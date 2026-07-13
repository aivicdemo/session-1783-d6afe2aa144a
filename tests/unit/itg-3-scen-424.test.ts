import { calculateMonthlyCostOptimization } from "../../src/logic/it-1-br-3-2-1";

describe("購入実績の記録と月次食費削減効果の自動集計・分析機能", () => {
  // SCEN-424: [edge] 月次食費最適化分析機能 - 月次食費が予算と完全に一致する場合、適正と判定される
  test("月次食費が予算と完全に一致する場合、分析結果は適正と判定される", () => {
    const monthly_budget = 10000;
    const actual_cost = 10000;
    const budget_exceeded_amount = 0;
    const excess_reason_analysis = {
      ingredient_composition_change: 0,
      unit_price_fluctuation: 0,
    };
    const satisfaction_score = 85;

    const result = calculateMonthlyCostOptimization({
      monthly_budget,
      actual_cost,
      budget_exceeded_amount,
      excess_reason_analysis,
      satisfaction_score,
    });

    expect(result.status).toBe("appropriate");
    expect(result.is_over_budget).toBe(false);
    expect(result.warning_message).toBeNull();
    expect(result.excess_amount).toBe(0);
    expect(result.adjusted_priority_conditions).toBeNull();
    expect(result.next_month_recommendation).not.toBeNull();
    expect(result.next_month_recommendation?.nutrition_priority).toBe("maintain");
    expect(result.next_month_recommendation?.cost_optimization_priority).toBe(
      "maintain"
    );
  });
});