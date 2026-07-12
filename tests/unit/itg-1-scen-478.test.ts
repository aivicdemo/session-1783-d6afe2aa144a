import { validateMealAfterAlgorithmImprovement } from '../../src/logic/it-1-1-1';

describe('アルゴリズム改善反映後の献立妥当性判定', () => {
  // SCEN-478
  test('制限条件に違反する献立は不妥当判定で違反理由を記録する', () => {
    const mealData = {
      mealId: 'meal_001',
      date: '2024-01-15',
      dishes: [
        {
          dishId: 'dish_001',
          name: '海老フライ',
          caloriesPer100g: 280,
          servingSize: 150,
          allergens: ['shrimp', 'egg']
        },
        {
          dishId: 'dish_002',
          name: 'ピーナッツバター和え',
          caloriesPer100g: 590,
          servingSize: 50,
          allergens: ['peanut']
        },
        {
          dishId: 'dish_003',
          name: '牛乳プリン',
          caloriesPer100g: 85,
          servingSize: 100,
          allergens: ['dairy']
        }
      ]
    };

    const constraints = {
      dailyCalorieLimit: 2000,
      allowedAllergens: [],
      forbiddenAllergens: ['shrimp', 'peanut', 'dairy'],
      proteinMinGrams: 50,
      sodiumMaxMg: 2400
    };

    const familyMember = {
      memberId: 'member_001',
      age: 8,
      gender: 'male'
    };

    const result = validateMealAfterAlgorithmImprovement(
      mealData,
      constraints,
      familyMember
    );

    expect(result.isAppropriate).toBe(false);
    expect(result.violationReasons).toContain('指定アレルゲン含有: shrimp');
    expect(result.violationReasons).toContain('指定アレルゲン含有: peanut');
    expect(result.violationReasons).toContain('指定アレルゲン含有: dairy');
    expect(result.violationReasons.length).toBeGreaterThanOrEqual(3);
    expect(result.timestamp).toBeDefined();
    expect(typeof result.timestamp).toBe('string');
    expect(result.mealId).toBe('meal_001');
  });

  test('カロリー上限を超過する献立は不妥当判定でカロリー超過理由を記録する', () => {
    const mealData = {
      mealId: 'meal_002',
      date: '2024-01-16',
      dishes: [
        {
          dishId: 'dish_004',
          name: 'ステーキ',
          caloriesPer100g: 300,
          servingSize: 250,
          allergens: []
        },
        {
          dishId: 'dish_005',
          name: 'フライドポテト',
          caloriesPer100g: 365,
          servingSize: 200,
          allergens: []
        },
        {
          dishId: 'dish_006',
          name: 'チーズケーキ',
          caloriesPer100g: 320,
          servingSize: 150,
          allergens: ['dairy', 'egg']
        }
      ]
    };

    const constraints = {
      dailyCalorieLimit: 1500,
      allowedAllergens: [],
      forbiddenAllergens: [],
      proteinMinGrams: 40,
      sodiumMaxMg: 2400
    };

    const familyMember = {
      memberId: 'member_002',
      age: 5,
      gender: 'female'
    };

    const result = validateMealAfterAlgorithmImprovement(
      mealData,
      constraints,
      familyMember
    );

    expect(result.isAppropriate).toBe(false);
    expect(result.violationReasons.some((reason: string) =>
      reason.includes('カロリー上限超過')
    )).toBe(true);
    expect(result.mealId).toBe('meal_002');
  });

  test('複数の制限条件に違反する献立で全違反理由が記録される', () => {
    const mealData = {
      mealId: 'meal_003',
      date: '2024-01-17',
      dishes: [
        {
          dishId: 'dish_007',
          name: '卵焼き',
          caloriesPer100g: 151,
          servingSize: 100,
          allergens: ['egg']
        },
        {
          dishId: 'dish_008',
          name: '高塩漬物',
          caloriesPer100g: 30,
          servingSize: 150,
          allergens: []
        },
        {
          dishId: 'dish_009',
          name: 'バター焼き',
          caloriesPer100g: 717,
          servingSize: 80,
          allergens: ['dairy']
        }
      ]
    };

    const constraints = {
      dailyCalorieLimit: 1800,
      allowedAllergens: [],
      forbiddenAllergens: ['egg', 'dairy'],
      proteinMinGrams: 60,
      sodiumMaxMg: 1200
    };

    const familyMember = {
      memberId: 'member_003',
      age: 65,
      gender: 'female'
    };

    const result = validateMealAfterAlgorithmImprovement(
      mealData,
      constraints,
      familyMember
    );

    expect(result.isAppropriate).toBe(false);
    expect(result.violationReasons.length).toBeGreaterThanOrEqual(2);
    expect(result.violationReasons.some((reason: string) =>
      reason.includes('アレルゲン')
    )).toBe(true);
    expect(result.violationReasons.some((reason: string) =>
      reason.includes('塩分') || reason.includes('ナトリウム')
    )).toBe(true);
  });

  test('制限条件に違反しない献立は妥当判定される', () => {
    const mealData = {
      mealId: 'meal_004',
      date: '2024-01-18',
      dishes: [
        {
          dishId: 'dish_010',
          name: '鶏胸肉の塩焼き',
          caloriesPer100g: 165,
          servingSize: 150,
          allergens: []
        },
        {
          dishId: 'dish_011',
          name: 'ほうれん草のおひたし',
          caloriesPer100g: 23,
          servingSize: 100,
          allergens: []
        },
        {
          dishId: 'dish_012',
          name: '玄米ご飯',
          caloriesPer100g: 111,
          servingSize: 150,
          allergens: []
        }
      ]
    };

    const constraints = {
      dailyCalorieLimit: 2000,
      allowedAllergens: [],
      forbiddenAllergens: ['shrimp', 'peanut'],
      proteinMinGrams: 50,
      sodiumMaxMg: 2400
    };

    const familyMember = {
      memberId: 'member_004',
      age: 40,
      gender: 'male'
    };

    const result = validateMealAfterAlgorithmImprovement(
      mealData,
      constraints,
      familyMember
    );

    expect(result.isAppropriate).toBe(true);
    expect(result.violationReasons.length).toBe(0);
    expect(result.mealId).toBe('meal_004');
    expect(result.timestamp).toBeDefined();
  });

  test('違反理由ログの記録形式が正確で解読可能である', () => {
    const mealData = {
      mealId: 'meal_005',
      date: '2024-01-19',
      dishes: [
        {
          dishId: 'dish_013',
          name: 'エビ天丼',
          caloriesPer100g: 240,
          servingSize: 300,
          allergens: ['shrimp', 'gluten']
        }
      ]
    };

    const constraints = {
      dailyCalorieLimit: 1500,
      allowedAllergens: [],
      forbiddenAllergens: ['shrimp'],
      proteinMinGrams: 45,
      sodiumMaxMg: 2000
    };

    const familyMember = {
      memberId: 'member_005',
      age: 12,
      gender: 'male'
    };

    const result = validateMealAfterAlgorithmImprovement(
      mealData,
      constraints,
      familyMember
    );

    expect(result.isAppropriate).toBe(false);
    expect(result.violationReasons).toBeDefined();
    expect(Array.isArray(result.violationReasons)).toBe(true);

    result.violationReasons.forEach((reason: string) => {
      expect(typeof reason).toBe('string');
      expect(reason.length).toBeGreaterThan(0);
      expect(/[ァ-ヴー一-龯]/.test(reason) || /[a-zA-Z]/.test(reason)).toBe(true);
    });

    expect(result.violationReasons.some((reason: string) =>
      reason.includes('指定アレルゲン含有') && reason.includes('shrimp')
    )).toBe(true);
  });
});