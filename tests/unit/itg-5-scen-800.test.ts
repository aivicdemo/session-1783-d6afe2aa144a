import { judgeModelImprovementProposalVariablePriority } from '../../src/logic/it-7-2-1';

describe('献立生成の成功率・調理時間短縮度・ユーザー満足度スコアなどの行動指標を週次で自動集計し、アルゴリズム改善前後の効果差を定量比較するダッシュボード機能', () => {
  // SCEN-800: [edge] モデル改善提案変数優先度判定機能 - 優先度スコアが同値の複数変数に対して、補助判定基準により順序付けが行われる
  test('should rank variables with identical priority scores by subsidiary criteria (usage_frequency, impact_level, update_frequency)', () => {
    const variables = [
      {
        variable_id: 'var_001',
        variable_name: 'temperature_avg',
        priority_score: 75,
        usage_frequency: 45,
        impact_level: 60,
        update_frequency: 12,
      },
      {
        variable_id: 'var_002',
        variable_name: 'event_type',
        priority_score: 75,
        usage_frequency: 80,
        impact_level: 55,
        update_frequency: 8,
      },
      {
        variable_id: 'var_003',
        variable_name: 'competitor_discount_rate',
        priority_score: 75,
        usage_frequency: 60,
        impact_level: 85,
        update_frequency: 20,
      },
      {
        variable_id: 'var_004',
        variable_name: 'holiday_flag',
        priority_score: 75,
        usage_frequency: 70,
        impact_level: 70,
        update_frequency: 15,
      },
    ];

    const result = judgeModelImprovementProposalVariablePriority(variables);

    // 返却されたリストは配列型
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(4);

    // 優先度スコアが同値の場合、補助判定基準の高い順に並べる
    // 第1優先: impact_level が高い順 (85 > 70 > 60 > 55)
    // 第2優先: usage_frequency が高い順 (80 > 70 > 60 > 45)
    // 第3優先: update_frequency が高い順 (20 > 15 > 12 > 8)

    // 期待順序:
    // 1位: var_003 (impact_level=85, usage_frequency=60, update_frequency=20)
    // 2位: var_004 (impact_level=70, usage_frequency=70, update_frequency=15)
    // 3位: var_002 (impact_level=55, usage_frequency=80, update_frequency=8)
    // 4位: var_001 (impact_level=60, usage_frequency=45, update_frequency=12)
    // 補正: var_002 vs var_001 の場合、impact_level では var_002 < var_001 だが、
    //      usage_frequency では var_002 > var_001 なので、
    //      impact_level を最優先とすると var_001 が上位
    // 再度検証: 補助判定基準の優先度を確認

    // 正確な期待順序を再計算:
    // impact_level 優先: var_003(85) > var_004(70) > var_001(60) > var_002(55)
    expect(result[0].variable_id).toBe('var_003');
    expect(result[1].variable_id).toBe('var_004');
    expect(result[2].variable_id).toBe('var_001');
    expect(result[3].variable_id).toBe('var_002');

    // 返却されたオブジェクトが元のデータ構造を保持
    expect(result[0]).toEqual({
      variable_id: 'var_003',
      variable_name: 'competitor_discount_rate',
      priority_score: 75,
      usage_frequency: 60,
      impact_level: 85,
      update_frequency: 20,
    });

    expect(result[1]).toEqual({
      variable_id: 'var_004',
      variable_name: 'holiday_flag',
      priority_score: 75,
      usage_frequency: 70,
      impact_level: 70,
      update_frequency: 15,
    });

    expect(result[2]).toEqual({
      variable_id: 'var_001',
      variable_name: 'temperature_avg',
      priority_score: 75,
      usage_frequency: 45,
      impact_level: 60,
      update_frequency: 12,
    });

    expect(result[3]).toEqual({
      variable_id: 'var_002',
      variable_name: 'event_type',
      priority_score: 75,
      usage_frequency: 80,
      impact_level: 55,
      update_frequency: 8,
    });
  });

  test('should maintain consistent order across multiple invocations', () => {
    const variables = [
      {
        variable_id: 'var_a',
        variable_name: 'factor_a',
        priority_score: 80,
        usage_frequency: 50,
        impact_level: 70,
        update_frequency: 10,
      },
      {
        variable_id: 'var_b',
        variable_name: 'factor_b',
        priority_score: 80,
        usage_frequency: 40,
        impact_level: 90,
        update_frequency: 5,
      },
      {
        variable_id: 'var_c',
        variable_name: 'factor_c',
        priority_score: 80,
        usage_frequency: 60,
        impact_level: 65,
        update_frequency: 15,
      },
    ];

    // 1回目実行
    const result_1 = judgeModelImprovementProposalVariablePriority(variables);
    const order_1 = result_1.map((v) => v.variable_id);

    // 2回目実行
    const result_2 = judgeModelImprovementProposalVariablePriority(variables);
    const order_2 = result_2.map((v) => v.variable_id);

    // 3回目実行
    const result_3 = judgeModelImprovementProposalVariablePriority(variables);
    const order_3 = result_3.map((v) => v.variable_id);

    // すべての実行で同じ順序を保持することを確認
    expect(order_1).toEqual(order_2);
    expect(order_2).toEqual(order_3);

    // 期待される順序: impact_level 優先 (var_b=90 > var_a=70 > var_c=65)
    expect(order_1).toEqual(['var_b', 'var_a', 'var_c']);
  });

  test('should handle variables with different priority scores separately from subsidiary criteria', () => {
    const variables = [
      {
        variable_id: 'var_high',
        variable_name: 'high_priority_var',
        priority_score: 90,
        usage_frequency: 30,
        impact_level: 40,
        update_frequency: 5,
      },
      {
        variable_id: 'var_mid_1',
        variable_name: 'mid_priority_var_1',
        priority_score: 75,
        usage_frequency: 80,
        impact_level: 85,
        update_frequency: 20,
      },
      {
        variable_id: 'var_mid_2',
        variable_name: 'mid_priority_var_2',
        priority_score: 75,
        usage_frequency: 70,
        impact_level: 90,
        update_frequency: 15,
      },
      {
        variable_id: 'var_low',
        variable_name: 'low_priority_var',
        priority_score: 60,
        usage_frequency: 95,
        impact_level: 100,
        update_frequency: 25,
      },
    ];

    const result = judgeModelImprovementProposalVariablePriority(variables);

    // priority_score が異なる場合は priority_score が優先
    // 期待順序: var_high(90) > var_mid_2(75, impact=90) > var_mid_1(75, impact=85) > var_low(60)
    expect(result[0].variable_id).toBe('var_high');
    expect(result[1].variable_id).toBe('var_mid_2');
    expect(result[2].variable_id).toBe('var_mid_1');
    expect(result[3].variable_id).toBe('var_low');

    // priority_score と補助判定基準の値を確認
    expect(result[0].priority_score).toBe(90);
    expect(result[1].priority_score).toBe(75);
    expect(result[2].priority_score).toBe(75);
    expect(result[3].priority_score).toBe(60);
  });

  test('should rank by usage_frequency as secondary criterion when impact_level is equal', () => {
    const variables = [
      {
        variable_id: 'var_x',
        variable_name: 'var_x_name',
        priority_score: 70,
        usage_frequency: 50,
        impact_level: 75,
        update_frequency: 10,
      },
      {
        variable_id: 'var_y',
        variable_name: 'var_y_name',
        priority_score: 70,
        usage_frequency: 85,
        impact_level: 75,
        update_frequency: 8,
      },
      {
        variable_id: 'var_z',
        variable_name: 'var_z_name',
        priority_score: 70,
        usage_frequency: 70,
        impact_level: 75,
        update_frequency: 12,
      },
    ];

    const result = judgeModelImprovementProposalVariablePriority(variables);

    // priority_score = 70, impact_level = 75 で同値
    // usage_frequency: var_y(85) > var_z(70) > var_x(50)
    expect(result[0].variable_id).toBe('var_y');
    expect(result[1].variable_id).toBe('var_z');
    expect(result[2].variable_id).toBe('var_x');
  });

  test('should rank by update_frequency as tertiary criterion when priority_score, impact_level and usage_frequency are all equal', () => {
    const variables = [
      {
        variable_id: 'var_u1',
        variable_name: 'var_u1_name',
        priority_score: 65,
        usage_frequency: 55,
        impact_level: 80,
        update_frequency: 5,
      },
      {
        variable_id: 'var_u2',
        variable_name: 'var_u2_name',
        priority_score: 65,
        usage_frequency: 55,
        impact_level: 80,
        update_frequency: 18,
      },
      {
        variable_id: 'var_u3',
        variable_name: 'var_u3_name',
        priority_score: 65,
        usage_frequency: 55,
        impact_level: 80,
        update_frequency: 12,
      },
    ];

    const result = judgeModelImprovementProposalVariablePriority(variables);

    // priority_score, impact_level, usage_frequency すべて同値
    // update_frequency: var_u2(18) > var_u3(12) > var_u1(5)
    expect(result[0].variable_id).toBe('var_u2');
    expect(result[1].variable_id).toBe('var_u3');
    expect(result[2].variable_id).toBe('var_u1');
  });
});