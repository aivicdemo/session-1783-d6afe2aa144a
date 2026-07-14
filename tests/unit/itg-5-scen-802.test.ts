import { validateMonthlyDemandForecastFlow } from '../../src/logic/it-7-2-1';

describe('月次需要予測検証フロー自動実行機能 - SLA超過アラート', () => {
  test('SCEN-802: SLA基準完了時間を超過した場合、例外アラートが発火して承認者に通知される', () => {
    // ========== Arrange ==========
    const job_id = 'JOB-2024-001';
    const sla_threshold_ms = 30 * 60 * 1000; // 30分
    const actual_execution_time_ms = 35 * 60 * 1000; // 35分（超過）
    const exceeds_duration_ms = actual_execution_time_ms - sla_threshold_ms; // 5分超過
    const approver_email = 'approver@example.com';
    const start_timestamp = new Date('2024-01-15T09:00:00Z');
    const end_timestamp = new Date(start_timestamp.getTime() + actual_execution_time_ms);

    const forecast_flow_config = {
      job_id: job_id,
      sla_threshold_ms: sla_threshold_ms,
      approver_email: approver_email,
      start_timestamp: start_timestamp,
      end_timestamp: end_timestamp,
      execution_status: 'completed',
      actual_execution_time_ms: actual_execution_time_ms,
    };

    // ========== Act ==========
    const result = validateMonthlyDemandForecastFlow(forecast_flow_config);

    // ========== Assert ==========
    // 1. SLA超過を正しく検出した
    expect(result.sla_exceeded).toBe(true);

    // 2. 超過時間を正確に計算
    expect(result.exceeds_duration_ms).toBe(exceeds_duration_ms);

    // 3. 例外アラートが発火
    expect(result.alert_triggered).toBe(true);
    expect(result.alert_type).toBe('sla_exceeded');

    // 4. アラート通知が承認者に対して生成された
    expect(result.notification_sent).toBe(true);
    expect(result.notification_recipient).toBe(approver_email);

    // 5. 通知メッセージに必須情報が含まれている
    expect(result.notification_message).toContain(job_id);
    expect(result.notification_message).toContain('5');  // 超過時間（分）
    expect(result.notification_message).toContain('分超過');

    // 6. 通知に推奨アクション情報が記載されている
    expect(result.notification_message).toContain('検証フロー');
    expect(result.notification_message).toMatch(/再実行|確認|対応/);

    // 7. ジョブの詳細情報が通知に含まれている
    expect(result.alert_details).toBeDefined();
    expect(result.alert_details.job_id).toBe(job_id);
    expect(result.alert_details.start_time).toBe(start_timestamp.toISOString());
    expect(result.alert_details.end_time).toBe(end_timestamp.toISOString());
    expect(result.alert_details.actual_duration_minutes).toBe(35);
    expect(result.alert_details.sla_threshold_minutes).toBe(30);

    // 8. ログに例外情報が記録される
    expect(result.alert_logged).toBe(true);
    expect(result.log_level).toBe('error');

    // 9. アラート発火時刻が正確に記録されている
    expect(result.alert_triggered_at).toBeDefined();
    expect(typeof result.alert_triggered_at).toBe('string');

    // 10. 承認者による対応が必要な状態である
    expect(result.requires_approval_action).toBe(true);
  });
});