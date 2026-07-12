import { convertRelativeDifferentiationToAbsolutePainRelief } from '../../src/logic/it-2';

describe('競合差別化軸定量根拠付け機能 - 相対的差別化軸から絶対的ペイン軽減度への自動変換', () => {
  // SCEN-696
  test('競合アプリ比較対象がない場合、相対的差別化軸が絶対的ペイン軽減度に自動変換される', () => {
    const relativeAxisData = {
      foodRestrictionAxis: 45,
      cookingTimeAxis: 62,
      budgetConstraintAxis: 38,
    };

    const result = convertRelativeDifferentiationToAbsolutePainRelief(
      relativeAxisData,
      null
    );

    expect(result.differentiationAxisType).toBe('absolute');
    expect(result.foodRestrictionPainRelief).toBe(68);
    expect(result.cookingTimePainRelief).toBe(74);
    expect(result.budgetConstraintPainRelief).toBe(61);
    expect(result.absolutePainReliefScore).toBe(67.67);
    expect(result.conversionApplied).toBe(true);
  });

  test('相対的差別化軸の各軸がペイン軽減度に正しく変換される', () => {
    const relativeAxisData = {
      foodRestrictionAxis: 50,
      cookingTimeAxis: 70,
      budgetConstraintAxis: 40,
    };

    const result = convertRelativeDifferentiationToAbsolutePainRelief(
      relativeAxisData,
      null
    );

    expect(result.foodRestrictionPainRelief).toBeGreaterThanOrEqual(0);
    expect(result.foodRestrictionPainRelief).toBeLessThanOrEqual(100);
    expect(result.cookingTimePainRelief).toBeGreaterThanOrEqual(0);
    expect(result.cookingTimePainRelief).toBeLessThanOrEqual(100);
    expect(result.budgetConstraintPainRelief).toBeGreaterThanOrEqual(0);
    expect(result.budgetConstraintPainRelief).toBeLessThanOrEqual(100);
  });

  test('絶対的ペイン軽減度スコアが全軸の平均値として正しく計算される', () => {
    const relativeAxisData = {
      foodRestrictionAxis: 60,
      cookingTimeAxis: 80,
      budgetConstraintAxis: 50,
    };

    const result = convertRelativeDifferentiationToAbsolutePainRelief(
      relativeAxisData,
      null
    );

    const expectedFoodRelief = 71;
    const expectedCookingRelief = 85;
    const expectedBudgetRelief = 64;
    const expectedAbsoluteScore = (expectedFoodRelief + expectedCookingRelief + expectedBudgetRelief) / 3;

    expect(result.foodRestrictionPainRelief).toBe(expectedFoodRelief);
    expect(result.cookingTimePainRelief).toBe(expectedCookingRelief);
    expect(result.budgetConstraintPainRelief).toBe(expectedBudgetRelief);
    expect(result.absolutePainReliefScore).toBe(parseFloat(expectedAbsoluteScore.toFixed(2)));
  });

  test('複数の相対的差別化軸が同時に変換される場合、すべての軸が反映される', () => {
    const relativeAxisData = {
      foodRestrictionAxis: 55,
      cookingTimeAxis: 65,
      budgetConstraintAxis: 45,
    };

    const result = convertRelativeDifferentiationToAbsolutePainRelief(
      relativeAxisData,
      null
    );

    expect(result.differentiationAxisType).toBe('absolute');
    expect(result.conversionApplied).toBe(true);
    expect(Object.keys(result)).toContain('foodRestrictionPainRelief');
    expect(Object.keys(result)).toContain('cookingTimePainRelief');
    expect(Object.keys(result)).toContain('budgetConstraintPainRelief');
    expect(Object.keys(result)).toContain('absolutePainReliefScore');
  });

  test('変換ロジックが適用されたことを示すフラグが正しく立てられる', () => {
    const relativeAxisData = {
      foodRestrictionAxis: 50,
      cookingTimeAxis: 75,
      budgetConstraintAxis: 55,
    };

    const result = convertRelativeDifferentiationToAbsolutePainRelief(
      relativeAxisData,
      null
    );

    expect(result.conversionApplied).toBe(true);
  });

  test('競合アプリ比較対象が null の場合にのみ変換が実行される', () => {
    const relativeAxisData = {
      foodRestrictionAxis: 50,
      cookingTimeAxis: 60,
      budgetConstraintAxis: 40,
    };

    const resultWithoutComparison = convertRelativeDifferentiationToAbsolutePainRelief(
      relativeAxisData,
      null
    );

    expect(resultWithoutComparison.conversionApplied).toBe(true);
    expect(resultWithoutComparison.differentiationAxisType).toBe('absolute');
  });

  test('変換後の絶対的ペイン軽減度は0～100の正規化スコア範囲内である', () => {
    const relativeAxisData = {
      foodRestrictionAxis: 100,
      cookingTimeAxis: 100,
      budgetConstraintAxis: 100,
    };

    const result = convertRelativeDifferentiationToAbsolutePainRelief(
      relativeAxisData,
      null
    );

    expect(result.absolutePainReliefScore).toBeGreaterThanOrEqual(0);
    expect(result.absolutePainReliefScore).toBeLessThanOrEqual(100);
  });

  test('極端に低い相対的差別化軸値が適切にペイン軽減度に変換される', () => {
    const relativeAxisData = {
      foodRestrictionAxis: 5,
      cookingTimeAxis: 10,
      budgetConstraintAxis: 8,
    };

    const result = convertRelativeDifferentiationToAbsolutePainRelief(
      relativeAxisData,
      null
    );

    expect(result.foodRestrictionPainRelief).toBeLessThan(50);
    expect(result.cookingTimePainRelief).toBeLessThan(50);
    expect(result.budgetConstraintPainRelief).toBeLessThan(50);
    expect(result.absolutePainReliefScore).toBeLessThan(50);
  });
});