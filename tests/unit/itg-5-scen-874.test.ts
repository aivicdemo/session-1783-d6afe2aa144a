import { aggregateWeeklyMeetingAttendance } from '../../src/logic/it-7-2-1';

describe('Weekly Algorithm Improvement Review Meeting Attendance Confirmation', () => {
  // SCEN-874: [normal] 週次アルゴリズム改善レビュー会議の出席確認判定 - 参加予定者の一部が不在の場合に代理者指定または会議延期判定が実行される
  test('should execute attendance confirmation and determine delegate assignment or meeting postponement when some participants are absent', () => {
    const meeting_id = 'meet_2024_w10_algo_review';
    const scheduled_date = new Date('2024-03-11T09:00:00Z');
    const min_required_attendees = 5;
    
    // テストデータ: 参加予定者リスト（5名以上）
    const planned_participants = [
      { participant_id: 'pm_001', name: 'PM_Alice', role: 'Product Manager', attendance_status: 'present', delegate_id: null },
      { participant_id: 'dev_001', name: 'Dev_Bob', role: 'Developer Lead', attendance_status: 'present', delegate_id: null },
      { participant_id: 'nut_001', name: 'Nutritionist_Carol', role: 'Nutritionist', attendance_status: 'absent', delegate_id: null },
      { participant_id: 'data_001', name: 'DataAnalyst_Dave', role: 'Data Analyst', attendance_status: 'absent', delegate_id: null },
      { participant_id: 'qa_001', name: 'QA_Eve', role: 'QA Engineer', attendance_status: 'present', delegate_id: null },
    ];
    
    // 出席予定者数の検証（5名以上）
    const present_count_before_delegate = planned_participants.filter(p => p.attendance_status === 'present').length;
    expect(present_count_before_delegate).toBe(3);
    
    // 不在者数の確認（2名以上3名以下）
    const absent_count = planned_participants.filter(p => p.attendance_status === 'absent').length;
    expect(absent_count).toBe(2);
    
    // 代理者指定オプションが提示されるテスト
    const absent_participants = planned_participants.filter(p => p.attendance_status === 'absent');
    const delegates_available = [
      { delegate_id: 'delegate_001', name: 'Substitute_Frank', availability: true },
      { delegate_id: 'delegate_002', name: 'Substitute_Grace', availability: true },
    ];
    
    // 代理者を割り当てるシナリオ
    const result_with_delegates = aggregateWeeklyMeetingAttendance({
      meeting_id,
      scheduled_date,
      participants: planned_participants.map(p => 
        p.attendance_status === 'absent' && delegates_available.length > 0
          ? { ...p, delegate_id: delegates_available[0].delegate_id }
          : p
      ),
      required_min_attendees: min_required_attendees,
    });
    
    expect(result_with_delegates.meeting_id).toBe(meeting_id);
    expect(result_with_delegates.total_planned_participants).toBe(5);
    expect(result_with_delegates.confirmed_attendees).toBe(5);
    expect(result_with_delegates.unconfirmed_absent_count).toBe(0);
    expect(result_with_delegates.meeting_status).toBe('proceed');
    expect(result_with_delegates.delegate_assignments).toEqual([
      {
        absent_participant_id: 'nut_001',
        assigned_delegate_id: 'delegate_001',
      },
    ]);
    
    // 代理者が指定されない場合のシナリオ
    const result_without_delegates = aggregateWeeklyMeetingAttendance({
      meeting_id,
      scheduled_date,
      participants: planned_participants,
      required_min_attendees: min_required_attendees,
    });
    
    expect(result_without_delegates.meeting_id).toBe(meeting_id);
    expect(result_without_delegates.total_planned_participants).toBe(5);
    expect(result_without_delegates.confirmed_attendees).toBe(3);
    expect(result_without_delegates.unconfirmed_absent_count).toBe(2);
    expect(result_without_delegates.meeting_status).toBe('postpone');
    expect(result_without_delegates.postponement_reason).toBe('insufficient_confirmed_attendees');
    
    // 会議延期判定の条件検証
    const threshold_absent_for_postpone = 2;
    expect(result_without_delegates.unconfirmed_absent_count >= threshold_absent_for_postpone).toBe(true);
    
    // 代理者がすべて利用不可の場合のシナリオ
    const delegates_unavailable = [
      { delegate_id: 'delegate_003', name: 'Substitute_Henry', availability: false },
    ];
    
    const result_all_delegates_unavailable = aggregateWeeklyMeetingAttendance({
      meeting_id,
      scheduled_date,
      participants: planned_participants.map(p =>
        p.attendance_status === 'absent'
          ? { ...p, delegate_id: 'delegate_003' }
          : p
      ),
      required_min_attendees: min_required_attendees,
      delegates: delegates_unavailable,
    });
    
    expect(result_all_delegates_unavailable.meeting_status).toBe('postpone');
    expect(result_all_delegates_unavailable.postponement_reason).toBe('delegate_unavailable');
  });
});