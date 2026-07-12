import { calculateNutritionAchievementByMember } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-520: [edge] 栄養摂取状況可視化機能 - 栄養基準値が同一で複数家族成員が存在する場合、個別の達成度が正確に計算される
  test("栄養基準値が同一の複数家族成員について、それぞれの実績摂取量に基づいて個別の栄養達成度が正確に計算される", () => {
    const nutritionStandard = {
      protein_g: 80,
      fat_g: 60,
      carbohydrate_g: 300,
    };

    const familyMemberA = {
      member_id: "member_001",
      member_name: "成人男性A",
      age: 35,
      nutrition_standard: nutritionStandard,
    };

    const familyMemberB = {
      member_id: "member_002",
      member_name: "成人男性B",
      age: 38,
      nutrition_standard: nutritionStandard,
    };

    const mealRecordA = {
      member_id: "member_001",
      protein_g: 80,
      fat_g: 60,
      carbohydrate_g: 300,
    };

    const mealRecordB = {
      member_id: "member_002",
      protein_g: 70,
      fat_g: 50,
      carbohydrate_g: 280,
    };

    const result = calculateNutritionAchievementByMember(
      [familyMemberA, familyMemberB],
      [mealRecordA, mealRecordB]
    );

    // 家族成員Aの栄養達成度：実績÷基準×100
    // タンパク質: 80÷80×100 = 100
    // 脂質: 60÷60×100 = 100
    // 炭水化物: 300÷300×100 = 100
    expect(result.member_001.protein_achievement_percent).toBe(100);
    expect(result.member_001.fat_achievement_percent).toBe(100);
    expect(result.member_001.carbohydrate_achievement_percent).toBe(100);

    // 家族成員Bの栄養達成度：実績÷基準×100
    // タンパク質: 70÷80×100 = 87.5
    // 脂質: 50÷60×100 = 83.33...
    // 炭水化物: 280÷300×100 = 93.33...
    expect(result.member_002.protein_achievement_percent).toBe(87.5);
    expect(Math.round(result.member_002.fat_achievement_percent * 100) / 100).toBe(83.33);
    expect(Math.round(result.member_002.carbohydrate_achievement_percent * 100) / 100).toBe(93.33);

    // 一方の成員の実績が他方の成員の達成度計算に影響を与えていないことを確認
    // 成員AはBの実績に影響されず100%を維持
    expect(result.member_001.protein_achievement_percent).toBe(100);
    expect(result.member_001.fat_achievement_percent).toBe(100);
    expect(result.member_001.carbohydrate_achievement_percent).toBe(100);

    // 成員Bも成員Aの100%達成に影響されず、自身の実績値に基づいて計算
    expect(result.member_002.protein_achievement_percent).toBe(87.5);

    // 複数家族成員のレコードが独立して処理されていることを確認
    expect(Object.keys(result)).toContain("member_001");
    expect(Object.keys(result)).toContain("member_002");
    expect(Object.keys(result).length).toBe(2);
  });
});