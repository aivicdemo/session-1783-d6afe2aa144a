import { determinePriorityMatrixPlacement } from '../../src/logic/it-3-br-6-3-3';

describe('予測精度低下要因の可視化ダッシュボード', () => {
  // SCEN-284: [normal] 外部要因変数の優先度マトリクス配置 - 影響度が高く実装難度が低い変数を高優先度象限に配置される
  test('影響度が高く実装難度が低い変数が高優先度象限に配置される', () => {
    const external_factor_variables = [
      {
        variable_id: 'var_001',
        variable_name: '季節性',
        impact_level: 'high',
        implementation_difficulty: 'low',
        priority_score: 95
      },
      {
        variable_id: 'var_002',
        variable_name: '天候',
        impact_level: 'high',
        implementation_difficulty: 'low',
        priority_score: 90
      },
      {
        variable_id: 'var_003',
        variable_name: 'イベント',
        impact_level: 'high',
        implementation_difficulty: 'medium',
        priority_score: 70
      },
      {
        variable_id: 'var_004',
        variable_name: '競合価格',
        impact_level: 'high',
        implementation_difficulty: 'low',
        priority_score: 88
      },
      {
        variable_id: 'var_005',
        variable_name: '市場トレンド',
        impact_level: 'low',
        implementation_difficulty: 'high',
        priority_score: 30
      }
    ];

    const result = determinePriorityMatrixPlacement(external_factor_variables);

    // 高優先度象限（左上：高影響度・低実装難度）に配置された変数の検証
    expect(result.high_priority_quadrant).toHaveLength(3);
    expect(result.high_priority_quadrant).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          variable_id: 'var_001',
          variable_name: '季節性',
          impact_level: 'high',
          implementation_difficulty: 'low',
          quadrant: 'high_priority',
          priority_rank: 1
        }),
        expect.objectContaining({
          variable_id: 'var_002',
          variable_name: '天候',
          impact_level: 'high',
          implementation_difficulty: 'low',
          quadrant: 'high_priority',
          priority_rank: 2
        }),
        expect.objectContaining({
          variable_id: 'var_004',
          variable_name: '競合価格',
          impact_level: 'high',
          implementation_difficulty: 'low',
          quadrant: 'high_priority',
          priority_rank: 3
        })
      ])
    );

    // 優先度スコアで正順ソート確認
    const sorted_high_priority = result.high_priority_quadrant;
    expect(sorted_high_priority[0].priority_score).toBe(95);
    expect(sorted_high_priority[1].priority_score).toBe(90);
    expect(sorted_high_priority[2].priority_score).toBe(88);
    expect(sorted_high_priority[0].priority_score).toBeGreaterThanOrEqual(
      sorted_high_priority[1].priority_score
    );
    expect(sorted_high_priority[1].priority_score).toBeGreaterThanOrEqual(
      sorted_high_priority[2].priority_score
    );

    // 中優先度象限（高影響度・高実装難度）に配置された変数の検証
    expect(result.medium_priority_quadrant).toHaveLength(1);
    expect(result.medium_priority_quadrant[0]).toEqual(
      expect.objectContaining({
        variable_id: 'var_003',
        variable_name: 'イベント',
        impact_level: 'high',
        implementation_difficulty: 'medium',
        quadrant: 'medium_priority',
        priority_rank: 1
      })
    );

    // 低優先度象限（低影響度・高実装難度）に配置された変数の検証
    expect(result.low_priority_quadrant).toHaveLength(1);
    expect(result.low_priority_quadrant[0]).toEqual(
      expect.objectContaining({
        variable_id: 'var_005',
        variable_name: '市場トレンド',
        impact_level: 'low',
        implementation_difficulty: 'high',
        quadrant: 'low_priority',
        priority_rank: 1
      })
    );

    // マトリクス配置の正確性確認
    expect(result.matrix_placement_accuracy).toBe(100);

    // 視覚的識別属性の確認
    expect(result.high_priority_quadrant[0]).toHaveProperty('visual_marker', 'red_circle');
    expect(result.high_priority_quadrant[0]).toHaveProperty('color_code', '#FF0000');
    expect(result.medium_priority_quadrant[0]).toHaveProperty('visual_marker', 'yellow_square');
    expect(result.low_priority_quadrant[0]).toHaveProperty('visual_marker', 'gray_diamond');

    // 全変数が正確に象限に配置されたことを確認
    const total_placed = 
      result.high_priority_quadrant.length +
      result.medium_priority_quadrant.length +
      result.low_priority_quadrant.length;
    expect(total_placed).toBe(5);

    // 高優先度象限のすべての変数が条件を満たすことを確認
    result.high_priority_quadrant.forEach(variable => {
      expect(variable.impact_level).toBe('high');
      expect(variable.implementation_difficulty).toBe('low');
      expect(variable.quadrant).toBe('high_priority');
    });
  });
});