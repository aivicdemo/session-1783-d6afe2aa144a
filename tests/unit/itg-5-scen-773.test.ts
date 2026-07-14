import { calculateWeeklyMetricsAndCompare } from '../../src/logic/it-7-2-1';

describe('Weekly Algorithm Performance Metrics and Improvement Effect Comparison', () => {
  // SCEN-773: [edge] SLA遅延検知・代替処理機能 - 経過時間がSLA境界値（24時間）と同一の場合の遅延判定を正確に実行する
  test('should judge as non-delayed when elapsed time equals SLA boundary of 24 hours exactly', () => {
    const sla_threshold_seconds = 86400; // 24 hours in seconds
    const elapsed_time_seconds = 86400; // exactly 24 hours

    const metricsBeforeImprovement = {
      week_id: 'week_001',
      generation_success_rate: 0.75,
      cooking_time_reduction_degree: 0.15,
      user_satisfaction_score: 3.2,
      timestamp_start: new Date('2024-01-08T09:00:00Z'),
    };

    const metricsAfterImprovement = {
      week_id: 'week_002',
      generation_success_rate: 0.82,
      cooking_time_reduction_degree: 0.22,
      user_satisfaction_score: 3.8,
      timestamp_start: new Date('2024-01-15T09:00:00Z'),
    };

    const slaCheckInput = {
      metrics_before: metricsBeforeImprovement,
      metrics_after: metricsAfterImprovement,
      elapsed_seconds: elapsed_time_seconds,
      sla_threshold_seconds: sla_threshold_seconds,
    };

    const result = calculateWeeklyMetricsAndCompare(slaCheckInput);

    // 境界値と同一の時点では遅延なしと判定される
    expect(result.is_delayed).toBe(false);

    // 代替処理はトリガーされない
    expect(result.fallback_process_triggered).toBe(false);

    // 正常系の状態コードが返される
    expect(result.status).toBe('normal');

    // ログ記録はされるが、アラート通知は発動しない
    expect(result.alert_notification_triggered).toBe(false);

    // SLA判定結果の詳細
    expect(result.sla_judgment_detail).toEqual({
      elapsed_seconds: 86400,
      sla_threshold_seconds: 86400,
      is_at_boundary: true,
      is_over_boundary: false,
    });

    // 通常の改善効果比較が実行される
    expect(result.improvement_effect_comparison).toEqual({
      success_rate_improvement: 0.07, // 0.82 - 0.75
      cooking_time_reduction_improvement: 0.07, // 0.22 - 0.15
      satisfaction_score_improvement: 0.6, // 3.8 - 3.2
    });

    // メトリクス比較の詳細スコア（改善効果の有意性を検証）
    expect(result.comparison_detail).toEqual({
      success_rate_before: 0.75,
      success_rate_after: 0.82,
      cooking_time_reduction_before: 0.15,
      cooking_time_reduction_after: 0.22,
      satisfaction_before: 3.2,
      satisfaction_after: 3.8,
    });

    // ダッシュボード表示用の集計結果
    expect(result.dashboard_metrics).toEqual({
      week_before: 'week_001',
      week_after: 'week_002',
      metrics_comparison_ready: true,
      visualization_data_generated: true,
    });
  });
});