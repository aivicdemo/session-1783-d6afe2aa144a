import { aggregateMonthlyCostAndProposePriority } from "../../src/logic/it-7-2-1";

describe("IT-7-2-1: 月次食費集計・次月優先条件提案機能", () => {
  // SCEN-608: [edge] 購入記録が存在しない場合、食費実績額がゼロとして集計される
  test("購入記録なし時、食費実績額は0円で集計され、次月優先条件が正しく提案される", () => {
    const userId = "user-001";
    const targetMonth = "2024-01-01T00:00:00Z";
    const monthlyBudget = 50000;
    const purchaseRecords: Array<{
      purchaseId: string;
      userId: string;
      purchaseDate: string;
      amount: number;
      foodItemId: string;
      quantity: number;
    }> = [];

    const result = aggregateMonthlyCostAndProposePriority({
      userId,
      targetMonth,
      monthlyBudget,
      purchaseRecords,
    });

    expect(result.actualExpense).toBe(0);
    expect(result.budgetRemaining).toBe(50000);
    expect(result.excessAmount).toBe(0);
    expect(result.proposedPriorities).toEqual([
      {
        priorityType: "OPTIMIZE_NUTRITION",
        reason: "予算に十分な余裕があり、栄養バランス最適化を優先",
        estimatedImpact: "HIGH",
      },
      {
        priorityType: "SEASONAL_INGREDIENT",
        reason: "旬の食材導入により食費効率化と満足度向上を同時達成",
        estimatedImpact: "MEDIUM",
      },
      {
        priorityType: "FAMILY_PREFERENCE",
        reason: "家族の嗜好学習継続による満足度維持",
        estimatedImpact: "MEDIUM",
      },
    ]);
    expect(result.nextMonthBudgetAdjustment).toBe(0);
    expect(result.recommendedCostReductionCategories).toEqual([]);
  });
});