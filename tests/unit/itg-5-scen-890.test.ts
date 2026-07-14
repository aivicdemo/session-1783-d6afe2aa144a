import { assignImprovementPriorityRank } from '../../src/logic/it-7-2-1';

describe('改善提案の2軸優先度自動付与', () => {
  test('SCEN-890: 影響度が中程度で実装難度が中程度の改善提案に優先度ランク中が付与される', () => {
    // Arrange
    const improvementProposal = {
      id: 'proposal_001',
      title: '栄養バランス検証ロジック改善',
      impact: 3,
      difficulty: 3,
    };

    // Act
    const result = assignImprovementPriorityRank(improvementProposal);

    // Assert
    expect(result.priorityRank).toBe('中');
  });
});