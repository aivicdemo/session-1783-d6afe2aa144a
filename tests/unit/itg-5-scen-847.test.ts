import { confirmAlgorithmReviewMeetingAttendees } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズム改善レビュー会議の参加者確認', () => {
  // SCEN-847: アルゴリズム改善レビュー会議参加者確認 - 定期開催日時に到達した際、参加者全員の出席確認が完了し、欠席者に対して代理参加者の割り当てが実行される
  test('定期開催日時に到達した際、出席確認と欠席者への代理参加者割り当てが自動実行されること', () => {
    // Arrange: 定期開催日時設定、複数参加者登録、現在日時を定期開催時刻に進行させた状況をシミュレート
    const scheduled_date_time = new Date('2024-02-12T09:00:00Z'); // 毎週月曜 09:00
    const current_date_time = new Date('2024-02-12T09:00:00Z'); // 定期開催日時に到達
    
    const meeting_participants = [
      {
        participant_id: 'P001',
        participant_name: '田中 太郎',
        role: 'アプリ開発チームリード',
        expected_attendance: true,
      },
      {
        participant_id: 'P002',
        participant_name: '鈴木 花子',
        role: 'プロダクトマネージャー',
        expected_attendance: true,
      },
      {
        participant_id: 'P003',
        participant_name: '佐藤 次郎',
        role: '栄養士',
        expected_attendance: true,
      },
      {
        participant_id: 'P004',
        participant_name: '松本 美咲',
        role: 'UXデザイナー',
        expected_attendance: false, // 欠席予定
      },
    ];

    const substitute_mapping = {
      P004: {
        substitute_id: 'P005',
        substitute_name: '山田 健太',
        substitute_role: 'シニアデベロッパー',
      },
    };

    // Act: 会議参加者確認処理を実行
    const result = confirmAlgorithmReviewMeetingAttendees({
      scheduled_date_time,
      current_date_time,
      meeting_participants,
      substitute_mapping,
    });

    // Assert: 出席確認と代理参加者割り当て結果を検証
    expect(result.meeting_confirmed).toBe(true);
    expect(result.scheduled_datetime_reached).toBe(true);
    expect(result.total_participants).toBe(4);
    expect(result.expected_attendance_count).toBe(3);
    expect(result.absent_count).toBe(1);

    // 出席予定者の確認状況
    expect(result.confirmed_attendees).toEqual([
      {
        participant_id: 'P001',
        participant_name: '田中 太郎',
        role: 'アプリ開発チームリード',
        confirmed_status: 'confirmed',
      },
      {
        participant_id: 'P002',
        participant_name: '鈴木 花子',
        role: 'プロダクトマネージャー',
        confirmed_status: 'confirmed',
      },
      {
        participant_id: 'P003',
        participant_name: '佐藤 次郎',
        role: '栄養士',
        confirmed_status: 'confirmed',
      },
    ]);

    // 欠席者と代理参加者の割り当て状況
    expect(result.absent_with_substitutes).toEqual([
      {
        absent_participant_id: 'P004',
        absent_participant_name: '松本 美咲',
        absent_role: 'UXデザイナー',
        substitute_id: 'P005',
        substitute_name: '山田 健太',
        substitute_role: 'シニアデベロッパー',
        substitute_assigned: true,
      },
    ]);

    // 最終会議参加者リスト（代理参加者を含む）
    expect(result.final_meeting_participants).toEqual([
      {
        participant_id: 'P001',
        participant_name: '田中 太郎',
        role: 'アプリ開発チームリード',
        attendance_type: 'direct',
      },
      {
        participant_id: 'P002',
        participant_name: '鈴木 花子',
        role: 'プロダクトマネージャー',
        attendance_type: 'direct',
      },
      {
        participant_id: 'P003',
        participant_name: '佐藤 次郎',
        role: '栄養士',
        attendance_type: 'direct',
      },
      {
        participant_id: 'P005',
        participant_name: '山田 健太',
        role: 'シニアデベロッパー',
        attendance_type: 'substitute',
        represents_participant_id: 'P004',
      },
    ]);

    // ステークホルダー通知フラグ
    expect(result.notification_required).toBe(true);
    expect(result.notification_message).toBe('会議参加者リスト確定: P005(山田 健太)が P004の代理参加者として割り当てられました。');
  });
});