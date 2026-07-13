import { analyzeMonthlyFoodExpenseExcess } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase Record and Monthly Food Expense Analysis', () => {
  // SCEN-411
  test('should automatically update dashboard display data based on latest menu results and purchase records', () => {
    // Precondition: User logged in, dashboard open with current month's food expense and budget info
    const current_month = '2024-01';
    const user_id = 'user_001';
    const family_id = 'family_001';
    const budget_amount = 50000; // JPY

    // Existing purchase records before new entry
    const existing_purchases = [
      {
        purchase_id: 'purchase_001',
        user_id: user_id,
        purchase_date: '2024-01-05',
        category: 'vegetable',
        amount: 3500,
        item_count: 5,
      },
      {
        purchase_id: 'purchase_002',
        user_id: user_id,
        purchase_date: '2024-01-10',
        category: 'meat',
        amount: 8200,
        item_count: 3,
      },
    ];

    // Existing menu results
    const existing_menu_results = [
      {
        menu_id: 'menu_001',
        user_id: user_id,
        family_id: family_id,
        menu_date: '2024-01-05',
        dishes: [
          { dish_name: 'grilled_chicken', estimated_cost: 1200 },
        ],
        total_cost: 1200,
      },
      {
        menu_id: 'menu_002',
        user_id: user_id,
        family_id: family_id,
        menu_date: '2024-01-10',
        dishes: [
          { dish_name: 'salmon_pasta', estimated_cost: 2800 },
        ],
        total_cost: 2800,
      },
    ];

    // Calculate existing monthly total
    const existing_total = existing_purchases.reduce((sum, p) => sum + p.amount, 0);
    expect(existing_total).toBe(11700);

    // New menu result registered (dinner menu)
    const new_menu_result = {
      menu_id: 'menu_003',
      user_id: user_id,
      family_id: family_id,
      menu_date: '2024-01-15',
      dishes: [
        { dish_name: 'beef_stew', estimated_cost: 3200 },
        { dish_name: 'salad', estimated_cost: 800 },
      ],
      total_cost: 4000,
    };

    // New purchase record added (supermarket receipt)
    const new_purchase_record = {
      purchase_id: 'purchase_003',
      user_id: user_id,
      purchase_date: '2024-01-15',
      category: 'meat',
      amount: 4500,
      item_count: 2,
      distributor_id: 'supermarket_001',
      items: [
        { item_name: 'beef_chuck', quantity: 800, unit_price: 2800 },
        { item_name: 'potato', quantity: 1000, unit_price: 1700 },
      ],
    };

    // Combine all purchase records after new entry
    const all_purchases = [...existing_purchases, new_purchase_record];

    // Input to analysis function
    const analysis_input = {
      user_id: user_id,
      month: current_month,
      budget: budget_amount,
      purchases: all_purchases,
      menu_results: [...existing_menu_results, new_menu_result],
    };

    // Call analysis function
    const result = analyzeMonthlyFoodExpenseExcess(analysis_input);

    // Verify: Monthly food expense total is updated
    const updated_total = all_purchases.reduce((sum, p) => sum + p.amount, 0);
    expect(updated_total).toBe(16200);
    expect(result.total_expense_amount).toBe(16200);

    // Verify: Excess analysis section reflects new registered item
    expect(result.excess_factors).toBeDefined();
    expect(result.excess_factors.length).toBeGreaterThan(0);

    // Check if meat category increased due to new purchase
    const meat_factor = result.excess_factors.find((f: any) => f.category === 'meat');
    expect(meat_factor).toBeDefined();
    expect(meat_factor.amount).toBe(12700); // 8200 + 4500

    // Verify: Category-wise breakdown is recalculated with latest data
    const category_breakdown = result.category_breakdown;
    expect(category_breakdown).toBeDefined();
    expect(category_breakdown.vegetable).toBe(3500);
    expect(category_breakdown.meat).toBe(12700);
    expect(category_breakdown.total).toBe(16200);

    // Verify: Budget comparison is correctly updated
    const budget_excess = result.total_expense_amount - result.budget;
    expect(budget_excess).toBe(-33800); // 16200 - 50000 (within budget, negative excess)
    expect(result.is_over_budget).toBe(false);
    expect(result.remaining_budget).toBe(33800);

    // Verify: Dashboard metrics are accurate
    expect(result.monthly_total).toBe(16200);
    expect(result.budget_utilization_rate).toBe(32.4); // (16200 / 50000) * 100
    expect(result.excess_percentage).toBe(0); // Not exceeded

    // Verify: New purchase is reflected in excess factor analysis
    const has_new_purchase_in_factors = result.excess_factors.some(
      (f: any) => f.purchase_id === 'purchase_003'
    );
    expect(has_new_purchase_in_factors).toBe(true);

    // Verify: Menu contribution to expenses
    const total_menu_cost = [...existing_menu_results, new_menu_result].reduce(
      (sum, m) => sum + m.total_cost,
      0
    );
    expect(total_menu_cost).toBe(8000); // 1200 + 2800 + 4000
    expect(result.total_menu_estimated_cost).toBe(8000);

    // Verify: Actual vs estimated cost variance
    const cost_variance = result.total_expense_amount - result.total_menu_estimated_cost;
    expect(cost_variance).toBe(8200); // 16200 - 8000 (market prices higher than estimated)

    // Verify: All dashboard sections are present and updated
    expect(result.dashboard_update_timestamp).toBeDefined();
    expect(result.data_refresh_status).toBe('updated');
  });
});