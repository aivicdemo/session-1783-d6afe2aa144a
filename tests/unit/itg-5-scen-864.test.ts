import { categorizeAndPrioritizeFailures } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-864
  test('失敗パターン優先度付け機能 - 失敗カテゴリの発生頻度と改善優先度が根拠付けられて出力される', () => {
    const failure_records = [
      { id: '1', reason_text: '栄養バランスが家族の好みと合わない', category: null },
      { id: '2', reason_text: '調理時間が目標を超過した', category: null },
      { id: '3', reason_text: '栄養バランスが家族の好みと合わない', category: null },
      { id: '4', reason_text: '食材制限を反映できていない', category: null },
      { id: '5', reason_text: '調理時間が目標を超過した', category: null },
      { id: '6', reason_text: '調理時間が目標を超過した', category: null },
      { id: '7', reason_text: '予算上限を超過している', category: null },
      { id: '8', reason_text: '栄養バランスが家族の好みと合わない', category: null },
      { id: '9', reason_text: '調理時間が目標を超過した', category: null },
      { id: '10', reason_text: '食材制限を反映できていない', category: null },
    ];

    const predefined_categories = [
      'nutrition_balance',
      'cooking_time',
      'food_restriction',
      'budget_exceeded',
    ];

    const category_keywords = {
      nutrition_balance: ['栄養', 'バランス', '好み'],
      cooking_time: ['調理時間', '超過'],
      food_restriction: ['食材制限', '反映'],
      budget_exceeded: ['予算', '超過'],
    };

    const result = categorizeAndPrioritizeFailures(
      failure_records,
      predefined_categories,
      category_keywords,
    );

    // Assertions for categorization
    expect(result.categorized_records.length).toBe(10);
    expect(result.categorized_records[0].category).toBe('nutrition_balance');
    expect(result.categorized_records[1].category).toBe('cooking_time');
    expect(result.categorized_records[3].category).toBe('food_restriction');
    expect(result.categorized_records[6].category).toBe('budget_exceeded');

    // Assertions for aggregation (frequency count)
    // Expected frequencies: cooking_time=4, nutrition_balance=3, food_restriction=2, budget_exceeded=1
    expect(result.aggregated_stats.length).toBe(4);

    // Priority 1: cooking_time (frequency=4, percentage=40%)
    expect(result.aggregated_stats[0].category).toBe('cooking_time');
    expect(result.aggregated_stats[0].frequency_count).toBe(4);
    expect(result.aggregated_stats[0].frequency_percentage).toBe(40);
    expect(result.aggregated_stats[0].priority_rank).toBe(1);

    // Priority 2: nutrition_balance (frequency=3, percentage=30%)
    expect(result.aggregated_stats[1].category).toBe('nutrition_balance');
    expect(result.aggregated_stats[1].frequency_count).toBe(3);
    expect(result.aggregated_stats[1].frequency_percentage).toBe(30);
    expect(result.aggregated_stats[1].priority_rank).toBe(2);

    // Priority 3: food_restriction (frequency=2, percentage=20%)
    expect(result.aggregated_stats[2].category).toBe('food_restriction');
    expect(result.aggregated_stats[2].frequency_count).toBe(2);
    expect(result.aggregated_stats[2].frequency_percentage).toBe(20);
    expect(result.aggregated_stats[2].priority_rank).toBe(3);

    // Priority 4: budget_exceeded (frequency=1, percentage=10%)
    expect(result.aggregated_stats[3].category).toBe('budget_exceeded');
    expect(result.aggregated_stats[3].frequency_count).toBe(1);
    expect(result.aggregated_stats[3].frequency_percentage).toBe(10);
    expect(result.aggregated_stats[3].priority_rank).toBe(4);

    // Assertions for reasoning/justification
    expect(result.aggregated_stats[0].reasoning).toContain(
      'cooking_time',
    );
    expect(result.aggregated_stats[0].reasoning).toContain('4');
    expect(result.aggregated_stats[0].reasoning).toContain('40');

    expect(result.aggregated_stats[1].reasoning).toContain(
      'nutrition_balance',
    );
    expect(result.aggregated_stats[1].reasoning).toContain('3');
    expect(result.aggregated_stats[1].reasoning).toContain('30');

    // Assertions for prioritization order
    const priority_order = result.aggregated_stats.map(
      (stat) => stat.priority_rank,
    );
    expect(priority_order).toEqual([1, 2, 3, 4]);

    // Assertions for categorization success rate
    const categorized_count = result.categorized_records.filter(
      (r) => r.category !== null,
    ).length;
    expect(categorized_count).toBe(10);

    // Assertions for total records consistency
    expect(result.total_records).toBe(10);
  });
});