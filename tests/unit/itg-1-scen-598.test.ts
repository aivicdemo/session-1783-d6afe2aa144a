import { confirmMeetingAttendance } from '../../src/logic/it-1-1-1';

describe('献立生成アルゴリズム改善レビュー会議の参加者出席確認', () => {
  // SCEN-598: [normal] 会議参加者出席確認・代理者指定機能 - 参加予定者が全員出席確認された場合、会議開催状態が確定される
  test('全ての参加予定者の出席確認が完了した時点で、会議開催状態が確定される', () => {
    const meetingId = 'meeting-001';
    const meetingCreationTimestamp = new Date('2024-11-18T09:00:00Z');
    
    const attendeeList = [
      {
        attendeeId: 'user-pm-001',
        attendeeName: 'プロダクトマネージャーA',
        role: 'PM',
        status: 'pending',
        confirmedAt: null,
        isProxy: false,
        proxyUserId: null,
      },
      {
        attendeeId: 'user-dev-001',
        attendeeName: '開発チームリーダーB',
        role: 'dev_lead',
        status: 'pending',
        confirmedAt: null,
        isProxy: false,
        proxyUserId: null,
      },
      {
        attendeeId: 'user-nutritionist-001',
        attendeeName: '栄養士C',
        role: 'nutritionist',
        status: 'pending',
        confirmedAt: null,
        isProxy: false,
        proxyUserId: null,
      },
    ];

    const meetingData = {
      meetingId,
      meetingTitle: '週次アルゴリズム改善レビュー会議',
      scheduledStartTime: new Date('2024-11-18T09:00:00Z'),
      scheduledEndTime: new Date('2024-11-18T10:00:00Z'),
      createdAt: meetingCreationTimestamp,
      createdBy: 'user-pm-001',
      meetingStatus: 'pending_confirmation',
      attendees: attendeeList,
    };

    // 参加者1が出席確認
    const confirmFirstAttendee = {
      meetingId,
      attendeeId: 'user-pm-001',
      confirmationAction: 'confirm_attendance',
      confirmedAt: new Date('2024-11-18T08:30:00Z'),
    };

    const stateAfterFirstConfirm = confirmMeetingAttendance(
      meetingData,
      confirmFirstAttendee
    );

    expect(stateAfterFirstConfirm.attendees[0].status).toBe('confirmed');
    expect(stateAfterFirstConfirm.attendees[0].confirmedAt).toEqual(
      new Date('2024-11-18T08:30:00Z')
    );
    expect(stateAfterFirstConfirm.meetingStatus).toBe('pending_confirmation');

    // 参加者2が出席確認
    const confirmSecondAttendee = {
      meetingId,
      attendeeId: 'user-dev-001',
      confirmationAction: 'confirm_attendance',
      confirmedAt: new Date('2024-11-18T08:45:00Z'),
    };

    const stateAfterSecondConfirm = confirmMeetingAttendance(
      stateAfterFirstConfirm,
      confirmSecondAttendee
    );

    expect(stateAfterSecondConfirm.attendees[1].status).toBe('confirmed');
    expect(stateAfterSecondConfirm.attendees[1].confirmedAt).toEqual(
      new Date('2024-11-18T08:45:00Z')
    );
    expect(stateAfterSecondConfirm.meetingStatus).toBe('pending_confirmation');

    // 参加者3（最後の参加者）が出席確認
    const confirmLastAttendee = {
      meetingId,
      attendeeId: 'user-nutritionist-001',
      confirmationAction: 'confirm_attendance',
      confirmedAt: new Date('2024-11-18T08:55:00Z'),
    };

    const stateAfterLastConfirm = confirmMeetingAttendance(
      stateAfterSecondConfirm,
      confirmLastAttendee
    );

    // 期待結果: 全参加者の出席確認が完了し、会議状態が『confirmed』に変更される
    expect(stateAfterLastConfirm.attendees[2].status).toBe('confirmed');
    expect(stateAfterLastConfirm.attendees[2].confirmedAt).toEqual(
      new Date('2024-11-18T08:55:00Z')
    );
    expect(stateAfterLastConfirm.meetingStatus).toBe('confirmed');
    expect(stateAfterLastConfirm.meetingConfirmedAt).toEqual(
      new Date('2024-11-18T08:55:00Z')
    );

    // 全参加者のステータスを確認
    const allConfirmed = stateAfterLastConfirm.attendees.every(
      (attendee) => attendee.status === 'confirmed'
    );
    expect(allConfirmed).toBe(true);

    // 確定状態フラグを確認
    expect(stateAfterLastConfirm.isConfirmed).toBe(true);
  });
});