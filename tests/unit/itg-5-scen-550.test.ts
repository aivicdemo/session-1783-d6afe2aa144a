import { validateMealPlanConstraints } from "../../src/logic/it-7-2-1";

describe("献立確定・制約条件検証機能", () => {
  // SCEN-550
  test("合計調理時間が制限時間の境界値を超過する場合、確定不可と判定される", () => {
    const mealPlanData = {
      mealPlanId: "plan_001",
      userId: "user_101",
      familyMemberId: "family_001",
      dishes: [
        {
          dishId: "dish_001",
          dishName: "カレーライス",
          cookingTimeMinutes: 20,
          nutritionCalories: 450,
          nutritionProteinGrams: 12,
          nutritionCarbsGrams: 65,
          nutritionFatGrams: 15,
          hasAllergens: false,
        },
        {
          dishId: "dish_002",
          dishName: "サラダ",
          cookingTimeMinutes: 10,
          nutritionCalories: 120,
          nutritionProteinGrams: 5,
          nutritionCarbsGrams: 15,
          nutritionFatGrams: 4,
          hasAllergens: false,
        },
      ],
      constraints: {
        maxCookingTimeMinutes: 25,
        maxBudgetYen: 2000,
        allergiesExcluded: [],
        dietaryRestrictionsExcluded: [],
      },
    };

    const result = validateMealPlanConstraints(mealPlanData);

    expect(result.isValid).toBe(false);
    expect(result.totalCookingTimeMinutes).toBe(30);
    expect(result.maxCookingTimeMinutes).toBe(25);
    expect(result.cookingTimeExceeded).toBe(true);
    expect(result.constraintViolations).toContain("調理時間");
    expect(result.errorMessage).toMatch(/調理時間/);
    expect(result.canConfirmMealPlan).toBe(false);
  });
});