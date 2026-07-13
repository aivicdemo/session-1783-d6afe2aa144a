import {
  calculateNutritionAchievementDegree,
} from "../../src/logic/it-1-br-3-2-1";

describe("購入実績の記録と月次食費削減効果の自動集計・分析機能", () => {
  // SCEN-350
  test("栄養目標達成度の計算・可視化機能 - 栄養項目ごとの達成度が百分率で正しく計算される", () => {
    const nutrition_standards = {
      protein_g: 60,
      fat_g: 50,
      carbohydrate_g: 300,
      vitamin_c_mg: 100,
    };

    const nutrition_intake = {
      protein_g: 51,
      fat_g: 36,
      carbohydrate_g: 273,
      vitamin_c_mg: 65,
    };

    const result = calculateNutritionAchievementDegree({
      nutrition_standards,
      nutrition_intake,
    });

    expect(result.protein_achievement_percentage).toBe(85);
    expect(result.fat_achievement_percentage).toBe(72);
    expect(result.carbohydrate_achievement_percentage).toBe(91);
    expect(result.vitamin_c_achievement_percentage).toBe(65);

    const nutrition_intake_exceed = {
      protein_g: 75,
      fat_g: 60,
      carbohydrate_g: 320,
      vitamin_c_mg: 120,
    };

    const result_exceed = calculateNutritionAchievementDegree({
      nutrition_standards,
      nutrition_intake: nutrition_intake_exceed,
    });

    expect(result_exceed.protein_achievement_percentage).toBe(125);
    expect(result_exceed.fat_achievement_percentage).toBe(120);
    expect(result_exceed.carbohydrate_achievement_percentage).toBe(107);
    expect(result_exceed.vitamin_c_achievement_percentage).toBe(120);

    const nutrition_intake_zero = {
      protein_g: 0,
      fat_g: 0,
      carbohydrate_g: 0,
      vitamin_c_mg: 0,
    };

    const result_zero = calculateNutritionAchievementDegree({
      nutrition_standards,
      nutrition_intake: nutrition_intake_zero,
    });

    expect(result_zero.protein_achievement_percentage).toBe(0);
    expect(result_zero.fat_achievement_percentage).toBe(0);
    expect(result_zero.carbohydrate_achievement_percentage).toBe(0);
    expect(result_zero.vitamin_c_achievement_percentage).toBe(0);

    const nutrition_intake_rounding = {
      protein_g: 55,
      fat_g: 37,
      carbohydrate_g: 275,
      vitamin_c_mg: 66,
    };

    const result_rounding = calculateNutritionAchievementDegree({
      nutrition_standards,
      nutrition_intake: nutrition_intake_rounding,
    });

    expect(result_rounding.protein_achievement_percentage).toBe(92);
    expect(result_rounding.fat_achievement_percentage).toBe(74);
    expect(result_rounding.carbohydrate_achievement_percentage).toBe(92);
    expect(result_rounding.vitamin_c_achievement_percentage).toBe(66);

    expect(() =>
      calculateNutritionAchievementDegree({
        nutrition_standards: {
          protein_g: 0,
          fat_g: 50,
          carbohydrate_g: 300,
          vitamin_c_mg: 100,
        },
        nutrition_intake,
      })
    ).toThrow(/基準値/);

    expect(() =>
      calculateNutritionAchievementDegree({
        nutrition_standards: {
          protein_g: -10,
          fat_g: 50,
          carbohydrate_g: 300,
          vitamin_c_mg: 100,
        },
        nutrition_intake,
      })
    ).toThrow(/基準値/);

    expect(() =>
      calculateNutritionAchievementDegree({
        nutrition_standards,
        nutrition_intake: {
          protein_g: -5,
          fat_g: 36,
          carbohydrate_g: 273,
          vitamin_c_mg: 65,
        },
      })
    ).toThrow(/摂取量/);
  });
});