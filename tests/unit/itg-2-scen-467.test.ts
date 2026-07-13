import { calculateNutritionAchievementScore } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能', () => {
  // SCEN-467: [error] 推移データ表示機能 - 食事記録データが不完全な場合にエラーが適切に処理される
  test('should throw error when food record data is incomplete with missing required nutrients', () => {
    const incompleteFoodRecordData = {
      userId: 'user-123',
      recordDate: '2024-01-15',
      mealType: 'breakfast',
      calories: 350,
      protein: null,
      carbohydrates: 45,
      fat: 12,
      fiber: null,
      sodium: 800,
      potassium: undefined,
    };

    expect(() =>
      calculateNutritionAchievementScore(incompleteFoodRecordData)
    ).toThrow(/必須項目/);
  });

  test('should throw error when food record lacks required calorie data', () => {
    const recordWithoutCalories = {
      userId: 'user-456',
      recordDate: '2024-01-16',
      mealType: 'lunch',
      calories: undefined,
      protein: 25,
      carbohydrates: 55,
      fat: 15,
      fiber: 6,
      sodium: 1000,
      potassium: 450,
    };

    expect(() =>
      calculateNutritionAchievementScore(recordWithoutCalories)
    ).toThrow(/カロリー/);
  });

  test('should throw error when food record has no nutrition data at all', () => {
    const emptyNutritionRecord = {
      userId: 'user-789',
      recordDate: '2024-01-17',
      mealType: 'dinner',
      calories: null,
      protein: null,
      carbohydrates: null,
      fat: null,
      fiber: null,
      sodium: null,
      potassium: null,
    };

    expect(() =>
      calculateNutritionAchievementScore(emptyNutritionRecord)
    ).toThrow(/不完全/);
  });

  test('should calculate achievement score correctly when all required nutrition data is present', () => {
    const completeFoodRecord = {
      userId: 'user-101',
      recordDate: '2024-01-18',
      mealType: 'breakfast',
      calories: 450,
      protein: 18,
      carbohydrates: 52,
      fat: 14,
      fiber: 7,
      sodium: 950,
      potassium: 520,
      targetCalories: 2000,
      targetProtein: 60,
      targetCarbohydrates: 250,
      targetFat: 65,
      targetFiber: 25,
      targetSodium: 2300,
      targetPotassium: 3500,
    };

    const result = calculateNutritionAchievementScore(completeFoodRecord);

    expect(result).toEqual({
      userId: 'user-101',
      recordDate: '2024-01-18',
      calorieAchievementRate: 22.5,
      proteinAchievementRate: 30.0,
      carbohydrateAchievementRate: 20.8,
      fatAchievementRate: 21.5,
      fiberAchievementRate: 28.0,
      sodiumAchievementRate: 41.3,
      potassiumAchievementRate: 14.9,
      overallAchievementScore: 25.4,
      hasDataGap: false,
      validationStatus: 'VALID',
    });
  });

  test('should maintain dashboard stability and not persist incomplete records', () => {
    const incompleteRecord = {
      userId: 'user-202',
      recordDate: '2024-01-19',
      mealType: 'lunch',
      calories: 500,
      protein: undefined,
      carbohydrates: 60,
      fat: null,
      fiber: 5,
      sodium: 1100,
      potassium: 400,
    };

    const persistedRecords: any[] = [];

    try {
      calculateNutritionAchievementScore(incompleteRecord);
      persistedRecords.push(incompleteRecord);
    } catch (error) {
      if (error instanceof Error && error.message.includes('必須項目')) {
        persistedRecords.length = 0;
      }
    }

    expect(persistedRecords).toHaveLength(0);
    expect(persistedRecords).not.toContain(incompleteRecord);
  });
});