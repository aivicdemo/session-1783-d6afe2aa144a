import { validateMeetingParticipants } from '../../src/logic/it-1-br-8-2-1-1';

describe('ユーザーセグメント別の利用パターン分析ダッシュボード - 週次・月次アルゴリズム改善レビュー会議開催判定', () => {
  // SCEN-253
  test('参加予定者データが不正な形式の場合、出席確認処理がエラーで中止される', () => {
    // 不正なパターン1: JSONフォーマットの欠損 - participants が null
    expect(() => {
      validateMeetingParticipants({
        meetingId: 'meeting_20240115',
        scheduledDate: new Date('2024-01-15T09:00:00Z'),
        participants: null as any,
      });
    }).toThrow(/参加予定者/);

    // 不正なパターン2: 型の不一致 - participants が string
    expect(() => {
      validateMeetingParticipants({
        meetingId: 'meeting_20240115',
        scheduledDate: new Date('2024-01-15T09:00:00Z'),
        participants: 'invalid_string' as any,
      });
    }).toThrow(/参加予定者/);

    // 不正なパターン3: 必須フィールドの欠損 - participant の userId が undefined
    expect(() => {
      validateMeetingParticipants({
        meetingId: 'meeting_20240115',
        scheduledDate: new Date('2024-01-15T09:00:00Z'),
        participants: [
          {
            userId: undefined as any,
            name: '栄養士A',
            role: 'nutritionist',
          },
        ],
      });
    }).toThrow(/参加予定者/);

    // 不正なパターン4: 必須フィールドの欠損 - participant の role が空文字列
    expect(() => {
      validateMeetingParticipants({
        meetingId: 'meeting_20240115',
        scheduledDate: new Date('2024-01-15T09:00:00Z'),
        participants: [
          {
            userId: 'user_001',
            name: '栄養士A',
            role: '' as any,
          },
        ],
      });
    }).toThrow(/参加予定者/);

    // 不正なパターン5: 空配列
    expect(() => {
      validateMeetingParticipants({
        meetingId: 'meeting_20240115',
        scheduledDate: new Date('2024-01-15T09:00:00Z'),
        participants: [],
      });
    }).toThrow(/参加予定者/);

    // 正常なデータで成功することを確認
    const validResult = validateMeetingParticipants({
      meetingId: 'meeting_20240115',
      scheduledDate: new Date('2024-01-15T09:00:00Z'),
      participants: [
        {
          userId: 'user_001',
          name: '栄養士A',
          role: 'nutritionist',
        },
        {
          userId: 'user_002',
          name: 'PM太郎',
          role: 'product_manager',
        },
      ],
    });

    expect(validResult).toEqual({
      isValid: true,
      meetingId: 'meeting_20240115',
      participantCount: 2,
      validationStatus: 'success',
    });
  });
});