import { evaluateNutritionStandard } from '../../src/logic/it-1-br-2-1-1-1';

describe('栄養基準ロジック評価機能', () => {
  // SCEN-473
  test('栄養項目の実績値が異常値の場合に評価ロジックが異常を検出する', () => {
    // 正常な実績値でのベースケース
    const validNutritionData = {
      userId: 'user-001',
      nutrientId: 'nutrient-calcium',
      targetValue: 800,
      actualValue: 750,
      unit: 'mg',
      evaluationDate: '2024-01-15',
    };

    const validResult = evaluateNutritionStandard(validNutritionData);
    expect(validResult).toEqual({
      nutrientId: 'nutrient-calcium',
      achievementRate: 93.75,
      status: 'acceptable',
      errorDetected: false,
    });

    // 負の値を入力した場合のエラーケース
    const negativeValueData = {
      userId: 'user-001',
      nutrientId: 'nutrient-calcium',
      targetValue: 800,
      actualValue: -100,
      unit: 'mg',
      evaluationDate: '2024-01-15',
    };

    expect(() => evaluateNutritionStandard(negativeValueData)).toThrow(/負の値/);

    // 極端に大きな値を入力した場合のエラーケース
    const extremeLargeValueData = {
      userId: 'user-001',
      nutrientId: 'nutrient-calcium',
      targetValue: 800,
      actualValue: 999999999,
      unit: 'mg',
      evaluationDate: '2024-01-15',
    };

    expect(() => evaluateNutritionStandard(extremeLargeValueData)).toThrow(/範囲外/);

    // 非数値を入力した場合のエラーケース
    const invalidTypeData = {
      userId: 'user-001',
      nutrientId: 'nutrient-calcium',
      targetValue: 800,
      actualValue: 'invalid-string' as any,
      unit: 'mg',
      evaluationDate: '2024-01-15',
    };

    expect(() => evaluateNutritionStandard(invalidTypeData)).toThrow(/データ型/);

    // 無限大（Infinity）を入力した場合のエラーケース
    const infinityValueData = {
      userId: 'user-001',
      nutrientId: 'nutrient-calcium',
      targetValue: 800,
      actualValue: Infinity,
      unit: 'mg',
      evaluationDate: '2024-01-15',
    };

    expect(() => evaluateNutritionStandard(infinityValueData)).toThrow(/無効/);

    // NaN を入力した場合のエラーケース
    const nanValueData = {
      userId: 'user-001',
      nutrientId: 'nutrient-calcium',
      targetValue: 800,
      actualValue: NaN,
      unit: 'mg',
      evaluationDate: '2024-01-15',
    };

    expect(() => evaluateNutritionStandard(nanValueData)).toThrow(/無効/);

    // null を入力した場合のエラーケース
    const nullValueData = {
      userId: 'user-001',
      nutrientId: 'nutrient-calcium',
      targetValue: 800,
      actualValue: null as any,
      unit: 'mg',
      evaluationDate: '2024-01-15',
    };

    expect(() => evaluateNutritionStandard(nullValueData)).toThrow(/値が必須/);

    // undefined を入力した場合のエラーケース
    const undefinedValueData = {
      userId: 'user-001',
      nutrientId: 'nutrient-calcium',
      targetValue: 800,
      actualValue: undefined as any,
      unit: 'mg',
      evaluationDate: '2024-01-15',
    };

    expect(() => evaluateNutritionStandard(undefinedValueData)).toThrow(/値が必須/);

    // ゼロ値は正常（低栄養状態として認識）
    const zeroValueData = {
      userId: 'user-001',
      nutrientId: 'nutrient-calcium',
      targetValue: 800,
      actualValue: 0,
      unit: 'mg',
      evaluationDate: '2024-01-15',
    };

    const zeroResult = evaluateNutritionStandard(zeroValueData);
    expect(zeroResult).toEqual({
      nutrientId: 'nutrient-calcium',
      achievementRate: 0,
      status: 'insufficient',
      errorDetected: false,
    });

    // 目標値を超える正常な実績値
    const exceedingValueData = {
      userId: 'user-001',
      nutrientId: 'nutrient-calcium',
      targetValue: 800,
      actualValue: 950,
      unit: 'mg',
      evaluationDate: '2024-01-15',
    };

    const exceedingResult = evaluateNutritionStandard(exceedingValueData);
    expect(exceedingResult).toEqual({
      nutrientId: 'nutrient-calcium',
      achievementRate: 118.75,
      status: 'excellent',
      errorDetected: false,
    });
  });
});