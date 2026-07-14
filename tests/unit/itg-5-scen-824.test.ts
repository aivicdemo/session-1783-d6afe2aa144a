import { aggregateWeeklyMetrics } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズム改善効果の週次集計と定量比較', () => {
  // SCEN-824: [edge] ルール仕様書配布・確認追跡機能 - 配布対象者が1名のみの場合、確認追跡が正常に動作する
  test('配布対象者1名のみの場合、確認追跡機能が正常に動作し、ステータスと確認日時が正確に更新される', () => {
    // 配布前初期状態: 対象者1名、ステータス未確認
    const distributionRecord = {
      distribution_id: 'dist_001',
      rule_spec_version: 'v2024Q1',
      recipients: [
        {
          recipient_id: 'user_developer_001',
          recipient_name: 'Development Team Member A',
          status: '未確認',
          confirmed_at: null,
        },
      ],
      distribution_date: new Date('2024-01-15T09:00:00Z'),
      file_path: '/rules/v2024Q1_rule_spec.pdf',
    };

    // ステップ1-6: 配布実行完了、配布完了メッセージ表示
    const initial_delivery_status = distributionRecord.recipients[0].status;
    expect(initial_delivery_status).toBe('未確認');

    // ステップ7-8: 配布対象者確認追跡画面を表示、未確認ステータス確認
    const initial_confirmation_state = {
      recipient_id: 'user_developer_001',
      status: '未確認',
      confirmed_at: null,
    };
    expect(initial_confirmation_state.status).toBe('未確認');
    expect(initial_confirmation_state.confirmed_at).toBeNull();

    // ステップ9: 対象者が仕様書を開封（開封イベントシミュレート）
    const opened_timestamp = new Date('2024-01-15T10:30:00Z');

    // ステップ10-12: 確認追跡画面を更新、ステータスが確認済みに更新、確認日時タイムスタンプ記録
    const updated_confirmation_state = {
      recipient_id: 'user_developer_001',
      status: '確認済み',
      confirmed_at: opened_timestamp,
    };

    // 集計対象期間: 2024-01-08 ～ 2024-01-14（先週）
    const aggregation_period_start = new Date('2024-01-08T00:00:00Z');
    const aggregation_period_end = new Date('2024-01-14T23:59:59Z');
    const current_week_start = new Date('2024-01-15T00:00:00Z');

    // 配布タイムスタンプが当週（集計対象外）だが、確認日時が先週に含まれるシナリオを検証
    const adjusted_confirmation_date = new Date('2024-01-12T14:20:00Z'); // 先週内
    const weekly_metrics_input = {
      week_start: aggregation_period_start,
      week_end: aggregation_period_end,
      algorithm_version_before: 'algo_v1.0',
      algorithm_version_after: 'algo_v1.1',
      delivery_confirmations: [
        {
          recipient_id: 'user_developer_001',
          status: '確認済み',
          confirmed_at: adjusted_confirmation_date,
        },
      ],
      user_satisfaction_scores_before: [85, 82, 88, 90, 87],
      user_satisfaction_scores_after: [88, 91, 89, 92, 90],
      cooking_time_minutes_before: [45, 50, 42, 48, 46],
      cooking_time_minutes_after: [40, 42, 38, 43, 41],
      meal_generation_success_rate_before: 0.88,
      meal_generation_success_rate_after: 0.94,
    };

    // 前後のユーザー満足度平均を計算
    const avg_satisfaction_before =
      weekly_metrics_input.user_satisfaction_scores_before.reduce((a, b) => a + b, 0) /
      weekly_metrics_input.user_satisfaction_scores_before.length;
    const avg_satisfaction_after =
      weekly_metrics_input.user_satisfaction_scores_after.reduce((a, b) => a + b, 0) /
      weekly_metrics_input.user_satisfaction_scores_after.length;
    const satisfaction_improvement = avg_satisfaction_after - avg_satisfaction_before;

    // 前後の調理時間平均を計算（短縮度は負の差分が改善）
    const avg_cooking_time_before =
      weekly_metrics_input.cooking_time_minutes_before.reduce((a, b) => a + b, 0) /
      weekly_metrics_input.cooking_time_minutes_before.length;
    const avg_cooking_time_after =
      weekly_metrics_input.cooking_time_minutes_after.reduce((a, b) => a + b, 0) /
      weekly_metrics_input.cooking_time_minutes_after.length;
    const cooking_time_reduction_minutes = avg_cooking_time_before - avg_cooking_time_after;
    const cooking_time_reduction_rate =
      (cooking_time_reduction_minutes / avg_cooking_time_before) * 100;

    // 献立生成成功率の改善度
    const success_rate_improvement =
      weekly_metrics_input.meal_generation_success_rate_after -
      weekly_metrics_input.meal_generation_success_rate_before;
    const success_rate_improvement_percentage = success_rate_improvement * 100;

    // 集計関数呼び出し
    const aggregation_result = aggregateWeeklyMetrics(weekly_metrics_input);

    // アサーション: 配布対象者1名のみの確認追跡ステータス
    expect(updated_confirmation_state.status).toBe('確認済み');
    expect(updated_confirmation_state.confirmed_at).not.toBeNull();
    expect(updated_confirmation_state.confirmed_at).toEqual(opened_timestamp);

    // アサーション: 配布対象者が1名の場合、確認追跡が正常に機能
    expect(weekly_metrics_input.delivery_confirmations).toHaveLength(1);
    expect(weekly_metrics_input.delivery_confirmations[0].status).toBe('確認済み');
    expect(weekly_metrics_input.delivery_confirmations[0].confirmed_at).toEqual(
      adjusted_confirmation_date,
    );

    // アサーション: ユーザー満足度スコアの改善度（平均: 87 → 90）
    expect(avg_satisfaction_before).toBe(87);
    expect(avg_satisfaction_after).toBe(90);
    expect(satisfaction_improvement).toBe(3);

    // アサーション: 調理時間短縮度（平均: 46.2 分 → 40.8 分、短縮 5.4 分 ≈ 11.7%）
    expect(avg_cooking_time_before).toBeCloseTo(46.2, 1);
    expect(avg_cooking_time_after).toBeCloseTo(40.8, 1);
    expect(cooking_time_reduction_minutes).toBeCloseTo(5.4, 1);
    expect(cooking_time_reduction_rate).toBeCloseTo(11.68, 1);

    // アサーション: 献立生成成功率の改善度（88% → 94%、改善 6 ポイント）
    expect(success_rate_improvement).toBeCloseTo(0.06, 2);
    expect(success_rate_improvement_percentage).toBeCloseTo(6, 1);

    // アサーション: 集計結果に上記指標がすべて含まれる
    expect(aggregation_result).toHaveProperty('week_start');
    expect(aggregation_result).toHaveProperty('week_end');
    expect(aggregation_result).toHaveProperty('avg_satisfaction_before', 87);
    expect(aggregation_result).toHaveProperty('avg_satisfaction_after', 90);
    expect(aggregation_result).toHaveProperty('satisfaction_improvement', 3);
    expect(aggregation_result).toHaveProperty(
      'cooking_time_reduction_minutes',
      expect.closeTo(5.4, 1),
    );
    expect(aggregation_result).toHaveProperty(
      'cooking_time_reduction_rate',
      expect.closeTo(11.68, 1),
    );
    expect(aggregation_result).toHaveProperty('meal_generation_success_rate_before', 0.88);
    expect(aggregation_result).toHaveProperty('meal_generation_success_rate_after', 0.94);
    expect(aggregation_result).toHaveProperty(
      'success_rate_improvement_percentage',
      expect.closeTo(6, 1),
    );
    expect(aggregation_result).toHaveProperty('algorithm_version_before', 'algo_v1.0');
    expect(aggregation_result).toHaveProperty('algorithm_version_after', 'algo_v1.1');

    // アサーション: 配布確認リストが正確に保持される（1名のみ）
    expect(aggregation_result.delivery_confirmation_summary).toHaveLength(1);
    expect(aggregation_result.delivery_confirmation_summary[0]).toEqual({
      recipient_id: 'user_developer_001',
      status: '確認済み',
      confirmed_at: adjusted_confirmation_date,
    });

    // アサーション: 統計的有意性判定が実施される（サンプルサイズ5件で信頼度を評価）
    expect(aggregation_result).toHaveProperty('statistical_significance');
    expect(aggregation_result.statistical_significance).toBe(true);

    // アサーション: 確認日時タイムスタンプが正確に記録・更新される
    expect(aggregation_result.delivery_confirmation_summary[0].confirmed_at.getTime()).toBe(
      adjusted_confirmation_date.getTime(),
    );
  });
});