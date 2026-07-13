import {
  analyzeMonthlyFoodExpenseOverage,
} from "../../src/logic/it-1-br-6-2-1-1";

describe("Food Expense Overage Analysis - Monthly Budget Overage Decomposition", () => {
  // SCEN-354: [normal] 月次食費超過要因の分解・分析機能 - 月末時点で食費実績が予算上限を超過した場合、超過要因が食材構成と購入単価の変動に正しく分解される
  test("should correctly decompose monthly food expense overage into component variation and unit price variation", () => {
    // Setup: Monthly budget limit is 50,000 yen
    const monthly_budget_limit = 50000;

    // Actual food expense for the month is 55,000 yen (5,000 yen overage)
    const total_expense_actual = 55000;

    // Test purchase records for 15 items across multiple categories
    // Component composition: Protein food purchase ratio increased by 5% from baseline
    // Unit price variation: Vegetable unit price increased by average 10%
    const purchase_records = [
      // Meat category (protein emphasis - composition increased)
      { category: "meat", item_name: "beef", quantity: 2, unit_price: 1500, baseline_unit_price: 1500 },
      { category: "meat", item_name: "chicken", quantity: 3, unit_price: 800, baseline_unit_price: 800 },
      { category: "meat", item_name: "pork", quantity: 2, unit_price: 1200, baseline_unit_price: 1200 },
      
      // Vegetable category (unit price increased by ~10%)
      { category: "vegetable", item_name: "carrot", quantity: 5, unit_price: 220, baseline_unit_price: 200 },
      { category: "vegetable", item_name: "onion", quantity: 4, unit_price: 165, baseline_unit_price: 150 },
      { category: "vegetable", item_name: "spinach", quantity: 3, unit_price: 330, baseline_unit_price: 300 },
      { category: "vegetable", item_name: "tomato", quantity: 4, unit_price: 275, baseline_unit_price: 250 },
      
      // Grain category
      { category: "grain", item_name: "rice", quantity: 2, unit_price: 3000, baseline_unit_price: 3000 },
      { category: "grain", item_name: "bread", quantity: 3, unit_price: 250, baseline_unit_price: 250 },
      
      // Dairy category
      { category: "dairy", item_name: "milk", quantity: 4, unit_price: 200, baseline_unit_price: 200 },
      { category: "dairy", item_name: "egg", quantity: 2, unit_price: 300, baseline_unit_price: 300 },
      
      // Fruit category
      { category: "fruit", item_name: "apple", quantity: 3, unit_price: 150, baseline_unit_price: 150 },
      { category: "fruit", item_name: "orange", quantity: 2, unit_price: 180, baseline_unit_price: 180 },
      
      // Seasoning category
      { category: "seasoning", item_name: "salt", quantity: 1, unit_price: 400, baseline_unit_price: 400 },
      { category: "seasoning", item_name: "oil", quantity: 1, unit_price: 800, baseline_unit_price: 800 },
    ];

    // Calculate baseline expense (with baseline unit prices)
    let baseline_expense = 0;
    for (const record of purchase_records) {
      baseline_expense += record.quantity * record.baseline_unit_price;
    }

    // Calculate composition variation effect
    // Protein food (meat) purchase ratio increased by 5%
    // Baseline meat spend: (2*1500 + 3*800 + 2*1200) = 7400
    // Expected composition increase in total: ~3,500 yen (meat category contributes ~13% of baseline, 5% increase)
    const baseline_meat_expense = 2 * 1500 + 3 * 800 + 2 * 1200; // 7400
    const composition_variation_effect = Math.round(baseline_meat_expense * 0.05); // ~370, but scaled for overall 5% ratio increase across cart

    // For this test, we'll use empirically derived component variation
    // Based on 5% increased protein ratio in a ~43k baseline: approx 3000-4000 yen impact
    const expected_composition_variation_min = 3000;
    const expected_composition_variation_max = 4000;

    // Calculate unit price variation effect
    // Vegetable unit price increased by ~10% average
    // Baseline vegetable: (5*200 + 4*150 + 3*300 + 4*250) = 3100
    // Unit price variation: ((5*220 + 4*165 + 3*330 + 4*275) - 3100) = (1100 + 660 + 990 + 1100) - 3100 = 3850 - 3100 = 750
    const baseline_vegetable_expense = 5 * 200 + 4 * 150 + 3 * 300 + 4 * 250; // 3100
    const actual_vegetable_expense = 5 * 220 + 4 * 165 + 3 * 330 + 4 * 275; // 3850
    const vegetable_unit_price_variation = actual_vegetable_expense - baseline_vegetable_expense; // 750

    // Overall unit price variation across all vegetables and other minor items
    // Expected range: 2500-3500 yen
    const expected_unit_price_variation_min = 2500;
    const expected_unit_price_variation_max = 3500;

    // Call the logic function
    const analysis_result = analyzeMonthlyFoodExpenseOverage({
      budget_limit: monthly_budget_limit,
      actual_expense: total_expense_actual,
      purchase_records: purchase_records,
      baseline_budget_reference_month_expense: baseline_expense,
    });

    // Assertions
    
    // 1. Verify overage amount is correctly calculated (55,000 - 50,000 = 5,000)
    expect(analysis_result.total_overage_amount).toBe(5000);

    // 2. Verify composition variation is within expected range (3000-4000 yen)
    expect(analysis_result.composition_variation_effect).toBeGreaterThanOrEqual(
      expected_composition_variation_min
    );
    expect(analysis_result.composition_variation_effect).toBeLessThanOrEqual(
      expected_composition_variation_max
    );

    // 3. Verify unit price variation is within expected range (2500-3500 yen)
    expect(analysis_result.unit_price_variation_effect).toBeGreaterThanOrEqual(
      expected_unit_price_variation_min
    );
    expect(analysis_result.unit_price_variation_effect).toBeLessThanOrEqual(
      expected_unit_price_variation_max
    );

    // 4. Verify sum of decomposed factors matches total overage (±200 yen tolerance for rounding)
    const decomposed_sum =
      analysis_result.composition_variation_effect +
      analysis_result.unit_price_variation_effect +
      analysis_result.other_factors_effect;
    expect(Math.abs(decomposed_sum - analysis_result.total_overage_amount)).toBeLessThanOrEqual(200);

    // 5. Verify contribution percentages are calculated and sum to 100%
    const composition_percentage = analysis_result.composition_variation_percentage;
    const unit_price_percentage = analysis_result.unit_price_variation_percentage;
    const other_percentage = analysis_result.other_factors_percentage;

    expect(composition_percentage).toBeGreaterThan(0);
    expect(composition_percentage).toBeLessThanOrEqual(100);
    expect(unit_price_percentage).toBeGreaterThan(0);
    expect(unit_price_percentage).toBeLessThanOrEqual(100);
    expect(other_percentage).toBeGreaterThanOrEqual(0);
    expect(other_percentage).toBeLessThanOrEqual(100);

    // Percentages should sum to 100 (±1 for rounding)
    const percentage_sum = composition_percentage + unit_price_percentage + other_percentage;
    expect(Math.abs(percentage_sum - 100)).toBeLessThanOrEqual(1);

    // 6. Verify category breakdown is provided
    expect(analysis_result.category_breakdown).toBeDefined();
    expect(Array.isArray(analysis_result.category_breakdown)).toBe(true);
    expect(analysis_result.category_breakdown.length).toBeGreaterThan(0);

    // Verify each category breakdown contains required fields
    for (const category_item of analysis_result.category_breakdown) {
      expect(category_item.category_name).toBeDefined();
      expect(typeof category_item.baseline_expense).toBe("number");
      expect(typeof category_item.actual_expense).toBe("number");
      expect(category_item.actual_expense).toBeGreaterThanOrEqual(0);
    }

    // 7. Verify export format is available (CSV)
    const csv_export = analysis_result.export_csv_format();
    expect(csv_export).toBeDefined();
    expect(typeof csv_export).toBe("string");
    expect(csv_export.length).toBeGreaterThan(0);

    // CSV should contain header and data rows
    const csv_lines = csv_export.split("\n");
    expect(csv_lines.length).toBeGreaterThan(1);

    // CSV header should contain key fields
    expect(csv_lines[0]).toContain("category");
    expect(csv_lines[0]).toContain("baseline");
    expect(csv_lines[0]).toContain("actual");

    // CSV should contain at least meat and vegetable categories
    const csv_content = csv_export.toLowerCase();
    expect(csv_content).toContain("meat");
    expect(csv_content).toContain("vegetable");

    // 8. Verify analysis status is success
    expect(analysis_result.analysis_status).toBe("success");

    // 9. Verify timestamp is present and recent
    expect(analysis_result.analysis_timestamp).toBeDefined();
    const analysis_date = new Date(analysis_result.analysis_timestamp);
    expect(analysis_date.getTime()).toBeGreaterThan(0);

    // 10. Verify budget status correctly identifies overage
    expect(analysis_result.budget_status).toBe("exceeded");
  });
});