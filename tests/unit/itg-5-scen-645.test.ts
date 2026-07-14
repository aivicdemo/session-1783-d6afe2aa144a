import { validateAlgorithmImprovementVerification } from '../../src/logic/it-7-2-1';

describe('アルゴリズム改善検証基準判定機能 - 栄養士監修ステータスチェック', () => {
  // SCEN-645
  test('栄養士監修が未完了の改善提案は検証基準判定が実行されない', () => {
    const improvementProposal = {
      proposalId: 'PROP-20240115-001',
      algorithmVersion: 'v2.3.1',
      improvementTitle: '栄養バランス最適化アルゴリズム',
      proposalDescription: 'ビタミン・ミネラルの推奨値計算ロジックを改善',
      businessValue: 85,
      technicalDifficulty: 60,
      userImpactScore: 75,
      totalPriorityScore: 73,
      nutritionistReviewStatus: 'incomplete',
      nutritionistReviewCompletedAt: null,
      proposalSubmittedAt: new Date('2024-01-15T10:30:00Z'),
      verificationCriteria: {
        minAccuracyImprovement: 5,
        minSatisfactionImprovement: 0.5,
        maxImplementationDays: 14
      },
      currentStatus: 'awaiting_review'
    };

    expect(() =>
      validateAlgorithmImprovementVerification(improvementProposal)
    ).toThrow(/栄養士監修/);
  });

  test('栄養士監修が完了している改善提案は検証基準判定が実行される', () => {
    const improvementProposal = {
      proposalId: 'PROP-20240115-002',
      algorithmVersion: 'v2.3.2',
      improvementTitle: '家族好み学習アルゴリズム強化',
      proposalDescription: '過去の食事評価データから嗜好パターンを学習',
      businessValue: 80,
      technicalDifficulty: 55,
      userImpactScore: 88,
      totalPriorityScore: 74,
      nutritionistReviewStatus: 'completed',
      nutritionistReviewCompletedAt: new Date('2024-01-15T09:00:00Z'),
      proposalSubmittedAt: new Date('2024-01-14T14:20:00Z'),
      verificationCriteria: {
        minAccuracyImprovement: 5,
        minSatisfactionImprovement: 0.5,
        maxImplementationDays: 14
      },
      currentStatus: 'awaiting_verification'
    };

    const result = validateAlgorithmImprovementVerification(
      improvementProposal
    );

    expect(result).toEqual({
      isVerificationExecutable: true,
      proposalId: 'PROP-20240115-002',
      nutritionistReviewStatus: 'completed',
      verificationStartedAt: expect.any(Date),
      validationMessage: expect.stringContaining(
        '検証基準判定を開始します'
      )
    });
  });

  test('栄養士監修が完了していない場合、エラーメッセージが構造化されて返される', () => {
    const improvementProposal = {
      proposalId: 'PROP-20240115-003',
      algorithmVersion: 'v2.4.0',
      improvementTitle: '調理時間予測精度向上',
      proposalDescription: '機械学習モデルを用いた調理時間推定',
      businessValue: 70,
      technicalDifficulty: 75,
      userImpactScore: 65,
      totalPriorityScore: 70,
      nutritionistReviewStatus: 'pending',
      nutritionistReviewCompletedAt: null,
      proposalSubmittedAt: new Date('2024-01-15T11:45:00Z'),
      verificationCriteria: {
        minAccuracyImprovement: 8,
        minSatisfactionImprovement: 1.0,
        maxImplementationDays: 21
      },
      currentStatus: 'awaiting_review'
    };

    expect(() =>
      validateAlgorithmImprovementVerification(improvementProposal)
    ).toThrow(
      /栄養士監修が完了していないため、検証基準判定は実行できません/
    );
  });

  test('検証基準判定実行時にプロポーザルステータスが変更されない（未完了時）', () => {
    const improvementProposal = {
      proposalId: 'PROP-20240115-004',
      algorithmVersion: 'v2.3.5',
      improvementTitle: '食材制限自動検出',
      proposalDescription: 'アレルギー・制限情報の自動マッチング強化',
      businessValue: 90,
      technicalDifficulty: 50,
      userImpactScore: 92,
      totalPriorityScore: 77,
      nutritionistReviewStatus: 'incomplete',
      nutritionistReviewCompletedAt: null,
      proposalSubmittedAt: new Date('2024-01-15T13:15:00Z'),
      verificationCriteria: {
        minAccuracyImprovement: 3,
        minSatisfactionImprovement: 0.3,
        maxImplementationDays: 10
      },
      currentStatus: 'awaiting_review'
    };

    const initialStatus = improvementProposal.currentStatus;

    try {
      validateAlgorithmImprovementVerification(improvementProposal);
    } catch {
      // Expected error
    }

    expect(improvementProposal.currentStatus).toBe(initialStatus);
    expect(improvementProposal.currentStatus).toBe('awaiting_review');
  });

  test('複数の改善提案のうち、栄養士監修完了分のみが検証基準判定に進む', () => {
    const proposals = [
      {
        proposalId: 'PROP-20240115-005',
        algorithmVersion: 'v2.5.0',
        improvementTitle: '改善案1',
        proposalDescription: 'Description 1',
        businessValue: 75,
        technicalDifficulty: 60,
        userImpactScore: 78,
        totalPriorityScore: 71,
        nutritionistReviewStatus: 'incomplete',
        nutritionistReviewCompletedAt: null,
        proposalSubmittedAt: new Date('2024-01-15T10:00:00Z'),
        verificationCriteria: {
          minAccuracyImprovement: 5,
          minSatisfactionImprovement: 0.5,
          maxImplementationDays: 14
        },
        currentStatus: 'awaiting_review'
      },
      {
        proposalId: 'PROP-20240115-006',
        algorithmVersion: 'v2.5.1',
        improvementTitle: '改善案2',
        proposalDescription: 'Description 2',
        businessValue: 82,
        technicalDifficulty: 48,
        userImpactScore: 85,
        totalPriorityScore: 72,
        nutritionistReviewStatus: 'completed',
        nutritionistReviewCompletedAt: new Date('2024-01-15T08:30:00Z'),
        proposalSubmittedAt: new Date('2024-01-14T16:00:00Z'),
        verificationCriteria: {
          minAccuracyImprovement: 6,
          minSatisfactionImprovement: 0.6,
          maxImplementationDays: 12
        },
        currentStatus: 'awaiting_verification'
      }
    ];

    const results = proposals.map((proposal) => {
      try {
        return {
          proposalId: proposal.proposalId,
          result: validateAlgorithmImprovementVerification(proposal),
          error: null
        };
      } catch (error) {
        return {
          proposalId: proposal.proposalId,
          result: null,
          error: (error as Error).message
        };
      }
    });

    expect(results[0].error).toMatch(/栄養士監修/);
    expect(results[0].result).toBeNull();

    expect(results[1].error).toBeNull();
    expect(results[1].result).toEqual({
      isVerificationExecutable: true,
      proposalId: 'PROP-20240115-006',
      nutritionistReviewStatus: 'completed',
      verificationStartedAt: expect.any(Date),
      validationMessage: expect.stringContaining(
        '検証基準判定を開始します'
      )
    });
  });

  test('栄養士監修完了日時が記録されている場合、検証基準判定が正常に実行される', () => {
    const improvementProposal = {
      proposalId: 'PROP-20240115-007',
      algorithmVersion: 'v2.6.0',
      improvementTitle: '予算最適化アルゴリズム',
      proposalDescription: '食費削減と満足度のバランス最適化',
      businessValue: 88,
      technicalDifficulty: 65,
      userImpactScore: 80,
      totalPriorityScore: 78,
      nutritionistReviewStatus: 'completed',
      nutritionistReviewCompletedAt: new Date('2024-01-14T17:45:00Z'),
      proposalSubmittedAt: new Date('2024-01-14T10:15:00Z'),
      verificationCriteria: {
        minAccuracyImprovement: 4,
        minSatisfactionImprovement: 0.4,
        maxImplementationDays: 16
      },
      currentStatus: 'awaiting_verification'
    };

    const result = validateAlgorithmImprovementVerification(
      improvementProposal
    );

    expect(result.isVerificationExecutable).toBe(true);
    expect(result.nutritionistReviewStatus).toBe('completed');
    expect(result.proposalId).toBe('PROP-20240115-007');
    expect(result.verificationStartedAt).toBeInstanceOf(Date);
  });
});