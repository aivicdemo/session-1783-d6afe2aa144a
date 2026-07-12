import { calculateNutritionAchievementRate } from '../../src/logic/it-2';

describe('Family Member Meal Evaluation Data Accumulation and Management', () => {
  // SCEN-366
  test('should calculate nutrition achievement rate exceeding 100% when actual value far exceeds target value', () => {
    const proteinTargetValue = 50;
    const proteinActualValue = 150;

    const achievementRate = calculateNutritionAchievementRate(
      proteinActualValue,
      proteinTargetValue
    );

    expect(achievementRate).toBe(300);
  });
});