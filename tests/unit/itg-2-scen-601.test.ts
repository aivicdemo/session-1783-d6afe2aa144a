import { assignPriorityToImprovementProposals } from '../../src/logic/it-1-br-2-1-2-1';

describe('改善提案の優先度自動付与機能', () => {
  // SCEN-601
  test('2軸マトリクス（影響度×実装難度）に基づいて優先度ランクが正しく自動付与される', () => {
    const improvement_proposals = [
      {
        proposal_id: 'PROP-001',
        title: '栄養バランスアルゴリズム改善',
        description: '栄養基準値の精度向上',
        impact_level: 'high',
        implementation_difficulty: 'low',
      },
      {
        proposal_id: 'PROP-002',
        title: 'UI/UX改善',
        description: 'ユーザーインターフェース最適化',
        impact_level: 'high',
        implementation_difficulty: 'high',
      },
      {
        proposal_id: 'PROP-003',
        title: 'データ可視化機能',
        description: '栄養摂取推移グラフ表示',
        impact_level: 'medium',
        implementation_difficulty: 'low',
      },
      {
        proposal_id: 'PROP-004',
        title: 'レポート出力機能',
        description: 'PDF出力機能の追加',
        impact_level: 'medium',
        implementation_difficulty: 'medium',
      },
      {
        proposal_id: 'PROP-005',
        title: '言語対応',
        description: '多言語サポート',
        impact_level: 'low',
        implementation_difficulty: 'high',
      },
      {
        proposal_id: 'PROP-006',
        title: 'ログ出力',
        description: 'システムログの詳細化',
        impact_level: 'low',
        implementation_difficulty: 'low',
      },
    ];

    const result = assignPriorityToImprovementProposals(improvement_proposals);

    // 期待値の検証
    // 影響度が高く実装難度が低い提案 → 優先度『高』
    const prop001 = result.find((p) => p.proposal_id === 'PROP-001');
    expect(prop001).toBeDefined();
    expect(prop001?.priority_rank).toBe('high');

    // 影響度が高く実装難度が高い提案 → 優先度『中』
    const prop002 = result.find((p) => p.proposal_id === 'PROP-002');
    expect(prop002).toBeDefined();
    expect(prop002?.priority_rank).toBe('medium');

    // 影響度が中程度で実装難度が低い提案 → 優先度『中』
    const prop003 = result.find((p) => p.proposal_id === 'PROP-003');
    expect(prop003).toBeDefined();
    expect(prop003?.priority_rank).toBe('medium');

    // 影響度が中程度で実装難度が中程度の提案 → 優先度『低』
    const prop004 = result.find((p) => p.proposal_id === 'PROP-004');
    expect(prop004).toBeDefined();
    expect(prop004?.priority_rank).toBe('low');

    // 影響度が低い提案 → 優先度『低』
    const prop005 = result.find((p) => p.proposal_id === 'PROP-005');
    expect(prop005).toBeDefined();
    expect(prop005?.priority_rank).toBe('low');

    // 影響度が低く実装難度が低い提案 → 優先度『低』
    const prop006 = result.find((p) => p.proposal_id === 'PROP-006');
    expect(prop006).toBeDefined();
    expect(prop006?.priority_rank).toBe('low');

    // すべての提案に優先度ランクが付与されたことを確認
    expect(result.length).toBe(6);
    result.forEach((proposal) => {
      expect(['high', 'medium', 'low']).toContain(proposal.priority_rank);
      expect(proposal).toHaveProperty('proposal_id');
      expect(proposal).toHaveProperty('priority_rank');
    });

    // 優先度『高』は1件のみ
    const high_priority_count = result.filter((p) => p.priority_rank === 'high').length;
    expect(high_priority_count).toBe(1);

    // 優先度『中』は2件
    const medium_priority_count = result.filter((p) => p.priority_rank === 'medium').length;
    expect(medium_priority_count).toBe(2);

    // 優先度『低』は3件
    const low_priority_count = result.filter((p) => p.priority_rank === 'low').length;
    expect(low_priority_count).toBe(3);
  });
});