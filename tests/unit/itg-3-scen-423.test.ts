import { analyzeMonthlyCostOptimization } from "../../src/logic/it-1-br-3-2-1";

describe("Purchase Record and Monthly Food Cost Savings Analysis", () => {
  // SCEN-423
  test("should skip budget comparison when monthly food budget is not set", () => {
    const user_id = "user_001";
    const analysis_month = "2024-01";
    const monthly_budget = null;
    const actual_cost = 45000;
    const purchase_records = [
      {
        purchase_id: "purchase_001",
        user_id: user_id,
        purchase_date: "2024-01-05",
        item_name: "salmon",
        quantity: 2,
        unit_price: 1500,
        total_price: 3000,
      },
      {
        purchase_id: "purchase_002",
        user_id: user_id,
        purchase_date: "2024-01-10",
        item_name: "rice",
        quantity: 5,
        unit_price: 3000,
        total_price: 15000,
      },
      {
        purchase_id: "purchase_003",
        user_id: user_id,
        purchase_date: "2024-01-15",
        item_name: "vegetables",
        quantity: 10,
        unit_price: 2700,
        total_price: 27000,
      },
    ];

    const input = {
      user_id,
      analysis_month,
      monthly_budget,
      actual_cost,
      purchase_records,
    };

    const result = analyzeMonthlyCostOptimization(input);

    expect(result).toBeDefined();
    expect(result.user_id).toBe(user_id);
    expect(result.analysis_month).toBe("2024-01");
    expect(result.actual_cost).toBe(45000);
    expect(result.budget_set).toBe(false);
    expect(result.comparison_skipped).toBe(true);
    expect(result.message).toMatch(/予算が設定されていません/);
    expect(result.should_retry_after_budget_set).toBe(true);
    expect(result.cost_by_category).toEqual({
      salmon: 3000,
      rice: 15000,
      vegetables: 27000,
    });
    expect(result.total_items_purchased).toBe(3);
  });
});