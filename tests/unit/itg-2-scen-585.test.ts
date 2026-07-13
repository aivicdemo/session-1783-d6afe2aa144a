import { confirmMeetingAttendance } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能', () => {
  // SCEN-585
  test('定期会議開催予定者確認・代理指定 - 週次月曜09:00の会議参加予定者の出席確認が完了する', () => {
    const meeting_id = 'MTG-2024-W01-MON-0900';
    const meeting_date = new Date('2024-01-08T09:00:00Z');
    const meeting_type = 'weekly_monday';
    const scheduled_attendees = [
      {
        attendee_id: 'USR-001',
        attendee_name: '栄養士A',
        role: 'nutritionist',
        attendance_status: 'pending',
        confirmation_timestamp: null,
      },
      {
        attendee_id: 'USR-002',
        attendee_name: 'PM-B',
        role: 'product_manager',
        attendance_status: 'pending',
        confirmation_timestamp: null,
      },
      {
        attendee_id: 'USR-003',
        attendee_name: '開発チームリーダーC',
        role: 'tech_lead',
        attendance_status: 'pending',
        confirmation_timestamp: null,
      },
    ];

    const confirmation_timestamp = new Date('2024-01-08T08:55:00Z');
    const confirmed_attendees = [
      {
        attendee_id: 'USR-001',
        attendance_status: 'confirmed',
        confirmation_timestamp: confirmation_timestamp,
      },
      {
        attendee_id: 'USR-002',
        attendance_status: 'confirmed',
        confirmation_timestamp: confirmation_timestamp,
      },
      {
        attendee_id: 'USR-003',
        attendance_status: 'confirmed',
        confirmation_timestamp: confirmation_timestamp,
      },
    ];

    const result = confirmMeetingAttendance({
      meeting_id,
      meeting_date,
      meeting_type,
      scheduled_attendees,
      confirmed_attendees,
      confirmation_timestamp,
    });

    expect(result).toEqual({
      meeting_id: 'MTG-2024-W01-MON-0900',
      meeting_date: new Date('2024-01-08T09:00:00Z'),
      meeting_type: 'weekly_monday',
      total_scheduled_count: 3,
      confirmed_count: 3,
      absent_count: 0,
      pending_count: 0,
      confirmation_status: 'all_confirmed',
      confirmation_completed_at: confirmation_timestamp,
      attendee_confirmations: [
        {
          attendee_id: 'USR-001',
          attendee_name: '栄養士A',
          role: 'nutritionist',
          attendance_status: 'confirmed',
          confirmation_timestamp: confirmation_timestamp,
        },
        {
          attendee_id: 'USR-002',
          attendee_name: 'PM-B',
          role: 'product_manager',
          attendance_status: 'confirmed',
          confirmation_timestamp: confirmation_timestamp,
        },
        {
          attendee_id: 'USR-003',
          attendee_name: '開発チームリーダーC',
          role: 'tech_lead',
          attendance_status: 'confirmed',
          confirmation_timestamp: confirmation_timestamp,
        },
      ],
      message: '全参加予定者の出席確認が完了しました',
      database_save_status: 'success',
    });

    expect(result.confirmation_status).toBe('all_confirmed');
    expect(result.confirmed_count).toBe(3);
    expect(result.absent_count).toBe(0);
    expect(result.pending_count).toBe(0);
    expect(result.database_save_status).toBe('success');
    expect(result.message).toBe('全参加予定者の出席確認が完了しました');
  });
});