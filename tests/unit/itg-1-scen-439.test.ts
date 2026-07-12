import { manageMealEvaluationRetentionPolicy } from '../../src/logic/it-2';

describe('家族成員の食事評価データの蓄積・管理機能', () => {
  // SCEN-439
  test('保持期間ポリシーが無効または未定義の場合、エラーを返してデータ削除を中止する', () => {
    const retentionPolicyUndefined = {
      userId: 'user_001',
      policyId: null,
      policyStatus: 'undefined',
      retentionDays: null,
      mealEvaluationRecords: [
        {
          evaluationId: 'eval_001',
          createdAt: '2024-01-01T10:00:00Z',
          satisfactionScore: 4,
          completionRate: 0.95,
          comment: 'Very tasty'
        },
        {
          evaluationId: 'eval_002',
          createdAt: '2024-01-02T10:00:00Z',
          satisfactionScore: 3,
          completionRate: 0.80,
          comment: 'Good'
        }
      ]
    };

    expect(() =>
      manageMealEvaluationRetentionPolicy(retentionPolicyUndefined)
    ).toThrow(/保持期間ポリシー/);
  });

  test('保持期間ポリシーが無効な場合、データ削除を中止しエラーログを記録する', () => {
    const retentionPolicyInvalid = {
      userId: 'user_002',
      policyId: 'policy_invalid_001',
      policyStatus: 'invalid',
      retentionDays: -1,
      mealEvaluationRecords: [
        {
          evaluationId: 'eval_003',
          createdAt: '2023-12-15T14:30:00Z',
          satisfactionScore: 5,
          completionRate: 1.0,
          comment: 'Excellent'
        }
      ]
    };

    expect(() =>
      manageMealEvaluationRetentionPolicy(retentionPolicyInvalid)
    ).toThrow(/保持期間ポリシー/);
  });

  test('保持期間ポリシーが有効な場合、期限切れデータを削除し結果を返す', () => {
    const retentionPolicyValid = {
      userId: 'user_003',
      policyId: 'policy_valid_001',
      policyStatus: 'active',
      retentionDays: 90,
      mealEvaluationRecords: [
        {
          evaluationId: 'eval_004',
          createdAt: '2023-08-01T09:00:00Z',
          satisfactionScore: 4,
          completionRate: 0.88,
          comment: 'Good meal'
        },
        {
          evaluationId: 'eval_005',
          createdAt: '2024-01-10T11:00:00Z',
          satisfactionScore: 5,
          completionRate: 0.95,
          comment: 'Recent excellent meal'
        }
      ],
      currentDate: '2024-01-11T00:00:00Z'
    };

    const result = manageMealEvaluationRetentionPolicy(retentionPolicyValid);

    expect(result).toEqual({
      success: true,
      deletedRecordCount: 1,
      retainedRecordCount: 1,
      policyAppliedDate: '2024-01-11T00:00:00Z',
      retentionDays: 90
    });
  });

  test('保持期間ポリシー適用時、期限切れデータ数を正確に計算する', () => {
    const retentionPolicyMultiDelete = {
      userId: 'user_004',
      policyId: 'policy_valid_002',
      policyStatus: 'active',
      retentionDays: 30,
      mealEvaluationRecords: [
        {
          evaluationId: 'eval_006',
          createdAt: '2023-11-01T08:00:00Z',
          satisfactionScore: 3,
          completionRate: 0.75,
          comment: 'Old evaluation'
        },
        {
          evaluationId: 'eval_007',
          createdAt: '2023-11-15T10:00:00Z',
          satisfactionScore: 2,
          completionRate: 0.60,
          comment: 'Very old evaluation'
        },
        {
          evaluationId: 'eval_008',
          createdAt: '2024-01-05T15:00:00Z',
          satisfactionScore: 4,
          completionRate: 0.90,
          comment: 'Recent evaluation'
        },
        {
          evaluationId: 'eval_009',
          createdAt: '2024-01-10T12:00:00Z',
          satisfactionScore: 5,
          completionRate: 1.0,
          comment: 'Very recent evaluation'
        }
      ],
      currentDate: '2024-01-11T00:00:00Z'
    };

    const result = manageMealEvaluationRetentionPolicy(retentionPolicyMultiDelete);

    expect(result).toEqual({
      success: true,
      deletedRecordCount: 2,
      retainedRecordCount: 2,
      policyAppliedDate: '2024-01-11T00:00:00Z',
      retentionDays: 30
    });
  });

  test('保持期間ポリシーが null policyId の場合、エラーを返す', () => {
    const retentionPolicyNullId = {
      userId: 'user_005',
      policyId: null,
      policyStatus: 'active',
      retentionDays: 60,
      mealEvaluationRecords: [
        {
          evaluationId: 'eval_010',
          createdAt: '2024-01-05T10:00:00Z',
          satisfactionScore: 4,
          completionRate: 0.85,
          comment: 'Test'
        }
      ]
    };

    expect(() =>
      manageMealEvaluationRetentionPolicy(retentionPolicyNullId)
    ).toThrow(/保持期間ポリシー/);
  });

  test('保持期間ポリシーが inactive ステータスの場合、エラーを返す', () => {
    const retentionPolicyInactive = {
      userId: 'user_006',
      policyId: 'policy_inactive_001',
      policyStatus: 'inactive',
      retentionDays: 90,
      mealEvaluationRecords: [
        {
          evaluationId: 'eval_011',
          createdAt: '2024-01-08T14:00:00Z',
          satisfactionScore: 3,
          completionRate: 0.80,
          comment: 'Test'
        }
      ]
    };

    expect(() =>
      manageMealEvaluationRetentionPolicy(retentionPolicyInactive)
    ).toThrow(/保持期間ポリシー/);
  });
});