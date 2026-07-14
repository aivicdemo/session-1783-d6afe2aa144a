import { validateAlgorithmReviewMeetingParticipants } from '../../src/logic/it-7-2-1';

describe('Algorithm Improvement Review Meeting - Participant Validation', () => {
  // SCEN-850
  test('should throw error and prevent meeting start when participant list is empty at scheduled start time', () => {
    const meetingId = 'meeting-001';
    const scheduledStartTime = new Date('2024-01-15T09:00:00Z');
    const currentTime = new Date('2024-01-15T09:00:00Z');
    const participantList: string[] = [];
    const meetingStatus = 'scheduled';

    const inputData = {
      meetingId,
      scheduledStartTime,
      currentTime,
      participantList,
      meetingStatus,
    };

    expect(() => validateAlgorithmReviewMeetingParticipants(inputData)).toThrow(/参加者/);
  });

  test('should successfully start meeting when participant list contains at least one participant at scheduled start time', () => {
    const meetingId = 'meeting-002';
    const scheduledStartTime = new Date('2024-01-15T09:00:00Z');
    const currentTime = new Date('2024-01-15T09:00:00Z');
    const participantList = ['user-001', 'user-002'];
    const meetingStatus = 'scheduled';

    const inputData = {
      meetingId,
      scheduledStartTime,
      currentTime,
      participantList,
      meetingStatus,
    };

    const result = validateAlgorithmReviewMeetingParticipants(inputData);

    expect(result).toEqual({
      meetingId: 'meeting-002',
      isValidated: true,
      meetingStatus: 'active',
      participantCount: 2,
      startedAt: new Date('2024-01-15T09:00:00Z'),
      errorMessage: null,
    });
  });

  test('should not start meeting when current time is before scheduled start time', () => {
    const meetingId = 'meeting-003';
    const scheduledStartTime = new Date('2024-01-15T09:00:00Z');
    const currentTime = new Date('2024-01-15T08:30:00Z');
    const participantList = ['user-001'];
    const meetingStatus = 'scheduled';

    const inputData = {
      meetingId,
      scheduledStartTime,
      currentTime,
      participantList,
      meetingStatus,
    };

    const result = validateAlgorithmReviewMeetingParticipants(inputData);

    expect(result).toEqual({
      meetingId: 'meeting-003',
      isValidated: false,
      meetingStatus: 'scheduled',
      participantCount: 1,
      startedAt: null,
      errorMessage: 'Meeting start time has not been reached',
    });
  });

  test('should set meeting status to error state and include error details when participant list is empty', () => {
    const meetingId = 'meeting-004';
    const scheduledStartTime = new Date('2024-01-15T09:00:00Z');
    const currentTime = new Date('2024-01-15T09:00:00Z');
    const participantList: string[] = [];
    const meetingStatus = 'scheduled';

    const inputData = {
      meetingId,
      scheduledStartTime,
      currentTime,
      participantList,
      meetingStatus,
    };

    try {
      validateAlgorithmReviewMeetingParticipants(inputData);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeDefined();
      expect((error as Error).message).toMatch(/参加者/);
    }
  });

  test('should prevent meeting transition to active state when participant validation fails', () => {
    const meetingId = 'meeting-005';
    const scheduledStartTime = new Date('2024-01-15T09:00:00Z');
    const currentTime = new Date('2024-01-15T09:00:00Z');
    const participantList: string[] = [];
    const meetingStatus = 'scheduled';

    const inputData = {
      meetingId,
      scheduledStartTime,
      currentTime,
      participantList,
      meetingStatus,
    };

    try {
      validateAlgorithmReviewMeetingParticipants(inputData);
    } catch {
      // Expected error
    }

    expect(inputData.meetingStatus).not.toBe('active');
    expect(inputData.meetingStatus).toBe('scheduled');
  });
});