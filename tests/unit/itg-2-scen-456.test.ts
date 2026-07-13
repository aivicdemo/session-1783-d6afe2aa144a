import { calculateNutritionAchievementRate } from "../../src/logic/it-1-br-2-1-1-1";

describe("栄養達成度可視化機能", () => {
  // SCEN-456
  test("複数の家族成員の栄養達成度が個別に正しく計算される", () => {
    // 家族成員A: タンパク質、炭水化物、脂質、ビタミン、ミネラル
    const familyMemberA = {
      familyMemberId: "FM001",
      familyMemberName: "父親",
      nutritionData: {
        protein: { intake: 75, recommended: 60 },
        carbohydrate: { intake: 300, recommended: 350 },
        fat: { intake: 50, recommended: 65 },
        vitamin: { intake: 1200, recommended: 1000 },
        mineral: { intake: 800, recommended: 900 },
      },
    };

    // 家族成員B: 異なる摂取・推奨量
    const familyMemberB = {
      familyMemberId: "FM002",
      familyMemberName: "母親",
      nutritionData: {
        protein: { intake: 55, recommended: 50 },
        carbohydrate: { intake: 280, recommended: 300 },
        fat: { intake: 45, recommended: 55 },
        vitamin: { intake: 900, recommended: 1000 },
        mineral: { intake: 700, recommended: 800 },
      },
    };

    // 家族成員C: さらに異なる摂取・推奨量
    const familyMemberC = {
      familyMemberId: "FM003",
      familyMemberName: "子供",
      nutritionData: {
        protein: { intake: 40, recommended: 45 },
        carbohydrate: { intake: 200, recommended: 250 },
        fat: { intake: 35, recommended: 40 },
        vitamin: { intake: 600, recommended: 700 },
        mineral: { intake: 500, recommended: 600 },
      },
    };

    // 家族成員A の栄養達成度を計算
    const resultA = calculateNutritionAchievementRate(familyMemberA);

    // 期待値: 各栄養素の達成度 (摂取量 ÷ 推奨量 × 100)
    // タンパク質: 75 ÷ 60 × 100 = 125.0
    // 炭水化物: 300 ÷ 350 × 100 = 85.71...
    // 脂質: 50 ÷ 65 × 100 = 76.92...
    // ビタミン: 1200 ÷ 1000 × 100 = 120.0
    // ミネラル: 800 ÷ 900 × 100 = 88.88...
    // トータル達成度: (125 + 85.71 + 76.92 + 120 + 88.88) ÷ 5 = 99.30%

    expect(resultA.familyMemberId).toBe("FM001");
    expect(resultA.familyMemberName).toBe("父親");
    expect(resultA.nutritionAchievementRates.protein).toBeCloseTo(125.0, 1);
    expect(resultA.nutritionAchievementRates.carbohydrate).toBeCloseTo(
      85.71,
      1
    );
    expect(resultA.nutritionAchievementRates.fat).toBeCloseTo(76.92, 1);
    expect(resultA.nutritionAchievementRates.vitamin).toBeCloseTo(120.0, 1);
    expect(resultA.nutritionAchievementRates.mineral).toBeCloseTo(88.88, 1);
    expect(resultA.totalAchievementRate).toBeCloseTo(99.3, 1);

    // 家族成員B の栄養達成度を計算
    const resultB = calculateNutritionAchievementRate(familyMemberB);

    // 期待値:
    // タンパク質: 55 ÷ 50 × 100 = 110.0
    // 炭水化物: 280 ÷ 300 × 100 = 93.33...
    // 脂質: 45 ÷ 55 × 100 = 81.81...
    // ビタミン: 900 ÷ 1000 × 100 = 90.0
    // ミネラル: 700 ÷ 800 × 100 = 87.5
    // トータル達成度: (110 + 93.33 + 81.81 + 90 + 87.5) ÷ 5 = 92.53%

    expect(resultB.familyMemberId).toBe("FM002");
    expect(resultB.familyMemberName).toBe("母親");
    expect(resultB.nutritionAchievementRates.protein).toBeCloseTo(110.0, 1);
    expect(resultB.nutritionAchievementRates.carbohydrate).toBeCloseTo(93.33, 1);
    expect(resultB.nutritionAchievementRates.fat).toBeCloseTo(81.81, 1);
    expect(resultB.nutritionAchievementRates.vitamin).toBeCloseTo(90.0, 1);
    expect(resultB.nutritionAchievementRates.mineral).toBeCloseTo(87.5, 1);
    expect(resultB.totalAchievementRate).toBeCloseTo(92.53, 1);

    // 家族成員C の栄養達成度を計算
    const resultC = calculateNutritionAchievementRate(familyMemberC);

    // 期待値:
    // タンパク質: 40 ÷ 45 × 100 = 88.88...
    // 炭水化物: 200 ÷ 250 × 100 = 80.0
    // 脂質: 35 ÷ 40 × 100 = 87.5
    // ビタミン: 600 ÷ 700 × 100 = 85.71...
    // ミネラル: 500 ÷ 600 × 100 = 83.33...
    // トータル達成度: (88.88 + 80 + 87.5 + 85.71 + 83.33) ÷ 5 = 85.08%

    expect(resultC.familyMemberId).toBe("FM003");
    expect(resultC.familyMemberName).toBe("子供");
    expect(resultC.nutritionAchievementRates.protein).toBeCloseTo(88.88, 1);
    expect(resultC.nutritionAchievementRates.carbohydrate).toBeCloseTo(80.0, 1);
    expect(resultC.nutritionAchievementRates.fat).toBeCloseTo(87.5, 1);
    expect(resultC.nutritionAchievementRates.vitamin).toBeCloseTo(85.71, 1);
    expect(resultC.nutritionAchievementRates.mineral).toBeCloseTo(83.33, 1);
    expect(resultC.totalAchievementRate).toBeCloseTo(85.08, 1);

    // 各家族成員のデータが独立していることを確認
    expect(resultA.totalAchievementRate).not.toBe(resultB.totalAchievementRate);
    expect(resultB.totalAchievementRate).not.toBe(resultC.totalAchievementRate);
    expect(resultA.totalAchievementRate).not.toBe(resultC.totalAchievementRate);

    // 各家族成員の栄養素別達成度が他の家族成員と異なることを確認
    expect(resultA.nutritionAchievementRates.protein).not.toBe(
      resultB.nutritionAchievementRates.protein
    );
    expect(resultB.nutritionAchievementRates.protein).not.toBe(
      resultC.nutritionAchievementRates.protein
    );

    // 家族成員IDが正確に保持されていることを確認（データ混在がないことの確認）
    expect(resultA.familyMemberId).not.toBe(resultB.familyMemberId);
    expect(resultB.familyMemberId).not.toBe(resultC.familyMemberId);
    expect(resultA.familyMemberId).not.toBe(resultC.familyMemberId);
  });
});