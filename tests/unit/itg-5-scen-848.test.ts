import { confirmMeetingAttendance } from '../../src/logic/it-7-2-1';

describe('IT-7-2-1: アルゴリズム改善レビュー会議参加者確認 - タイムアウトエラー処理', () => {
  // SCEN-848
  test('全参加者からの出席確認応答がタイムアウト期間内に得られない場合、確認タイムアウトエラーが発生して会議開始が遅延される', () => {
    const meeting_id = 'meeting_20250126_algo_review';
    const scheduled_start_time = new Date('2025-01-26T09:00:00Z');
    const confirmation_timeout_seconds = 180; // 3分
    const confirmation_deadline = new Date('2025-01-26T08:55:00Z');

    const participants = [
      {
        participant_id: 'user_001',
        participant_name: 'Alice',
        email: 'alice@example.com',
        confirmation_status: 'pending',
        confirmation_responded_at: null,
      },
      {
        participant_id: 'user_002',
        participant_name: 'Bob',
        email: 'bob@example.com',
        confirmation_status: 'pending',
        confirmation_responded_at: null,
      },
      {
        participant_id: 'user_003',
        participant_name: 'Charlie',
        email: 'charlie@example.com',
        confirmation_status: 'pending',
        confirmation_responded_at: null,
      },
    ];

    const confirmation_notification_sent_at = new Date('2025-01-26T08:55:00Z');
    const current_time_at_timeout = new Date(
      confirmation_notification_sent_at.getTime() + confirmation_timeout_seconds * 1000
    );

    const result = confirmMeetingAttendance({
      meeting_id,
      scheduled_start_time,
      confirmation_timeout_seconds,
      confirmation_deadline,
      participants,
      confirmation_notification_sent_at,
      current_time_at_timeout,
    });

    // タイムアウトエラーが発生していることを確認
    expect(result.error_occurred).toBe(true);
    expect(result.error_type).toBe('confirmation_timeout');

    // エラーメッセージに「確認」と「タイムアウト」が含まれることを確認
    expect(result.error_message).toMatch(/確認/);
    expect(result.error_message).toMatch(/タイムアウト/);

    // タイムアウト発生時刻が記録されていることを確認
    expect(result.timeout_occurred_at).toEqual(current_time_at_timeout);

    // 会議開始が遅延状態であることを確認
    expect(result.meeting_start_status).toBe('delayed');

    // 手動開始または再確認が必要な状態であることを確認
    expect(result.requires_manual_intervention).toBe(true);

    // 管理者への通知が生成されていることを確認
    expect(result.admin_notification_generated).toBe(true);
    expect(result.admin_notification_content).toMatch(/確認/);

    // タイムアウト時点での参加者確認状況を確認
    expect(result.participants_confirmation_count).toBe(0);
    expect(result.participants_pending_count).toBe(3);

    // エラーログが記録されていることを確認
    expect(result.error_log_recorded).toBe(true);
    expect(result.error_log_details).toBeDefined();
    expect(result.error_log_details.meeting_id).toBe(meeting_id);
    expect(result.error_log_details.error_type).toBe('confirmation_timeout');
  });
});