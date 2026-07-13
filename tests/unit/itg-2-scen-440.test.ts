import { decideMealPriorityConditionSet } from "../../src/logic/it-1-br-2-1-1-1";

describe("月次分析結果から献立生成優先条件セットの決定機能", () => {
  // SCEN-440
  test("食費超過かつ栄養不足の場合、バランス型の優先条件セットが決定される", () => {
    // Arrange: 月次分析データを準備
    const monthlyAnalysisData = {
      month: "2024-01",
      budgetLimit: 50000,
      actualExpense: 55000,
      budgetExceededAmount: 5000,
      budgetExceededRate: 0.1,
      nutritionItems: [
        {
          nutrientId: "protein",
          nutrientName: "タンパク質",
          recommendedValue: 60,
          actualValue: 45,
          achievementRate: 75,
          gapValue: 15,
          priority: 1,
        },
        {
          nutrientId: "calcium",
          nutrientName: "カルシウム",
          recommendedValue: 800,
          actualValue: 550,
          achievementRate: 69,
          gapValue: 250,
          priority: 2,
        },
        {
          nutrientId: "iron",
          nutrientName: "鉄",
          recommendedValue: 8,
          actualValue: 6,
          achievementRate: 75,
          gapValue: 2,
          priority: 3,
        },
      ],
      insufficientNutrientCount: 3,
      deficitNutrientIds: ["protein", "calcium", "iron"],
    };

    // Act: 献立生成優先条件セットを決定
    const result = decideMealPriorityConditionSet(monthlyAnalysisData);

    // Assert: バランス型が決定されていることを検証
    expect(result.priorityConditionSetType).toBe("balanced");

    // バランス型の具体的な条件内容を検証
    expect(result.costOptimizationWeight).toBe(50);
    expect(result.nutritionSupplementWeight).toBe(50);

    // 食費最適化条件
    expect(result.costOptimizationConditions).toEqual({
      targetReductionRate: 0.1,
      preferSeasonal: true,
      preferBulkPurchase: true,
      allowDiscountItems: true,
      maxCostPerMeal: 1666.67,
    });

    // 栄養補充条件
    expect(result.nutritionSupplementConditions).toEqual({
      priorityNutrients: ["protein", "calcium", "iron"],
      targetProteinIncrease: 15,
      targetCalciumIncrease: 250,
      targetIronIncrease: 2,
      supplementFoodCategories: ["lean_meat", "dairy", "fish"],
    });

    // 献立生成時の優先度付け
    expect(result.mealGenerationPriority).toEqual({
      order: 1,
      nutrientBalanceWeight: 40,
      costOptimizationWeight: 40,
      familyPreferenceWeight: 20,
    });

    // 決定結果のメタデータ
    expect(result.decisionTimestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    expect(result.analysisMonth).toBe("2024-01");
    expect(result.decisionReason).toBe("食費超過と栄養不足の同時解決が必要");
  });
});