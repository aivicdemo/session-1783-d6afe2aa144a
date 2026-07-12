import { validateMeetingParticipantAttendance } from '../../src/logic/it-1-1-1';

describe('会議参加者出席確認・代理者指定機能', () => {
  // SCEN-599
  test('複数の参加予定者が不在の場合、代理者指定または会議延期判定が正確に実行される', () => {
    const now = new Date('2024-01-15T09:00:00Z');
    const meetingTimeWithin24h = new Date('2024-01-15T18:00:00Z');
    const meetingTimeOver24h = new Date('2024-01-17T10:00:00Z');

    // ケース1: 24時間以内の会議 + 複数不在者 + 全員に代理者指定
    const participantsWithin24hAllAssigned = [
      {
        participantId: 'P001',
        name: '参加予定者A',
        attendanceStatus: 'absent',
        delegateId: 'P004',
        delegateName: '代理者A',
      },
      {
        participantId: 'P002',
        name: '参加予定者B',
        attendanceStatus: 'absent',
        delegateId: 'P005',
        delegateName: '代理者B',
      },
      {
        participantId: 'P003',
        name: '参加予定者C',
        attendanceStatus: 'absent',
        delegateId: 'P006',
        delegateName: '代理者C',
      },
      {
        participantId: 'P007',
        name: '参加予定者D',
        attendanceStatus: 'present',
        delegateId: null,
        delegateName: null,
      },
    ];

    const resultWithin24hAllAssigned = validateMeetingParticipantAttendance({
      meetingId: 'MEET001',
      scheduledTime: meetingTimeWithin24h,
      currentTime: now,
      participants: participantsWithin24hAllAssigned,
    });

    expect(resultWithin24hAllAssigned.requiresPostponementJudgment).toBe(true);
    expect(resultWithin24hAllAssigned.absentParticipantCount).toBe(3);
    expect(resultWithin24hAllAssigned.assignedDelegateCount).toBe(3);
    expect(resultWithin24hAllAssigned.postponementJudgmentPossible).toBe(true);
    expect(resultWithin24hAllAssigned.statusUpdates).toEqual([
      {
        participantId: 'P001',
        newStatus: 'absent_with_delegate',
        delegateId: 'P004',
      },
      {
        participantId: 'P002',
        newStatus: 'absent_with_delegate',
        delegateId: 'P005',
      },
      {
        participantId: 'P003',
        newStatus: 'absent_with_delegate',
        delegateId: 'P006',
      },
    ]);

    // ケース2: 24時間以内の会議 + 複数不在者 + 一部代理者未指定
    const participantsWithin24hPartialAssigned = [
      {
        participantId: 'P001',
        name: '参加予定者A',
        attendanceStatus: 'absent',
        delegateId: 'P004',
        delegateName: '代理者A',
      },
      {
        participantId: 'P002',
        name: '参加予定者B',
        attendanceStatus: 'absent',
        delegateId: null,
        delegateName: null,
      },
      {
        participantId: 'P003',
        name: '参加予定者C',
        attendanceStatus: 'absent',
        delegateId: 'P006',
        delegateName: '代理者C',
      },
      {
        participantId: 'P007',
        name: '参加予定者D',
        attendanceStatus: 'present',
        delegateId: null,
        delegateName: null,
      },
    ];

    const resultWithin24hPartialAssigned =
      validateMeetingParticipantAttendance({
        meetingId: 'MEET002',
        scheduledTime: meetingTimeWithin24h,
        currentTime: now,
        participants: participantsWithin24hPartialAssigned,
      });

    expect(resultWithin24hPartialAssigned.requiresPostponementJudgment).toBe(
      true
    );
    expect(resultWithin24hPartialAssigned.absentParticipantCount).toBe(3);
    expect(resultWithin24hPartialAssigned.assignedDelegateCount).toBe(2);
    expect(resultWithin24hPartialAssigned.postponementJudgmentPossible).toBe(
      false
    );
    expect(resultWithin24hPartialAssigned.errorMessage).toMatch(
      /代理者未指定/
    );
    expect(resultWithin24hPartialAssigned.unassignedAbsentParticipants).toEqual(
      ['P002']
    );

    // ケース3: 24時間を超える会議 + 複数不在者 + 全員に代理者指定
    const participantsOver24hAllAssigned = [
      {
        participantId: 'P001',
        name: '参加予定者A',
        attendanceStatus: 'absent',
        delegateId: 'P004',
        delegateName: '代理者A',
      },
      {
        participantId: 'P002',
        name: '参加予定者B',
        attendanceStatus: 'absent',
        delegateId: 'P005',
        delegateName: '代理者B',
      },
      {
        participantId: 'P003',
        name: '参加予定者C',
        attendanceStatus: 'absent',
        delegateId: 'P006',
        delegateName: '代理者C',
      },
      {
        participantId: 'P007',
        name: '参加予定者D',
        attendanceStatus: 'present',
        delegateId: null,
        delegateName: null,
      },
    ];

    const resultOver24hAllAssigned = validateMeetingParticipantAttendance({
      meetingId: 'MEET003',
      scheduledTime: meetingTimeOver24h,
      currentTime: now,
      participants: participantsOver24hAllAssigned,
    });

    expect(resultOver24hAllAssigned.requiresPostponementJudgment).toBe(false);
    expect(resultOver24hAllAssigned.onlyDelegateAssignmentApplied).toBe(true);
    expect(resultOver24hAllAssigned.absentParticipantCount).toBe(3);
    expect(resultOver24hAllAssigned.assignedDelegateCount).toBe(3);
    expect(resultOver24hAllAssigned.statusUpdates).toEqual([
      {
        participantId: 'P001',
        newStatus: 'absent_with_delegate',
        delegateId: 'P004',
      },
      {
        participantId: 'P002',
        newStatus: 'absent_with_delegate',
        delegateId: 'P005',
      },
      {
        participantId: 'P003',
        newStatus: 'absent_with_delegate',
        delegateId: 'P006',
      },
    ]);

    // ケース4: 24時間を超える会議 + 複数不在者 + 一部代理者未指定 → エラー
    const participantsOver24hPartialAssigned = [
      {
        participantId: 'P001',
        name: '参加予定者A',
        attendanceStatus: 'absent',
        delegateId: 'P004',
        delegateName: '代理者A',
      },
      {
        participantId: 'P002',
        name: '参加予定者B',
        attendanceStatus: 'absent',
        delegateId: null,
        delegateName: null,
      },
      {
        participantId: 'P003',
        name: '参加予定者C',
        attendanceStatus: 'absent',
        delegateId: null,
        delegateName: null,
      },
      {
        participantId: 'P007',
        name: '参加予定者D',
        attendanceStatus: 'present',
        delegateId: null,
        delegateName: null,
      },
    ];

    const resultOver24hPartialAssigned = validateMeetingParticipantAttendance({
      meetingId: 'MEET004',
      scheduledTime: meetingTimeOver24h,
      currentTime: now,
      participants: participantsOver24hPartialAssigned,
    });

    expect(resultOver24hPartialAssigned.success).toBe(false);
    expect(resultOver24hPartialAssigned.errorMessage).toMatch(/代理者未指定/);
    expect(resultOver24hPartialAssigned.unassignedAbsentParticipants).toEqual([
      'P002',
      'P003',
    ]);
    expect(resultOver24hPartialAssigned.statusUpdates).toEqual([]);

    // ケース5: 24時間以内の会議 + 全員出席 → 延期判定不要
    const participantsAllPresent = [
      {
        participantId: 'P001',
        name: '参加予定者A',
        attendanceStatus: 'present',
        delegateId: null,
        delegateName: null,
      },
      {
        participantId: 'P002',
        name: '参加予定者B',
        attendanceStatus: 'present',
        delegateId: null,
        delegateName: null,
      },
      {
        participantId: 'P003',
        name: '参加予定者C',
        attendanceStatus: 'present',
        delegateId: null,
        delegateName: null,
      },
    ];

    const resultAllPresent = validateMeetingParticipantAttendance({
      meetingId: 'MEET005',
      scheduledTime: meetingTimeWithin24h,
      currentTime: now,
      participants: participantsAllPresent,
    });

    expect(resultAllPresent.requiresPostponementJudgment).toBe(false);
    expect(resultAllPresent.absentParticipantCount).toBe(0);
    expect(resultAllPresent.assignedDelegateCount).toBe(0);
    expect(resultAllPresent.statusUpdates).toEqual([]);
    expect(resultAllPresent.success).toBe(true);

    // ケース6: 3人不在 + 1人代理者指定 + 1人は代理者が自動代理となるケース（24時間以内）
    const participantsWithAutoDelegate = [
      {
        participantId: 'P001',
        name: '参加予定者A',
        attendanceStatus: 'absent',
        delegateId: 'P004',
        delegateName: '代理者A',
      },
      {
        participantId: 'P002',
        name: '参加予定者B',
        attendanceStatus: 'absent',
        delegateId: null,
        delegateName: null,
      },
      {
        participantId: 'P003',
        name: '参加予定者C',
        attendanceStatus: 'absent',
        delegateId: null,
        delegateName: null,
      },
      {
        participantId: 'P007',
        name: '参加予定者D',
        attendanceStatus: 'present',
        delegateId: null,
        delegateName: null,
      },
    ];

    expect(() => {
      validateMeetingParticipantAttendance({
        meetingId: 'MEET006',
        scheduledTime: meetingTimeWithin24h,
        currentTime: now,
        participants: participantsWithAutoDelegate,
      });
    }).toThrow(/代理者/);
  });
});