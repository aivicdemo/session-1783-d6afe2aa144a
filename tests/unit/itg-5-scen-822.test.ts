import { distributeRuleSpecification, trackDistributionStatus } from '../../src/logic/it-7-2-1';

describe('ルール仕様書配布・確認追跡機能', () => {
  // SCEN-822
  test('更新されたルール仕様書が指定タイミングで対象者全員に配布され、確認状況がリアルタイムで追跡される', () => {
    const specificationId = 'SPEC-2024-Q1-001';
    const specificationTitle = '季節パターン・割引率閾値・販売期間の優先度ルール';
    const specificationVersion = '2.0';
    const createdAt = new Date('2024-01-15T09:00:00Z');
    const updatedAt = new Date('2024-01-15T10:30:00Z');

    const distributionTargets = [
      { userId: 'user-001', userName: '開発チーム_田中', email: 'tanaka@dev.example.com', role: 'developer' },
      { userId: 'user-002', userName: '開発チーム_佐藤', email: 'satoh@dev.example.com', role: 'developer' },
      { userId: 'user-003', userName: 'QA_山田', email: 'yamada@qa.example.com', role: 'qa' },
    ];

    const distributionSchedule = {
      scheduledAt: new Date('2024-01-15T14:00:00Z'),
      distributionMethod: 'system-notification',
      requireConfirmation: true,
    };

    const distributionInput = {
      specificationId,
      specificationTitle,
      specificationVersion,
      createdAt,
      updatedAt,
      distributionTargets,
      distributionSchedule,
    };

    const distributionResult = distributeRuleSpecification(distributionInput);

    expect(distributionResult.specificationId).toBe(specificationId);
    expect(distributionResult.distributionStatus).toBe('scheduled');
    expect(distributionResult.targetCount).toBe(3);
    expect(distributionResult.distributedCount).toBe(0);
    expect(distributionResult.confirmedCount).toBe(0);
    expect(distributionResult.unconfirmedCount).toBe(3);
    expect(distributionResult.scheduledAt).toEqual(new Date('2024-01-15T14:00:00Z'));

    const simulatedDistributionTime = new Date('2024-01-15T14:00:01Z');
    const distributionExecution = {
      distributionId: distributionResult.distributionId,
      executedAt: simulatedDistributionTime,
    };

    const executionResult = trackDistributionStatus(distributionExecution);

    expect(executionResult.distributionId).toBe(distributionResult.distributionId);
    expect(executionResult.status).toBe('distributed');
    expect(executionResult.distributedAt).toEqual(simulatedDistributionTime);
    expect(executionResult.recipientStatuses).toHaveLength(3);
    expect(executionResult.recipientStatuses[0].userId).toBe('user-001');
    expect(executionResult.recipientStatuses[0].confirmationStatus).toBe('unconfirmed');
    expect(executionResult.recipientStatuses[0].receivedAt).toEqual(simulatedDistributionTime);
    expect(executionResult.recipientStatuses[0].confirmedAt).toBeNull();
    expect(executionResult.recipientStatuses[1].userId).toBe('user-002');
    expect(executionResult.recipientStatuses[1].confirmationStatus).toBe('unconfirmed');
    expect(executionResult.recipientStatuses[2].userId).toBe('user-003');
    expect(executionResult.recipientStatuses[2].confirmationStatus).toBe('unconfirmed');

    const confirmationTime1 = new Date('2024-01-15T14:05:00Z');
    const userConfirmation1 = {
      distributionId: distributionResult.distributionId,
      userId: 'user-001',
      confirmedAt: confirmationTime1,
    };

    const confirmationResult1 = trackDistributionStatus(userConfirmation1);

    expect(confirmationResult1.recipientStatuses[0].userId).toBe('user-001');
    expect(confirmationResult1.recipientStatuses[0].confirmationStatus).toBe('confirmed');
    expect(confirmationResult1.recipientStatuses[0].confirmedAt).toEqual(confirmationTime1);
    expect(confirmationResult1.confirmedCount).toBe(1);
    expect(confirmationResult1.unconfirmedCount).toBe(2);

    const confirmationTime2 = new Date('2024-01-15T14:12:00Z');
    const userConfirmation2 = {
      distributionId: distributionResult.distributionId,
      userId: 'user-003',
      confirmedAt: confirmationTime2,
    };

    const confirmationResult2 = trackDistributionStatus(userConfirmation2);

    expect(confirmationResult2.recipientStatuses[2].userId).toBe('user-003');
    expect(confirmationResult2.recipientStatuses[2].confirmationStatus).toBe('confirmed');
    expect(confirmationResult2.recipientStatuses[2].confirmedAt).toEqual(confirmationTime2);
    expect(confirmationResult2.confirmedCount).toBe(2);
    expect(confirmationResult2.unconfirmedCount).toBe(1);

    const dashboardSnapshot = trackDistributionStatus({
      distributionId: distributionResult.distributionId,
      queryType: 'dashboard-summary',
    });

    expect(dashboardSnapshot.distributionId).toBe(distributionResult.distributionId);
    expect(dashboardSnapshot.totalTargets).toBe(3);
    expect(dashboardSnapshot.confirmedCount).toBe(2);
    expect(dashboardSnapshot.unconfirmedCount).toBe(1);
    expect(dashboardSnapshot.confirmationRate).toBe(66.67);
    expect(dashboardSnapshot.recipientStatuses).toHaveLength(3);

    const userNotConfirmed = dashboardSnapshot.recipientStatuses.find((r) => r.userId === 'user-002');
    expect(userNotConfirmed.confirmationStatus).toBe('unconfirmed');
    expect(userNotConfirmed.confirmedAt).toBeNull();
    expect(userNotConfirmed.receivedAt).toEqual(simulatedDistributionTime);

    const summaryReport = {
      distributionId: distributionResult.distributionId,
      specificationId,
      specificationVersion,
      distributionTimestamp: simulatedDistributionTime,
      reportGeneratedAt: new Date('2024-01-15T14:30:00Z'),
      targetCount: 3,
      confirmedCount: 2,
      unconfirmedCount: 1,
      confirmationRate: 66.67,
      recipientDetails: dashboardSnapshot.recipientStatuses.map((r) => ({
        userId: r.userId,
        confirmationStatus: r.confirmationStatus,
        receivedAt: r.receivedAt,
        confirmedAt: r.confirmedAt,
      })),
    };

    expect(summaryReport.distributionId).toBe(distributionResult.distributionId);
    expect(summaryReport.targetCount).toBe(3);
    expect(summaryReport.confirmedCount).toBe(2);
    expect(summaryReport.unconfirmedCount).toBe(1);
    expect(summaryReport.confirmationRate).toBe(66.67);
    expect(summaryReport.recipientDetails).toHaveLength(3);
    expect(summaryReport.recipientDetails[0].userId).toBe('user-001');
    expect(summaryReport.recipientDetails[0].confirmationStatus).toBe('confirmed');
    expect(summaryReport.recipientDetails[0].confirmedAt).toEqual(confirmationTime1);
    expect(summaryReport.recipientDetails[1].userId).toBe('user-002');
    expect(summaryReport.recipientDetails[1].confirmationStatus).toBe('unconfirmed');
    expect(summaryReport.recipientDetails[1].confirmedAt).toBeNull();
    expect(summaryReport.recipientDetails[2].userId).toBe('user-003');
    expect(summaryReport.recipientDetails[2].confirmationStatus).toBe('confirmed');
    expect(summaryReport.recipientDetails[2].confirmedAt).toEqual(confirmationTime2);
  });
});