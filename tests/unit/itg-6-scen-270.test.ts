import { assignPriorityRankToImprovement } from '../../src/logic/it-1-br-8-2-1-1';

describe('ユーザーセグメント別の利用パターン分析ダッシュボード', () => {
  // SCEN-270
  test('[edge] 改善提案優先度付与機能 - 影響度が最低・実装難度が最高の場合に優先度ランク「低」が付与される', () => {
    const improvement_proposal = {
      proposal_id: 'IMP-001',
      impact_degree: 1,
      implementation_difficulty: 5,
      user_impact_score: 50,
    };

    const result = assignPriorityRankToImprovement(improvement_proposal);

    expect(result.priority_rank).toBe('低');
  });
});