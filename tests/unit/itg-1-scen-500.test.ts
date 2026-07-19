import { analyzeMonthlyFoodExpenseExcessReasons } from "../../src/logic/it-2";

describe("家族成員の食事評価データの蓄積・管理機能", () => {
  // SCEN-500
  test("月次食費超過要因の分解と可視化 - 購入記録データが不完全な場合、要因分解がエラーとなる", () => {
    const incompletePurchaseRecords = [
      {
        purchase_id: "PUR001",
        food_name: "米",
        quantity: 5,
        unit: "kg",
        purchase_date: "2024-01-10",
        amount: 1500,
        distributor_id: "DIST001",
      },
      {
        purchase_id: "PUR002",
        food_name: "鶏肉",
        quantity: 2,
        unit: "kg",
        purchase_date: "2024-01-12",
        amount: null,
      },
      {
        purchase_id: "PUR003",
        food_name: "野菜セット",
        quantity: 1,
        unit: "box",
        ...{ purchase_date: "2024-01-15" },
        purchase_date: "2024-01-15",
        amount: undefined,
      },
    ];

    const monthlyBudget = {
      month: "2024-01",
      budget_limit: 30000,
      user_id: "USR001",
    };

    expect(() =>
      analyzeMonthlyFoodExpenseExcessReasons(
        incompletePurchaseRecords,
        monthlyBudget
      )
    ).toThrow(/金額情報/);
  });
});