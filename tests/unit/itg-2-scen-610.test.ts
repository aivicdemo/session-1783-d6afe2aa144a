import { validateAndCorrectUserNutritionData } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証', () => {
  // SCEN-610
  test('補正方法が未定義の場合にデータ品質の信頼性が損なわれるエラーが検出される', () => {
    const testUserData = {
      userId: 'user_001',
      familyMemberId: 'member_001',
      mealRecords: [
        {
          mealId: 'meal_001',
          mealDate: '2024-01-15',
          mealType: '朝食',
          nutrients: [
            { nutrientId: 'ntr_001', nutrientName: 'タンパク質', actualValue: null },
            { nutrientId: 'ntr_002', nutrientName: 'カルシウム', actualValue: 500 },
          ],
        },
        {
          mealId: 'meal_002',
          mealDate: '2024-01-15',
          mealType: '昼食',
          nutrients: [
            { nutrientId: 'ntr_001', nutrientName: 'タンパク質', actualValue: 45 },
            { nutrientId: 'ntr_003', nutrientName: '食物繊維', actualValue: NaN },
          ],
        },
      ],
      correctionMethodDefined: false,
      correctionMethods: {},
    };

    const expectedErrorMessage = /補正方法が未定義/;
    const expectedDataQualityScore = 0;

    expect(() => validateAndCorrectUserNutritionData(testUserData)).toThrow(expectedErrorMessage);

    try {
      validateAndCorrectUserNutritionData(testUserData);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toMatch(/補正方法が未定義/);
    }
  });
});