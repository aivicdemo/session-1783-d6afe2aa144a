import { detectConflictingMealPatterns } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-475
  test("判定結果が記録されず判定ステータスが空の場合、デフォルト処理が実行される", () => {
    const newRestriction = {
      userId: "user-001",
      restrictionType: "allergen",
      restrictedIngredient: "peanuts",
      addedAt: new Date("2024-01-15T10:00:00Z"),
    };

    const pastMealHistory = [
      {
        mealId: "meal-001",
        mealName: "Peanut Butter Sandwich",
        ingredients: ["bread", "peanuts", "butter"],
        createdAt: new Date("2024-01-10T18:00:00Z"),
        nutritionScore: 75,
        familySatisfaction: 4.5,
      },
      {
        mealId: "meal-002",
        mealName: "Vegetable Stir Fry",
        ingredients: ["broccoli", "carrot", "soy_sauce"],
        createdAt: new Date("2024-01-12T18:30:00Z"),
        nutritionScore: 82,
        familySatisfaction: 4.8,
      },
      {
        mealId: "meal-003",
        mealName: "Peanut Noodles",
        ingredients: ["noodles", "peanuts", "sesame_oil"],
        createdAt: new Date("2024-01-14T18:15:00Z"),
        nutritionScore: 78,
        familySatisfaction: 4.2,
      },
    ];

    const result = detectConflictingMealPatterns(
      newRestriction,
      pastMealHistory,
      null
    );

    expect(result).toEqual({
      conflictingMeals: [
        {
          mealId: "meal-001",
          mealName: "Peanut Butter Sandwich",
          conflictingIngredients: ["peanuts"],
          detectedAt: expect.any(Date),
          validationStatus: null,
          shouldApplyDefault: true,
        },
        {
          mealId: "meal-003",
          mealName: "Peanut Noodles",
          conflictingIngredients: ["peanuts"],
          detectedAt: expect.any(Date),
          validationStatus: null,
          shouldApplyDefault: true,
        },
      ],
      totalConflictsDetected: 2,
      defaultProcessingApplied: true,
      recommendedMeals: expect.arrayContaining([
        expect.objectContaining({
          mealId: "meal-002",
          mealName: "Vegetable Stir Fry",
          ingredients: ["broccoli", "carrot", "soy_sauce"],
          nutritionScore: 82,
          familySatisfaction: 4.8,
          reason: "No restriction conflicts detected",
        }),
      ]),
      generatedMealId: expect.any(String),
      generatedMealName: expect.any(String),
      generatedMealIngredients: expect.arrayContaining([
        expect.any(String),
      ]),
      displayErrorMessage: false,
      processingMode: "default_fallback",
    });

    expect(result.conflictingMeals).toHaveLength(2);
    expect(
      result.conflictingMeals.every((meal) => meal.validationStatus === null)
    ).toBe(true);
    expect(
      result.conflictingMeals.every((meal) => meal.shouldApplyDefault === true)
    ).toBe(true);
    expect(result.defaultProcessingApplied).toBe(true);
    expect(result.totalConflictsDetected).toBe(2);
    expect(result.recommendedMeals).toHaveLength(1);
    expect(result.displayErrorMessage).toBe(false);
    expect(result.processingMode).toBe("default_fallback");
    expect(result.generatedMealName).not.toBeUndefined();
    expect(result.generatedMealIngredients).not.toHaveLength(0);
  });
});