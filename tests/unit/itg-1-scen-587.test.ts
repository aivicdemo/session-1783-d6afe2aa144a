import { assignProxyParticipant } from '../../src/logic/it-1-1-1';

describe('アルゴリズム改善レビュー会議参加者確認', () => {
  // SCEN-587
  test('全参加者が欠席の場合、代理参加者割り当てエラーが発生する', () => {
    const meeting_id = 'MEETING-20240115-001';
    const participants = [
      {
        participant_id: 'P001',
        name: '栄養士A',
        status: 'absent',
        role: 'nutritionist',
      },
      {
        participant_id: 'P002',
        name: '開発者B',
        status: 'absent',
        role: 'developer',
      },
      {
        participant_id: 'P003',
        name: 'PMC',
        status: 'absent',
        role: 'product_manager',
      },
    ];
    const proxy_candidate_id = 'PROXY-001';

    expect(() =>
      assignProxyParticipant({
        meeting_id,
        participants,
        proxy_candidate_id,
      })
    ).toThrow(/全参加者が欠席/);
  });
});