import { calculateNutritionAchievementDegree } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-519: 栄養摂取状況可視化機能 - 家族成員の年齢・性別に基づいた栄養基準値と実績値が照合され、栄養項目別の達成度が正確に算出される
  test('年齢・性別ごとの栄養基準値と実績値から達成度パーセンテージを正確に計算する', () => {
    const familyMembers = [
      {
        memberId: 'member_001',
        name: '父親',
        age: 50,
        gender: 'male',
      },
      {
        memberId: 'member_002',
        name: '母親',
        age: 48,
        gender: 'female',
      },
      {
        memberId: 'member_003',
        name: '子ども',
        age: 12,
        gender: 'male',
      },
    ];

    const nutritionStandards = {
      member_001: {
        calories: 2500,
        protein: 65,
        fat: 70,
        carbohydrate: 325,
        vitamin: 900,
        mineral: 800,
      },
      member_002: {
        calories: 2000,
        protein: 50,
        fat: 55,
        carbohydrate: 260,
        vitamin: 700,
        mineral: 650,
      },
      member_003: {
        calories: 2000,
        protein: 55,
        fat: 55,
        carbohydrate: 260,
        vitamin: 800,
        mineral: 700,
      },
    };

    const mealRecords = {
      member_001: {
        breakfast: { calories: 600, protein: 15, fat: 20, carbohydrate: 80, vitamin: 200, mineral: 150 },
        lunch: { calories: 800, protein: 25, fat: 25, carbohydrate: 100, vitamin: 250, mineral: 200 },
        dinner: { calories: 900, protein: 20, fat: 20, carbohydrate: 120, vitamin: 300, mineral: 250 },
        snack: { calories: 100, protein: 5, fat: 3, carbohydrate: 15, vitamin: 50, mineral: 50 },
      },
      member_002: {
        breakfast: { calories: 450, protein: 12, fat: 15, carbohydrate: 60, vitamin: 150, mineral: 120 },
        lunch: { calories: 650, protein: 18, fat: 20, carbohydrate: 85, vitamin: 200, mineral: 160 },
        dinner: { calories: 750, protein: 15, fat: 18, carbohydrate: 100, vitamin: 250, mineral: 200 },
        snack: { calories: 100, protein: 5, fat: 2, carbohydrate: 15, vitamin: 40, mineral: 50 },
      },
      member_003: {
        breakfast: { calories: 500, protein: 15, fat: 17, carbohydrate: 70, vitamin: 200, mineral: 150 },
        lunch: { calories: 700, protein: 20, fat: 20, carbohydrate: 95, vitamin: 250, mineral: 180 },
        dinner: { calories: 700, protein: 18, fat: 15, carbohydrate: 90, vitamin: 280, mineral: 220 },
        snack: { calories: 100, protein: 2, fat: 3, carbohydrate: 15, vitamin: 50, mineral: 50 },
      },
    };

    const result = calculateNutritionAchievementDegree({
      familyMembers,
      nutritionStandards,
      mealRecords,
    });

    // 父親（50歳男性）の栄養基準値の確認
    expect(result.member_001.nutritionStandard).toEqual({
      calories: 2500,
      protein: 65,
      fat: 70,
      carbohydrate: 325,
      vitamin: 900,
      mineral: 800,
    });

    // 父親の実績値合計の確認
    expect(result.member_001.totalActual).toEqual({
      calories: 2400,
      protein: 65,
      fat: 68,
      carbohydrate: 315,
      vitamin: 800,
      mineral: 650,
    });

    // 父親の栄養項目別達成度（パーセンテージ）の確認
    expect(result.member_001.achievementDegree.calories).toBe(96);
    expect(result.member_001.achievementDegree.protein).toBe(100);
    expect(result.member_001.achievementDegree.fat).toBe(97);
    expect(result.member_001.achievementDegree.carbohydrate).toBe(97);
    expect(result.member_001.achievementDegree.vitamin).toBe(89);
    expect(result.member_001.achievementDegree.mineral).toBe(81);

    // 母親（48歳女性）の栄養基準値の確認
    expect(result.member_002.nutritionStandard).toEqual({
      calories: 2000,
      protein: 50,
      fat: 55,
      carbohydrate: 260,
      vitamin: 700,
      mineral: 650,
    });

    // 母親の実績値合計の確認
    expect(result.member_002.totalActual).toEqual({
      calories: 1950,
      protein: 50,
      fat: 55,
      carbohydrate: 260,
      vitamin: 640,
      mineral: 530,
    });

    // 母親の栄養項目別達成度（パーセンテージ）の確認
    expect(result.member_002.achievementDegree.calories).toBe(97);
    expect(result.member_002.achievementDegree.protein).toBe(100);
    expect(result.member_002.achievementDegree.fat).toBe(100);
    expect(result.member_002.achievementDegree.carbohydrate).toBe(100);
    expect(result.member_002.achievementDegree.vitamin).toBe(91);
    expect(result.member_002.achievementDegree.mineral).toBe(82);

    // 子ども（12歳男性）の栄養基準値の確認
    expect(result.member_003.nutritionStandard).toEqual({
      calories: 2000,
      protein: 55,
      fat: 55,
      carbohydrate: 260,
      vitamin: 800,
      mineral: 700,
    });

    // 子どもの実績値合計の確認
    expect(result.member_003.totalActual).toEqual({
      calories: 2000,
      protein: 55,
      fat: 55,
      carbohydrate: 270,
      vitamin: 780,
      mineral: 600,
    });

    // 子どもの栄養項目別達成度（パーセンテージ）の確認
    expect(result.member_003.achievementDegree.calories).toBe(100);
    expect(result.member_003.achievementDegree.protein).toBe(100);
    expect(result.member_003.achievementDegree.fat).toBe(100);
    expect(result.member_003.achievementDegree.carbohydrate).toBe(104);
    expect(result.member_003.achievementDegree.vitamin).toBe(97);
    expect(result.member_003.achievementDegree.mineral).toBe(86);

    // 年齢・性別が異なる家族成員間で栄養基準値が適切に相違していることを検証
    expect(result.member_001.nutritionStandard.calories).toBeGreaterThan(
      result.member_002.nutritionStandard.calories,
    );
    expect(result.member_002.nutritionStandard.calories).toBe(
      result.member_003.nutritionStandard.calories,
    );
    expect(result.member_001.nutritionStandard.protein).toBeGreaterThan(
      result.member_002.nutritionStandard.protein,
    );

    // 達成度パーセンテージが各メンバーで異なることを検証
    expect(result.member_001.achievementDegree.vitamin).not.toBe(
      result.member_002.achievementDegree.vitamin,
    );
    expect(result.member_002.achievementDegree.vitamin).not.toBe(
      result.member_003.achievementDegree.vitamin,
    );
  });
});