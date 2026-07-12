import { validateDeploymentGate } from "../../src/logic/it-1-1-1";

describe("本番デプロイ時の自動検証ゲート機能のエラーハンドリング", () => {
  // SCEN-569
  test("自動検証プロセスが失敗した場合、例外をキャッチしエラーログに記録、ユーザーにエラーメッセージを返す", () => {
    const deploymentContext = {
      algorithmVersion: "v2.1.0",
      previousSuccessRate: 85.5,
      minSuccessRateThreshold: 80.0,
      deploymentEnvironment: "production",
      isSimulatedDatabaseFailure: true,
    };

    const result = validateDeploymentGate(deploymentContext);

    // エラーハンドリングが正常に動作し、例外がキャッチされている
    expect(result.success).toBe(false);

    // エラーメッセージが明確に返される（「データベース」という業務キーワードをマッチ）
    expect(result.errorMessage).toMatch(/データベース/);

    // エラーログが記録されている
    expect(result.errorLogRecorded).toBe(true);

    // エラーログには詳細情報（スタックトレース等）が含まれている
    expect(result.errorDetails).toBeDefined();
    expect(result.errorDetails.length).toBeGreaterThan(0);

    // デプロイプロセスが安全に停止している
    expect(result.deploymentStatus).toBe("stopped");

    // システムが一貫性のある状態を保っている（既存のアルゴリズムがロールバック不要で維持されている）
    expect(result.currentDeployedVersion).toBe("v2.0.9");

    // リカバリー手順が実行可能な状態にある
    expect(result.recoveryActionRequired).toBe(true);
    expect(result.recoverySteps).toEqual([
      "データベース接続確認",
      "ネットワーク接続確認",
      "ログファイル確認",
    ]);

    // ユーザーへの通知が正しく準備されている
    expect(result.userNotificationPrepared).toBe(true);
    expect(result.userFacingMessage).toMatch(/一時的な問題が発生しました/);
  });

  test("外部API呼び出し失敗時、エラーハンドリングが正常に動作する", () => {
    const deploymentContext = {
      algorithmVersion: "v2.1.0",
      previousSuccessRate: 85.5,
      minSuccessRateThreshold: 80.0,
      deploymentEnvironment: "production",
      isSimulatedExternalApiFailure: true,
    };

    const result = validateDeploymentGate(deploymentContext);

    expect(result.success).toBe(false);
    expect(result.errorMessage).toMatch(/API/);
    expect(result.errorLogRecorded).toBe(true);
    expect(result.deploymentStatus).toBe("stopped");
    expect(result.recoveryActionRequired).toBe(true);
  });

  test("タイムアウト発生時、エラーハンドリングが正常に動作する", () => {
    const deploymentContext = {
      algorithmVersion: "v2.1.0",
      previousSuccessRate: 85.5,
      minSuccessRateThreshold: 80.0,
      deploymentEnvironment: "production",
      isSimulatedTimeout: true,
    };

    const result = validateDeploymentGate(deploymentContext);

    expect(result.success).toBe(false);
    expect(result.errorMessage).toMatch(/タイムアウト/);
    expect(result.errorLogRecorded).toBe(true);
    expect(result.deploymentStatus).toBe("stopped");
    expect(result.recoveryActionRequired).toBe(true);
    expect(result.currentDeployedVersion).toBe("v2.0.9");
  });

  test("検証プロセス成功時、デプロイが進行可能な状態になる", () => {
    const deploymentContext = {
      algorithmVersion: "v2.1.0",
      previousSuccessRate: 85.5,
      minSuccessRateThreshold: 80.0,
      deploymentEnvironment: "production",
      isSimulatedDatabaseFailure: false,
      isSimulatedExternalApiFailure: false,
      isSimulatedTimeout: false,
    };

    const result = validateDeploymentGate(deploymentContext);

    expect(result.success).toBe(true);
    expect(result.errorLogRecorded).toBe(false);
    expect(result.deploymentStatus).toBe("proceed");
    expect(result.recoveryActionRequired).toBe(false);
    expect(result.userNotificationPrepared).toBe(false);
  });
});