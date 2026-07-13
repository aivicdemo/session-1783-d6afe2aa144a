import { assignDelegateParticipant } from '../../src/logic/it-1-br-2-1-2-1';

describe('アルゴリズム改善レビュー会議参加者確認・代理割り当て機能', () => {
  // SCEN-571
  test('欠席者への代理参加者割り当てが失敗した場合、エラーが発生し処理が中断される', () => {
    const meetingId = 'meeting-2024-01-15-001';
    const absentParticipantId = 'participant-001';
    const delegateParticipantId = 'participant-002';
    const originalParticipants = [
      {
        participant_id: absentParticipantId,
        name: '田中太郎',
        role: '栄養士',
        status: 'absent',
        delegate_id: null,
        scheduled_meetings: ['meeting-2024-01-15-001']
      },
      {
        participant_id: delegateParticipantId,
        name: '鈴木次郎',
        role: '開発チーム',
        status: 'confirmed',
        delegate_id: null,
        scheduled_meetings: ['meeting-2024-01-15-001', 'meeting-2024-01-15-002']
      },
      {
        participant_id: 'participant-003',
        name: '佐藤三郎',
        role: 'PM',
        status: 'confirmed',
        delegate_id: null,
        scheduled_meetings: ['meeting-2024-01-15-001']
      }
    ];

    const input = {
      meeting_id: meetingId,
      absent_participant_id: absentParticipantId,
      delegate_participant_id: delegateParticipantId,
      participants: originalParticipants,
      conflict_reason: 'delegate_already_scheduled'
    };

    expect(() => assignDelegateParticipant(input)).toThrow(/代理参加者/);

    const resultParticipants = originalParticipants;
    const absentParticipantResult = resultParticipants.find(
      (p) => p.participant_id === absentParticipantId
    );
    const delegateParticipantResult = resultParticipants.find(
      (p) => p.participant_id === delegateParticipantId
    );

    expect(absentParticipantResult?.delegate_id).toBeNull();
    expect(absentParticipantResult?.status).toBe('absent');
    expect(delegateParticipantResult?.delegate_id).toBeNull();
    expect(delegateParticipantResult?.status).toBe('confirmed');
  });
});