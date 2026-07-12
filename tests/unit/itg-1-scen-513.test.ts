import { executeMonthlyAnalysisCycle } from "../../src/logic/it-2";

describe("家族成員の食事評価データの蓄積・管理機能", () => {
  // SCEN-513
  test("月次分析サイクル自動実行機能 - 毎月末日の月次分析が自動実行され、7日以内に次月献立優先条件調整まで完了する", () => {
    const analysisStartDate = new Date("2024-02-28T00:00:00Z");
    const analysisEndDate = new Date("2024-02-28T23:59:59Z");
    const monthStartDate = new Date("2024-02-01T00:00:00Z");
    const monthEndDate = new Date("2024-02-29T23:59:59Z");

    const mockMealRecords = [
      {
        meal_id: "meal_001",
        user_id: "user_100",
        meal_date: "2024-02-15",
        satisfaction_score: 5,
        consumption_rate: 1.0,
        request_content: "もっと辛い料理がほしい",
      },
      {
        meal_id: "meal_002",
        user_id: "user_100",
        meal_date: "2024-02-22",
        satisfaction_score: 4,
        consumption_rate: 0.9,
        request_content: "野菜をもっと増やしてほしい",
      },
      {
        meal_id: "meal_003",
        user_id: "user_100",
        meal_date: "2024-02-29",
        satisfaction_score: 5,
        consumption_rate: 1.0,
        request_content: "",
      },
    ];

    const mockFoodExpenseRecords = [
      {
        expense_id: "exp_001",
        user_id: "user_100",
        expense_date: "2024-02-10",
        amount: 5000,
        category: "野菜",
      },
      {
        expense_id: "exp_002",
        user_id: "user_100",
        expense_date: "2024-02-20",
        amount: 3000,
        category: "肉類",
      },
      {
        expense_id: "exp_003",
        user_id: "user_100",
        expense_date: "2024-02-28",
        amount: 2000,
        category: "調味料",
      },
    ];

    const monthlyBudget = 15000;
    const targetNutritionValues = {
      carbohydrates: 300,
      protein: 75,
      fat: 60,
      calcium: 600,
      iron: 8,
      vitamin_c: 100,
    };

    const nutritionAchievementData = {
      carbohydrates: 310,
      protein: 72,
      fat: 58,
      calcium: 620,
      iron: 7.5,
      vitamin_c: 95,
    };

    const result = executeMonthlyAnalysisCycle({
      analysisExecutionDate: analysisStartDate,
      analysisStartDate: monthStartDate,
      analysisEndDate: monthEndDate,
      mealRecords: mockMealRecords,
      foodExpenseRecords: mockFoodExpenseRecords,
      monthlyBudget: monthlyBudget,
      targetNutritionValues: targetNutritionValues,
      actualNutritionValues: nutritionAchievementData,
      userId: "user_100",
    });

    const maxAllowedDurationSeconds = 604800;
    const actualDurationSeconds = Math.floor(
      (result.adjustmentCompletionTimestamp.getTime() -
        result.analysisStartTimestamp.getTime()) /
        1000
    );

    expect(result.analysisExecutionStatus).toBe("completed");
    expect(actualDurationSeconds).toBeLessThanOrEqual(maxAllowedDurationSeconds);
    expect(result.analysisStartTimestamp).toEqual(analysisStartDate);
    expect(result.aggregationPeriodStart).toEqual(monthStartDate);
    expect(result.aggregationPeriodEnd).toEqual(monthEndDate);

    const totalExpense = mockFoodExpenseRecords.reduce(
      (sum, record) => sum + record.amount,
      0
    );
    expect(result.totalMonthlyExpense).toBe(10000);

    const budgetVariance = totalExpense - monthlyBudget;
    expect(result.budgetVariance).toBe(-5000);

    const carbohydratesAchievementPercentage = Math.round(
      (nutritionAchievementData.carbohydrates /
        targetNutritionValues.carbohydrates) *
        100
    );
    expect(result.nutritionAchievementPercentages.carbohydrates).toBe(103);

    const proteinAchievementPercentage = Math.round(
      (nutritionAchievementData.protein / targetNutritionValues.protein) * 100
    );
    expect(result.nutritionAchievementPercentages.protein).toBe(96);

    const fatAchievementPercentage = Math.round(
      (nutritionAchievementData.fat / targetNutritionValues.fat) * 100
    );
    expect(result.nutritionAchievementPercentages.fat).toBe(97);

    const calciumAchievementPercentage = Math.round(
      (nutritionAchievementData.calcium / targetNutritionValues.calcium) * 100
    );
    expect(result.nutritionAchievementPercentages.calcium).toBe(103);

    const ironAchievementPercentage = Math.round(
      (nutritionAchievementData.iron / targetNutritionValues.iron) * 100
    );
    expect(result.nutritionAchievementPercentages.iron).toBe(94);

    const vitaminCAchievementPercentage = Math.round(
      (nutritionAchievementData.vitamin_c / targetNutritionValues.vitamin_c) *
        100
    );
    expect(result.nutritionAchievementPercentages.vitamin_c).toBe(95);

    const insufficientNutrients = Object.entries(
      result.nutritionAchievementPercentages
    )
      .filter(([_, percentage]) => (percentage as number) < 100)
      .map(([nutrient, _]) => nutrient)
      .sort();

    expect(insufficientNutrients).toContain("protein");
    expect(insufficientNutrients).toContain("fat");
    expect(insufficientNutrients).toContain("iron");
    expect(insufficientNutrients).toContain("vitamin_c");

    expect(result.nextMonthPriorityConditions).toBeDefined();
    expect(result.nextMonthPriorityConditions.priority_mode).toBe(
      "nutrition_weighted"
    );
    expect(
      result.nextMonthPriorityConditions.deficient_nutrients
    ).toContain("protein");
    expect(
      result.nextMonthPriorityConditions.deficient_nutrients
    ).toContain("vitamin_c");
    expect(
      result.nextMonthPriorityConditions.deficient_nutrients
    ).toContain("iron");
    expect(result.nextMonthPriorityConditions.deficient_nutrients).toContain(
      "fat"
    );

    expect(result.priorityConditionAdjustmentCompleted).toBe(true);
    expect(result.analysisDataValidationStatus).toBe("valid");
    expect(result.nextMonthMealPlanReflectionStatus).toBe("applied");

    expect(
      result.adjustmentCompletionTimestamp.getTime() -
        result.analysisStartTimestamp.getTime()
    ).toBeLessThanOrEqual(maxAllowedDurationSeconds * 1000);
  });
});