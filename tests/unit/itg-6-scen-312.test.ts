import { generatePainFactorPriorityMatrix } from '../../src/logic/it-1-br-8-2-1-1';

describe('ユーザーセグメント別の利用パターン分析ダッシュボード', () => {
  // SCEN-312
  test('[normal] ペイン要因定量化・優先度マトリクス生成機能 - インタビュー記録とアプリ内ログから食材制限・調理時間制限・予算制約の発生頻度と影響度が数値化され、優先度マトリクスが生成される', () => {
    const interview_records = [
      {
        pain_factor_category: '食材制限',
        occurrence_count: 3,
      },
      {
        pain_factor_category: '調理時間制限',
        occurrence_count: 2,
      },
      {
        pain_factor_category: '予算制約',
        occurrence_count: 4,
      },
    ];

    const app_log_entries = [
      {
        pain_factor_category: '食材制限',
        operation_log_count: 15,
        impact_level: 'high',
      },
      {
        pain_factor_category: '調理時間制限',
        operation_log_count: 8,
        impact_level: 'medium',
      },
      {
        pain_factor_category: '予算制約',
        operation_log_count: 12,
        impact_level: 'high',
      },
    ];

    const result = generatePainFactorPriorityMatrix(
      interview_records,
      app_log_entries
    );

    expect(result).toBeDefined();
    expect(result.pain_factors).toBeDefined();
    expect(Array.isArray(result.pain_factors)).toBe(true);
    expect(result.pain_factors.length).toBe(3);

    const food_restriction = result.pain_factors.find(
      (pf) => pf.pain_factor_category === '食材制限'
    );
    expect(food_restriction).toBeDefined();
    expect(food_restriction?.occurrence_frequency).toBe(18);
    expect(food_restriction?.impact_level).toBe('high');
    expect(food_restriction?.priority_rank).toBe(1);

    const cooking_time_restriction = result.pain_factors.find(
      (pf) => pf.pain_factor_category === '調理時間制限'
    );
    expect(cooking_time_restriction).toBeDefined();
    expect(cooking_time_restriction?.occurrence_frequency).toBe(10);
    expect(cooking_time_restriction?.impact_level).toBe('medium');
    expect(cooking_time_restriction?.priority_rank).toBe(3);

    const budget_constraint = result.pain_factors.find(
      (pf) => pf.pain_factor_category === '予算制約'
    );
    expect(budget_constraint).toBeDefined();
    expect(budget_constraint?.occurrence_frequency).toBe(16);
    expect(budget_constraint?.impact_level).toBe('high');
    expect(budget_constraint?.priority_rank).toBe(2);

    expect(result.priority_matrix).toBeDefined();
    expect(result.priority_matrix.high_priority_zone).toBeDefined();
    expect(result.priority_matrix.high_priority_zone.length).toBe(2);
    expect(
      result.priority_matrix.high_priority_zone.map(
        (pf) => pf.pain_factor_category
      )
    ).toEqual(expect.arrayContaining(['食材制限', '予算制約']));

    expect(result.priority_matrix.medium_priority_zone).toBeDefined();
    expect(result.priority_matrix.medium_priority_zone.length).toBe(1);
    expect(result.priority_matrix.medium_priority_zone[0].pain_factor_category).toBe(
      '調理時間制限'
    );

    expect(result.priority_matrix.low_priority_zone).toBeDefined();
    expect(result.priority_matrix.low_priority_zone.length).toBe(0);

    expect(result.matrix_generated_at).toBeDefined();
    expect(typeof result.matrix_generated_at).toBe('string');
    expect(result.quantification_status).toBe('completed');
  });
});