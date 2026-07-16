import { confirmMeetingParticipants } from '../../src/logic/it-1-br-8-2-2-1';

describe('アルゴリズム改善レビュー会議参加者確定機能', () => {
  // SCEN-234
  test('定期開催日時到達時に全参加者出席確認と欠席者代理割り当てが完了して会議参加者リストが確定される', () => {
    // 定期開催日時の前日までに登録された全参加者情報
    const registered_participants = [
      {
        participant_id: 'P001',
        name: '栄養士A',
        email: 'nutritionist_a@example.com',
        role: '栄養士',
        substitute_id: null,
      },
      {
        participant_id: 'P002',
        name: 'PM_B',
        email: 'pm_b@example.com',
        role: 'プロダクトマネージャー',
        substitute_id: 'P005',
      },
      {
        participant_id: 'P003',
        name: '開発者C',
        email: 'developer_c@example.com',
        role: '開発チーム',
        substitute_id: 'P006',
      },
      {
        participant_id: 'P004',
        name: 'QA_D',
        email: 'qa_d@example.com',
        role: 'QA',
        substitute_id: null,
      },
      {
        participant_id: 'P005',
        name: '栄養士E',
        email: 'nutritionist_e@example.com',
        role: '栄養士',
        substitute_id: null,
      },
      {
        participant_id: 'P006',
        name: '開発者F',
        email: 'developer_f@example.com',
        role: '開発チーム',
        substitute_id: null,
      },
    ];

    // 定期開催日時到達のシミュレーション
    const scheduled_datetime = new Date('2024-03-18T09:00:00Z');
    const current_datetime = new Date('2024-03-18T09:00:00Z');

    // 出席確認回答（一部参加者のみ回答を想定）
    const attendance_responses = [
      {
        participant_id: 'P001',
        attendance_status: 'confirmed',
        responded_at: new Date('2024-03-17T14:30:00Z'),
      },
      {
        participant_id: 'P002',
        attendance_status: 'absent',
        responded_at: new Date('2024-03-17T16:00:00Z'),
      },
      {
        participant_id: 'P003',
        attendance_status: 'confirmed',
        responded_at: new Date('2024-03-18T08:45:00Z'),
      },
      {
        participant_id: 'P004',
        attendance_status: 'no_response',
        responded_at: null,
      },
      {
        participant_id: 'P005',
        attendance_status: 'confirmed',
        responded_at: new Date('2024-03-17T18:00:00Z'),
      },
    ];

    // 関数実行
    const result = confirmMeetingParticipants({
      registered_participants,
      scheduled_datetime,
      current_datetime,
      attendance_responses,
    });

    // 期待結果検証

    // 1. 全参加者に対して出席確認通知が送信されたことを検証
    expect(result.confirmation_notifications_sent).toBe(6);

    // 2. 出席確認済みの参加者数をカウント（confirmed + absent + no_response の有効応答）
    expect(result.confirmed_count).toBe(3); // P001, P003, P005

    // 3. 欠席者の特定（absent status）
    expect(result.absent_participants).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          participant_id: 'P002',
          attendance_status: 'absent',
        }),
      ])
    );

    // 4. 欠席者に登録済みの代理人が正常に割り当てられたことを確認
    expect(result.assigned_substitutes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          original_participant_id: 'P002',
          substitute_id: 'P005',
          substitute_name: '栄養士E',
          assignment_reason: 'absent_with_registered_substitute',
        }),
      ])
    );

    // 5. 代理人が存在しない欠席者（P004）については代替案が提示されたことを検証
    const no_response_alternatives = result.alternative_proposals.filter(
      (alt: any) => alt.participant_id === 'P004'
    );
    expect(no_response_alternatives.length).toBeGreaterThan(0);
    expect(no_response_alternatives[0]).toEqual(
      expect.objectContaining({
        participant_id: 'P004',
        proposal_type: 'no_registered_substitute',
        options: expect.any(Array),
      })
    );

    // 6. 最終的な会議参加者リスト（出席者＋割り当てられた代理人）を検証
    const final_participant_list = result.final_participant_list;
    expect(final_participant_list).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          participant_id: 'P001',
          name: '栄養士A',
          status: 'confirmed_attendance',
        }),
        expect.objectContaining({
          participant_id: 'P003',
          name: '開発者C',
          status: 'confirmed_attendance',
        }),
        expect.objectContaining({
          participant_id: 'P005',
          name: '栄養士E',
          status: 'confirmed_attendance',
        }),
        expect.objectContaining({
          participant_id: 'P005',
          substitute_for: 'P002',
          name: '栄養士E',
          status: 'assigned_as_substitute',
        }),
      ])
    );

    // 7. 参加者リストの整合性検証（重複、漏れ、データ形式）
    expect(result.integrity_check).toEqual(
      expect.objectContaining({
        has_duplicates: false,
        has_missing_fields: false,
        valid_format: true,
        total_participants_in_list: 5,
      })
    );

    // 8. 会議参加者リストのステータスが「確定」に更新されたことを確認
    expect(result.meeting_participant_list_status).toBe('confirmed');

    // 9. 会議参加者リスト確定時刻を検証
    expect(result.confirmation_datetime).toEqual(current_datetime);

    // 10. 出席者と代理人の総数検証
    expect(result.final_participant_list.length).toBe(5); // P001, P003, P004(no_response), P005, P005(as substitute for P002)
  });
});