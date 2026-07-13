import { calculateMonthlyBudgetExcessFactor, generateNextMonthMenuWithPriorityMode } from '../../src/logic/it-1-br-2-1-1-1';

describe('月次食費超過要因の分解と次月献立優先条件の自動調整', () => {
  // SCEN-351
  test('超過額が予算の50%以上の場合、次月献立が低価格優先モードに切り替わり、予想費用が15%以上削減される', () => {
    // === Setup: 月次予算と食費実績データの準備 ===
    const budget_amount = 10000; // 月次予算: 10,000円
    const current_month_total_cost = 15500; // 当月食費合計: 15,500円（予算の50%以上超過）
    const excess_amount = current_month_total_cost - budget_amount; // 超過額: 5,500円
    const excess_ratio = excess_amount / budget_amount; // 超過率: 0.55 (55%)

    // 当月の食材購入記録
    const current_month_purchases = [
      { ingredient_name: 'beef', unit_price: 1200, quantity: 5, category: 'meat' }, // 単価: 1,200円
      { ingredient_name: 'salmon', unit_price: 800, quantity: 4, category: 'fish' }, // 単価: 800円
      { ingredient_name: 'avocado', unit_price: 250, quantity: 8, category: 'vegetable' }, // 単価: 250円
      { ingredient_name: 'organic_rice', unit_price: 3500, quantity: 1, category: 'grain' }, // 単価: 3,500円
    ];

    // === Trigger: 超過要因分解ロジックの実行 ===
    const excess_factor_result = calculateMonthlyBudgetExcessFactor({
      user_id: 'user_12345',
      monthly_budget: budget_amount,
      current_month_total_cost: current_month_total_cost,
      purchases: current_month_purchases,
      analysis_date: new Date('2024-01-31T23:59:59Z'),
    });

    // === Assertion 1: 超過額の計算と50%以上超過判定 ===
    expect(excess_factor_result.excess_amount).toBe(5500); // 超過額: 5,500円
    expect(excess_factor_result.excess_ratio).toBe(0.55); // 超過率: 55% > 50% → true
    expect(excess_factor_result.exceeds_50_percent_threshold).toBe(true);

    // === Assertion 2: 超過要因の分解（カテゴリ別コスト分析） ===
    const expected_breakdown = {
      meat_cost: 6000, // beef: 1,200 * 5
      fish_cost: 3200, // salmon: 800 * 4
      vegetable_cost: 2000, // avocado: 250 * 8
      grain_cost: 3500, // organic_rice: 3,500 * 1
    };
    expect(excess_factor_result.category_breakdown.meat_cost).toBe(expected_breakdown.meat_cost);
    expect(excess_factor_result.category_breakdown.fish_cost).toBe(expected_breakdown.fish_cost);
    expect(excess_factor_result.category_breakdown.vegetable_cost).toBe(expected_breakdown.vegetable_cost);
    expect(excess_factor_result.category_breakdown.grain_cost).toBe(expected_breakdown.grain_cost);

    // === Assertion 3: 次月献立優先条件の自動調整判定 ===
    expect(excess_factor_result.next_month_priority_mode).toBe('low_price_priority'); // 低価格優先モード
    expect(excess_factor_result.target_cost_reduction_ratio).toBe(0.15); // 最小15%削減目標

    // === Trigger 2: 次月献立自動生成（低価格優先モード適用） ===
    const next_month_menu_input = {
      user_id: 'user_12345',
      priority_mode: 'low_price_priority',
      family_members: [
        { member_id: 'member_1', age: 35, gender: 'male', nutritional_requirement: 'standard' },
        { member_id: 'member_2', age: 32, gender: 'female', nutritional_requirement: 'standard' },
        { member_id: 'member_3', age: 8, gender: 'male', nutritional_requirement: 'standard' },
      ],
      monthly_budget_for_next_month: 8500, // 当月の15%削減: 10,000 * 0.85 = 8,500円
      target_cost_reduction: 1500, // 目標削減額: 15,000 * 0.10 = 1,500円（当月実績の10%削減）
      previous_month_actual_cost: 15500,
      generation_date: new Date('2024-02-01T09:00:00Z'),
    };

    const next_month_menu = generateNextMonthMenuWithPriorityMode(next_month_menu_input);

    // === Assertion 4: 低価格優先モードの適用確認 ===
    expect(next_month_menu.priority_mode).toBe('low_price_priority');
    expect(next_month_menu.is_low_price_priority_mode_applied).toBe(true);

    // === Assertion 5: 生成献立の食材選定が低価格食材を優先 ===
    // 低価格優先モード: 高単価食材（beef: 1,200円, salmon: 800円）を削減し、
    // 低単価食材（vegetable, grain の代替品）を増加
    const next_month_ingredients = next_month_menu.menu_items;
    
    // 高単価食材の使用頻度が前月より削減
    const beef_usage_next_month = next_month_ingredients.filter((item: any) => item.ingredient_name === 'beef').length;
    const salmon_usage_next_month = next_month_ingredients.filter((item: any) => item.ingredient_name === 'salmon').length;
    
    expect(beef_usage_next_month).toBeLessThanOrEqual(2); // 前月 5 回から削減
    expect(salmon_usage_next_month).toBeLessThanOrEqual(2); // 前月 4 回から削減

    // === Assertion 6: 次月予想費用の計算と削減率の検証 ===
    const next_month_expected_cost = next_month_menu.estimated_total_cost;
    const cost_reduction_amount = current_month_total_cost - next_month_expected_cost;
    const actual_reduction_ratio = cost_reduction_amount / current_month_total_cost;

    // 削減額: 15,500 - 次月予想費用 >= 1,500円 (前月比10%以上削減)
    expect(cost_reduction_amount).toBeGreaterThanOrEqual(1500);
    
    // 削減率: 実績削減率 >= 10% (当月実績から)
    expect(actual_reduction_ratio).toBeGreaterThanOrEqual(0.10);
    
    // 予算内収納: 次月予想費用 <= 次月予算
    expect(next_month_expected_cost).toBeLessThanOrEqual(8500);

    // === Assertion 7: 各食材のコスト効率性（栄養価あたりのコスト）を確認 ===
    const low_price_items = next_month_menu.menu_items.filter(
      (item: any) => item.cost_efficiency_score !== undefined
    );
    
    // 低価格優先モード適用時は、高コスト効率（栄養価あたりのコストが低い）食材が優先
    for (const item of low_price_items) {
      expect(item.cost_efficiency_score).toBeGreaterThan(0.75); // コスト効率スコア > 75%
    }

    // === Assertion 8: 平均単価の低下を確認 ===
    const current_month_avg_unit_price = current_month_total_cost / current_month_purchases.reduce((sum: number, p: any) => sum + p.quantity, 0);
    const next_month_avg_unit_price = next_month_menu.average_unit_price;
    
    expect(next_month_avg_unit_price).toBeLessThan(current_month_avg_unit_price);

    // === Assertion 9: 低価格優先モードの適用がシステムログに記録 ===
    expect(next_month_menu.mode_change_log).toEqual({
      change_type: 'priority_mode_switch',
      from_mode: 'balanced',
      to_mode: 'low_price_priority',
      triggered_by_excess_ratio: 0.55,
      threshold_condition: 'excess_amount >= 50% of budget',
      timestamp: expect.any(Date),
      applied_to_menu_generation: true,
    });

    // === Assertion 10: 次月献立の栄養バランスが最小基準を満たすことを確認 ===
    // 低価格優先でも栄養基準は維持（最小基準）
    expect(next_month_menu.nutrition_score).toBeGreaterThanOrEqual(0.75); // 栄養スコア >= 75%
    expect(next_month_menu.family_satisfaction_score).toBeGreaterThanOrEqual(0.70); // 家族満足度 >= 70%

    // === 総合検証 ===
    expect(next_month_menu.estimated_total_cost).toBeCloseTo(
      current_month_total_cost * 0.85,
      1 // 小数点第1位まで許容（約15%削減）
    );
  });
});