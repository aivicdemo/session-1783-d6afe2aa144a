import { calculateNutrientAchievementRate } from "../../src/logic/it-7-2-1";

describe("栄養達成度可視化機能", () => {
  // SCEN-562
  test("実績値が目標値と完全に一致する場合、達成度100%として計算される", () => {
    const targetValues = {
      calories: 2000,
      protein: 50,
      fat: 60,
    };

    const actualValues = {
      calories: 2000,
      protein: 50,
      fat: 60,
    };

    const result = calculateNutrientAchievementRate(targetValues, actualValues);

    expect(result.overallAchievementRate).toBe(100);
    expect(result.nutrients).toEqual([
      {
        name: "calories",
        target: 2000,
        actual: 2000,
        achievementRate: 100,
        status: "success",
      },
      {
        name: "protein",
        target: 50,
        actual: 50,
        achievementRate: 100,
        status: "success",
      },
      {
        name: "fat",
        target: 60,
        actual: 60,
        achievementRate: 100,
        status: "success",
      },
    ]);
    expect(result.statusIndicator).toBe("green");
    expect(result.completionMessage).toBe("達成完了");
  });
});