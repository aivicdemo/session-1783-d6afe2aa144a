import { aggregateWeeklyMetrics } from '../../src/logic/it-7-2-1';

describe('献立生成の成功率・調理時間短縮度・ユーザー満足度スコアなどの行動指標を週次で自動集計し、アルゴリズム改善前後の効果差を定量比較するダッシュボード機能', () => {
  // SCEN-572
  test('改善提案の優先度付けが承認待ちの場合、通知は送信されない', () => {
    const improvementProposalId = 'proposal_001';
    const proposalStatus = '承認待ち';
    const weekStartDate = new Date('2024-01-08T00:00:00Z');
    const weekEndDate = new Date('2024-01-14T23:59:59Z');

    const weeklyMetricsData = {
      weekStartDate,
      weekEndDate,
      metricsRecords: [
        {
          userId: 'user_001',
          proposalId: improvementProposalId,
          proposalStatus,
          successRate: 0.78,
          cookingTimeReductionDegree: 0.15,
          satisfactionScore: 4.2,
          metricsCollectedAt: new Date('2024-01-10T14:30:00Z'),
        },
        {
          userId: 'user_002',
          proposalId: improvementProposalId,
          proposalStatus,
          successRate: 0.82,
          cookingTimeReductionDegree: 0.18,
          satisfactionScore: 4.5,
          metricsCollectedAt: new Date('2024-01-11T15:45:00Z'),
        },
      ],
      notificationSendingJobId: 'job_20240115_001',
      jobExecutionTimestamp: new Date('2024-01-15T09:00:00Z'),
    };

    const result = aggregateWeeklyMetrics(weeklyMetricsData);

    expect(result.aggregatedMetrics).toEqual({
      weekStartDate: new Date('2024-01-08T00:00:00Z'),
      weekEndDate: new Date('2024-01-14T23:59:59Z'),
      averageSuccessRate: 0.8,
      averageCookingTimeReductionDegree: 0.165,
      averageSatisfactionScore: 4.35,
      totalRecordsProcessed: 2,
    });

    expect(result.notificationSendingResult).toEqual({
      notificationsSentCount: 0,
      proposalsWithAwaitingStatusCount: 1,
      proposalIdWithAwaitingStatus: improvementProposalId,
      proposalStatusIgnored: '承認待ち',
      notificationLogsCreated: [],
    });

    expect(result.jobExecutionLog).toEqual({
      jobId: 'job_20240115_001',
      executionTimestamp: new Date('2024-01-15T09:00:00Z'),
      jobStatus: 'completed',
      metricsAggregationCompleted: true,
      notificationFilteringApplied: true,
      notificationsFiltered: 1,
      reason: '承認待ちステータスの改善提案は通知対象外',
    });

    expect(result.complianceCheck).toEqual({
      allAwaitingProposalsExcluded: true,
      noNotificationsForAwaitingStatus: true,
      auditLogRecorded: true,
      complianceStatus: 'passed',
    });
  });

  test('優先度付けが複数回スケジューラー実行でも通知が送信されない', () => {
    const improvementProposalId = 'proposal_002';
    const proposalStatus = '承認待ち';

    const firstJobRun = {
      weekStartDate: new Date('2024-01-08T00:00:00Z'),
      weekEndDate: new Date('2024-01-14T23:59:59Z'),
      metricsRecords: [
        {
          userId: 'user_003',
          proposalId: improvementProposalId,
          proposalStatus,
          successRate: 0.75,
          cookingTimeReductionDegree: 0.12,
          satisfactionScore: 4.0,
          metricsCollectedAt: new Date('2024-01-10T10:00:00Z'),
        },
      ],
      notificationSendingJobId: 'job_20240115_first',
      jobExecutionTimestamp: new Date('2024-01-15T09:00:00Z'),
    };

    const secondJobRun = {
      weekStartDate: new Date('2024-01-08T00:00:00Z'),
      weekEndDate: new Date('2024-01-14T23:59:59Z'),
      metricsRecords: [
        {
          userId: 'user_003',
          proposalId: improvementProposalId,
          proposalStatus,
          successRate: 0.75,
          cookingTimeReductionDegree: 0.12,
          satisfactionScore: 4.0,
          metricsCollectedAt: new Date('2024-01-10T10:00:00Z'),
        },
      ],
      notificationSendingJobId: 'job_20240115_second',
      jobExecutionTimestamp: new Date('2024-01-15T18:00:00Z'),
    };

    const resultFirst = aggregateWeeklyMetrics(firstJobRun);
    const resultSecond = aggregateWeeklyMetrics(secondJobRun);

    expect(resultFirst.notificationSendingResult.notificationsSentCount).toBe(0);
    expect(resultFirst.notificationSendingResult.proposalStatusIgnored).toBe(
      '承認待ち',
    );

    expect(resultSecond.notificationSendingResult.notificationsSentCount).toBe(
      0,
    );
    expect(resultSecond.notificationSendingResult.proposalStatusIgnored).toBe(
      '承認待ち',
    );

    expect(
      resultFirst.notificationSendingResult.notificationLogsCreated.length,
    ).toBe(0);
    expect(
      resultSecond.notificationSendingResult.notificationLogsCreated.length,
    ).toBe(0);

    expect(resultFirst.complianceCheck.noNotificationsForAwaitingStatus).toBe(
      true,
    );
    expect(resultSecond.complianceCheck.noNotificationsForAwaitingStatus).toBe(
      true,
    );
  });

  test('優先度付けステータスが承認待ち以外の場合、通知が送信される', () => {
    const improvementProposalId = 'proposal_003';
    const proposalStatus = '優先度付け完了';
    const weekStartDate = new Date('2024-01-08T00:00:00Z');
    const weekEndDate = new Date('2024-01-14T23:59:59Z');

    const weeklyMetricsData = {
      weekStartDate,
      weekEndDate,
      metricsRecords: [
        {
          userId: 'user_004',
          proposalId: improvementProposalId,
          proposalStatus,
          successRate: 0.85,
          cookingTimeReductionDegree: 0.2,
          satisfactionScore: 4.6,
          metricsCollectedAt: new Date('2024-01-12T11:20:00Z'),
        },
      ],
      notificationSendingJobId: 'job_20240115_approved',
      jobExecutionTimestamp: new Date('2024-01-15T09:00:00Z'),
    };

    const result = aggregateWeeklyMetrics(weeklyMetricsData);

    expect(result.notificationSendingResult.notificationsSentCount).toBe(1);
    expect(result.notificationSendingResult.proposalsWithAwaitingStatusCount).toBe(
      0,
    );
    expect(result.notificationSendingResult.notificationLogsCreated.length).toBe(
      1,
    );
    expect(result.notificationSendingResult.notificationLogsCreated[0]).toEqual(
      {
        proposalId: improvementProposalId,
        notificationStatus: 'sent',
        sentTimestamp: new Date('2024-01-15T09:00:00Z'),
      },
    );
  });

  test('混在シナリオ: 承認待ちと優先度付け完了の提案が存在する場合、優先度付け完了のみ通知される', () => {
    const awaitingProposalId = 'proposal_await_001';
    const completedProposalId = 'proposal_completed_001';
    const weekStartDate = new Date('2024-01-08T00:00:00Z');
    const weekEndDate = new Date('2024-01-14T23:59:59Z');

    const weeklyMetricsData = {
      weekStartDate,
      weekEndDate,
      metricsRecords: [
        {
          userId: 'user_005',
          proposalId: awaitingProposalId,
          proposalStatus: '承認待ち',
          successRate: 0.70,
          cookingTimeReductionDegree: 0.1,
          satisfactionScore: 3.8,
          metricsCollectedAt: new Date('2024-01-09T09:00:00Z'),
        },
        {
          userId: 'user_006',
          proposalId: completedProposalId,
          proposalStatus: '優先度付け完了',
          successRate: 0.88,
          cookingTimeReductionDegree: 0.22,
          satisfactionScore: 4.7,
          metricsCollectedAt: new Date('2024-01-13T16:30:00Z'),
        },
      ],
      notificationSendingJobId: 'job_20240115_mixed',
      jobExecutionTimestamp: new Date('2024-01-15T09:00:00Z'),
    };

    const result = aggregateWeeklyMetrics(weeklyMetricsData);

    expect(result.notificationSendingResult.notificationsSentCount).toBe(1);
    expect(result.notificationSendingResult.proposalsWithAwaitingStatusCount).toBe(
      1,
    );
    expect(result.notificationSendingResult.proposalIdWithAwaitingStatus).toBe(
      awaitingProposalId,
    );

    const sentNotifications = result.notificationSendingResult
      .notificationLogsCreated;
    expect(sentNotifications.length).toBe(1);
    expect(sentNotifications[0].proposalId).toBe(completedProposalId);
    expect(sentNotifications[0].notificationStatus).toBe('sent');
  });
});