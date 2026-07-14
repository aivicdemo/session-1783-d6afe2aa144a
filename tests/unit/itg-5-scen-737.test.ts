import { notifyImprovementProposalWithRetry } from '../../src/logic/it-7-3-1';

describe('改善提案優先度スコアリング通知機能 - SLA期限超過時のリトライ処理', () => {
  test('SCEN-737: SLA期限（5営業日）を超過した提案の通知リトライを正しく処理できる', () => {
    // テスト環境初期化
    const now = new Date('2024-01-15T09:00:00Z');
    const slaLimitDays = 5;
    const businessDaysInMs = slaLimitDays * 24 * 60 * 60 * 1000;

    // SLA期限超過日時の計算（5営業日超過）
    const proposalCreatedAt = new Date(now.getTime() - (businessDaysInMs + 24 * 60 * 60 * 1000));
    const proposalId = 'proposal_001';
    const developmentTeamId = 'team_dev_001';

    const proposal = {
      id: proposalId,
      title: '栄養基準ロジック改善提案',
      createdAt: proposalCreatedAt,
      status: 'pending_notification',
      priorityScore: 85,
      developmentTeamId: developmentTeamId,
      notificationHistory: [] as Array<{
        attemptNumber: number;
        timestamp: string;
        status: 'success' | 'failed' | 'retry';
        errorMessage?: string;
        retryInterval?: number;
      }>,
    };

    const retryConfig = {
      maxRetries: 3,
      initialRetryIntervalMs: 60000, // 1分
      backoffMultiplier: 2,
      slaLimitMs: businessDaysInMs,
    };

    // 通知リトライ処理を実行
    const result = notifyImprovementProposalWithRetry(proposal, retryConfig, now);

    // 1) 各リトライが設定された間隔で実行されたことを検証
    expect(result.notificationAttempts).toBe(3);
    expect(result.notifications[0].attemptNumber).toBe(1);
    expect(result.notifications[1].attemptNumber).toBe(2);
    expect(result.notifications[2].attemptNumber).toBe(3);

    // リトライ間隔の検証（初期: 1分、2回目: 2分、3回目: 4分）
    const firstRetryTimestamp = new Date(result.notifications[0].timestamp);
    const secondRetryTimestamp = new Date(result.notifications[1].timestamp);
    const thirdRetryTimestamp = new Date(result.notifications[2].timestamp);

    const interval1To2Ms = secondRetryTimestamp.getTime() - firstRetryTimestamp.getTime();
    const interval2To3Ms = thirdRetryTimestamp.getTime() - secondRetryTimestamp.getTime();

    expect(interval1To2Ms).toBe(120000); // 2分 (60000 * 2)
    expect(interval2To3Ms).toBe(240000); // 4分 (60000 * 2 * 2)

    // 2) リトライ回数が設定上限を超えないことを検証
    expect(result.notificationAttempts).toBeLessThanOrEqual(retryConfig.maxRetries);

    // 3) 最大リトライ回数に達した場合、管理者への警告通知が生成されたことを検証
    expect(result.adminAlertGenerated).toBe(true);
    expect(result.adminAlert).toEqual({
      type: 'proposal_notification_retry_limit_exceeded',
      proposalId: proposalId,
      developmentTeamId: developmentTeamId,
      message: `改善提案 ${proposalId} の通知リトライが上限（${retryConfig.maxRetries}回）に到達しました。`,
      severity: 'high',
      timestamp: expect.any(String),
    });

    // 4) 全リトライ処理の詳細ログが記録されていることを検証
    expect(result.detailedLogs).toBeDefined();
    expect(result.detailedLogs.length).toBe(3);

    result.detailedLogs.forEach((log, index) => {
      expect(log).toEqual({
        attemptNumber: index + 1,
        proposalId: proposalId,
        timestamp: expect.any(String),
        status: index < 2 ? 'failed' : 'final_failure',
        retryIntervalMs: index === 0 ? 60000 : index === 1 ? 120000 : 240000,
        elapsedTimeFromCreationMs: expect.any(Number),
        isSlaBreach: true,
      });
    });

    // 5) 最終的に提案のステータスが適切に更新されていることを検証
    expect(result.finalProposalStatus).toBe('notification_failed_max_retries_exceeded');
    expect(result.proposalUpdatedAt).toBeDefined();

    // SLA超過状況の詳細検証
    expect(result.isSlaBreach).toBe(true);
    expect(result.slaBreach).toEqual({
      breachDays: 1, // 5営業日超過 + 1日 = 6営業日経過
      slaPeriodMs: businessDaysInMs,
      totalElapsedMs: expect.any(Number),
      breachPercentage: expect.any(Number),
    });

    // リトライ構成の適用確認
    expect(result.retryConfigApplied).toEqual({
      maxRetries: retryConfig.maxRetries,
      initialRetryIntervalMs: retryConfig.initialRetryIntervalMs,
      backoffMultiplier: retryConfig.backoffMultiplier,
      slaLimitMs: retryConfig.slaLimitMs,
    });

    // 監査ログ記録の確認
    expect(result.auditLogEntries).toBeDefined();
    expect(result.auditLogEntries.length).toBeGreaterThanOrEqual(3);

    result.auditLogEntries.forEach((entry) => {
      expect(entry).toEqual({
        eventType: 'proposal_notification_retry_attempt',
        proposalId: proposalId,
        timestamp: expect.any(String),
        details: {
          attemptNumber: expect.any(Number),
          status: expect.stringMatching(/^(failed|final_failure)$/),
          retryIntervalMs: expect.any(Number),
        },
      });
    });

    // 最終ステータスが「通知失敗（最大リトライ超過）」であることを確認
    expect(result.finalProposalStatus).toBe('notification_failed_max_retries_exceeded');

    // 管理者アラートが発火していることを確認
    expect(result.adminAlert.type).toBe('proposal_notification_retry_limit_exceeded');
    expect(result.adminAlert.severity).toBe('high');
  });
});