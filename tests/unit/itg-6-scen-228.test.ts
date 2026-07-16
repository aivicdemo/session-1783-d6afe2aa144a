import { recordNotificationWithTimestamp, validateSLANotificationTiming } from '../../src/logic/it-8-1-2-1';

describe('献立生成フロー内の改善提案優先度スコアリングと通知ワークフロー', () => {
  // SCEN-228: [edge] 改善提案の優先度スコアリングと通知ワークフロー - SLA上限5営業日の直前および直後時刻での通知送信が正確に記録される
  test('SLA上限5営業日の直前・直後時刻における通知送信ログのタイムスタンプ精度とワークフロー実行順序を検証', () => {
    // Arrange: テストデータとしてSLA上限5営業日のタイムスタンプを基準日時として設定
    // 基準日時: 2024-01-15 (月曜) 09:00 UTC を週の開始とする
    // SLA上限5営業日 = 2024-01-22 (月曜) 09:00 UTC
    const sla_base_date = new Date('2024-01-15T09:00:00.000Z');
    const sla_limit_5_business_days = new Date('2024-01-22T09:00:00.000Z');

    // SLA上限5営業日の直前時刻: 2024-01-21 23:59:59.999Z (4営業日23時59分59秒)
    const just_before_sla_timestamp = new Date('2024-01-21T23:59:59.999Z');
    // SLA上限5営業日の直後時刻: 2024-01-22 00:00:00.000Z (5営業日00時00分00秒)
    const just_after_sla_timestamp = new Date('2024-01-22T00:00:00.000Z');

    // 改善提案のスコアリング結果を準備
    const improvement_proposal_id = 'PROP-2024-001';
    const business_value_score = 85;
    const technical_difficulty_score = 45;
    const user_impact_score = 90;
    const total_priority_score = (business_value_score + (100 - technical_difficulty_score) + user_impact_score) / 3;

    // Act: SLA上限5営業日の直前時刻に通知ワークフローをトリガー
    const notification_log_before = recordNotificationWithTimestamp({
      proposal_id: improvement_proposal_id,
      priority_score: total_priority_score,
      notification_timestamp: just_before_sla_timestamp,
      sla_limit_timestamp: sla_limit_5_business_days,
      notification_type: 'PRIORITY_SCORING_COMPLETE',
      recipient: 'development_team'
    });

    // Act: SLA上限5営業日の直後時刻に通知ワークフローをトリガー
    const notification_log_after = recordNotificationWithTimestamp({
      proposal_id: improvement_proposal_id,
      priority_score: total_priority_score,
      notification_timestamp: just_after_sla_timestamp,
      sla_limit_timestamp: sla_limit_5_business_days,
      notification_type: 'PRIORITY_SCORING_COMPLETE',
      recipient: 'development_team'
    });

    // Act: 両ログエントリのSLA遵守状況を検証
    const sla_validation_before = validateSLANotificationTiming({
      notification_timestamp: just_before_sla_timestamp,
      sla_limit_timestamp: sla_limit_5_business_days
    });

    const sla_validation_after = validateSLANotificationTiming({
      notification_timestamp: just_after_sla_timestamp,
      sla_limit_timestamp: sla_limit_5_business_days
    });

    // Assert: 直前時刻のログが正確に記録されている
    expect(notification_log_before).toEqual({
      proposal_id: improvement_proposal_id,
      notification_timestamp: just_before_sla_timestamp.toISOString(),
      recorded_at: expect.any(String),
      timestamp_precision_ms: 999,
      sla_status: 'WITHIN_SLA',
      notification_type: 'PRIORITY_SCORING_COMPLETE',
      recipient: 'development_team'
    });
    expect(new Date(notification_log_before.notification_timestamp).getTime()).toBe(just_before_sla_timestamp.getTime());
    expect(notification_log_before.timestamp_precision_ms).toBe(999);
    expect(notification_log_before.sla_status).toBe('WITHIN_SLA');

    // Assert: 直後時刻のログが正確に記録されている
    expect(notification_log_after).toEqual({
      proposal_id: improvement_proposal_id,
      notification_timestamp: just_after_sla_timestamp.toISOString(),
      recorded_at: expect.any(String),
      timestamp_precision_ms: 0,
      sla_status: 'AT_SLA_BOUNDARY',
      notification_type: 'PRIORITY_SCORING_COMPLETE',
      recipient: 'development_team'
    });
    expect(new Date(notification_log_after.notification_timestamp).getTime()).toBe(just_after_sla_timestamp.getTime());
    expect(notification_log_after.timestamp_precision_ms).toBe(0);
    expect(notification_log_after.sla_status).toBe('AT_SLA_BOUNDARY');

    // Assert: ミリ秒単位での時刻精度が保証されている
    const time_diff_ms = new Date(notification_log_after.notification_timestamp).getTime() - new Date(notification_log_before.notification_timestamp).getTime();
    expect(time_diff_ms).toBe(1); // 1ミリ秒の差分

    // Assert: 通知ワークフローの実行順序が時系列で正しく記録されている
    expect(new Date(notification_log_before.notification_timestamp).getTime() < new Date(notification_log_after.notification_timestamp).getTime()).toBe(true);

    // Assert: SLA遵守判定の結果が正確である
    expect(sla_validation_before.is_within_sla).toBe(true);
    expect(sla_validation_before.hours_remaining).toBe(0.0002778); // 約1秒を時間単位で
    expect(sla_validation_after.is_within_sla).toBe(true);
    expect(sla_validation_after.hours_remaining).toBe(0);

    // Assert: タイムスタンプ精度テスト - ISO 8601形式で秒以下の精度を確認
    const before_iso = notification_log_before.notification_timestamp;
    const after_iso = notification_log_after.notification_timestamp;
    expect(before_iso).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    expect(after_iso).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
  });
});