import { analyzeMonthlyFoodCostExcessCauses } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証 - 月次食費超過要因分析", () => {
  // SCEN-350: [error] 月次食費超過要因の分解と次月献立優先条件の自動調整 - 購入記録が0件の場合、超過要因分析が実行されず、エラーが返却される
  test("購入記録が0件の場合、エラーメッセージが返却され超過要因分析が実行されないこと", () => {
    const input = {
      target_year_month: "2024-01",
      user_id: "user_001",
      purchase_records: [],
      monthly_budget: 50000,
      actual_spending: 55000,
    };

    expect(() =>
      analyzeMonthlyFoodCostExcessCauses(input)
    ).toThrow(/購入記録/);
  });
});