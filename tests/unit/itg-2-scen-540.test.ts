import { prioritizeAndNotifyImprovementProposals } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能', () => {
  // SCEN-540
  test('[error] 改善提案優先度付け・通知機能 - 優先度スコア未入力の改善提案は通知対象外として除外される', () => {
    const proposalWithoutPriorityScore = {
      proposalId: 'PROP-001',
      title: '栄養基準値の調整',
      description: 'タンパク質の推奨摂取量を改善する',
      priorityScore: null,
      businessValue: 8,
      technicalDifficulty: 5,
      userImpact: 7,
      createdAt: new Date('2024-01-15T11:00:00Z'),
      createdBy: 'nutritionist-001'
    };

    const proposalWithPriorityScore = {
      proposalId: 'PROP-002',
      title: '食材制限ロジック改善',
      description: 'アレルギー食材検出を強化する',
      priorityScore: 8,
      businessValue: 9,
      technicalDifficulty: 4,
      userImpact: 8,
      createdAt: new Date('2024-01-15T12:00:00Z'),
      createdBy: 'nutritionist-001'
    };

    const proposalWithZeroPriorityScore = {
      proposalId: 'PROP-003',
      title: '調理時間最適化',
      description: '調理時間推定アルゴリズムの改善',
      priorityScore: 0,
      businessValue: 6,
      technicalDifficulty: 3,
      userImpact: 5,
      createdAt: new Date('2024-01-15T13:00:00Z'),
      createdBy: 'nutritionist-002'
    };

    const proposals = [
      proposalWithoutPriorityScore,
      proposalWithPriorityScore,
      proposalWithZeroPriorityScore
    ];

    const result = prioritizeAndNotifyImprovementProposals(proposals);

    expect(result.notificationTargets).toHaveLength(2);
    expect(result.notificationTargets.some(t => t.proposalId === 'PROP-001')).toBe(false);
    expect(result.notificationTargets.some(t => t.proposalId === 'PROP-002')).toBe(true);
    expect(result.notificationTargets.some(t => t.proposalId === 'PROP-003')).toBe(true);

    expect(result.excludedProposals).toHaveLength(1);
    expect(result.excludedProposals[0].proposalId).toBe('PROP-001');
    expect(result.excludedProposals[0].excludeReason).toBe('優先度スコア未入力');

    expect(result.notificationTargets[0].priorityScore).toBe(8);
    expect(result.notificationTargets[1].priorityScore).toBe(0);

    expect(result.processedAt).toEqual(new Date('2024-01-15T14:00:00Z'));
  });
});