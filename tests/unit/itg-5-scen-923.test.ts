import { evaluateImprovementProposalKPI } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の分類と失敗パターン特定 - KPI評価機能', () => {
  // SCEN-923: [edge] 改善提案のKPI評価機能 - 該当する失敗パターンが見つからない提案に対して評価値が0として設定される
  test('該当する失敗パターンが見つからない改善提案に対してKPI評価値が0を返す', () => {
    // Arrange: 失敗パターンが存在しないシナリオを設定
    const failurePatternDatabase = [
      {
        id: 'fp_001',
        category: '栄養バランス',
        frequency: 15,
        description: '栄養素のバランスが要件を満たしていない',
      },
      {
        id: 'fp_002',
        category: '調理時間',
        frequency: 12,
        description: '調理時間が予定を超過している',
      },
      {
        id: 'fp_003',
        category: '食材制限',
        frequency: 8,
        description: '食材制限条件が適用されていない',
      },
    ];

    // 失敗パターンに該当しない改善提案を作成
    const improvementProposal = {
      id: 'proposal_999',
      title: 'UI/UXの改善（何らかの理由にも該当しない独立的な提案）',
      description: 'ダッシュボード表示を改善する',
      type: '新機能',
      affectedFailurePatterns: [], // 該当する失敗パターンなし
      estimatedImplementationEffort: 'medium',
      expectedKPIImpact: 'low',
      userImpactLevel: 'medium',
    };

    // Act: KPI評価メソッドを実行
    const evaluationResult = evaluateImprovementProposalKPI(
      improvementProposal,
      failurePatternDatabase
    );

    // Assert: 評価値が0であることを確認
    expect(evaluationResult.kpiScore).toBe(0);
    expect(evaluationResult.kpiScore).not.toBeNull();
    expect(evaluationResult.kpiScore).not.toBeUndefined();
    expect(typeof evaluationResult.kpiScore).toBe('number');

    // ステータスが適切に処理済みとして記録されていることを確認
    expect(evaluationResult.status).toBe('processed');

    // 改善提案IDが正しく紐付けられていることを確認
    expect(evaluationResult.proposalId).toBe('proposal_999');

    // 評価結果が完全な形で返されていることを確認（nullやundefinedでない）
    expect(evaluationResult).toEqual({
      proposalId: 'proposal_999',
      kpiScore: 0,
      status: 'processed',
      matchedPatternCount: 0,
      timestamp: expect.any(String),
    });
  });
});