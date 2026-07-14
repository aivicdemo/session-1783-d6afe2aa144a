import { aggregateWeeklyMetrics } from '../../src/logic/it-7-2-1';

describe('献立生成の成功率・調理時間短縮度・ユーザー満足度スコアの週次自動集計', () => {
  // SCEN-547: [edge] 献立評価フィードバック蓄積機能 - 完食度が0の場合でもフィードバックデータとして有効に蓄積される
  test('完食度0のフィードバックデータが正常に蓄積され、週次集計に含まれることを検証', () => {
    // Setup: 複数の献立フィードバックデータを用意（完食度0を含む）
    const feedback_data_set = [
      {
        user_id: 'user_001',
        meal_plan_id: 'plan_001',
        taste_score: 4.5,
        appearance_score: 4.0,
        completion_degree: 0.0,
        nutrition_balance_score: 3.8,
        satisfaction_score: 3.5,
        feedback_date: '2024-01-08T19:30:00Z',
        is_valid: true,
      },
      {
        user_id: 'user_001',
        meal_plan_id: 'plan_002',
        taste_score: 4.2,
        appearance_score: 4.3,
        completion_degree: 0.8,
        nutrition_balance_score: 4.1,
        satisfaction_score: 4.0,
        feedback_date: '2024-01-09T19:30:00Z',
        is_valid: true,
      },
      {
        user_id: 'user_001',
        meal_plan_id: 'plan_003',
        taste_score: 3.9,
        appearance_score: 3.7,
        completion_degree: 0.5,
        nutrition_balance_score: 3.6,
        satisfaction_score: 3.4,
        feedback_date: '2024-01-10T19:30:00Z',
        is_valid: true,
      },
    ];

    const week_start_date = '2024-01-08';
    const week_end_date = '2024-01-14';

    // Execute: 週次集計関数を実行
    const aggregation_result = aggregateWeeklyMetrics({
      feedback_records: feedback_data_set,
      week_start: week_start_date,
      week_end: week_end_date,
    });

    // Verify: 結果の構造と値を検証

    // 1. 集計対象の全フィードバック件数を確認（完食度0を含める）
    expect(aggregation_result.total_feedback_count).toBe(3);

    // 2. 完食度の平均値を計算: (0 + 0.8 + 0.5) / 3 = 0.43333...
    expect(aggregation_result.avg_completion_degree).toBeCloseTo(0.4333, 3);

    // 3. 満足度スコアの平均値を計算: (3.5 + 4.0 + 3.4) / 3 = 3.6333...
    expect(aggregation_result.avg_satisfaction_score).toBeCloseTo(3.6333, 3);

    // 4. 献立生成成功率（満足度スコア >= 3.5 のデータ件数 / 全件数）
    // 満足度スコア >= 3.5: plan_001(3.5), plan_002(4.0), plan_003(3.4) → 2件成功
    // 成功率 = 2 / 3 = 0.6667 (66.67%)
    expect(aggregation_result.success_rate).toBeCloseTo(0.6667, 3);

    // 5. 調理時間短縮度の平均値（データセット内の cooking_time_reduction_pct から計算）
    // completion_degree が調理時間短縮のプロキシ変数として機能: (0 + 0.8 + 0.5) / 3 = 0.4333
    expect(aggregation_result.avg_cooking_time_reduction_pct).toBeCloseTo(0.4333, 3);

    // 6. 完食度0のレコードが集計に正常に含まれたことを確認
    expect(aggregation_result.records_with_zero_completion).toBe(1);

    // 7. 集計レコードが全有効フィードバックを含むことを確認
    expect(aggregation_result.aggregated_records.length).toBe(3);

    // 8. 集計データ内の最初のレコード（完食度0）が正確に保持されていることを確認
    const first_record = aggregation_result.aggregated_records[0];
    expect(first_record.user_id).toBe('user_001');
    expect(first_record.meal_plan_id).toBe('plan_001');
    expect(first_record.completion_degree).toBe(0.0);
    expect(first_record.satisfaction_score).toBe(3.5);
    expect(first_record.is_included_in_stats).toBe(true);

    // 9. 完食度0データが統計情報に正常に反映されていることを確認
    expect(aggregation_result.statistics_includes_zero_completion).toBe(true);

    // 10. 週次集計期間の検証
    expect(aggregation_result.week_start_date).toBe(week_start_date);
    expect(aggregation_result.week_end_date).toBe(week_end_date);

    // 11. 全データが valid フラグで有効と判定されていることを確認
    const all_valid = aggregation_result.aggregated_records.every(
      (rec) => rec.is_valid === true
    );
    expect(all_valid).toBe(true);

    // 12. 集計結果に異常値や NaN が含まれていないことを確認
    expect(Number.isNaN(aggregation_result.avg_completion_degree)).toBe(false);
    expect(Number.isNaN(aggregation_result.avg_satisfaction_score)).toBe(false);
    expect(Number.isNaN(aggregation_result.success_rate)).toBe(false);
    expect(Number.isFinite(aggregation_result.avg_cooking_time_reduction_pct)).toBe(
      true
    );
  });
});