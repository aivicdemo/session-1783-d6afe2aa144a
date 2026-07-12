import { executeRegressionTest } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-428: [normal] 回帰テスト自動実行機能 - 過去1ヶ月分の献立生成実績に対して回帰テストを実行し、精度低下がないことを確認できる
  test('過去1ヶ月分の献立生成実績に対して回帰テストを実行し、精度低下がないことを確認する', () => {
    const test_start_date = new Date('2024-12-15T00:00:00Z');
    const test_end_date = new Date('2025-01-15T23:59:59Z');
    const test_period_days = 31;

    const regression_test_cases = [
      {
        meal_plan_id: 'MEAL_001',
        generation_date: '2025-01-10',
        user_id: 'USR_001',
        family_size: 4,
        satisfaction_score_before: 4.2,
        completion_rate_before: 0.95,
        cooking_time_minutes: 35,
      },
      {
        meal_plan_id: 'MEAL_002',
        generation_date: '2025-01-08',
        user_id: 'USR_001',
        family_size: 4,
        satisfaction_score_before: 4.5,
        completion_rate_before: 1.0,
        cooking_time_minutes: 28,
      },
      {
        meal_plan_id: 'MEAL_003',
        generation_date: '2025-01-05',
        user_id: 'USR_002',
        family_size: 3,
        satisfaction_score_before: 3.8,
        completion_rate_before: 0.92,
        cooking_time_minutes: 42,
      },
      {
        meal_plan_id: 'MEAL_004',
        generation_date: '2025-01-01',
        user_id: 'USR_002',
        family_size: 3,
        satisfaction_score_before: 4.1,
        completion_rate_before: 0.98,
        cooking_time_minutes: 38,
      },
      {
        meal_plan_id: 'MEAL_005',
        generation_date: '2024-12-28',
        user_id: 'USR_001',
        family_size: 4,
        satisfaction_score_before: 4.3,
        completion_rate_before: 0.96,
        cooking_time_minutes: 31,
      },
    ];

    const regression_test_input = {
      test_period_start: test_start_date.toISOString(),
      test_period_end: test_end_date.toISOString(),
      test_period_days: test_period_days,
      meal_plan_history: regression_test_cases,
      algorithm_version_current: 'v2.1',
      algorithm_version_baseline: 'v2.0',
      precision_threshold_satisfaction: 4.0,
      precision_threshold_completion_rate: 0.90,
      precision_threshold_cooking_time_minutes: 45,
      allowable_degradation_percentage: 5.0,
    };

    const regression_test_result = executeRegressionTest(
      regression_test_input,
    );

    // 期待値計算:
    // - テストケース数: 5件
    // - 全テストケースが基準値以上であると判定
    // - 平均満足度スコア: (4.2 + 4.5 + 3.8 + 4.1 + 4.3) / 5 = 4.18
    // - 平均完食度: (0.95 + 1.0 + 0.92 + 0.98 + 0.96) / 5 = 0.962
    // - 平均調理時間: (35 + 28 + 42 + 38 + 31) / 5 = 34.8分
    // - 精度低下判定: 平均値がすべて基準値以上かつ許容範囲内なため「精度低下なし」
    // - テスト成功率: 5/5 = 100%
    // - メッセージ: "精度低下なし"

    expect(regression_test_result).toEqual({
      test_execution_status: 'completed',
      test_case_count: 5,
      test_passed_count: 5,
      test_failed_count: 0,
      test_success_rate_percentage: 100.0,
      average_satisfaction_score: 4.18,
      average_completion_rate: 0.962,
      average_cooking_time_minutes: 34.8,
      precision_degradation_detected: false,
      precision_degradation_message: '精度低下なし',
      detailed_comparison: {
        satisfaction_score_delta: 0.18,
        completion_rate_delta: 0.062,
        cooking_time_delta: -10.2,
        within_allowable_threshold: true,
      },
      result_summary: 'すべてのテストケースが基準値以上',
      timestamp: expect.any(String),
    });

    expect(regression_test_result.test_execution_status).toBe('completed');
    expect(regression_test_result.test_success_rate_percentage).toBe(100.0);
    expect(regression_test_result.precision_degradation_detected).toBe(false);
    expect(regression_test_result.average_satisfaction_score).toBeGreaterThanOrEqual(
      regression_test_input.precision_threshold_satisfaction,
    );
    expect(regression_test_result.average_completion_rate).toBeGreaterThanOrEqual(
      regression_test_input.precision_threshold_completion_rate,
    );
    expect(regression_test_result.average_cooking_time_minutes).toBeLessThanOrEqual(
      regression_test_input.precision_threshold_cooking_time_minutes,
    );
    expect(regression_test_result.test_passed_count).toBe(
      regression_test_result.test_case_count,
    );
  });
});