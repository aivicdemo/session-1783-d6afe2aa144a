import { validateNutritionIntakeData } from '../../src/logic/it-1-br-2-1-1-1';

describe('栄養摂取量推移分析 - バリデーション', () => {
  // SCEN-483
  test('負の摂取量データが入力された場合にバリデーションエラーを返す', () => {
    const invalidIntakeData = {
      nutrientId: 'CALORIE',
      nutrientName: 'カロリー',
      intakeAmount: -100,
      unit: 'kcal',
      recordDate: '2024-01-15'
    };

    expect(() => validateNutritionIntakeData(invalidIntakeData)).toThrow(/摂取量/);
  });
});