import { aggregateWeeklyMetrics } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズム改善前後の効果差定量比較ダッシュボード', () => {
  // SCEN-686: [edge] 改善提案一覧化・スケジュール通知 - 優先度が同一の提案が存在する場合、入力順序で一覧順序を決定する
  test('should maintain insertion order for proposals with identical priority', () => {
    const proposalA = {
      id: 'prop-001',
      title: '栄養バランス改善',
      priority: 85,
      createdAt: '2024-01-15T09:00:00Z',
      businessValue: 8,
      technicalDifficulty: 5,
      userImpact: 9,
    };

    const proposalB = {
      id: 'prop-002',
      title: '調理時間最適化',
      priority: 85,
      createdAt: '2024-01-15T09:15:00Z',
      businessValue: 8,
      technicalDifficulty: 6,
      userImpact: 8,
    };

    const proposalC = {
      id: 'prop-003',
      title: 'アレルギー対応強化',
      priority: 85,
      createdAt: '2024-01-15T09:30:00Z',
      businessValue: 8,
      technicalDifficulty: 4,
      userImpact: 9,
    };

    const firstOrderProposals = [proposalA, proposalB, proposalC];
    const firstResult = aggregateWeeklyMetrics(firstOrderProposals);

    expect(firstResult.proposals).toHaveLength(3);
    expect(firstResult.proposals[0].id).toBe('prop-001');
    expect(firstResult.proposals[1].id).toBe('prop-002');
    expect(firstResult.proposals[2].id).toBe('prop-003');

    const proposalD = {
      id: 'prop-004',
      title: '家族好み学習',
      priority: 85,
      createdAt: '2024-01-15T10:00:00Z',
      businessValue: 8,
      technicalDifficulty: 7,
      userImpact: 8,
    };

    const proposalE = {
      id: 'prop-005',
      title: '食材制限管理改善',
      priority: 85,
      createdAt: '2024-01-15T10:15:00Z',
      businessValue: 8,
      technicalDifficulty: 5,
      userImpact: 9,
    };

    const proposalF = {
      id: 'prop-006',
      title: '栄養摂取推移追跡',
      priority: 85,
      createdAt: '2024-01-15T10:30:00Z',
      businessValue: 8,
      technicalDifficulty: 6,
      userImpact: 8,
    };

    const reversedOrderProposals = [proposalF, proposalE, proposalD];
    const reversedResult = aggregateWeeklyMetrics(reversedOrderProposals);

    expect(reversedResult.proposals).toHaveLength(3);
    expect(reversedResult.proposals[0].id).toBe('prop-006');
    expect(reversedResult.proposals[1].id).toBe('prop-005');
    expect(reversedResult.proposals[2].id).toBe('prop-004');

    const mixedOrderProposals = [proposalC, proposalA, proposalB];
    const mixedResult = aggregateWeeklyMetrics(mixedOrderProposals);

    expect(mixedResult.proposals).toHaveLength(3);
    expect(mixedResult.proposals[0].id).toBe('prop-003');
    expect(mixedResult.proposals[1].id).toBe('prop-001');
    expect(mixedResult.proposals[2].id).toBe('prop-002');

    expect(mixedResult.proposals[0].priority).toBe(85);
    expect(mixedResult.proposals[1].priority).toBe(85);
    expect(mixedResult.proposals[2].priority).toBe(85);

    const expectedScheduleNotification = {
      scheduledDate: '2024-01-22T09:00:00Z',
      proposalCount: 3,
      proposalIds: ['prop-003', 'prop-001', 'prop-002'],
    };

    expect(mixedResult.scheduleNotification.scheduledDate).toBe(
      expectedScheduleNotification.scheduledDate,
    );
    expect(mixedResult.scheduleNotification.proposalCount).toBe(3);
    expect(mixedResult.scheduleNotification.proposalIds).toEqual(
      expectedScheduleNotification.proposalIds,
    );
  });
});