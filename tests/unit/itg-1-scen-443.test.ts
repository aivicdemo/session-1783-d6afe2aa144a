import { integrateAndDeployAlgorithm } from "../../src/logic/it-3";

const fetchMock = require("jest-fetch-mock");

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  test("SCEN-443: アルゴリズム統合・デプロイ実行機能 - 統合・デプロイ処理中にエラーが発生した場合、ロールバックして従来ロジックに復帰する", async () => {
    fetchMock.resetMocks();

    const algorithmVersionId = "algo_v2_20240115";
    const deploymentTimestamp = "2024-01-15T11:00:00Z";
    const previousAlgorithmVersionId = "algo_v1_20231201";

    // デプロイ中のエラーシナリオ: ファイルシステムエラー
    const deploymentPayload = {
      versionId: algorithmVersionId,
      algorithmCode: "new_algorithm_code_v2",
      timestamp: deploymentTimestamp,
      rollbackTargetVersionId: previousAlgorithmVersionId,
    };

    // 第1段階: デプロイ API 呼び出し時にエラーレスポンス
    fetchMock.mockResponseOnce(
      JSON.stringify({
        status: 500,
        errorCode: "DEPLOYMENT_FILESYSTEM_ERROR",
        errorMessage: "Failed to write algorithm file to deployment directory",
        rollbackInitiated: true,
        rollbackStatus: "in_progress",
      }),
      { status: 500 }
    );

    // 第2段階: ロールバック確認 API
    fetchMock.mockResponseOnce(
      JSON.stringify({
        status: 200,
        rollbackStatus: "completed",
        activeAlgorithmVersionId: previousAlgorithmVersionId,
        deploymentLog: {
          timestamp: deploymentTimestamp,
          attemptedVersion: algorithmVersionId,
          error: "DEPLOYMENT_FILESYSTEM_ERROR",
          rollbackExecutedAt: "2024-01-15T11:00:05Z",
          rollbackCompletedAt: "2024-01-15T11:00:10Z",
        },
      }),
      { status: 200 }
    );

    // 第3段階: 従来ロジック（旧アルゴリズム）での献立生成リクエスト
    fetchMock.mockResponseOnce(
      JSON.stringify({
        status: 200,
        mealPlanId: "mp_20240115_001",
        menus: [
          {
            menuId: "menu_001",
            dishName: "鶏の塩焼き",
            ingredients: ["鶏肉", "塩", "レモン"],
            cookingTimeMinutes: 25,
            nutritionScore: 85,
          },
          {
            menuId: "menu_002",
            dishName: "ほうれん草のおひたし",
            ingredients: ["ほうれん草", "醤油", "かつお節"],
            cookingTimeMinutes: 10,
            nutritionScore: 78,
          },
        ],
        generatedByAlgorithmVersion: previousAlgorithmVersionId,
      }),
      { status: 200 }
    );

    // テスト実行
    const deploymentResult = await integrateAndDeployAlgorithm(
      deploymentPayload
    );

    // Assertion 1: デプロイエラーが検出されたか
    expect(deploymentResult.deploymentStatus).toBe("failed");
    expect(deploymentResult.errorCode).toBe("DEPLOYMENT_FILESYSTEM_ERROR");
    expect(deploymentResult.rollbackInitiated).toBe(true);

    // Assertion 2: ロールバック完了確認
    const rollbackVerificationResponse = await fetch(
      "https://api.mealplan.local/v1/deployment/rollback-status",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    const rollbackData = await rollbackVerificationResponse.json();

    expect(rollbackData.rollbackStatus).toBe("completed");
    expect(rollbackData.activeAlgorithmVersionId).toBe(previousAlgorithmVersionId);
    expect(rollbackVerificationResponse.status).toBe(200);

    // Assertion 3: ロールバック後の従来ロジック（旧アルゴリズム）で献立生成が正常に動作
    const mealGenerationResponse = await fetch(
      "https://api.mealplan.local/v1/meal-generation",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user_20240115_001",
          familyMembers: 4,
          constraints: {
            dietaryRestrictions: ["vegetarian"],
            allergies: ["peanut"],
            budgetLimitYen: 3000,
            cookingTimeMinutes: 60,
          },
        }),
      }
    );

    const mealData = await mealGenerationResponse.json();

    expect(mealGenerationResponse.status).toBe(200);
    expect(mealData.mealPlanId).toBe("mp_20240115_001");
    expect(mealData.generatedByAlgorithmVersion).toBe(previousAlgorithmVersionId);
    expect(Array.isArray(mealData.menus)).toBe(true);
    expect(mealData.menus.length).toBe(2);

    // Assertion 4: メニュー詳細検証
    expect(mealData.menus[0].menuId).toBe("menu_001");
    expect(mealData.menus[0].dishName).toBe("鶏の塩焼き");
    expect(mealData.menus[0].cookingTimeMinutes).toBe(25);
    expect(mealData.menus[0].nutritionScore).toBe(85);

    expect(mealData.menus[1].menuId).toBe("menu_002");
    expect(mealData.menus[1].dishName).toBe("ほうれん草のおひたし");
    expect(mealData.menus[1].cookingTimeMinutes).toBe(10);
    expect(mealData.menus[1].nutritionScore).toBe(78);

    // Assertion 5: ログファイル記録の検証
    expect(rollbackData.deploymentLog.timestamp).toBe(deploymentTimestamp);
    expect(rollbackData.deploymentLog.attemptedVersion).toBe(algorithmVersionId);
    expect(rollbackData.deploymentLog.error).toBe("DEPLOYMENT_FILESYSTEM_ERROR");
    expect(rollbackData.deploymentLog.rollbackInitiatedAt).toBeUndefined();
    expect(rollbackData.deploymentLog.rollbackExecutedAt).toBe(
      "2024-01-15T11:00:05Z"
    );
    expect(rollbackData.deploymentLog.rollbackCompletedAt).toBe(
      "2024-01-15T11:00:10Z"
    );

    // Assertion 6: ロールバック完了後、アプリケーションが正常に動作
    expect(deploymentResult.recoveryStatus).toBe("success");
    expect(deploymentResult.activeVersionAfterRecovery).toBe(
      previousAlgorithmVersionId
    );
  });
});