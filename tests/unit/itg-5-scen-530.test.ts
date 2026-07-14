import { generateMenuWithFamilyValidation } from '../../src/logic/it-7-2-1';

describe('献立生成要求処理 - 家族情報検証', () => {
  // SCEN-530
  test('家族情報が未登録の状態で献立生成要求を受け取った場合にエラーを返す', () => {
    const request = {
      userId: 'user_001',
      familyMembers: [],
      nutritionRequirements: {
        calories: 2000,
        protein: 50,
        carbohydrates: 250,
        fat: 65,
      },
      dietaryRestrictions: [],
      allergies: [],
      cookingTimeLimit: 60,
      budgetLimit: 3000,
    };

    expect(() => generateMenuWithFamilyValidation(request)).toThrow(/家族情報/);
  });
});