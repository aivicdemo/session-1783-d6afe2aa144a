import { detectAndHandleSLADelay } from '../../src/logic/it-7-2-1';

describe('SLA遅延検知・代替処理機能 - ダッシュボード指標集計', () => {
  // SCEN-774
  test('SLA遅延検知時に遅延ログが記録され、ステークホルダー通知が実行される', () => {
    // === Setup: 遅延発生のシミュレーション ===
    const trigger_timestamp = new Date('2024-01-15T10:00:00Z');
    const sla_threshold_ms = 24 * 60 * 60 * 1000; // 24時間
    const delay_detection_timestamp = new Date('2024-01-16T11:30:00Z');
    const delay_duration_ms =
      delay_detection_timestamp.getTime() - trigger_timestamp.getTime();

    const input_params = {
      process_trigger_timestamp: trigger_timestamp,
      sla_threshold_milliseconds: sla_threshold_ms,
      delay_detected_at: delay_detection_timestamp,
      process_type: 'weekly_aggregation',
      affected_metrics: ['generation_success_rate', 'cooking_time_reduction', 'user_satisfaction_score'],
      stakeholder_list: ['dev_team@company.com', 'pm@company.com'],
    };

    // === 遅延検知・代替処理実行 ===
    const result = detectAndHandleSLADelay(input_params);

    // === Assertion: 遅延ログ記録の検証 ===
    expect(result.delay_detected).toBe(true);
    expect(result.delay_log).toBeDefined();
    expect(result.delay_log.delay_start_time).toEqual(trigger_timestamp);
    expect(result.delay_log.delay_detected_time).toEqual(delay_detection_timestamp);
    expect(result.delay_log.delay_duration_milliseconds).toBe(delay_duration_ms);
    expect(result.delay_log.delay_type).toBe('process_timeout');
    expect(result.delay_log.process_type).toBe('weekly_aggregation');

    // === Assertion: 代替処理実行ステータスの検証 ===
    expect(result.fallback_process_executed).toBe(true);
    expect(result.fallback_process_status).toBe('completed');
    expect(result.fallback_execution_timestamp).toBeDefined();
    expect(
      new Date(result.fallback_execution_timestamp).getTime()
    ).toBeGreaterThanOrEqual(delay_detection_timestamp.getTime());

    // === Assertion: 代替処理の結果ステータスが遅延ログに記録されている ===
    expect(result.delay_log.fallback_result_status).toBe('completed');
    expect(result.delay_log.affected_metrics_count).toBe(3);
    expect(result.delay_log.affected_metrics).toEqual([
      'generation_success_rate',
      'cooking_time_reduction',
      'user_satisfaction_score',
    ]);

    // === Assertion: ステークホルダー通知の検証 ===
    expect(result.stakeholder_notifications).toBeDefined();
    expect(result.stakeholder_notifications.length).toBe(2);

    // 通知1: 開発チーム
    const dev_team_notification = result.stakeholder_notifications[0];
    expect(dev_team_notification.recipient_email).toBe('dev_team@company.com');
    expect(dev_team_notification.notification_timestamp).toBeDefined();
    expect(dev_team_notification.notification_status).toBe('sent');
    expect(dev_team_notification.message_content).toContain('遅延');
    expect(dev_team_notification.message_content).toContain('weekly_aggregation');
    expect(dev_team_notification.message_content).toContain('completed');

    // 通知2: PM
    const pm_notification = result.stakeholder_notifications[1];
    expect(pm_notification.recipient_email).toBe('pm@company.com');
    expect(pm_notification.notification_timestamp).toBeDefined();
    expect(pm_notification.notification_status).toBe('sent');
    expect(pm_notification.message_content).toContain('遅延');

    // === Assertion: 通知メッセージに遅延情報と処理結果が含まれている ===
    for (const notification of result.stakeholder_notifications) {
      expect(notification.message_content).toContain(
        delay_detection_timestamp.toISOString()
      );
      expect(notification.message_content).toContain('処理結果:');
    }

    // === Assertion: 通知送信ログの検証 ===
    expect(result.notification_send_log).toBeDefined();
    expect(result.notification_send_log.length).toBe(2);

    const notification_log_entry_1 = result.notification_send_log[0];
    expect(notification_log_entry_1.notification_sent_at).toBeDefined();
    expect(notification_log_entry_1.recipient).toBe('dev_team@company.com');
    expect(notification_log_entry_1.delivery_status).toBe('sent');
    expect(new Date(notification_log_entry_1.notification_sent_at).getTime()).toBeGreaterThan(0);

    const notification_log_entry_2 = result.notification_send_log[1];
    expect(notification_log_entry_2.notification_sent_at).toBeDefined();
    expect(notification_log_entry_2.recipient).toBe('pm@company.com');
    expect(notification_log_entry_2.delivery_status).toBe('sent');

    // === Assertion: 全通知ログの日時・対象者・ステータスが正確に記録されている ===
    expect(result.notification_send_log).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recipient: expect.any(String),
          delivery_status: 'sent',
          notification_sent_at: expect.any(String),
        }),
      ])
    );

    // === Assertion: 全体的な遅延ハンドリング結果の検証 ===
    expect(result.sla_delay_handling_complete).toBe(true);
    expect(result.error_occurred).toBe(false);
  });
});