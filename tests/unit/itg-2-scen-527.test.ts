import { evaluateTechnicalFeasibility } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能', () => {
  // SCEN-527
  test('改善提案の技術実現性評価が実行され、すべての提案が実装可能・条件付き実装・実装不可のいずれかに正確に分類される', () => {
    const improvementProposals = [
      {
        proposalId: 'PROP-001',
        title: '栄養基準値の動的調整機能',
        description: '年齢・性別・活動量に基づいた栄養基準値の自動計算機能',
        businessValue: 8,
        technicalDifficulty: 5,
        userImpact: 7,
        implementationEstimate: 40,
        affectedNutrients: ['カロリー', 'タンパク質'],
        estimatedComplexity: 'medium',
        createdAt: new Date('2024-01-15T10:00:00Z'),
      },
      {
        proposalId: 'PROP-002',
        title: 'リアルタイム栄養分析ダッシュボード',
        description: '食事記録に基づくリアルタイム栄養分析表示',
        businessValue: 9,
        technicalDifficulty: 8,
        userImpact: 9,
        implementationEstimate: 80,
        affectedNutrients: ['カロリー', 'タンパク質', '脂質', '炭水化物'],
        estimatedComplexity: 'high',
        createdAt: new Date('2024-01-15T11:00:00Z'),
      },
      {
        proposalId: 'PROP-003',
        title: 'アレルギー食材の自動除外',
        description: 'ユーザー登録のアレルギー情報に基づいた食材の自動フィルタリング',
        businessValue: 10,
        technicalDifficulty: 3,
        userImpact: 10,
        implementationEstimate: 20,
        affectedNutrients: [],
        estimatedComplexity: 'low',
        createdAt: new Date('2024-01-15T12:00:00Z'),
      },
      {
        proposalId: 'PROP-004',
        title: 'AI需要予測モデルの統合',
        description: '気象・イベント・競合施策データを活用した需要予測',
        businessValue: 7,
        technicalDifficulty: 10,
        userImpact: 6,
        implementationEstimate: 200,
        affectedNutrients: [],
        estimatedComplexity: 'very_high',
        createdAt: new Date('2024-01-15T13:00:00Z'),
      },
    ];

    const evaluationCriteria = {
      implementationEstimateThreshold: 100,
      technicalDifficultyThreshold: 7,
      complexityLevels: {
        low: 'feasible',
        medium: 'feasible',
        high: 'conditional',
        very_high: 'not_feasible',
      },
    };

    const result = evaluateTechnicalFeasibility(
      improvementProposals,
      evaluationCriteria
    );

    expect(result).toBeDefined();
    expect(result.evaluations).toBeDefined();
    expect(result.evaluations.length).toBe(4);

    // PROP-001: medium complexity, estimate 40 < 100 → feasible
    expect(result.evaluations[0]).toEqual({
      proposalId: 'PROP-001',
      classification: 'feasible',
      reason: '技術難度が中程度で実装見積が100時間以下のため実装可能',
      technicalChallenges: [],
      feasibilityScore: 85,
      evaluatedAt: expect.any(String),
    });

    // PROP-002: high complexity, estimate 80 < 100 but difficulty 8 > 7 → conditional
    expect(result.evaluations[1]).toEqual({
      proposalId: 'PROP-002',
      classification: 'conditional',
      reason: '技術難度が高く複数システムとの連携が必要となるため条件付き実装',
      technicalChallenges: ['リアルタイム処理の実装', 'データベースパフォーマンス最適化'],
      feasibilityScore: 65,
      evaluatedAt: expect.any(String),
    });

    // PROP-003: low complexity, estimate 20 < 100 → feasible
    expect(result.evaluations[2]).toEqual({
      proposalId: 'PROP-003',
      classification: 'feasible',
      reason: '技術難度が低く実装見積が少ないため実装可能',
      technicalChallenges: [],
      feasibilityScore: 95,
      evaluatedAt: expect.any(String),
    });

    // PROP-004: very_high complexity, estimate 200 > 100, difficulty 10 > 7 → not_feasible
    expect(result.evaluations[3]).toEqual({
      proposalId: 'PROP-004',
      classification: 'not_feasible',
      reason: '実装見積が多く高度な機械学習技術を要するため実装不可',
      technicalChallenges: ['機械学習モデル開発', '大規模データセット構築', '予測精度検証'],
      feasibilityScore: 35,
      evaluatedAt: expect.any(String),
    });

    // Verify classification distribution
    const feasibleCount = result.evaluations.filter((e) => e.classification === 'feasible').length;
    const conditionalCount = result.evaluations.filter((e) => e.classification === 'conditional').length;
    const notFeasibleCount = result.evaluations.filter((e) => e.classification === 'not_feasible').length;

    expect(feasibleCount).toBe(2);
    expect(conditionalCount).toBe(1);
    expect(notFeasibleCount).toBe(1);

    // Verify feasibility scores are in valid range
    result.evaluations.forEach((evaluation) => {
      expect(evaluation.feasibilityScore).toBeGreaterThanOrEqual(0);
      expect(evaluation.feasibilityScore).toBeLessThanOrEqual(100);
    });

    // Verify evaluation results are persisted
    expect(result.savedAt).toBeDefined();
    expect(result.status).toBe('completed');

    // Verify detailed information
    expect(result.summary).toEqual({
      totalEvaluated: 4,
      feasibleCount: 2,
      conditionalCount: 1,
      notFeasibleCount: 1,
      averageFeasibilityScore: 70,
    });
  });
});