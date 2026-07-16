import { calculateCookingTimeAchievementRate } from '../../src/logic/it-8-1-2-1';

describe('調理時間短縮実現度比較・可視化機能', () => {
  // SCEN-363
  test('各セグメントの目標調理時間と実績調理時間の差分が計算され、達成度パーセンテージが正確に算出される', () => {
    // セグメント A: 目標30分、実績22分
    const segment_a_target = 30;
    const segment_a_actual = 22;
    const segment_a_difference = segment_a_target - segment_a_actual;
    const segment_a_achievement_rate = (segment_a_difference / segment_a_target) * 100;

    const result_a = calculateCookingTimeAchievementRate(
      segment_a_target,
      segment_a_actual
    );

    expect(result_a.difference).toBe(8);
    expect(result_a.achievement_rate).toBe(26.67);

    // セグメント B: 目標25分、実績18分
    const segment_b_target = 25;
    const segment_b_actual = 18;
    const segment_b_difference = segment_b_target - segment_b_actual;
    const segment_b_achievement_rate = (segment_b_difference / segment_b_target) * 100;

    const result_b = calculateCookingTimeAchievementRate(
      segment_b_target,
      segment_b_actual
    );

    expect(result_b.difference).toBe(7);
    expect(result_b.achievement_rate).toBe(28.0);

    // セグメント C: 目標20分、実績16分
    const segment_c_target = 20;
    const segment_c_actual = 16;
    const segment_c_difference = segment_c_target - segment_c_actual;
    const segment_c_achievement_rate = (segment_c_difference / segment_c_target) * 100;

    const result_c = calculateCookingTimeAchievementRate(
      segment_c_target,
      segment_c_actual
    );

    expect(result_c.difference).toBe(4);
    expect(result_c.achievement_rate).toBe(20.0);

    // 複数の異なる数値パターンで再度計算を実行し、結果の一貫性を確認
    // パターン 1: 目標40分、実績30分
    const pattern_1_target = 40;
    const pattern_1_actual = 30;
    const result_pattern_1 = calculateCookingTimeAchievementRate(
      pattern_1_target,
      pattern_1_actual
    );

    expect(result_pattern_1.difference).toBe(10);
    expect(result_pattern_1.achievement_rate).toBe(25.0);

    // パターン 2: 目標50分、実績35分
    const pattern_2_target = 50;
    const pattern_2_actual = 35;
    const result_pattern_2 = calculateCookingTimeAchievementRate(
      pattern_2_target,
      pattern_2_actual
    );

    expect(result_pattern_2.difference).toBe(15);
    expect(result_pattern_2.achievement_rate).toBe(30.0);

    // パターン 3: 目標15分、実績12分
    const pattern_3_target = 15;
    const pattern_3_actual = 12;
    const result_pattern_3 = calculateCookingTimeAchievementRate(
      pattern_3_target,
      pattern_3_actual
    );

    expect(result_pattern_3.difference).toBe(3);
    expect(result_pattern_3.achievement_rate).toBe(20.0);

    // 一貫性確認: 同じ値を複数回計算
    const consistency_result_1 = calculateCookingTimeAchievementRate(30, 22);
    const consistency_result_2 = calculateCookingTimeAchievementRate(30, 22);

    expect(consistency_result_1.difference).toEqual(consistency_result_2.difference);
    expect(consistency_result_1.achievement_rate).toEqual(consistency_result_2.achievement_rate);
    expect(consistency_result_1.difference).toBe(8);
    expect(consistency_result_1.achievement_rate).toBe(26.67);
  });
});