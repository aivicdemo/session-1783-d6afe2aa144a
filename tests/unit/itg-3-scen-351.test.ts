import { calculateNutritionAchievementRate } from "../../src/logic/it-1-br-3-2-1";

describe("購入実績の記録と月次食費削減効果の自動集計・分析機能", () => {
  // SCEN-351
  test("食事記録がない場合、栄養達成度が計算されずエラーメッセージが返される", async () => {
    const userId = "user_001";
    const nutritionTargets = {
      protein: 50,
      carbohydrates: 300,
      fat: 60,
    };
    const mealRecords: any[] = [];

    try {
      await calculateNutritionAchievementRate(userId, nutritionTargets, mealRecords);
      fail("Expected an error to be thrown");
    } catch (error: any) {
      expect(error.message).toMatch(/食事記録/);
      expect(error.statusCode).toBeGreaterThanOrEqual(400);
      expect(error.statusCode).toBeLessThan(600);
    }

    expect(mealRecords.length).toBe(0);
  });
});