import { executeDeploymentValidationGate } from '../../src/logic/it-1-1-1';

describe('本番デプロイ時の自動検証ゲート機能', () => {
  test('SCEN-567: 自動検証で不合格判定を受けた場合、デプロイがロールバックされる', () => {
    // 準備: テスト環境の本番デプロイプロセス前状態
    const deploymentConfig = {
      targetVersion: '2.1.0-prod',
      previousStableVersion: '2.0.5-prod',
      deploymentTimestamp: new Date('2024-02-15T10:30:00Z'),
      deploymentEnvironment: 'production'
    };

    const validationCriteria = {
      unitTestPassRate: 95,
      codeCoverageThreshold: 80,
      securityScanPassRequired: true,
      performanceRegressionAllowed: 5
    };

    const validationResults = {
      unitTestPassRate: 87,
      codeCoveragePercentage: 75,
      securityScanStatus: 'FAILED',
      performanceRegressionPercentage: 12,
      validationTimestamp: new Date('2024-02-15T10:35:00Z')
    };

    const previousApplicationState = {
      version: '2.0.5-prod',
      status: 'HEALTHY',
      lastDeploymentTime: new Date('2024-02-08T14:00:00Z'),
      healthCheckStatus: 'PASS'
    };

    // 実行: 自動検証ゲートを実行
    const result = executeDeploymentValidationGate({
      deploymentConfig,
      validationCriteria,
      validationResults,
      previousApplicationState
    });

    // 検証: 自動検証ゲートが不合格判定を出力することを確認
    expect(result.validationGateStatus).toBe('REJECTED');
    expect(result.deploymentProceeded).toBe(false);

    // 検証: デプロイプロセスが中断されることを確認
    expect(result.deploymentInterrupted).toBe(true);
    expect(result.deploymentInterruptionReason).toContain('セキュリティスキャン');

    // 検証: ロールバック実行が確認されることを確認
    expect(result.rollbackExecuted).toBe(true);
    expect(result.rollbackTargetVersion).toBe('2.0.5-prod');
    expect(result.rollbackTimestamp).toBeDefined();

    // 検証: ロールバック後、アプリケーションが正常に動作していることを確認
    expect(result.postRollbackHealthStatus).toBe('HEALTHY');
    expect(result.postRollbackHealthCheckPass).toBe(true);

    // 検証: ロールバック関連のログが適切に記録されていることを確認
    expect(result.rollbackLogEntries).toBeDefined();
    expect(result.rollbackLogEntries.length).toBeGreaterThan(0);
    expect(result.rollbackLogEntries[0]).toMatchObject({
      logLevel: 'ERROR',
      message: expect.stringMatching(/ロールバック/)
    });

    // 検証: 警告通知が適切に送信されていることを確認
    expect(result.notificationSent).toBe(true);
    expect(result.notificationType).toBe('DEPLOYMENT_ROLLBACK_ALERT');
    expect(result.notificationRecipients).toEqual(expect.arrayContaining(['dev-team', 'ops-team']));

    // 検証: 自動検証の不合格項目が詳細に記録されていることを確認
    expect(result.validationFailures).toBeDefined();
    expect(result.validationFailures.length).toBe(3);
    expect(result.validationFailures).toContainEqual(
      expect.objectContaining({
        criterion: 'unitTestPassRate',
        expected: 95,
        actual: 87,
        isFailed: true
      })
    );
    expect(result.validationFailures).toContainEqual(
      expect.objectContaining({
        criterion: 'codeCoverageThreshold',
        expected: 80,
        actual: 75,
        isFailed: true
      })
    );
    expect(result.validationFailures).toContainEqual(
      expect.objectContaining({
        criterion: 'securityScanPassRequired',
        expected: true,
        actual: false,
        isFailed: true
      })
    );

    // 検証: ロールバック完了後のアプリケーション状態が直前の安定版と一致することを確認
    expect(result.finalApplicationVersion).toBe('2.0.5-prod');
    expect(result.deploymentStatus).toBe('ROLLED_BACK');
  });
});