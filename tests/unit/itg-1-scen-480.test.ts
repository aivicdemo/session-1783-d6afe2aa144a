import { validateMealPlanIntegrity } from '../../src/logic/it-1-1-1';

describe('アルゴリズム改善反映後の献立妥当性判定', () => {
  // SCEN-480
  test('不完全な献立データの場合、必須フィールド欠落エラーを発生させる', () => {
    const incompleteMealPlan = {
      mealName: '',
      nutritionInfo: null,
      cookingTimeMinutes: undefined,
      familyMemberId: '12345',
      allergyCheckResult: true,
      dietaryRestrictionCheckResult: true,
    };

    expect(() => validateMealPlanIntegrity(incompleteMealPlan)).toThrow(/必須フィールド/);
  });

  test('料理名が空文字列の場合、エラーを発生させる', () => {
    const mealPlanMissingName = {
      mealName: '',
      nutritionInfo: { calories: 500, protein: 20, carbs: 60, fat: 15 },
      cookingTimeMinutes: 30,
      familyMemberId: '12345',
      allergyCheckResult: true,
      dietaryRestrictionCheckResult: true,
    };

    expect(() => validateMealPlanIntegrity(mealPlanMissingName)).toThrow(/料理名/);
  });

  test('栄養価情報がnullの場合、エラーを発生させる', () => {
    const mealPlanMissingNutrition = {
      mealName: 'サンマの塩焼き',
      nutritionInfo: null,
      cookingTimeMinutes: 25,
      familyMemberId: '12345',
      allergyCheckResult: true,
      dietaryRestrictionCheckResult: true,
    };

    expect(() => validateMealPlanIntegrity(mealPlanMissingNutrition)).toThrow(/栄養価/);
  });

  test('調理時間が未定義の場合、エラーを発生させる', () => {
    const mealPlanMissingCookingTime = {
      mealName: 'カレーライス',
      nutritionInfo: { calories: 650, protein: 15, carbs: 80, fat: 20 },
      cookingTimeMinutes: undefined,
      familyMemberId: '12345',
      allergyCheckResult: true,
      dietaryRestrictionCheckResult: true,
    };

    expect(() => validateMealPlanIntegrity(mealPlanMissingCookingTime)).toThrow(/調理時間/);
  });

  test('すべての必須フィールドが存在する場合、妥当性判定結果オブジェクトを返す', () => {
    const completeMealPlan = {
      mealName: '鶏肉の照り焼き',
      nutritionInfo: { calories: 480, protein: 32, carbs: 40, fat: 18 },
      cookingTimeMinutes: 35,
      familyMemberId: '12345',
      allergyCheckResult: true,
      dietaryRestrictionCheckResult: true,
    };

    const result = validateMealPlanIntegrity(completeMealPlan);

    expect(result).toEqual({
      isValid: true,
      validationTimestamp: expect.any(String),
      mealName: '鶏肉の照り焼き',
      nutritionCheck: true,
      allergyCompliance: true,
      dietaryRestrictionCompliance: true,
      cookingTimeWithinLimit: true,
    });
  });

  test('栄養価情報が不完全（必須栄養素が欠落）の場合、エラーを発生させる', () => {
    const mealPlanWithIncompleteNutrition = {
      mealName: 'トマトスープ',
      nutritionInfo: { calories: 200, protein: null, carbs: 25, fat: 8 },
      cookingTimeMinutes: 20,
      familyMemberId: '12345',
      allergyCheckResult: true,
      dietaryRestrictionCheckResult: true,
    };

    expect(() => validateMealPlanIntegrity(mealPlanWithIncompleteNutrition)).toThrow(/栄養素/);
  });

  test('調理時間が負の値の場合、エラーを発生させる', () => {
    const mealPlanWithNegativeCookingTime = {
      mealName: '冷やし中華',
      nutritionInfo: { calories: 420, protein: 18, carbs: 55, fat: 14 },
      cookingTimeMinutes: -10,
      familyMemberId: '12345',
      allergyCheckResult: true,
      dietaryRestrictionCheckResult: true,
    };

    expect(() => validateMealPlanIntegrity(mealPlanWithNegativeCookingTime)).toThrow(/調理時間/);
  });

  test('家族成員IDが空文字列の場合、エラーを発生させる', () => {
    const mealPlanMissingFamilyId = {
      mealName: '和風パスタ',
      nutritionInfo: { calories: 550, protein: 22, carbs: 70, fat: 16 },
      cookingTimeMinutes: 28,
      familyMemberId: '',
      allergyCheckResult: true,
      dietaryRestrictionCheckResult: true,
    };

    expect(() => validateMealPlanIntegrity(mealPlanMissingFamilyId)).toThrow(/家族成員/);
  });

  test('複数の必須フィールドが欠落している場合、最初の欠落フィールドエラーを発生させる', () => {
    const mealPlanMultipleMissing = {
      mealName: '',
      nutritionInfo: null,
      cookingTimeMinutes: undefined,
      familyMemberId: '12345',
      allergyCheckResult: true,
      dietaryRestrictionCheckResult: true,
    };

    expect(() => validateMealPlanIntegrity(mealPlanMultipleMissing)).toThrow(/必須フィールド/);
  });
});