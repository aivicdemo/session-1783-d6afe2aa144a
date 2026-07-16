import { calculateCookingTimeAchievementRate } from '../../src/logic/it-8-1-2-1';

describe('調理時間短縮実現度比較・可視化機能', () => {
  // SCEN-367
  test('実績調理時間が目標を下回るとき、達成度が100%を超えて表示される', () => {
    const target_cooking_time_minutes = 30;
    const actual_cooking_time_minutes = 20;

    const achievement_rate_percent = calculateCookingTimeAchievementRate({
      target_cooking_time_minutes,
      actual_cooking_time_minutes,
    });

    const expected_achievement_rate = ((target_cooking_time_minutes - actual_cooking_time_minutes) / target_cooking_time_minutes) * 100;
    expect(achievement_rate_percent).toBe(expected_achievement_rate);
    expect(achievement_rate_percent).toBe(133.33333333333334);
    expect(achievement_rate_percent).toBeGreaterThan(100);
  });
});