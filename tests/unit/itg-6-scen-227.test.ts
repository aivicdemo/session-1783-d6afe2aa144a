import {
  scoreImprovementProposalPriority,
} from '../../src/logic/it-8-1-2-1';

describe('改善提案の優先度スコアリングと通知ワークフロー', () => {
  // SCEN-227
  test('改善課題リスト未作成時の優先度スコアリング実行制御とエラー通知ワークフロー', () => {
    // 前提: 栄養士フィードバック統合機能が存在し、改善課題リストが未作成の状態
    const nutritionistFeedbackId = 'NF-2024-001';
    const improvementProposalId = 'IP-2024-001';
    const improvementTaskListId = null; // 改善課題リストが未作成

    // トリガー: 改善課題リスト未作成の状態で優先度スコアリング実行を試みる
    const scoreInput = {
      nutritionistFeedbackId,
      improvementProposalId,
      improvementTaskListId,
      businessValueScore: 8,
      technicalDifficultyScore: 6,
      userImpactScore: 9,
    };

    // 期待結果: 改善課題リストが未作成のため、エラーが発生する
    expect(() => {
      scoreImprovementProposalPriority(scoreInput);
    }).toThrow(/改善課題リスト/);

    // 期待結果: エラーハンドリング後、通知ワークフロー内で管理者への警告通知が送信される状態
    // (システムは不整合な状態での処理実行を防止)
    // 期待結果: ユーザーに改善課題リスト作成の必要性を明示するメッセージが表示可能な状態

    // 成功ケース: 改善課題リストが正常に作成された後、優先度スコアリング実行
    const validScoreInput = {
      nutritionistFeedbackId,
      improvementProposalId,
      improvementTaskListId: 'ITASK-2024-001', // 改善課題リストが存在
      businessValueScore: 8,
      technicalDifficultyScore: 6,
      userImpactScore: 9,
    };

    // 期待結果の計算: (ビジネス価値 × ユーザーインパクト) / (技術難度 + 1) の公式を適用
    // = (8 × 9) / (6 + 1) = 72 / 7 ≈ 10.29 → 四捨五入して 10
    const expectedTotalPriorityScore = 10;

    const result = scoreImprovementProposalPriority(validScoreInput);

    expect(result).toEqual({
      improvementProposalId,
      improvementTaskListId: 'ITASK-2024-001',
      businessValueScore: 8,
      technicalDifficultyScore: 6,
      userImpactScore: 9,
      totalPriorityScore: expectedTotalPriorityScore,
      priorityRank: 'high',
      workflowNotificationSent: true,
      notificationTimestamp: expect.any(String),
    });

    expect(result.priorityRank).toBe('high');
    expect(result.workflowNotificationSent).toBe(true);
    expect(result.totalPriorityScore).toBe(expectedTotalPriorityScore);

    // 境界値テスト: 優先度スコアが中程度の場合
    const mediumPriorityInput = {
      nutritionistFeedbackId,
      improvementProposalId: 'IP-2024-002',
      improvementTaskListId: 'ITASK-2024-001',
      businessValueScore: 5,
      technicalDifficultyScore: 5,
      userImpactScore: 5,
    };

    // 期待結果の計算: (5 × 5) / (5 + 1) = 25 / 6 ≈ 4.17 → 四捨五入して 4
    const expectedMediumScore = 4;

    const mediumResult = scoreImprovementProposalPriority(mediumPriorityInput);

    expect(mediumResult).toEqual({
      improvementProposalId: 'IP-2024-002',
      improvementTaskListId: 'ITASK-2024-001',
      businessValueScore: 5,
      technicalDifficultyScore: 5,
      userImpactScore: 5,
      totalPriorityScore: expectedMediumScore,
      priorityRank: 'medium',
      workflowNotificationSent: true,
      notificationTimestamp: expect.any(String),
    });

    expect(mediumResult.priorityRank).toBe('medium');
    expect(mediumResult.totalPriorityScore).toBe(expectedMediumScore);

    // 境界値テスト: 優先度スコアが低い場合
    const lowPriorityInput = {
      nutritionistFeedbackId,
      improvementProposalId: 'IP-2024-003',
      improvementTaskListId: 'ITASK-2024-001',
      businessValueScore: 2,
      technicalDifficultyScore: 8,
      userImpactScore: 2,
    };

    // 期待結果の計算: (2 × 2) / (8 + 1) = 4 / 9 ≈ 0.44 → 四捨五入して 0
    const expectedLowScore = 0;

    const lowResult = scoreImprovementProposalPriority(lowPriorityInput);

    expect(lowResult).toEqual({
      improvementProposalId: 'IP-2024-003',
      improvementTaskListId: 'ITASK-2024-001',
      businessValueScore: 2,
      technicalDifficultyScore: 8,
      userImpactScore: 2,
      totalPriorityScore: expectedLowScore,
      priorityRank: 'low',
      workflowNotificationSent: true,
      notificationTimestamp: expect.any(String),
    });

    expect(lowResult.priorityRank).toBe('low');
    expect(lowResult.totalPriorityScore).toBe(expectedLowScore);
  });
});