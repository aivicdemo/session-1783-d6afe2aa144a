import { aggregateWeeklyBehaviorIndicators } from '../../src/logic/it-7-2-1';

describe('週次行動指標集計機能', () => {
  // SCEN-666: [normal] 週次行動指標集計機能 - 献立生成成功率・調理時間短縮度・ユーザー満足度スコアを週単位で正常に集計できる
  test('献立生成成功率・調理時間短縮度・ユーザー満足度スコアを週単位で正常に集計できる', () => {
    // 第1週（2024-01-01～2024-01-07）のログデータ
    const week1_start = new Date('2024-01-01T00:00:00Z');
    const week1_end = new Date('2024-01-07T23:59:59Z');
    const week1_logs = [
      {
        user_id: 'user_001',
        menu_generation_timestamp: new Date('2024-01-01T10:00:00Z'),
        generation_success: true,
        actual_cooking_time_minutes: 25,
        target_cooking_time_minutes: 30,
        satisfaction_score: 4.5,
      },
      {
        user_id: 'user_001',
        menu_generation_timestamp: new Date('2024-01-02T10:00:00Z'),
        generation_success: true,
        actual_cooking_time_minutes: 20,
        target_cooking_time_minutes: 30,
        satisfaction_score: 4.8,
      },
      {
        user_id: 'user_001',
        menu_generation_timestamp: new Date('2024-01-03T10:00:00Z'),
        generation_success: false,
        actual_cooking_time_minutes: 35,
        target_cooking_time_minutes: 30,
        satisfaction_score: 2.5,
      },
      {
        user_id: 'user_001',
        menu_generation_timestamp: new Date('2024-01-04T10:00:00Z'),
        generation_success: true,
        actual_cooking_time_minutes: 28,
        target_cooking_time_minutes: 30,
        satisfaction_score: 4.2,
      },
      {
        user_id: 'user_001',
        menu_generation_timestamp: new Date('2024-01-05T10:00:00Z'),
        generation_success: true,
        actual_cooking_time_minutes: 22,
        target_cooking_time_minutes: 30,
        satisfaction_score: 4.6,
      },
      {
        user_id: 'user_001',
        menu_generation_timestamp: new Date('2024-01-06T10:00:00Z'),
        generation_success: true,
        actual_cooking_time_minutes: 26,
        target_cooking_time_minutes: 30,
        satisfaction_score: 4.3,
      },
      {
        user_id: 'user_001',
        menu_generation_timestamp: new Date('2024-01-07T10:00:00Z'),
        generation_success: false,
        actual_cooking_time_minutes: 32,
        target_cooking_time_minutes: 30,
        satisfaction_score: 3.1,
      },
    ];

    // 第2週（2024-01-08～2024-01-14）のログデータ
    const week2_start = new Date('2024-01-08T00:00:00Z');
    const week2_end = new Date('2024-01-14T23:59:59Z');
    const week2_logs = [
      {
        user_id: 'user_001',
        menu_generation_timestamp: new Date('2024-01-08T10:00:00Z'),
        generation_success: true,
        actual_cooking_time_minutes: 24,
        target_cooking_time_minutes: 30,
        satisfaction_score: 4.7,
      },
      {
        user_id: 'user_001',
        menu_generation_timestamp: new Date('2024-01-09T10:00:00Z'),
        generation_success: true,
        actual_cooking_time_minutes: 19,
        target_cooking_time_minutes: 30,
        satisfaction_score: 4.9,
      },
      {
        user_id: 'user_001',
        menu_generation_timestamp: new Date('2024-01-10T10:00:00Z'),
        generation_success: true,
        actual_cooking_time_minutes: 23,
        target_cooking_time_minutes: 30,
        satisfaction_score: 4.4,
      },
      {
        user_id: 'user_001',
        menu_generation_timestamp: new Date('2024-01-11T10:00:00Z'),
        generation_success: false,
        actual_cooking_time_minutes: 38,
        target_cooking_time_minutes: 30,
        satisfaction_score: 2.8,
      },
      {
        user_id: 'user_001',
        menu_generation_timestamp: new Date('2024-01-12T10:00:00Z'),
        generation_success: true,
        actual_cooking_time_minutes: 21,
        target_cooking_time_minutes: 30,
        satisfaction_score: 4.5,
      },
    ];

    // 第1週の集計実行
    const week1_result = aggregateWeeklyBehaviorIndicators(
      week1_logs,
      week1_start,
      week1_end
    );

    // 第1週: 献立生成成功率 = 成功件数 / 総件数 = 5 / 7 ≈ 0.7143 → 71.43%
    expect(week1_result.menu_generation_success_rate).toBe(71.43);

    // 第1週: 調理時間短縮度 = (目標時間 - 実績時間) / 目標時間 の平均
    // ケース1: (30 - 25) / 30 = 0.1667
    // ケース2: (30 - 20) / 30 = 0.3333
    // ケース3: (30 - 35) / 30 = -0.1667 (超過だが計算に含める)
    // ケース4: (30 - 28) / 30 = 0.0667
    // ケース5: (30 - 22) / 30 = 0.2667
    // ケース6: (30 - 26) / 30 = 0.1333
    // ケース7: (30 - 32) / 30 = -0.0667 (超過)
    // 平均 = (0.1667 + 0.3333 - 0.1667 + 0.0667 + 0.2667 + 0.1333 - 0.0667) / 7 = 0.7333 / 7 ≈ 0.1048 → 10.48%
    expect(week1_result.cooking_time_reduction_rate).toBe(10.48);

    // 第1週: ユーザー満足度スコアの平均 = (4.5 + 4.8 + 2.5 + 4.2 + 4.6 + 4.3 + 3.1) / 7 = 28.0 / 7 = 4.0
    expect(week1_result.average_satisfaction_score).toBe(4.0);

    // 第1週のメタデータ検証
    expect(week1_result.week_start_date).toEqual(week1_start);
    expect(week1_result.week_end_date).toEqual(week1_end);
    expect(week1_result.total_menu_generations).toBe(7);
    expect(week1_result.successful_menu_generations).toBe(5);

    // 第2週の集計実行
    const week2_result = aggregateWeeklyBehaviorIndicators(
      week2_logs,
      week2_start,
      week2_end
    );

    // 第2週: 献立生成成功率 = 4 / 5 = 0.8 → 80.0%
    expect(week2_result.menu_generation_success_rate).toBe(80.0);

    // 第2週: 調理時間短縮度の平均
    // ケース1: (30 - 24) / 30 = 0.2
    // ケース2: (30 - 19) / 30 = 0.3667
    // ケース3: (30 - 23) / 30 = 0.2333
    // ケース4: (30 - 38) / 30 = -0.2667
    // ケース5: (30 - 21) / 30 = 0.3
    // 平均 = (0.2 + 0.3667 + 0.2333 - 0.2667 + 0.3) / 5 = 0.8333 / 5 ≈ 0.1667 → 16.67%
    expect(week2_result.cooking_time_reduction_rate).toBe(16.67);

    // 第2週: ユーザー満足度スコアの平均 = (4.7 + 4.9 + 4.4 + 2.8 + 4.5) / 5 = 21.3 / 5 = 4.26
    expect(week2_result.average_satisfaction_score).toBe(4.26);

    // 第2週のメタデータ検証
    expect(week2_result.week_start_date).toEqual(week2_start);
    expect(week2_result.week_end_date).toEqual(week2_end);
    expect(week2_result.total_menu_generations).toBe(5);
    expect(week2_result.successful_menu_generations).toBe(4);

    // 複数週データの独立性検証
    // 第1週と第2週の結果が異なることを確認
    expect(week1_result.menu_generation_success_rate).not.toBe(
      week2_result.menu_generation_success_rate
    );
    expect(week1_result.average_satisfaction_score).not.toBe(
      week2_result.average_satisfaction_score
    );

    // 各週が独立したデータセットを保有していることを確認
    expect(week1_result.total_menu_generations).toBe(7);
    expect(week2_result.total_menu_generations).toBe(5);
  });
});