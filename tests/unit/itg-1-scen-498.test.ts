import { analyzeMonthlyFoodCostOverage } from "../../src/logic/it-2";

describe("月次食費超過要因の分解と可視化", () => {
  // SCEN-498
  test("月次食費超過の要因が献立の食材構成と購入単価変動に正しく分解される", () => {
    const monthlyBudget = 10000;
    const actualExpense = 12500;
    const mealComponentCostIncrease = 1200;
    const unitPriceChangeIncrease = 1300;

    const result = analyzeMonthlyFoodCostOverage({
      budget: monthlyBudget,
      actual_expense: actualExpense,
      meal_component_increase: mealComponentCostIncrease,
      unit_price_change_increase: unitPriceChangeIncrease,
    });

    expect(result.overage_amount).toBe(2500);
    expect(result.meal_component_factor).toBe(1200);
    expect(result.unit_price_factor).toBe(1300);
    expect(result.total_factor_sum).toBe(2500);
    expect(result.meal_component_percentage).toBe(48);
    expect(result.unit_price_percentage).toBe(52);
    expect(result.is_factors_aligned).toBe(true);
    expect(result.visualization_data).toEqual({
      meal_component_amount: 1200,
      unit_price_amount: 1300,
      chart_type: "stacked_bar",
      labels: ["食材構成", "購入単価変動"],
    });
    expect(result.drilldown_details).toHaveLength(2);
    expect(result.drilldown_details[0]).toEqual({
      factor_type: "meal_component",
      amount: 1200,
      percentage: 48,
      description: "献立の食材構成による超過要因",
    });
    expect(result.drilldown_details[1]).toEqual({
      factor_type: "unit_price_change",
      amount: 1300,
      percentage: 52,
      description: "購入単価変動による超過要因",
    });
  });
});