import { calculateMonthlyExpenseSummary } from "../../src/logic/it-1-br-2-1-1-1";

describe("月次食費集計機能 - 食費実績が予算額と完全一致する場合", () => {
  test("SCEN-391: 食費実績が予算額と完全一致する場合に削減率が0%と正しく計算される", () => {
    // Arrange: テスト条件の設定
    const budgetAmount = 100000; // 予算額: 100,000円
    const actualExpense = 100000; // 食費実績: 100,000円
    const targetMonth = "2024-01"; // テスト対象月
    const userId = "user_001"; // ユーザーID

    const input = {
      userId,
      targetMonth,
      budgetAmount,
      actualExpense,
    };

    // Act: 月次集計を実行
    const result = calculateMonthlyExpenseSummary(input);

    // Assert: 期待値を検証
    // 1. 削減率が0%であることを確認
    const expectedReductionRate = ((budgetAmount - actualExpense) / budgetAmount) * 100;
    expect(result.reductionRate).toBe(0);

    // 2. 削減率の計算式が正しいことを確認
    expect(result.reductionRate).toBe(expectedReductionRate);

    // 3. 食費実績が予算額と一致していることを確認
    expect(result.actualExpense).toBe(budgetAmount);

    // 4. 超過額が0であることを確認
    expect(result.excessAmount).toBe(0);

    // 5. 月次集計結果の構造を検証
    expect(result).toEqual({
      userId,
      targetMonth,
      budgetAmount: 100000,
      actualExpense: 100000,
      reductionRate: 0,
      excessAmount: 0,
      status: "within_budget",
    });
  });
});