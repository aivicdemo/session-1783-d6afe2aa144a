import { it, describe, expect, beforeEach, afterEach } from '@jest/globals';
import { confirmWeeklyReviewAttendance } from '../../src/logic/it-7-2-1';

describe('Weekly Algorithm Improvement Review Meeting Attendance Confirmation', () => {
  let mockCurrentDate: Date;
  let mockSystemLog: Array<{ eventType: string; timestamp: Date; details: string }>;

  beforeEach(() => {
    mockSystemLog = [];
    // Set mock current date to Monday 09:00 JST for consistent testing
    mockCurrentDate = new Date('2024-01-08T09:00:00Z'); // Monday 09:00 UTC
  });

  afterEach(() => {
    mockSystemLog = [];
  });

  // SCEN-873
  it('should confirm attendance completion when all registered participants have attendance flag ON at weekly Monday 09:00', () => {
    const meeting_schedule_id = 'meeting_001';
    const scheduled_time = new Date('2024-01-08T09:00:00Z'); // Monday 09:00
    const is_recurring_weekly_monday = true;

    const participants = [
      {
        participant_id: 'user_001',
        participant_name: 'Alice',
        is_planned_to_attend: true,
      },
      {
        participant_id: 'user_002',
        participant_name: 'Bob',
        is_planned_to_attend: true,
      },
      {
        participant_id: 'user_003',
        participant_name: 'Charlie',
        is_planned_to_attend: true,
      },
    ];

    const input = {
      meeting_schedule_id,
      scheduled_time,
      is_recurring_weekly_monday,
      participants,
      current_time: new Date('2024-01-08T09:00:00Z'),
    };

    const result = confirmWeeklyReviewAttendance(input);

    // Expected: All participants have attendance flag ON, so attendance confirmation should be complete
    expect(result.attendance_confirmation_status).toBe('completed');
    expect(result.confirmed_participant_count).toBe(3);
    expect(result.total_participant_count).toBe(3);
    expect(result.confirmation_percentage).toBe(100);
    expect(result.meeting_schedule_id).toBe('meeting_001');
    expect(result.confirmation_timestamp).toEqual(new Date('2024-01-08T09:00:00Z'));
    expect(result.system_event_recorded).toBe(true);
    expect(result.event_log_entry_type).toBe('attendance_confirmation_completed');
  });

  // Additional test: Partial attendance scenario
  it('should mark attendance as incomplete when not all participants have attendance flag ON', () => {
    const meeting_schedule_id = 'meeting_002';
    const scheduled_time = new Date('2024-01-15T09:00:00Z'); // Monday 09:00

    const participants = [
      {
        participant_id: 'user_001',
        participant_name: 'Alice',
        is_planned_to_attend: true,
      },
      {
        participant_id: 'user_002',
        participant_name: 'Bob',
        is_planned_to_attend: false,
      },
      {
        participant_id: 'user_003',
        participant_name: 'Charlie',
        is_planned_to_attend: true,
      },
    ];

    const input = {
      meeting_schedule_id,
      scheduled_time,
      is_recurring_weekly_monday: true,
      participants,
      current_time: new Date('2024-01-15T09:00:00Z'),
    };

    const result = confirmWeeklyReviewAttendance(input);

    expect(result.attendance_confirmation_status).toBe('pending');
    expect(result.confirmed_participant_count).toBe(2);
    expect(result.total_participant_count).toBe(3);
    expect(result.confirmation_percentage).toBe(67);
    expect(result.system_event_recorded).toBe(false);
  });

  // Additional test: Delegate participant assignment scenario
  it('should handle delegate assignment when primary participant is absent', () => {
    const meeting_schedule_id = 'meeting_003';
    const scheduled_time = new Date('2024-01-22T09:00:00Z');

    const participants = [
      {
        participant_id: 'user_001',
        participant_name: 'Alice',
        is_planned_to_attend: false,
        delegate_participant_id: 'user_004',
        delegate_name: 'David',
      },
      {
        participant_id: 'user_002',
        participant_name: 'Bob',
        is_planned_to_attend: true,
      },
      {
        participant_id: 'user_003',
        participant_name: 'Charlie',
        is_planned_to_attend: true,
      },
      {
        participant_id: 'user_004',
        participant_name: 'David',
        is_planned_to_attend: true,
        is_delegate: true,
      },
    ];

    const input = {
      meeting_schedule_id,
      scheduled_time,
      is_recurring_weekly_monday: true,
      participants,
      current_time: new Date('2024-01-22T09:00:00Z'),
    };

    const result = confirmWeeklyReviewAttendance(input);

    // With valid delegates, confirmation should still be complete
    expect(result.attendance_confirmation_status).toBe('completed');
    expect(result.confirmed_participant_count).toBe(4);
    expect(result.total_participant_count).toBe(4);
    expect(result.confirmation_percentage).toBe(100);
    expect(result.has_delegates).toBe(true);
    expect(result.system_event_recorded).toBe(true);
  });

  // Additional test: Timing validation - not Monday 09:00
  it('should not confirm attendance when called outside scheduled time window', () => {
    const meeting_schedule_id = 'meeting_004';
    const scheduled_time = new Date('2024-01-08T09:00:00Z');

    const participants = [
      {
        participant_id: 'user_001',
        participant_name: 'Alice',
        is_planned_to_attend: true,
      },
      {
        participant_id: 'user_002',
        participant_name: 'Bob',
        is_planned_to_attend: true,
      },
    ];

    const input = {
      meeting_schedule_id,
      scheduled_time,
      is_recurring_weekly_monday: true,
      participants,
      current_time: new Date('2024-01-08T10:30:00Z'), // Called at 10:30, not 09:00
    };

    const result = confirmWeeklyReviewAttendance(input);

    expect(result.attendance_confirmation_status).toBe('outside_window');
    expect(result.system_event_recorded).toBe(false);
    expect(result.timing_valid).toBe(false);
  });

  // Additional test: Empty or null participants
  it('should throw error when participants list is empty', () => {
    const input = {
      meeting_schedule_id: 'meeting_005',
      scheduled_time: new Date('2024-01-08T09:00:00Z'),
      is_recurring_weekly_monday: true,
      participants: [],
      current_time: new Date('2024-01-08T09:00:00Z'),
    };

    expect(() => confirmWeeklyReviewAttendance(input)).toThrow(/参加予定者/);
  });

  // Additional test: System event logging
  it('should record system event with correct timestamp and event type when attendance confirmed', () => {
    const meeting_schedule_id = 'meeting_006';
    const scheduled_time = new Date('2024-01-29T09:00:00Z');

    const participants = [
      {
        participant_id: 'user_001',
        participant_name: 'Alice',
        is_planned_to_attend: true,
      },
      {
        participant_id: 'user_002',
        participant_name: 'Bob',
        is_planned_to_attend: true,
      },
    ];

    const input = {
      meeting_schedule_id,
      scheduled_time,
      is_recurring_weekly_monday: true,
      participants,
      current_time: new Date('2024-01-29T09:00:00Z'),
    };

    const result = confirmWeeklyReviewAttendance(input);

    expect(result.attendance_confirmation_status).toBe('completed');
    expect(result.system_event_recorded).toBe(true);
    expect(result.event_log_entry_type).toBe('attendance_confirmation_completed');
    expect(result.event_timestamp).toEqual(new Date('2024-01-29T09:00:00Z'));
    expect(result.event_details_meeting_id).toBe('meeting_006');
    expect(result.event_details_confirmed_count).toBe(2);
  });
});