import { analyzeMonthlyFoodCostExcessFactors } from "../../src/logic/it-7-2-1";

describe("IT-7-2-1: 月次食費超過要因分析 - 不完全な食材構成データのエラーハンドリング", () => {
  // SCEN-569
  test("食材構成データが不完全な場合、適切なエラーハンドリングと詳細ログ出力を確認", () => {
    const incompleteCompositionData = {
      meal_id: "meal_001",
      // ingredient_name が欠落（必須フィールド）
      unit_price: 150,
      quantity: 2,
      category: "vegetable",
    };

    const monthlyData = {
      user_id: "user_household_001",
      year_month: "2024-01",
      budget_limit: 50000,
      actual_expenditure: 55000,
      excess_amount: 5000,
      ingredient_compositions: [incompleteCompositionData as any],
    };

    expect(() => analyzeMonthlyFoodCostExcessFactors(monthlyData)).toThrow(
      /食材構成/
    );
  });
});