import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { checkQuarterlyMeetingPreparationStatus } from '../../src/logic/it-1-1-1';

describe('四半期協議会事前準備 - 協議会開催日の0時00分に準備完了フラグが立つ', () => {
  let originalDate: typeof Date;

  beforeEach(() => {
    originalDate = global.Date;
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.Date = originalDate;
  });

  // SCEN-580
  test('協議会開催日の0時00分に準備完了フラグが自動的に立ち、関連準備項目が完了状態に遷移すること', () => {
    const meetingScheduleDate = new Date('2024-01-15T00:00:00Z');
    const beforeMeetingTime = new Date('2024-01-14T23:59:00Z');
    const meetingStartTime = new Date('2024-01-15T00:00:00Z');

    // 開催日の0時00分より前の状態を確認
    global.Date = class extends Date {
      constructor() {
        super();
        return beforeMeetingTime;
      }
      static now() {
        return beforeMeetingTime.getTime();
      }
    } as any;

    const beforePreparation = checkQuarterlyMeetingPreparationStatus({
      meetingScheduledDate: meetingScheduleDate,
      currentTime: beforeMeetingTime,
      preparationItems: [
        {
          itemId: 'participants_confirmation',
          itemName: '参加者リスト確認',
          status: 'pending',
          completedAt: null,
        },
        {
          itemId: 'agenda_template',
          itemName: '議題テンプレート',
          status: 'pending',
          completedAt: null,
        },
        {
          itemId: 'deliverables_definition',
          itemName: '期待成果物定義',
          status: 'pending',
          completedAt: null,
        },
      ],
    });

    expect(beforePreparation.isPreparationCompleted).toBe(false);
    expect(beforePreparation.preparationStatus).toBe('in_progress');
    expect(beforePreparation.allItemsReady).toBe(false);

    // 開催日の0時00分ちょうどの状態を確認
    global.Date = class extends Date {
      constructor() {
        super();
        return meetingStartTime;
      }
      static now() {
        return meetingStartTime.getTime();
      }
    } as any;

    const atMeetingTime = checkQuarterlyMeetingPreparationStatus({
      meetingScheduledDate: meetingScheduleDate,
      currentTime: meetingStartTime,
      preparationItems: [
        {
          itemId: 'participants_confirmation',
          itemName: '参加者リスト確認',
          status: 'completed',
          completedAt: new Date('2024-01-15T00:00:00Z'),
        },
        {
          itemId: 'agenda_template',
          itemName: '議題テンプレート',
          status: 'completed',
          completedAt: new Date('2024-01-15T00:00:00Z'),
        },
        {
          itemId: 'deliverables_definition',
          itemName: '期待成果物定義',
          status: 'completed',
          completedAt: new Date('2024-01-15T00:00:00Z'),
        },
      ],
    });

    expect(atMeetingTime.isPreparationCompleted).toBe(true);
    expect(atMeetingTime.preparationStatus).toBe('ready');
    expect(atMeetingTime.allItemsReady).toBe(true);
    expect(atMeetingTime.activatedAt).toEqual(new Date('2024-01-15T00:00:00Z'));
    expect(atMeetingTime.timeUntilMeeting).toBe(0);

    // 準備完了フラグが立つ際の通知を検証
    expect(atMeetingTime.notificationsSent).toContain('preparation_completed');
    expect(atMeetingTime.notificationsSent).toContain('meeting_start_soon');

    // タイムゾーン境界での精度検証
    expect(atMeetingTime.secondPrecisionAccuracy).toBe(true);

    // 準備項目の状態遷移を検証
    expect(atMeetingTime.preparationItems.length).toBe(3);
    atMeetingTime.preparationItems.forEach((item: any) => {
      expect(item.status).toBe('completed');
      expect(item.completedAt).not.toBeNull();
    });

    // 開催日より後の状態（1分経過後）を確認
    const afterMeetingStarted = new Date('2024-01-15T00:01:00Z');
    global.Date = class extends Date {
      constructor() {
        super();
        return afterMeetingStarted;
      }
      static now() {
        return afterMeetingStarted.getTime();
      }
    } as any;

    const postMeetingStart = checkQuarterlyMeetingPreparationStatus({
      meetingScheduledDate: meetingScheduleDate,
      currentTime: afterMeetingStarted,
      preparationItems: [
        {
          itemId: 'participants_confirmation',
          itemName: '参加者リスト確認',
          status: 'completed',
          completedAt: new Date('2024-01-15T00:00:00Z'),
        },
        {
          itemId: 'agenda_template',
          itemName: '議題テンプレート',
          status: 'completed',
          completedAt: new Date('2024-01-15T00:00:00Z'),
        },
        {
          itemId: 'deliverables_definition',
          itemName: '期待成果物定義',
          status: 'completed',
          completedAt: new Date('2024-01-15T00:00:00Z'),
        },
      ],
    });

    expect(postMeetingStart.isPreparationCompleted).toBe(true);
    expect(postMeetingStart.preparationStatus).toBe('in_session');
    expect(postMeetingStart.timeUntilMeeting).toBe(-60);
  });
});