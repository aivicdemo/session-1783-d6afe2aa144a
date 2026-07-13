import { calculateNutrientAchievementRate } from "../../src/logic/it-1-br-2-1-1-1";

describe("栄養摂取量推移分析 - 達成率計算", () => {
  // SCEN-482: [edge] 栄養摂取量推移分析 - 達成率が0%と100%の境界値で正確に計算される
  test("達成率が0%と100%の境界値で正確に計算される", () => {
    // ケース1: 達成率0% (摂取量0g、目標値50g)
    const result_0_percent = calculateNutrientAchievementRate({
      nutrient_name: "タンパク質",
      target_value: 50,
      actual_intake: 0,
      unit: "g",
    });
    expect(result_0_percent.achievement_rate).toBe(0);
    expect(result_0_percent.achievement_rate_display).toBe("0%");

    // ケース2: 達成率100% (摂取量50g、目標値50g)
    const result_100_percent = calculateNutrientAchievementRate({
      nutrient_name: "タンパク質",
      target_value: 50,
      actual_intake: 50,
      unit: "g",
    });
    expect(result_100_percent.achievement_rate).toBe(100);
    expect(result_100_percent.achievement_rate_display).toBe("100%");

    // ケース3: 達成率50% (摂取量25g、目標値50g)
    const result_50_percent = calculateNutrientAchievementRate({
      nutrient_name: "タンパク質",
      target_value: 50,
      actual_intake: 25,
      unit: "g",
    });
    expect(result_50_percent.achievement_rate).toBe(50);
    expect(result_50_percent.achievement_rate_display).toBe("50%");

    // ケース4: カルシウム - 達成率0% (摂取量0mg、目標値600mg)
    const calcium_0_percent = calculateNutrientAchievementRate({
      nutrient_name: "カルシウム",
      target_value: 600,
      actual_intake: 0,
      unit: "mg",
    });
    expect(calcium_0_percent.achievement_rate).toBe(0);
    expect(calcium_0_percent.achievement_rate_display).toBe("0%");

    // ケース5: カルシウム - 達成率100% (摂取量600mg、目標値600mg)
    const calcium_100_percent = calculateNutrientAchievementRate({
      nutrient_name: "カルシウム",
      target_value: 600,
      actual_intake: 600,
      unit: "mg",
    });
    expect(calcium_100_percent.achievement_rate).toBe(100);
    expect(calcium_100_percent.achievement_rate_display).toBe("100%");

    // ケース6: ビタミンC - 達成率0% (摂取量0mg、目標値100mg)
    const vitamin_c_0_percent = calculateNutrientAchievementRate({
      nutrient_name: "ビタミンC",
      target_value: 100,
      actual_intake: 0,
      unit: "mg",
    });
    expect(vitamin_c_0_percent.achievement_rate).toBe(0);
    expect(vitamin_c_0_percent.achievement_rate_display).toBe("0%");

    // ケース7: ビタミンC - 達成率100% (摂取量100mg、目標値100mg)
    const vitamin_c_100_percent = calculateNutrientAchievementRate({
      nutrient_name: "ビタミンC",
      target_value: 100,
      actual_intake: 100,
      unit: "mg",
    });
    expect(vitamin_c_100_percent.achievement_rate).toBe(100);
    expect(vitamin_c_100_percent.achievement_rate_display).toBe("100%");

    // ケース8: 鉄 - 達成率0% (摂取量0mg、目標値10mg)
    const iron_0_percent = calculateNutrientAchievementRate({
      nutrient_name: "鉄",
      target_value: 10,
      actual_intake: 0,
      unit: "mg",
    });
    expect(iron_0_percent.achievement_rate).toBe(0);
    expect(iron_0_percent.achievement_rate_display).toBe("0%");

    // ケース9: 鉄 - 達成率100% (摂取量10mg、目標値10mg)
    const iron_100_percent = calculateNutrientAchievementRate({
      nutrient_name: "鉄",
      target_value: 10,
      actual_intake: 10,
      unit: "mg",
    });
    expect(iron_100_percent.achievement_rate).toBe(100);
    expect(iron_100_percent.achievement_rate_display).toBe("100%");

    // ケース10: 食物繊維 - 達成率0% (摂取量0g、目標値20g)
    const fiber_0_percent = calculateNutrientAchievementRate({
      nutrient_name: "食物繊維",
      target_value: 20,
      actual_intake: 0,
      unit: "g",
    });
    expect(fiber_0_percent.achievement_rate).toBe(0);
    expect(fiber_0_percent.achievement_rate_display).toBe("0%");

    // ケース11: 食物繊維 - 達成率100% (摂取量20g、目標値20g)
    const fiber_100_percent = calculateNutrientAchievementRate({
      nutrient_name: "食物繊維",
      target_value: 20,
      actual_intake: 20,
      unit: "g",
    });
    expect(fiber_100_percent.achievement_rate).toBe(100);
    expect(fiber_100_percent.achievement_rate_display).toBe("100%");

    // ケース12: 脂質 - 達成率0% (摂取量0g、目標値65g)
    const fat_0_percent = calculateNutrientAchievementRate({
      nutrient_name: "脂質",
      target_value: 65,
      actual_intake: 0,
      unit: "g",
    });
    expect(fat_0_percent.achievement_rate).toBe(0);
    expect(fat_0_percent.achievement_rate_display).toBe("0%");

    // ケース13: 脂質 - 達成率100% (摂取量65g、目標値65g)
    const fat_100_percent = calculateNutrientAchievementRate({
      nutrient_name: "脂質",
      target_value: 65,
      actual_intake: 65,
      unit: "g",
    });
    expect(fat_100_percent.achievement_rate).toBe(100);
    expect(fat_100_percent.achievement_rate_display).toBe("100%");
  });
});