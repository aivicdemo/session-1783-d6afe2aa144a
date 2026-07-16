import { generatePainPointPriorityMatrix } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログからペイン要因の優先度マトリクスを生成', () => {
  // SCEN-323: [edge] ペイン要因の優先度マトリクス生成機能 - 発生頻度0件かつ影響度0の要因が正しく左下象限に配置される
  test('発生頻度0件かつ影響度0の要因が左下象限に配置される', () => {
    const pain_factor_dataset = [
      {
        pain_factor_id: 'pf_001',
        pain_factor_name: '食材制限対応',
        occurrence_frequency: 45,
        impact_score: 85,
      },
      {
        pain_factor_id: 'pf_002',
        pain_factor_name: '調理時間短縮',
        occurrence_frequency: 32,
        impact_score: 72,
      },
      {
        pain_factor_id: 'pf_003',
        pain_factor_name: '予算制約対応',
        occurrence_frequency: 0,
        impact_score: 0,
      },
      {
        pain_factor_id: 'pf_004',
        pain_factor_name: '栄養バランス',
        occurrence_frequency: 28,
        impact_score: 65,
      },
    ];

    const frequency_threshold = 10;
    const impact_threshold = 40;

    const result = generatePainPointPriorityMatrix(
      pain_factor_dataset,
      frequency_threshold,
      impact_threshold
    );

    // マトリクスの構造を検証
    expect(result.matrix).toBeDefined();
    expect(result.matrix.quadrants).toBeDefined();
    expect(result.matrix.quadrants.high_high).toBeDefined();
    expect(result.matrix.quadrants.high_low).toBeDefined();
    expect(result.matrix.quadrants.low_high).toBeDefined();
    expect(result.matrix.quadrants.low_low).toBeDefined();

    // 発生頻度0件かつ影響度0の要因を検索
    const zero_frequency_zero_impact_factor = result.matrix.all_factors.find(
      (factor: any) =>
        factor.pain_factor_id === 'pf_003' &&
        factor.occurrence_frequency === 0 &&
        factor.impact_score === 0
    );

    expect(zero_frequency_zero_impact_factor).toBeDefined();
    expect(zero_frequency_zero_impact_factor.quadrant_position).toBe('low_low');
    expect(zero_frequency_zero_impact_factor.coordinate_x).toBe(0);
    expect(zero_frequency_zero_impact_factor.coordinate_y).toBe(0);
    expect(zero_frequency_zero_impact_factor.priority_rank).toBe('lowest');
    expect(zero_frequency_zero_impact_factor.priority_score).toBe(0);

    // 左下象限（low_low）に配置されていることを確認
    const low_low_quadrant = result.matrix.quadrants.low_low;
    const is_in_low_low = low_low_quadrant.some(
      (factor: any) => factor.pain_factor_id === 'pf_003'
    );
    expect(is_in_low_low).toBe(true);

    // 他の要因との相対的な位置関係を確認
    const high_high_quadrant = result.matrix.quadrants.high_high;
    const high_high_factors = high_high_quadrant.map((f: any) => f.pain_factor_id);
    expect(high_high_factors).toContain('pf_001');

    // マトリクス全体の座標範囲を検証
    expect(result.matrix.axis_x_min).toBe(0);
    expect(result.matrix.axis_x_max).toBeGreaterThan(0);
    expect(result.matrix.axis_y_min).toBe(0);
    expect(result.matrix.axis_y_max).toBeGreaterThan(0);

    // 全要因の個数を検証
    expect(result.matrix.all_factors.length).toBe(4);

    // 優先度スコア分布を検証（0要因が最小スコア）
    const priority_scores = result.matrix.all_factors.map(
      (f: any) => f.priority_score
    );
    expect(Math.min(...priority_scores)).toBe(0);
    expect(Math.max(...priority_scores)).toBeGreaterThan(0);
  });
});