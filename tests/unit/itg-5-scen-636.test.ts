import { aggregateWeeklyMetrics } from '../../src/logic/it-7-2-1';

describe('献立生成の成功率・調理時間短縮度・ユーザー満足度スコアなどの行動指標を週次で自動集計し、アルゴリズム改善前後の効果差を定量比較するダッシュボード機能', () => {
  test('SCEN-636: 食事評価入力期限ちょうどの時点で評価データが正常に受け入れられ、ダッシュボードに反映される', async () => {
    // 入力期限のちょうど0秒の時点を設定
    const deadline_timestamp = new Date('2024-01-15T23:59:59.999Z');
    const evaluation_input_timestamp = new Date('2024-01-16T00:00:00.000Z');

    // 評価対象の食事データを準備
    const meal_record_id = 'meal_001';
    const family_member_id = 'member_001';
    const user_id = 'user_001';
    const evaluation_data = {
      meal_record_id: meal_record_id,
      family_member_id: family_member_id,
      user_id: user_id,
      satisfaction_score: 4.5,
      consumption_rate: 0.95,
      request_text: 'もう一度作ってほしい',
      input_timestamp: evaluation_input_timestamp.toISOString(),
      deadline_timestamp: deadline_timestamp.toISOString(),
    };

    // 入力期限ちょうどのケースでの受け入れテスト
    const result = await aggregateWeeklyMetrics({
      evaluation_data: evaluation_data,
      current_timestamp: evaluation_input_timestamp,
      deadline_timestamp: deadline_timestamp,
    });

    // ステータスコード200 (成功) またはそれに相当するレスポンスの確認
    expect(result.status_code).toBe(200);

    // レスポンスボディの成功メッセージの確認
    expect(result.success_message).toBe('食事評価データが正常に受け入れられました');

    // データベースに評価データが正常に保存されたことの確認
    expect(result.database_saved).toBe(true);
    expect(result.saved_evaluation_id).toBeDefined();
    expect(typeof result.saved_evaluation_id).toBe('string');

    // ダッシュボードに評価データが反映されていることの確認
    expect(result.dashboard_reflected).toBe(true);
    expect(result.weekly_aggregated_metrics).toBeDefined();
    expect(result.weekly_aggregated_metrics.total_evaluations_received).toBeGreaterThanOrEqual(1);
    expect(result.weekly_aggregated_metrics.average_satisfaction_score).toBeDefined();
    expect(typeof result.weekly_aggregated_metrics.average_satisfaction_score).toBe('number');
    expect(result.weekly_aggregated_metrics.average_consumption_rate).toBeDefined();
    expect(typeof result.weekly_aggregated_metrics.average_consumption_rate).toBe('number');

    // 成功率・調理時間短縮度・ユーザー満足度スコアが正確に計算されていることの確認
    expect(result.weekly_aggregated_metrics.success_rate).toBeDefined();
    expect(result.weekly_aggregated_metrics.success_rate).toBeGreaterThanOrEqual(0);
    expect(result.weekly_aggregated_metrics.success_rate).toBeLessThanOrEqual(100);

    expect(result.weekly_aggregated_metrics.cooking_time_reduction_rate).toBeDefined();
    expect(typeof result.weekly_aggregated_metrics.cooking_time_reduction_rate).toBe('number');

    expect(result.weekly_aggregated_metrics.user_satisfaction_score).toBeDefined();
    expect(result.weekly_aggregated_metrics.user_satisfaction_score).toBeGreaterThanOrEqual(0);
    expect(result.weekly_aggregated_metrics.user_satisfaction_score).toBeLessThanOrEqual(5);

    // 改善前後の効果差が定量比較可能な状態であることの確認
    expect(result.comparison_data).toBeDefined();
    expect(result.comparison_data.pre_algorithm_metrics).toBeDefined();
    expect(result.comparison_data.post_algorithm_metrics).toBeDefined();
    expect(result.comparison_data.improvement_delta).toBeDefined();
    expect(typeof result.comparison_data.improvement_delta).toBe('number');

    // 評価データが実際に保存されたことの追加確認
    expect(result.persisted_evaluation).toBeDefined();
    expect(result.persisted_evaluation.meal_record_id).toBe(meal_record_id);
    expect(result.persisted_evaluation.family_member_id).toBe(family_member_id);
    expect(result.persisted_evaluation.satisfaction_score).toBe(4.5);
    expect(result.persisted_evaluation.consumption_rate).toBe(0.95);
  });
});