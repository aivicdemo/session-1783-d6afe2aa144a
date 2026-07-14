import { assignPriorityRankToImprovementProposal } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの改善提案優先度自動付与', () => {
  // SCEN-889
  test('影響度が高く実装難度が低い改善提案に優先度ランク高が付与される', () => {
    const improvementProposal = {
      proposal_id: 'PROP-001',
      title: '栄養バランス改善ロジック',
      business_value_score: 8,
      technical_difficulty_score: 2,
      user_impact_score: 9,
    };

    const result = assignPriorityRankToImprovementProposal(improvementProposal);

    expect(result.priority_rank).toBe('高');
    expect(result.total_score).toBe(75);
    expect(result.assigned_at).toBeDefined();
  });
});