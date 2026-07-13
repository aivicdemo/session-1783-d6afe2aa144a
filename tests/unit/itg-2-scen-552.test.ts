import { validateNutritionBalance } from "../../src/logic/it-1-br-2-1-1-1";

describe("栄養バランス検証機能 - 達成度100%のとき合格判定", () => {
  // SCEN-552
  test("達成度が基準値ちょうど100%のとき合格判定となる", () => {
    const nutritionData = {
      protein: {
        intake: 60,
        standard: 60,
        unit: "g",
      },
      fat: {
        intake: 65,
        standard: 65,
        unit: "g",
      },
      carbohydrate: {
        intake: 300,
        standard: 300,
        unit: "g",
      },
      vitamin_a: {
        intake: 850,
        standard: 850,
        unit: "μg",
      },
      vitamin_c: {
        intake: 100,
        standard: 100,
        unit: "mg",
      },
      calcium: {
        intake: 800,
        standard: 800,
        unit: "mg",
      },
      iron: {
        intake: 8,
        standard: 8,
        unit: "mg",
      },
    };

    const result = validateNutritionBalance(nutritionData);

    expect(result.status).toBe("合格");
    expect(result.achievementRate).toBe(100);
    expect(result.items).toHaveLength(7);

    expect(result.items[0]).toEqual({
      nutrient: "protein",
      intake: 60,
      standard: 60,
      achievementRate: 100,
      status: "合格",
    });

    expect(result.items[1]).toEqual({
      nutrient: "fat",
      intake: 65,
      standard: 65,
      achievementRate: 100,
      status: "合格",
    });

    expect(result.items[2]).toEqual({
      nutrient: "carbohydrate",
      intake: 300,
      standard: 300,
      achievementRate: 100,
      status: "合格",
    });

    expect(result.items[3]).toEqual({
      nutrient: "vitamin_a",
      intake: 850,
      standard: 850,
      achievementRate: 100,
      status: "合格",
    });

    expect(result.items[4]).toEqual({
      nutrient: "vitamin_c",
      intake: 100,
      standard: 100,
      achievementRate: 100,
      status: "合格",
    });

    expect(result.items[5]).toEqual({
      nutrient: "calcium",
      intake: 800,
      standard: 800,
      achievementRate: 100,
      status: "合格",
    });

    expect(result.items[6]).toEqual({
      nutrient: "iron",
      intake: 8,
      standard: 8,
      achievementRate: 100,
      status: "合格",
    });

    expect(result.overallScore).toBe(100);
    expect(result.passThreshold).toBe(80);
    expect(result.passThreshold <= result.overallScore).toBe(true);
  });
});