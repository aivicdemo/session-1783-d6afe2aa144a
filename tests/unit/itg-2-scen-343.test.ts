import { prioritizeHighRatedDishesForMealGeneration } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証", () => {
  // SCEN-343: [error] 評価データ蓄積に基づく高評価料理の優先度付けと献立反映 - 高評価料理が全て廃盤食材である場合、エラーメッセージが返却される
  test("高評価料理が全て廃盤食材で構成されている場合、適切なエラーメッセージを返却し献立反映処理は実行されない", () => {
    const userId = "user_001";
    const familyMemberId = "family_member_001";
    const evaluatedDishes = [
      {
        dishId: "dish_high_rated_001",
        dishName: "高評価料理A",
        averageRating: 4.8,
        requestCount: 15,
        ingredients: [
          { ingredientId: "ingredient_discontinued_001", name: "廃盤食材X", status: "discontinued" },
          { ingredientId: "ingredient_discontinued_002", name: "廃盤食材Y", status: "discontinued" },
        ],
      },
      {
        dishId: "dish_high_rated_002",
        dishName: "高評価料理B",
        averageRating: 4.7,
        requestCount: 12,
        ingredients: [
          { ingredientId: "ingredient_discontinued_003", name: "廃盤食材Z", status: "discontinued" },
          { ingredientId: "ingredient_discontinued_004", name: "廃盤食材W", status: "discontinued" },
        ],
      },
    ];
    const mealGenerationDate = new Date("2024-02-15T09:00:00Z");
    const priorityThreshold = 4.5;

    const result = prioritizeHighRatedDishesForMealGeneration({
      userId,
      familyMemberId,
      evaluatedDishes,
      mealGenerationDate,
      priorityThreshold,
    });

    expect(result).toHaveProperty("success", false);
    expect(result).toHaveProperty("error");
    expect(result.error).toMatch(/廃盤/);
    expect(result).toHaveProperty("reflectedToMealGeneration", false);
    expect(result).not.toHaveProperty("prioritizedDishList");
  });
});