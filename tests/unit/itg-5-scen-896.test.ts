import { aggregateWeeklyMetrics } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズム改善効果の週次集計と通知キュー管理', () => {
  // SCEN-896: 同じ優先度の改善提案が送信順序に基づいてFIFO順で通知キューに格納されることを検証
  test('同じ優先度で複数の改善提案が送信された場合、送信順序に基づいて通知キューに格納され、FIFO順で開発チームに通知される', () => {
    // ========== 前提条件 ==========
    // テスト環境を初期化し、改善提案管理システムをセットアップ
    const improvementProposals = [
      {
        proposalId: 'proposal-A',
        priority: 3,
        title: 'Algorithm refinement A',
        sentAt: new Date('2024-01-15T09:00:00Z'),
        sequenceOrder: 1,
      },
      {
        proposalId: 'proposal-B',
        priority: 3,
        title: 'Algorithm refinement B',
        sentAt: new Date('2024-01-15T09:00:00Z'),
        sequenceOrder: 2,
      },
      {
        proposalId: 'proposal-C',
        priority: 3,
        title: 'Algorithm refinement C',
        sentAt: new Date('2024-01-15T09:00:00Z'),
        sequenceOrder: 3,
      },
    ];

    const previousWeekMetrics = {
      successRate: 0.75,
      cookingTimeReduction: 0.15,
      satisfactionScore: 3.2,
      weekStartDate: new Date('2024-01-08T00:00:00Z'),
    };

    const currentWeekMetrics = {
      successRate: 0.82,
      cookingTimeReduction: 0.22,
      satisfactionScore: 3.7,
      weekStartDate: new Date('2024-01-15T00:00:00Z'),
    };

    // ========== 実行 ==========
    // 改善提案A、B、Cを0ms間隔で連続して送信し、通知キューの格納順序を確認
    const result = aggregateWeeklyMetrics({
      improvementProposals,
      previousWeekMetrics,
      currentWeekMetrics,
      includeNotificationQueue: true,
    });

    // ========== 検証 ==========
    // 1. 通知キューが正確に格納されていることを確認
    expect(result.notificationQueue).toBeDefined();
    expect(result.notificationQueue.length).toBe(3);

    // 2. 通知キューの格納順序がFIFO（先入れ先出し）であることを確認
    expect(result.notificationQueue[0].proposalId).toBe('proposal-A');
    expect(result.notificationQueue[1].proposalId).toBe('proposal-B');
    expect(result.notificationQueue[2].proposalId).toBe('proposal-C');

    // 3. 各通知のメタデータが正確に保持されていることを確認
    expect(result.notificationQueue[0]).toEqual({
      proposalId: 'proposal-A',
      priority: 3,
      sentAt: new Date('2024-01-15T09:00:00Z'),
      sequenceOrder: 1,
      deliveryOrder: 0,
    });

    expect(result.notificationQueue[1]).toEqual({
      proposalId: 'proposal-B',
      priority: 3,
      sentAt: new Date('2024-01-15T09:00:00Z'),
      sequenceOrder: 2,
      deliveryOrder: 1,
    });

    expect(result.notificationQueue[2]).toEqual({
      proposalId: 'proposal-C',
      priority: 3,
      sentAt: new Date('2024-01-15T09:00:00Z'),
      sequenceOrder: 3,
      deliveryOrder: 2,
    });

    // 4. 週次集計結果が正確に計算されていることを確認
    // successRate 改善度: (0.82 - 0.75) / 0.75 = 0.0933... ≈ 9.33%
    expect(result.successRateImprovement).toBeCloseTo(9.33, 1);

    // cookingTimeReduction 改善度: (0.22 - 0.15) / 0.15 = 0.4666... ≈ 46.67%
    expect(result.cookingTimeReductionImprovement).toBeCloseTo(46.67, 1);

    // satisfactionScore 改善度: (3.7 - 3.2) / 3.2 = 0.15625 = 15.625%
    expect(result.satisfactionScoreImprovement).toBeCloseTo(15.63, 1);

    // 5. 複数の改善提案の送信順序が一貫して保持されていることを確認
    expect(result.notificationQueue.map((n) => n.proposalId)).toEqual([
      'proposal-A',
      'proposal-B',
      'proposal-C',
    ]);

    // 6. 各通知にタイムスタンプが正確に記録されていることを確認
    result.notificationQueue.forEach((notification) => {
      expect(notification.sentAt).toEqual(new Date('2024-01-15T09:00:00Z'));
      expect(typeof notification.deliveryOrder).toBe('number');
      expect(notification.deliveryOrder).toBeGreaterThanOrEqual(0);
    });

    // 7. 通知キューが開発チームへの配信順序を正確に反映していることを確認
    const deliverySequence = result.notificationQueue.map((n) => n.proposalId);
    expect(deliverySequence).toEqual(['proposal-A', 'proposal-B', 'proposal-C']);

    // 8. 結果の一貫性を確認（同じ入力に対して常に同じ出力を返すこと）
    const resultSecondRun = aggregateWeeklyMetrics({
      improvementProposals,
      previousWeekMetrics,
      currentWeekMetrics,
      includeNotificationQueue: true,
    });

    expect(resultSecondRun.notificationQueue).toEqual(result.notificationQueue);
    expect(resultSecondRun.successRateImprovement).toBe(result.successRateImprovement);
    expect(resultSecondRun.cookingTimeReductionImprovement).toBe(
      result.cookingTimeReductionImprovement,
    );
    expect(resultSecondRun.satisfactionScoreImprovement).toBe(result.satisfactionScoreImprovement);
  });
});