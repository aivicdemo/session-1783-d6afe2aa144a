import { calculateNutritionAchievementRate } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-352
  test('栄養実績値が0%の場合、達成度が正しく0%で計算される', () => {
    const nutritionTargets = {
      protein: 50,
      fat: 60,
      carbohydrate: 300,
    };

    const nutritionActuals = {
      protein: 0,
      fat: 0,
      carbohydrate: 0,
    };

    const result = calculateNutritionAchievementRate(
      nutritionTargets,
      nutritionActuals
    );

    expect(result.proteinAchievementRate).toBe(0);
    expect(result.fatAchievementRate).toBe(0);
    expect(result.carbohydrateAchievementRate).toBe(0);
    expect(result.overallAchievementRate).toBe(0);

    expect(Number.isNaN(result.proteinAchievementRate)).toBe(false);
    expect(Number.isNaN(result.fatAchievementRate)).toBe(false);
    expect(Number.isNaN(result.carbohydrateAchievementRate)).toBe(false);
    expect(Number.isNaN(result.overallAchievementRate)).toBe(false);

    expect(isFinite(result.proteinAchievementRate)).toBe(true);
    expect(isFinite(result.fatAchievementRate)).toBe(true);
    expect(isFinite(result.carbohydrateAchievementRate)).toBe(true);
    expect(isFinite(result.overallAchievementRate)).toBe(true);
  });
});