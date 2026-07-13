import { calculateMenuConstraintSatisfactionScores } from "../../src/logic/it-1-br-2-1-1-1";

describe("献立案の制約条件充足度スコア計算機能", () => {
  // SCEN-326
  test("全制約条件を満たす場合、全スコアが100で総合スコアも100になる", () => {
    const menuProposal = {
      menuId: "menu_001",
      date: new Date("2024-01-15T11:00:00Z"),
      dishes: [
        {
          dishId: "dish_001",
          dishName: "鶏肉と野菜のバランス定食",
          ingredients: [
            {
              ingredientId: "ing_001",
              ingredientName: "鶏むね肉",
              quantity: 150,
              unit: "g",
              allergenIds: [],
              nutritionData: {
                protein: 30,
                carbs: 0,
                fat: 3,
                fiber: 0,
                calcium: 5,
                iron: 1,
                vitaminC: 0,
              },
            },
            {
              ingredientId: "ing_002",
              ingredientName: "ほうれん草",
              quantity: 100,
              unit: "g",
              allergenIds: [],
              nutritionData: {
                protein: 3,
                carbs: 3,
                fat: 0,
                fiber: 2.7,
                calcium: 49,
                iron: 2,
                vitaminC: 35,
              },
            },
            {
              ingredientId: "ing_003",
              ingredientName: "米",
              quantity: 150,
              unit: "g",
              allergenIds: [],
              nutritionData: {
                protein: 5,
                carbs: 55,
                fat: 1,
                fiber: 0.5,
                calcium: 5,
                iron: 0.2,
                vitaminC: 0,
              },
            },
            {
              ingredientId: "ing_004",
              ingredientName: "にんじん",
              quantity: 80,
              unit: "g",
              allergenIds: [],
              nutritionData: {
                protein: 1,
                carbs: 8,
                fat: 0,
                fiber: 2,
                calcium: 28,
                iron: 0.2,
                vitaminC: 5,
              },
            },
          ],
        },
      ],
      familyConstraints: {
        allergyIds: [],
        dietaryRestrictionIds: [],
      },
      nutritionTargets: {
        proteinMin: 30,
        proteinMax: 60,
        carbsMin: 40,
        carbsMax: 80,
        fatMin: 15,
        fatMax: 35,
        fiberMin: 5,
        fiberMax: 15,
        calciumMin: 50,
        calciumMax: 200,
        ironMin: 2,
        ironMax: 8,
        vitaminCMin: 30,
        vitaminCMax: 100,
      },
      calorieTarget: {
        minCalories: 400,
        maxCalories: 700,
      },
      ingredientDiversityThreshold: 3,
      cookingTimeMinutes: 25,
      budgetJPY: 2500,
    };

    const result = calculateMenuConstraintSatisfactionScores(menuProposal);

    expect(result.nutritionBalanceScore).toBe(100);
    expect(result.allergenConstraintScore).toBe(100);
    expect(result.ingredientDiversityScore).toBe(100);
    expect(result.calorieConstraintScore).toBe(100);
    expect(result.overallSatisfactionScore).toBe(100);
    expect(result.satisfactionDetails).toEqual({
      nutritionBalanceScore: 100,
      allergenConstraintScore: 100,
      ingredientDiversityScore: 100,
      calorieConstraintScore: 100,
      overallSatisfactionScore: 100,
    });
  });
});