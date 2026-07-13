import { calculateNutritionAchievementRate } from "../../src/logic/it-1-br-2-1-1-1";

describe("栄養達成度可視化機能", () => {
  // SCEN-453
  test("家族成員の年齢・性別に基づいた栄養基準値と実績値から達成度パーセンテージが正しく算出される", () => {
    // 家族成員1: 30歳 女性
    // タンパク質: 基準値50g, 実績値45g => 達成度90%
    const member1Input = {
      memberId: "member-001",
      age: 30,
      gender: "female",
      nutritionStandard: {
        protein: 50,
        carbohydrate: 300,
        fat: 60,
        vitamin_a: 700,
        calcium: 650,
      },
      nutritionActual: {
        protein: 45,
        carbohydrate: 270,
        fat: 50,
        vitamin_a: 630,
        calcium: 650,
      },
    };

    const result1 = calculateNutritionAchievementRate(member1Input);

    expect(result1.memberId).toBe("member-001");
    expect(result1.achievementRate.protein).toBe(90);
    expect(result1.achievementRate.carbohydrate).toBe(90);
    expect(result1.achievementRate.fat).toBe(83.33);
    expect(result1.achievementRate.vitamin_a).toBe(90);
    expect(result1.achievementRate.calcium).toBe(100);

    // 家族成員2: 10歳 男性
    // タンパク質: 基準値35g, 実績値35g => 達成度100%
    const member2Input = {
      memberId: "member-002",
      age: 10,
      gender: "male",
      nutritionStandard: {
        protein: 35,
        carbohydrate: 250,
        fat: 45,
        vitamin_a: 500,
        calcium: 700,
      },
      nutritionActual: {
        protein: 35,
        carbohydrate: 280,
        fat: 48,
        vitamin_a: 520,
        calcium: 750,
      },
    };

    const result2 = calculateNutritionAchievementRate(member2Input);

    expect(result2.memberId).toBe("member-002");
    expect(result2.achievementRate.protein).toBe(100);
    expect(result2.achievementRate.carbohydrate).toBe(112);
    expect(result2.achievementRate.fat).toBe(106.67);
    expect(result2.achievementRate.vitamin_a).toBe(104);
    expect(result2.achievementRate.calcium).toBe(107.14);

    // 家族成員3: 5歳 女性
    // タンパク質: 基準値20g, 実績値0g => 達成度0%
    const member3Input = {
      memberId: "member-003",
      age: 5,
      gender: "female",
      nutritionStandard: {
        protein: 20,
        carbohydrate: 180,
        fat: 30,
        vitamin_a: 400,
        calcium: 500,
      },
      nutritionActual: {
        protein: 0,
        carbohydrate: 0,
        fat: 0,
        vitamin_a: 0,
        calcium: 0,
      },
    };

    const result3 = calculateNutritionAchievementRate(member3Input);

    expect(result3.memberId).toBe("member-003");
    expect(result3.achievementRate.protein).toBe(0);
    expect(result3.achievementRate.carbohydrate).toBe(0);
    expect(result3.achievementRate.fat).toBe(0);
    expect(result3.achievementRate.vitamin_a).toBe(0);
    expect(result3.achievementRate.calcium).toBe(0);

    // 複数成員の基準値が異なることを確認
    expect(member1Input.nutritionStandard.protein).not.toBe(
      member2Input.nutritionStandard.protein
    );
    expect(member2Input.nutritionStandard.protein).not.toBe(
      member3Input.nutritionStandard.protein
    );

    // 成人女性と児童での栄養基準値の違い
    expect(member1Input.nutritionStandard.calcium).toBe(650);
    expect(member2Input.nutritionStandard.calcium).toBe(700);

    // 達成度100%超過のケース
    expect(result2.achievementRate.carbohydrate).toBeGreaterThan(100);
    expect(result2.achievementRate.fat).toBeGreaterThan(100);
    expect(result2.achievementRate.calcium).toBeGreaterThan(100);

    // 達成度0%のケース
    expect(result3.achievementRate.protein).toBe(0);
    expect(result3.achievementRate.carbohydrate).toBe(0);

    // 全栄養素の達成度が配列形式で正しく返却されること
    expect(Object.keys(result1.achievementRate).length).toBe(5);
    expect(Object.keys(result2.achievementRate).length).toBe(5);
    expect(Object.keys(result3.achievementRate).length).toBe(5);

    // 達成度が全員正の値または0であることを確認
    Object.values(result1.achievementRate).forEach((rate) => {
      expect(rate).toBeGreaterThanOrEqual(0);
    });
    Object.values(result2.achievementRate).forEach((rate) => {
      expect(rate).toBeGreaterThanOrEqual(0);
    });
    Object.values(result3.achievementRate).forEach((rate) => {
      expect(rate).toBeGreaterThanOrEqual(0);
    });
  });
});