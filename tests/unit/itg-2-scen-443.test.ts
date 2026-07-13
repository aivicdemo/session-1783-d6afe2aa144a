import { determineMenuGenerationPriorityConditionSet } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証 - 月次分析結果から献立生成優先条件セット決定', () => {
  // SCEN-443: [error] 月次分析結果から献立生成優先条件セットの決定機能 - 必須パラメータが不足している場合、エラーが発生する
  test('必須パラメータが不足している場合、適切なエラーが発生すること', () => {
    // ✅ 成功ケース：全必須パラメータ完備
    const validInput = {
      userId: 'user_001',
      analysisMonthYear: '2024-01',
      nutritionStandardValues: {
        protein: { min: 50, max: 100, unit: 'g' },
        carbohydrate: { min: 200, max: 400, unit: 'g' },
        fat: { min: 40, max: 80, unit: 'g' },
      },
      monthlyNutritionResults: {
        proteinActual: 48,
        carbohydrateActual: 210,
        fatActual: 75,
      },
      foodExpenseData: {
        budgetLimit: 50000,
        actualExpense: 52000,
        overageFlag: true,
      },
      familyPreferenceScores: [
        { dishId: 'dish_001', satisfactionScore: 85 },
        { dishId: 'dish_002', satisfactionScore: 72 },
      ],
    };

    const result = determineMenuGenerationPriorityConditionSet(validInput);

    expect(result).toEqual(
      expect.objectContaining({
        priorityConditions: expect.any(Array),
        priorityMode: expect.stringMatching(/nutrition|budget|preference/),
        adjustmentFactors: expect.any(Object),
      })
    );

    // ✅ エラーケース1：userId が undefined
    expect(() =>
      determineMenuGenerationPriorityConditionSet({
        userId: undefined,
        analysisMonthYear: '2024-01',
        nutritionStandardValues: validInput.nutritionStandardValues,
        monthlyNutritionResults: validInput.monthlyNutritionResults,
        foodExpenseData: validInput.foodExpenseData,
        familyPreferenceScores: validInput.familyPreferenceScores,
      })
    ).toThrow(/userId|ユーザーID/);

    // ✅ エラーケース2：analysisMonthYear が null
    expect(() =>
      determineMenuGenerationPriorityConditionSet({
        userId: 'user_001',
        analysisMonthYear: null,
        nutritionStandardValues: validInput.nutritionStandardValues,
        monthlyNutritionResults: validInput.monthlyNutritionResults,
        foodExpenseData: validInput.foodExpenseData,
        familyPreferenceScores: validInput.familyPreferenceScores,
      })
    ).toThrow(/analysisMonthYear|分析対象月|月次/);

    // ✅ エラーケース3：nutritionStandardValues が undefined
    expect(() =>
      determineMenuGenerationPriorityConditionSet({
        userId: 'user_001',
        analysisMonthYear: '2024-01',
        nutritionStandardValues: undefined,
        monthlyNutritionResults: validInput.monthlyNutritionResults,
        foodExpenseData: validInput.foodExpenseData,
        familyPreferenceScores: validInput.familyPreferenceScores,
      })
    ).toThrow(/nutritionStandardValues|栄養基準値/);

    // ✅ エラーケース4：monthlyNutritionResults が null
    expect(() =>
      determineMenuGenerationPriorityConditionSet({
        userId: 'user_001',
        analysisMonthYear: '2024-01',
        nutritionStandardValues: validInput.nutritionStandardValues,
        monthlyNutritionResults: null,
        foodExpenseData: validInput.foodExpenseData,
        familyPreferenceScores: validInput.familyPreferenceScores,
      })
    ).toThrow(/monthlyNutritionResults|月次栄養摂取|栄養データ/);

    // ✅ エラーケース5：foodExpenseData が undefined
    expect(() =>
      determineMenuGenerationPriorityConditionSet({
        userId: 'user_001',
        analysisMonthYear: '2024-01',
        nutritionStandardValues: validInput.nutritionStandardValues,
        monthlyNutritionResults: validInput.monthlyNutritionResults,
        foodExpenseData: undefined,
        familyPreferenceScores: validInput.familyPreferenceScores,
      })
    ).toThrow(/foodExpenseData|食費|予算/);

    // ✅ エラーケース6：familyPreferenceScores が null
    expect(() =>
      determineMenuGenerationPriorityConditionSet({
        userId: 'user_001',
        analysisMonthYear: '2024-01',
        nutritionStandardValues: validInput.nutritionStandardValues,
        monthlyNutritionResults: validInput.monthlyNutritionResults,
        foodExpenseData: validInput.foodExpenseData,
        familyPreferenceScores: null,
      })
    ).toThrow(/familyPreferenceScores|家族嗜好|好み/);

    // ✅ エラーケース7：analysisMonthYear が不正な形式
    expect(() =>
      determineMenuGenerationPriorityConditionSet({
        userId: 'user_001',
        analysisMonthYear: 'invalid-month',
        nutritionStandardValues: validInput.nutritionStandardValues,
        monthlyNutritionResults: validInput.monthlyNutritionResults,
        foodExpenseData: validInput.foodExpenseData,
        familyPreferenceScores: validInput.familyPreferenceScores,
      })
    ).toThrow(/analysisMonthYear|月次形式|YYYY-MM/);

    // ✅ エラーケース8：nutritionStandardValues に必須フィールドが不足
    expect(() =>
      determineMenuGenerationPriorityConditionSet({
        userId: 'user_001',
        analysisMonthYear: '2024-01',
        nutritionStandardValues: {
          protein: { min: 50, max: 100, unit: 'g' },
          // carbohydrate と fat が不足
        },
        monthlyNutritionResults: validInput.monthlyNutritionResults,
        foodExpenseData: validInput.foodExpenseData,
        familyPreferenceScores: validInput.familyPreferenceScores,
      })
    ).toThrow(/nutritionStandardValues|栄養基準値|不足|必須/);

    // ✅ エラーケース9：monthlyNutritionResults に必須フィールドが不足
    expect(() =>
      determineMenuGenerationPriorityConditionSet({
        userId: 'user_001',
        analysisMonthYear: '2024-01',
        nutritionStandardValues: validInput.nutritionStandardValues,
        monthlyNutritionResults: {
          proteinActual: 48,
          // carbohydrateActual と fatActual が不足
        },
        foodExpenseData: validInput.foodExpenseData,
        familyPreferenceScores: validInput.familyPreferenceScores,
      })
    ).toThrow(/monthlyNutritionResults|月次栄養摂取|不足|必須/);

    // ✅ エラーケース10：foodExpenseData に必須フィールドが不足
    expect(() =>
      determineMenuGenerationPriorityConditionSet({
        userId: 'user_001',
        analysisMonthYear: '2024-01',
        nutritionStandardValues: validInput.nutritionStandardValues,
        monthlyNutritionResults: validInput.monthlyNutritionResults,
        foodExpenseData: {
          budgetLimit: 50000,
          // actualExpense と overageFlag が不足
        },
        familyPreferenceScores: validInput.familyPreferenceScores,
      })
    ).toThrow(/foodExpenseData|食費|不足|必須/);

    // ✅ エラーケース11：familyPreferenceScores が空配列
    expect(() =>
      determineMenuGenerationPriorityConditionSet({
        userId: 'user_001',
        analysisMonthYear: '2024-01',
        nutritionStandardValues: validInput.nutritionStandardValues,
        monthlyNutritionResults: validInput.monthlyNutritionResults,
        foodExpenseData: validInput.foodExpenseData,
        familyPreferenceScores: [],
      })
    ).toThrow(/familyPreferenceScores|嗜好データ|空|不足/);

    // ✅ エラーケース12：userId が空文字列
    expect(() =>
      determineMenuGenerationPriorityConditionSet({
        userId: '',
        analysisMonthYear: '2024-01',
        nutritionStandardValues: validInput.nutritionStandardValues,
        monthlyNutritionResults: validInput.monthlyNutritionResults,
        foodExpenseData: validInput.foodExpenseData,
        familyPreferenceScores: validInput.familyPreferenceScores,
      })
    ).toThrow(/userId|ユーザーID|空|必須/);
  });
});