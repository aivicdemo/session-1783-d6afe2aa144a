import { assignPriorityMatrix } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの改善提案2軸優先度自動付与', () => {
  // SCEN-893
  test('影響度と実装難度が境界値（中と中）の場合に中が付与される', () => {
    const improvementProposal = {
      proposalId: 'PROPOSAL-001',
      title: 'アルゴリズム改善案A',
      impactScore: 5.0,
      implementationDifficultyScore: 5.0,
      description: 'テスト用改善提案',
    };

    const result = assignPriorityMatrix(improvementProposal);

    expect(result).toEqual({
      proposalId: 'PROPOSAL-001',
      title: 'アルゴリズム改善案A',
      impactScore: 5.0,
      implementationDifficultyScore: 5.0,
      priorityLevel: 'medium',
      priorityMatrix: 'center',
      dashboardDisplay: '中',
    });

    expect(result.priorityLevel).toBe('medium');
    expect(result.dashboardDisplay).toBe('中');
  });
});