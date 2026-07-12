import { validateAlgorithmRollout } from '../../src/logic/it-1-1-1';

describe('段階的アルゴリズム展開と効果検証', () => {
  // SCEN-491
  test('複数のユーザーセグメント別に異なるアルゴリズムバージョンが正しく配信される', () => {
    // 前提条件: アルゴリズム改善提案が開発チームに承認され、新しい献立生成ロジックが実装完了した状態
    // 発生条件: 新機能リリース前に、段階的ロールアウト対象ユーザーセグメントと検証期間が決定された
    // 期待結果: ユーザーセグメント別に異なるアルゴリズムバージョンを段階的に配信し、各段階の効果を定量検証してから全体展開を判定する

    const rolloutConfig = {
      segmentA: {
        segmentId: 'segment-a',
        segmentName: 'Family_Size_2to3',
        algorithmVersion: 'v1',
        targetUserCount: 500,
        rolloutStartDate: new Date('2024-01-15T00:00:00Z'),
        rolloutEndDate: new Date('2024-01-29T23:59:59Z'),
      },
      segmentB: {
        segmentId: 'segment-b',
        segmentName: 'Family_Size_4to5',
        algorithmVersion: 'v2',
        targetUserCount: 600,
        rolloutStartDate: new Date('2024-01-15T00:00:00Z'),
        rolloutEndDate: new Date('2024-01-29T23:59:59Z'),
      },
      segmentC: {
        segmentId: 'segment-c',
        segmentName: 'Family_Size_6plus',
        algorithmVersion: 'v3',
        targetUserCount: 400,
        rolloutStartDate: new Date('2024-01-15T00:00:00Z'),
        rolloutEndDate: new Date('2024-01-29T23:59:59Z'),
      },
    };

    const testUserA1 = {
      userId: 'test-user-a1',
      segmentId: 'segment-a',
      mealGenerationExecutions: [
        {
          executionId: 'exec-a1-1',
          timestamp: new Date('2024-01-20T10:00:00Z'),
          algorithmVersionApplied: 'v1',
          generatedMealPatterns: ['Pattern_Light_Cook_Time', 'Pattern_Budget_Conscious'],
          satisfactionScore: 4.2,
        },
        {
          executionId: 'exec-a1-2',
          timestamp: new Date('2024-01-22T10:00:00Z'),
          algorithmVersionApplied: 'v1',
          generatedMealPatterns: ['Pattern_Light_Cook_Time', 'Pattern_Budget_Conscious'],
          satisfactionScore: 4.1,
        },
        {
          executionId: 'exec-a1-3',
          timestamp: new Date('2024-01-25T10:00:00Z'),
          algorithmVersionApplied: 'v1',
          generatedMealPatterns: ['Pattern_Light_Cook_Time', 'Pattern_Budget_Conscious'],
          satisfactionScore: 4.3,
        },
      ],
    };

    const testUserB1 = {
      userId: 'test-user-b1',
      segmentId: 'segment-b',
      mealGenerationExecutions: [
        {
          executionId: 'exec-b1-1',
          timestamp: new Date('2024-01-20T10:00:00Z'),
          algorithmVersionApplied: 'v2',
          generatedMealPatterns: ['Pattern_Balanced_Nutrition', 'Pattern_Family_Preference'],
          satisfactionScore: 4.5,
        },
        {
          executionId: 'exec-b1-2',
          timestamp: new Date('2024-01-22T10:00:00Z'),
          algorithmVersionApplied: 'v2',
          generatedMealPatterns: ['Pattern_Balanced_Nutrition', 'Pattern_Family_Preference'],
          satisfactionScore: 4.6,
        },
        {
          executionId: 'exec-b1-3',
          timestamp: new Date('2024-01-25T10:00:00Z'),
          algorithmVersionApplied: 'v2',
          generatedMealPatterns: ['Pattern_Balanced_Nutrition', 'Pattern_Family_Preference'],
          satisfactionScore: 4.4,
        },
      ],
    };

    const testUserC1 = {
      userId: 'test-user-c1',
      segmentId: 'segment-c',
      mealGenerationExecutions: [
        {
          executionId: 'exec-c1-1',
          timestamp: new Date('2024-01-20T10:00:00Z'),
          algorithmVersionApplied: 'v3',
          generatedMealPatterns: ['Pattern_Large_Family_Volume', 'Pattern_Allergy_Inclusive'],
          satisfactionScore: 3.9,
        },
        {
          executionId: 'exec-c1-2',
          timestamp: new Date('2024-01-22T10:00:00Z'),
          algorithmVersionApplied: 'v3',
          generatedMealPatterns: ['Pattern_Large_Family_Volume', 'Pattern_Allergy_Inclusive'],
          satisfactionScore: 4.0,
        },
        {
          executionId: 'exec-c1-3',
          timestamp: new Date('2024-01-25T10:00:00Z'),
          algorithmVersionApplied: 'v3',
          generatedMealPatterns: ['Pattern_Large_Family_Volume', 'Pattern_Allergy_Inclusive'],
          satisfactionScore: 4.1,
        },
      ],
    };

    const validationInput = {
      rolloutConfig,
      testUsers: [testUserA1, testUserB1, testUserC1],
      verificationDate: new Date('2024-01-27T00:00:00Z'),
    };

    const result = validateAlgorithmRollout(validationInput);

    // 期待値: 各セグメントに配信されたアルゴリズムバージョンが異なることを確認
    expect(result.segmentVersionMapping).toEqual({
      'segment-a': 'v1',
      'segment-b': 'v2',
      'segment-c': 'v3',
    });

    // 期待値: 各セグメント内のテストユーザーが一貫性を持って同じバージョンを受け取り続けることを確認
    expect(result.consistencyValidation).toEqual({
      'segment-a': {
        allExecutionsUseVersion: 'v1',
        isConsistent: true,
        consistencyRate: 100,
      },
      'segment-b': {
        allExecutionsUseVersion: 'v2',
        isConsistent: true,
        consistencyRate: 100,
      },
      'segment-c': {
        allExecutionsUseVersion: 'v3',
        isConsistent: true,
        consistencyRate: 100,
      },
    });

    // 期待値: 異なるセグメント間で配信されたアルゴリズムバージョンが相互に異なることを確認
    expect(result.versionIsolationValidation).toEqual({
      'segment-a-vs-segment-b': {
        versionA: 'v1',
        versionB: 'v2',
        isDifferent: true,
      },
      'segment-a-vs-segment-c': {
        versionA: 'v1',
        versionC: 'v3',
        isDifferent: true,
      },
      'segment-b-vs-segment-c': {
        versionB: 'v2',
        versionC: 'v3',
        isDifferent: true,
      },
    });

    // 期待値: ロールアウトメトリクスの検証（各セグメントの満足度スコア平均値）
    expect(result.rolloutMetrics).toEqual({
      'segment-a': {
        averageSatisfactionScore: 4.2,
        executionCount: 3,
        versionApplied: 'v1',
      },
      'segment-b': {
        averageSatisfactionScore: 4.5,
        executionCount: 3,
        versionApplied: 'v2',
      },
      'segment-c': {
        averageSatisfactionScore: 4.0,
        executionCount: 3,
        versionApplied: 'v3',
      },
    });

    // 期待値: 全体的なロールアウト検証結果
    expect(result.overallValidationStatus).toEqual({
      isRolloutSuccessful: true,
      allVersionsDistributed: true,
      allSegmentsConsistent: true,
      allVersionsIsolated: true,
      verificationTimestamp: new Date('2024-01-27T00:00:00Z'),
    });

    // 期待値: ログ記録がアルゴリズムバージョン配信の意図通りの機能を証明
    expect(result.auditLog).toBeDefined();
    expect(result.auditLog.rolledOutVersions).toEqual(['v1', 'v2', 'v3']);
    expect(result.auditLog.rolloutStartTime).toEqual(new Date('2024-01-15T00:00:00Z'));
    expect(result.auditLog.verificationCompleteTime).toEqual(new Date('2024-01-27T00:00:00Z'));
  });
});