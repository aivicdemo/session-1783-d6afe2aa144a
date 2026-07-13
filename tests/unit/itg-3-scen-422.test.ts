import { calculateMonthlyOptimization } from "../../src/logic/it-1-br-3-2-1";

describe("購入実績の記録と月次食費削減効果の自動集計・分析機能", () => {
  // SCEN-422
  test("[normal] 月次食費が予算超過の場合、超過額と削減目標が自動計算される", () => {
    const monthly_budget = 50000;
    const actual_expense = 70000;
    const expected_excess = 20000;
    const excess_rate = (expected_excess / monthly_budget) * 100;
    const expected_reduction_target = Math.ceil(expected_excess * 0.8);

    const result = calculateMonthlyOptimization({
      monthly_budget,
      actual_expense,
    });

    expect(result.excess_amount).toBe(expected_excess);
    expect(result.excess_rate).toBe(excess_rate);
    expect(result.reduction_target).toBe(expected_reduction_target);
    expect(result.display_excess).toBe(`${expected_excess}円`);
    expect(result.display_reduction_target).toBe(`${expected_reduction_target}円`);
    expect(result.status).toBe("over_budget");
  });
});