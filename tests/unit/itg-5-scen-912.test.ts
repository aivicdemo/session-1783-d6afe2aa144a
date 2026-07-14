import { calculatePriorityScoreAndRank } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの改善提案優先順位付け', () => {
  // SCEN-912: [normal] 改善提案優先順位付け機能 - KPI寄与度・実装難度・ユーザー影響度から総合スコアが正しく算出され優先度ランクが決定される
  test('SCEN-912: 3つの改善提案について総合スコアと優先度ランクが正しく算出される', () => {
    // テスト用の改善提案データ3件を作成
    const proposals = [
      {
        id: 'prop_001',
        name: '栄養バランスロジック改善',
        kpi_contribution: 90,
        implementation_difficulty: 30,
        user_impact: 85,
      },
      {
        id: 'prop_002',
        name: '調理時間短縮アルゴリズム',
        kpi_contribution: 60,
        implementation_difficulty: 70,
        user_impact: 50,
      },
      {
        id: 'prop_003',
        name: '家族好み学習ロジック',
        kpi_contribution: 75,
        implementation_difficulty: 40,
        user_impact: 80,
      },
    ];

    // 総合スコアと優先度ランクを算出
    const result = calculatePriorityScoreAndRank(proposals);

    // 提案1の検証
    // 総合スコア計算式: (KPI寄与度 × 0.4) + (ユーザー影響度 × 0.4) + ((100 - 実装難度) × 0.2)
    // = (90 × 0.4) + (85 × 0.4) + ((100 - 30) × 0.2)
    // = 36 + 34 + 14 = 84
    expect(result[0].id).toBe('prop_001');
    expect(result[0].total_score).toBe(84);
    expect(result[0].priority_rank).toBe('High');

    // 提案2の検証
    // = (60 × 0.4) + (50 × 0.4) + ((100 - 70) × 0.2)
    // = 24 + 20 + 6 = 50
    expect(result[1].id).toBe('prop_003');
    expect(result[1].total_score).toBe(80);
    expect(result[1].priority_rank).toBe('Medium');

    // 提案3の検証
    // = (75 × 0.4) + (80 × 0.4) + ((100 - 40) × 0.2)
    // = 30 + 32 + 12 = 74
    expect(result[2].id).toBe('prop_002');
    expect(result[2].total_score).toBe(50);
    expect(result[2].priority_rank).toBe('Low');

    // 総合スコアの降順にソートされていることを確認
    expect(result[0].total_score).toBeGreaterThan(result[1].total_score);
    expect(result[1].total_score).toBeGreaterThan(result[2].total_score);

    // 優先度ランクが正しく付与されていることを確認
    expect(result.map((p) => p.priority_rank)).toEqual([
      'High',
      'Medium',
      'Low',
    ]);

    // 全提案が結果に含まれていることを確認
    expect(result).toHaveLength(3);
  });
});