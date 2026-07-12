import { validateMeetingAttendance } from '../../src/logic/it-1-1-1';

describe('アルゴリズム改善レビュー会議参加者確認', () => {
  // SCEN-588
  test('必須メンバーが欠席で代理参加者がいない場合、会議開始前に通知される', () => {
    const meetingScheduledTime = new Date('2024-01-22T09:00:00Z');
    const notificationCheckTime = new Date('2024-01-22T08:45:00Z');

    const attendeeList = [
      {
        memberId: 'M001',
        memberName: '田中太郎',
        role: 'productManager',
        isMandatory: true,
        attendanceStatus: 'absent',
        alternativeMemberId: null,
        alternativeMemberName: null,
      },
      {
        memberId: 'M002',
        memberName: '佐藤花子',
        role: 'developmentLead',
        isMandatory: true,
        attendanceStatus: 'attending',
        alternativeMemberId: null,
        alternativeMemberName: null,
      },
      {
        memberId: 'M003',
        memberName: '鈴木次郎',
        role: 'nutritionist',
        isMandatory: false,
        attendanceStatus: 'absent',
        alternativeMemberId: null,
        alternativeMemberName: null,
      },
    ];

    const result = validateMeetingAttendance({
      meetingId: 'REVIEW-2024-01-22-001',
      scheduledTime: meetingScheduledTime,
      checkTime: notificationCheckTime,
      attendees: attendeeList,
    });

    expect(result.hasWarning).toBe(true);
    expect(result.warningCount).toBe(1);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'mandatoryAbsentNoAlternative',
          memberId: 'M001',
          memberName: '田中太郎',
          severity: 'critical',
          message: expect.stringMatching(/田中太郎.*欠席.*代理/),
        }),
      ])
    );
    expect(result.shouldNotifyBefore).toBe(true);
    expect(result.notificationDeliveryTime).toBeLessThanOrEqual(
      notificationCheckTime.getTime()
    );
    expect(result.meetingCanProceeded).toBe(false);
  });
});