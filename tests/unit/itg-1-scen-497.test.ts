import { calculateNutritionAchievementScore } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-497
  test('栄養目標値が無効な場合、達成度計算がエラーとなる', () => {
    const invalidNutritionGoal_null = {
      nutritionGoalValue: null,
      actualIntakeValue: 50,
    };

    expect(() => calculateNutritionAchievementScore(invalidNutritionGoal_null)).toThrow(/栄養目標値/);
  });

  test('栄養目標値がundefinedの場合、達成度計算がエラーとなる', () => {
    const invalidNutritionGoal_undefined = {
      nutritionGoalValue: undefined,
      actualIntakeValue: 50,
    };

    expect(() => calculateNutritionAchievementScore(invalidNutritionGoal_undefined)).toThrow(/栄養目標値/);
  });

  test('栄養目標値が負数の場合、達成度計算がエラーとなる', () => {
    const invalidNutritionGoal_negative = {
      nutritionGoalValue: -100,
      actualIntakeValue: 50,
    };

    expect(() => calculateNutritionAchievementScore(invalidNutritionGoal_negative)).toThrow(/栄養目標値/);
  });

  test('栄養目標値が非数値の場合、達成度計算がエラーとなる', () => {
    const invalidNutritionGoal_nonNumeric = {
      nutritionGoalValue: 'invalid' as any,
      actualIntakeValue: 50,
    };

    expect(() => calculateNutritionAchievementScore(invalidNutritionGoal_nonNumeric)).toThrow(/栄養目標値/);
  });

  test('栄養目標値が0の場合、達成度計算がエラーとなる', () => {
    const invalidNutritionGoal_zero = {
      nutritionGoalValue: 0,
      actualIntakeValue: 50,
    };

    expect(() => calculateNutritionAchievementScore(invalidNutritionGoal_zero)).toThrow(/栄養目標値/);
  });

  test('栄養目標値が有効で実績値が正常な場合、達成度スコアが計算される', () => {
    const validNutritionData = {
      nutritionGoalValue: 100,
      actualIntakeValue: 80,
    };

    const result = calculateNutritionAchievementScore(validNutritionData);

    expect(result).toBe(80);
  });

  test('実績値が目標値を超える場合、達成度スコアが100に制限される', () => {
    const exceedingNutritionData = {
      nutritionGoalValue: 100,
      actualIntakeValue: 150,
    };

    const result = calculateNutritionAchievementScore(exceedingNutritionData);

    expect(result).toBe(100);
  });

  test('実績値が0の場合、達成度スコアが0となる', () => {
    const zeroIntakeData = {
      nutritionGoalValue: 100,
      actualIntakeValue: 0,
    };

    const result = calculateNutritionAchievementScore(zeroIntakeData);

    expect(result).toBe(0);
  });
});