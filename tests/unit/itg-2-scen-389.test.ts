import { calculateMonthlyCostAggregation } from '../../src/logic/it-1-br-2-1-1-1';

describe('Monthly Food Cost Aggregation Dashboard', () => {
  // SCEN-389
  test('should accurately aggregate monthly food expenses, budget savings rate, ingredient-wise cost analysis, and satisfaction scores', () => {
    // Preconditions: User logged in, food records for past 30 days recorded with expense amounts and satisfaction scores
    const monthly_budget = 50000; // JPY
    const food_records = [
      {
        record_id: 'REC001',
        user_id: 'USER123',
        meal_date: '2024-01-05',
        expense_amount: 1500,
        satisfaction_score: 8,
        ingredients: [
          { ingredient_name: '鶏肉', ingredient_category: 'タンパク質', cost: 600 },
          { ingredient_name: 'キャベツ', ingredient_category: '野菜', cost: 300 },
          { ingredient_name: '米', ingredient_category: '炭水化物', cost: 600 },
        ],
      },
      {
        record_id: 'REC002',
        user_id: 'USER123',
        meal_date: '2024-01-12',
        expense_amount: 2000,
        satisfaction_score: 9,
        ingredients: [
          { ingredient_name: '豚肉', ingredient_category: 'タンパク質', cost: 800 },
          { ingredient_name: 'トマト', ingredient_category: '野菜', cost: 400 },
          { ingredient_name: 'パスタ', ingredient_category: '炭水化物', cost: 800 },
        ],
      },
      {
        record_id: 'REC003',
        user_id: 'USER123',
        meal_date: '2024-01-19',
        expense_amount: 1800,
        satisfaction_score: 7,
        ingredients: [
          { ingredient_name: '魚', ingredient_category: 'タンパク質', cost: 900 },
          { ingredient_name: 'ほうれん草', ingredient_category: '野菜', cost: 300 },
          { ingredient_name: 'パン', ingredient_category: '炭水化物', cost: 600 },
        ],
      },
      {
        record_id: 'REC004',
        user_id: 'USER123',
        meal_date: '2024-01-26',
        expense_amount: 1700,
        satisfaction_score: 8,
        ingredients: [
          { ingredient_name: '牛肉', ingredient_category: 'タンパク質', cost: 700 },
          { ingredient_name: 'ニンジン', ingredient_category: '野菜', cost: 200 },
          { ingredient_name: 'じゃがいも', ingredient_category: '炭水化物', cost: 800 },
        ],
      },
    ];

    const target_month = '2024-01';
    const currency = 'JPY';

    // Execute: Call the aggregation function
    const result = calculateMonthlyCostAggregation({
      user_id: 'USER123',
      target_month: target_month,
      food_records: food_records,
      monthly_budget: monthly_budget,
      currency: currency,
    });

    // Expected values calculated from input:
    // Total expense: 1500 + 2000 + 1800 + 1700 = 7000 JPY
    const expected_total_expense = 7000;

    // Budget savings rate: (Budget - Expense) / Budget * 100 = (50000 - 7000) / 50000 * 100 = 86%
    const expected_budget_savings_rate = 86;

    // Average satisfaction score: (8 + 9 + 7 + 8) / 4 = 8.0
    const expected_avg_satisfaction_score = 8.0;

    // Ingredient-wise cost analysis (by category):
    // タンパク質 (Protein): 600 + 800 + 900 + 700 = 2800 JPY
    // 野菜 (Vegetables): 300 + 400 + 300 + 200 = 1200 JPY
    // 炭水化物 (Carbohydrates): 600 + 800 + 600 + 800 = 2800 JPY
    const expected_ingredient_analysis = {
      'タンパク質': 2800,
      '野菜': 1200,
      '炭水化物': 2800,
    };

    // Assertions: Verify all aggregated values
    expect(result.total_monthly_expense).toBe(expected_total_expense);
    expect(result.budget_savings_rate).toBe(expected_budget_savings_rate);
    expect(result.average_satisfaction_score).toBe(expected_avg_satisfaction_score);
    expect(result.ingredient_wise_cost_analysis).toEqual(expected_ingredient_analysis);
    expect(result.target_month).toBe('2024-01');
    expect(result.record_count).toBe(4);
    expect(result.currency).toBe('JPY');

    // Verify aggregation consistency
    expect(
      result.ingredient_wise_cost_analysis['タンパク質'] +
        result.ingredient_wise_cost_analysis['野菜'] +
        result.ingredient_wise_cost_analysis['炭水化物']
    ).toBe(expected_total_expense);

    // Verify budget savings rate calculation formula
    expect(result.budget_savings_rate).toBe(
      ((monthly_budget - expected_total_expense) / monthly_budget) * 100
    );
  });
});