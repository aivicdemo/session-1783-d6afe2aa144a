import { calculateNutritionAchievementDegree } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証', () => {
  // SCEN-455
  test('栄養基準値が未設定の場合にエラーハンドリングが正しく実行される', () => {
    const mealRecord = {
      userId: 'user_001',
      date: '2024-01-15',
      mealType: 'lunch',
      foods: [
        { name: 'サラダ', quantity: 100, unit: 'g' },
        { name: '白米', quantity: 150, unit: 'g' }
      ],
      nutritionData: {
        calories: 450,
        protein: 12,
        carbohydrates: 78,
        fat: 5,
        fiber: 3,
        sodium: 200,
        calcium: 80,
        iron: 2.1
      }
    };

    const nutritionStandardsUnset = {
      userId: 'user_001',
      familyMemberId: 'member_001',
      ageGroup: '30-40',
      gender: 'M',
      nutritionTargets: {}
    };

    expect(() => {
      calculateNutritionAchievementDegree(mealRecord, nutritionStandardsUnset);
    }).toThrow(/栄養基準値/);
  });
});