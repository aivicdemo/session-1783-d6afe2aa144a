import { determineAlgorithmReviewMeeting } from '../../src/logic/it-1-br-8-2-1-1';

describe('Weekly/Monthly Algorithm Improvement Review Meeting Scheduling', () => {
  // SCEN-251: [normal] 週次・月次アルゴリズム改善レビュー会議開催判定 - 毎週月曜09:00または毎月第1営業日に開催予定時刻に到達し、参加予定者の出席確認が正常に完了する
  test('should determine algorithm review meeting as scheduled and confirm all attendees for both weekly and monthly cycles', () => {
    // Setup: Mock current datetime for weekly Monday 09:00
    const weeklyMondayDate = new Date('2024-01-15T09:00:00Z'); // Monday
    const weeklyMondayTimestamp = weeklyMondayDate.getTime();

    // Execute: Weekly meeting determination at Monday 09:00
    const weeklyMeetingResult = determineAlgorithmReviewMeeting({
      currentTimestamp: weeklyMondayTimestamp,
      meetingType: 'weekly',
      scheduledTime: '09:00',
      targetDayOfWeek: 1, // Monday
      participantIds: ['user_001', 'user_002', 'user_003'],
    });

    // Verify: Weekly meeting should be scheduled
    expect(weeklyMeetingResult.meetingStatus).toBe('scheduled');
    expect(weeklyMeetingResult.meetingType).toBe('weekly');
    expect(weeklyMeetingResult.scheduledDateTime).toBe('2024-01-15T09:00:00Z');
    expect(weeklyMeetingResult.participantCount).toBe(3);

    // Verify: Attendance notification sent to all participants
    expect(weeklyMeetingResult.attendanceNotificationsSent).toBe(true);
    expect(weeklyMeetingResult.notificationCount).toBe(3);

    // Simulate: Attendees confirm participation
    const attendanceConfirmations = [
      { participantId: 'user_001', status: 'confirmed', confirmedAt: '2024-01-15T08:45:00Z' },
      { participantId: 'user_002', status: 'confirmed', confirmedAt: '2024-01-15T08:50:00Z' },
      { participantId: 'user_003', status: 'confirmed', confirmedAt: '2024-01-15T08:55:00Z' },
    ];

    const weeklyAttendanceResult = determineAlgorithmReviewMeeting({
      currentTimestamp: weeklyMondayTimestamp,
      meetingType: 'weekly',
      scheduledTime: '09:00',
      targetDayOfWeek: 1,
      participantIds: ['user_001', 'user_002', 'user_003'],
      attendanceConfirmations: attendanceConfirmations,
    });

    // Verify: All attendees confirmed for weekly meeting
    expect(weeklyAttendanceResult.attendanceConfirmationStatus).toBe('confirmed_all');
    expect(weeklyAttendanceResult.confirmedParticipantCount).toBe(3);
    expect(weeklyAttendanceResult.confirmationCompletionRate).toBe(100);

    // Setup: Mock current datetime for monthly first business day 09:00
    const monthlyFirstBusinessDayDate = new Date('2024-02-01T09:00:00Z'); // First business day of February
    const monthlyFirstBusinessDayTimestamp = monthlyFirstBusinessDayDate.getTime();

    // Execute: Monthly meeting determination at first business day 09:00
    const monthlyMeetingResult = determineAlgorithmReviewMeeting({
      currentTimestamp: monthlyFirstBusinessDayTimestamp,
      meetingType: 'monthly',
      scheduledTime: '09:00',
      targetBusinessDay: 1,
      participantIds: ['user_001', 'user_002', 'user_003', 'user_004'],
    });

    // Verify: Monthly meeting should be scheduled
    expect(monthlyMeetingResult.meetingStatus).toBe('scheduled');
    expect(monthlyMeetingResult.meetingType).toBe('monthly');
    expect(monthlyMeetingResult.scheduledDateTime).toBe('2024-02-01T09:00:00Z');
    expect(monthlyMeetingResult.participantCount).toBe(4);

    // Verify: Attendance notification sent to all participants
    expect(monthlyMeetingResult.attendanceNotificationsSent).toBe(true);
    expect(monthlyMeetingResult.notificationCount).toBe(4);

    // Simulate: Attendees confirm participation for monthly meeting
    const monthlyAttendanceConfirmations = [
      { participantId: 'user_001', status: 'confirmed', confirmedAt: '2024-02-01T08:45:00Z' },
      { participantId: 'user_002', status: 'confirmed', confirmedAt: '2024-02-01T08:50:00Z' },
      { participantId: 'user_003', status: 'confirmed', confirmedAt: '2024-02-01T08:55:00Z' },
      { participantId: 'user_004', status: 'confirmed', confirmedAt: '2024-02-01T08:58:00Z' },
    ];

    const monthlyAttendanceResult = determineAlgorithmReviewMeeting({
      currentTimestamp: monthlyFirstBusinessDayTimestamp,
      meetingType: 'monthly',
      scheduledTime: '09:00',
      targetBusinessDay: 1,
      participantIds: ['user_001', 'user_002', 'user_003', 'user_004'],
      attendanceConfirmations: monthlyAttendanceConfirmations,
    });

    // Verify: All attendees confirmed for monthly meeting
    expect(monthlyAttendanceResult.attendanceConfirmationStatus).toBe('confirmed_all');
    expect(monthlyAttendanceResult.confirmedParticipantCount).toBe(4);
    expect(monthlyAttendanceResult.confirmationCompletionRate).toBe(100);

    // Verify: Both weekly and monthly meetings completed without errors
    expect(weeklyAttendanceResult.processStatus).toBe('completed');
    expect(monthlyAttendanceResult.processStatus).toBe('completed');
  });
});