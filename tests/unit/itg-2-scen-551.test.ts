import { validateNutritionBalance } from '../../src/logic/it-1-br-2-1-1-1';

describe('栄養バランス検証機能', () => {
  // SCEN-551: [error] 栄養バランス検証機能 - 栄養項目のデータが不足しているときは検証処理がエラーになる
  test('必須栄養項目のデータが不足している場合、エラーを発生させる', () => {
    const nutritionData = {
      userId: 'user-001',
      recordDate: '2024-01-15',
      protein: 65.5,
      carbohydrate: 250.0,
      fat: null,
      fiber: 18.5,
      calcium: 800.0,
      iron: 10.2,
      vitaminA: 700.0,
      vitaminC: 100.0,
    };

    expect(() => validateNutritionBalance(nutritionData)).toThrow(/必須栄養項目/);
  });

  test('すべての必須栄養項目が揃っている場合、検証成功と達成度スコアを返す', () => {
    const nutritionData = {
      userId: 'user-001',
      recordDate: '2024-01-15',
      protein: 65.5,
      carbohydrate: 250.0,
      fat: 65.0,
      fiber: 18.5,
      calcium: 800.0,
      iron: 10.2,
      vitaminA: 700.0,
      vitaminC: 100.0,
    };

    const result = validateNutritionBalance(nutritionData);

    expect(result).toHaveProperty('isValid');
    expect(result.isValid).toBe(true);
    expect(result).toHaveProperty('achievementScores');
    expect(typeof result.achievementScores).toBe('object');
    expect(result.achievementScores.protein).toBe(100);
    expect(result.achievementScores.carbohydrate).toBe(100);
    expect(result.achievementScores.fat).toBe(100);
  });

  test('複数の必須栄養項目が不足している場合、エラーを発生させる', () => {
    const nutritionData = {
      userId: 'user-002',
      recordDate: '2024-01-16',
      protein: undefined,
      carbohydrate: undefined,
      fat: 55.0,
      fiber: 15.0,
      calcium: null,
      iron: 9.0,
      vitaminA: 600.0,
      vitaminC: 85.0,
    };

    expect(() => validateNutritionBalance(nutritionData)).toThrow(/必須栄養項目/);
  });

  test('栄養データが空のオブジェクトの場合、エラーを発生させる', () => {
    const nutritionData = {};

    expect(() => validateNutritionBalance(nutritionData)).toThrow(/必須栄養項目/);
  });

  test('栄養データがnullの場合、エラーを発生させる', () => {
    expect(() => validateNutritionBalance(null)).toThrow(/必須栄養項目/);
  });

  test('栄養データが不完全な場合、不足項目を特定してエラー情報に含める', () => {
    const nutritionData = {
      userId: 'user-003',
      recordDate: '2024-01-17',
      protein: 60.0,
      carbohydrate: 240.0,
      fat: null,
      fiber: null,
      calcium: 750.0,
      iron: null,
      vitaminA: 650.0,
      vitaminC: 90.0,
    };

    expect(() => validateNutritionBalance(nutritionData)).toThrow(/必須栄養項目/);
  });

  test('部分的に不足している栄養項目がある場合、検証失敗と部分的達成度を返す', () => {
    const nutritionData = {
      userId: 'user-004',
      recordDate: '2024-01-18',
      protein: 45.0,
      carbohydrate: 180.0,
      fat: 50.0,
      fiber: 12.0,
      calcium: 600.0,
      iron: 7.0,
      vitaminA: 500.0,
      vitaminC: 70.0,
    };

    const result = validateNutritionBalance(nutritionData);

    expect(result).toHaveProperty('isValid');
    expect(result.isValid).toBe(false);
    expect(result).toHaveProperty('achievementScores');
    expect(result.achievementScores.protein).toBe(69);
    expect(result.achievementScores.carbohydrate).toBe(72);
    expect(result.achievementScores.fiber).toBe(67);
    expect(result).toHaveProperty('deficiencyGapRanking');
    expect(Array.isArray(result.deficiencyGapRanking)).toBe(true);
    expect(result.deficiencyGapRanking[0]).toHaveProperty('item');
    expect(result.deficiencyGapRanking[0]).toHaveProperty('gap');
  });
});