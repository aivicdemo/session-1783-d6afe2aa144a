import { calculateMonthlyCostSummary } from "../../src/logic/it-1-br-2-1-1-1";

describe("月次食費実績集計ダッシュボード機能", () => {
  test("SCEN-425: 当月の総食費・予算上限との差分・食費超過有無・カテゴリ別支出内訳が自動集計される", () => {
    // Arrange: 当月の食費取引データを準備
    const current_month = "2024-01-31";
    const transactions = [
      {
        transaction_id: "tx_001",
        user_id: "user_123",
        transaction_date: "2024-01-05",
        category: "食材",
        amount: 2500,
        description: "スーパーでの食材購入"
      },
      {
        transaction_id: "tx_002",
        user_id: "user_123",
        transaction_date: "2024-01-10",
        category: "食材",
        amount: 3200,
        description: "スーパーでの食材購入"
      },
      {
        transaction_id: "tx_003",
        user_id: "user_123",
        transaction_date: "2024-01-15",
        category: "外食",
        amount: 1800,
        description: "家族で外食"
      },
      {
        transaction_id: "tx_004",
        user_id: "user_123",
        transaction_date: "2024-01-20",
        category: "飲料",
        amount: 800,
        description: "飲料の購入"
      },
      {
        transaction_id: "tx_005",
        user_id: "user_123",
        transaction_date: "2024-01-25",
        category: "食材",
        amount: 1700,
        description: "スーパーでの食材購入"
      }
    ];

    const budget_limit = 8000;

    // Act: ダッシュボード集計関数を実行
    const result = calculateMonthlyCostSummary({
      user_id: "user_123",
      target_month: "2024-01",
      transactions: transactions,
      budget_limit: budget_limit
    });

    // Assert: 総食費の正確性
    const expected_total_cost = 2500 + 3200 + 1800 + 800 + 1700;
    expect(result.total_cost).toBe(10000);
    expect(result.total_cost).toBe(expected_total_cost);

    // Assert: 予算上限との差分
    const expected_difference = expected_total_cost - budget_limit;
    expect(result.difference_from_budget).toBe(2000);
    expect(result.difference_from_budget).toBe(expected_difference);

    // Assert: 食費超過フラグ
    expect(result.is_over_budget).toBe(true);

    // Assert: カテゴリ別支出内訳の正確性
    expect(result.category_breakdown).toEqual({
      食材: 7400,
      外食: 1800,
      飲料: 800
    });

    // Assert: 各カテゴリ合計が総食費に正しく反映されている
    const sum_of_categories = 7400 + 1800 + 800;
    expect(sum_of_categories).toBe(expected_total_cost);
    expect(sum_of_categories).toBe(result.total_cost);

    // Assert: 当月の日付が正しく処理されている
    expect(result.target_month).toBe("2024-01");

    // Assert: 予算上限が正確に保持されている
    expect(result.budget_limit).toBe(8000);

    // Assert: すべての数値が整合性を持つ
    expect(result.total_cost).toBe(
      result.category_breakdown.食材 +
        result.category_breakdown.外食 +
        result.category_breakdown.飲料
    );

    // Assert: レスポンス構造の完全性
    expect(result).toHaveProperty("total_cost");
    expect(result).toHaveProperty("difference_from_budget");
    expect(result).toHaveProperty("is_over_budget");
    expect(result).toHaveProperty("category_breakdown");
    expect(result).toHaveProperty("target_month");
    expect(result).toHaveProperty("budget_limit");
  });
});