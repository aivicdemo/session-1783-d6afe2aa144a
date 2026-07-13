import { confirmMeetingAttendance } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証 - 定期会議開催予定者確認', () => {
  // SCEN-587
  test('不在者全員に代理者が指定されている場合に会議開催判定が確定される', () => {
    const meeting_id = 'mtg_20240115_001';
    const meeting_date = new Date('2024-01-15T09:00:00Z');
    const meeting_title = '週次アルゴリズム改善レビュー会議';

    const attendees = [
      {
        attendee_id: 'att_001',
        user_id: 'usr_001',
        name: '栄養士A',
        status: 'present',
        delegate_user_id: null,
        delegate_name: null,
      },
      {
        attendee_id: 'att_002',
        user_id: 'usr_002',
        name: 'PM B',
        status: 'absent',
        delegate_user_id: 'usr_004',
        delegate_name: '開発チームリーダーD',
      },
      {
        attendee_id: 'att_003',
        user_id: 'usr_003',
        name: '開発チームリーダーC',
        status: 'absent',
        delegate_user_id: 'usr_005',
        delegate_name: 'シニアエンジニアE',
      },
    ];

    const input = {
      meeting_id,
      meeting_date,
      meeting_title,
      attendees,
    };

    const result = confirmMeetingAttendance(input);

    expect(result).toEqual({
      meeting_id,
      meeting_date,
      meeting_title,
      total_attendees: 3,
      present_count: 1,
      absent_count: 2,
      delegates_assigned_count: 2,
      all_absent_have_delegates: true,
      meeting_status: 'confirmed',
      confirmed_at: expect.any(String),
      attendee_list: expect.arrayContaining([
        expect.objectContaining({
          attendee_id: 'att_001',
          name: '栄養士A',
          status: 'present',
        }),
        expect.objectContaining({
          attendee_id: 'att_002',
          name: 'PM B',
          status: 'absent',
          delegate_name: '開発チームリーダーD',
        }),
        expect.objectContaining({
          attendee_id: 'att_003',
          name: '開発チームリーダーC',
          status: 'absent',
          delegate_name: 'シニアエンジニアE',
        }),
      ]),
    });

    expect(result.all_absent_have_delegates).toBe(true);
    expect(result.meeting_status).toBe('confirmed');
    expect(result.delegates_assigned_count).toBe(2);
    expect(result.confirmed_at).toBeTruthy();

    const confirmed_timestamp = new Date(result.confirmed_at);
    expect(confirmed_timestamp.getTime()).toBeGreaterThan(0);
  });
});