import { prioritizeImprovementProposals } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能', () => {
  // SCEN-541
  test('[edge] 改善提案優先度付け・通知機能 - 同一優先度の複数提案が存在するとき、登録日時の昇順で並び替えられる', () => {
    // 同一優先度（優先度レベル2）を持つ改善提案を3件作成
    const proposal_1 = {
      proposal_id: 'prop_001',
      priority_level: 2,
      registered_at: new Date('2024-01-01T10:00:00Z'),
      title: '栄養基準ロジック改善案A',
      description: 'タンパク質摂取基準の調整',
      status: '優先度付け完了',
    };

    const proposal_2 = {
      proposal_id: 'prop_002',
      priority_level: 2,
      registered_at: new Date('2024-01-02T09:30:00Z'),
      title: '栄養基準ロジック改善案B',
      description: 'カルシウム摂取基準の見直し',
      status: '優先度付け完了',
    };

    const proposal_3 = {
      proposal_id: 'prop_003',
      priority_level: 2,
      registered_at: new Date('2024-01-01T15:45:00Z'),
      title: '栄養基準ロジック改善案C',
      description: 'ビタミンD摂取基準の調整',
      status: '優先度付け完了',
    };

    const input_proposals = [proposal_1, proposal_2, proposal_3];

    // 改善提案一覧を優先度順でソート
    const result = prioritizeImprovementProposals(input_proposals);

    // 同一優先度の提案が登録日時の昇順で並び替えられていることを検証
    expect(result.length).toBe(3);
    expect(result[0].proposal_id).toBe('prop_001');
    expect(result[0].registered_at).toEqual(new Date('2024-01-01T10:00:00Z'));
    expect(result[1].proposal_id).toBe('prop_003');
    expect(result[1].registered_at).toEqual(new Date('2024-01-01T15:45:00Z'));
    expect(result[2].proposal_id).toBe('prop_002');
    expect(result[2].registered_at).toEqual(new Date('2024-01-02T09:30:00Z'));

    // 返却された順序が時系列で正しく昇順になっていることを確認
    for (let i = 1; i < result.length; i++) {
      expect(result[i].registered_at.getTime()).toBeGreaterThanOrEqual(
        result[i - 1].registered_at.getTime()
      );
    }

    // 優先度が同じまま保持されていることを確認
    result.forEach((proposal) => {
      expect(proposal.priority_level).toBe(2);
    });

    // 複数回呼び出してモンスターシステム的一貫性を検証
    const result_second_call = prioritizeImprovementProposals(input_proposals);
    expect(result_second_call.length).toBe(result.length);
    expect(result_second_call[0].proposal_id).toBe(result[0].proposal_id);
    expect(result_second_call[1].proposal_id).toBe(result[1].proposal_id);
    expect(result_second_call[2].proposal_id).toBe(result[2].proposal_id);
  });
});