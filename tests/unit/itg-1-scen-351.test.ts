import { validateMealConfirmation } from "../../src/logic/it-1-br-4-2-1";

describe("献立確定検証機能 - アレルギー制限違反検出", () => {
  // SCEN-351
  test("アレルギー制限に違反する食材が含まれる献立は確定不可と判定される", () => {
    const allergyInfo = {
      userId: "user_001",
      allergens: ["egg", "dairy"],
      registeredAt: new Date("2024-01-10T09:00:00Z"),
    };

    const mealPlan = {
      mealId: "meal_20240115",
      userId: "user_001",
      dishes: [
        {
          dishId: "dish_001",
          dishName: "オムレツ",
          ingredients: [
            { ingredientId: "ing_egg", ingredientName: "卵", allergen: "egg" },
            {
              ingredientId: "ing_butter",
              ingredientName: "バター",
              allergen: "dairy",
            },
          ],
        },
      ],
      status: "pending",
      confirmedAt: null,
    };

    const result = validateMealConfirmation({
      mealPlan,
      allergyInfo,
      constraints: {
        nutritionBalance: true,
        budgetLimit: 2000,
        cookingTimeLimit: 60,
        inventory: [],
      },
    });

    expect(result.isValid).toBe(false);
    expect(result.status).toBe("error");
    expect(result.violatedAllergens).toEqual([
      {
        allergen: "egg",
        conflictingDishes: [
          {
            dishId: "dish_001",
            dishName: "オムレツ",
            conflictingIngredients: ["卵"],
          },
        ],
      },
      {
        allergen: "dairy",
        conflictingDishes: [
          {
            dishId: "dish_001",
            dishName: "オムレツ",
            conflictingIngredients: ["バター"],
          },
        ],
      },
    ]);
    expect(result.message).toMatch(/アレルギー/);
    expect(result.canConfirm).toBe(false);
  });
});