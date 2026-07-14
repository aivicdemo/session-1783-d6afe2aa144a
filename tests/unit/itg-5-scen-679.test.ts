import { calculateNutritionAchievementRate } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの週次集計と効果検証 - 栄養摂取達成度計算', () => {
  test('SCEN-679: 実績値がゼロの場合、達成率0%として計算される', () => {
    const target_kcal = 1500;
    const actual_kcal = 0;

    const result = calculateNutritionAchievementRate({
      target_intake: target_kcal,
      actual_intake: actual_kcal,
    });

    expect(result.achievement_rate_percent).toBe(0);
    expect(result.achievement_status).toBe('未達成');
  });
});