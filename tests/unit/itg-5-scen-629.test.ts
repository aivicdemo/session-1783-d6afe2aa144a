import { integrateImprovedAlgorithm } from "../../src/logic/it-7-2-1";

describe("献立生成アルゴリズムの改善統合デプロイ機能", () => {
  // SCEN-629: [normal] アルゴリズム改善・統合デプロイ機能 - 改善アルゴリズムが検証完了状態から本番ロジックに正常に統合される
  test("改善アルゴリズムが検証完了状態から本番ロジックに正常に統合される", () => {
    // テストデータ: 検証完了状態の改善アルゴリズム
    const improvedAlgorithmId = "algo_v2_20240115";
    const improvedAlgorithmVersion = "v2.1.0";
    const verificationStatus = "verified";
    const verificationCompletedAt = "2024-01-14T18:30:00Z";
    const successRateImprovement = 8.5; // 8.5% 向上
    const cookingTimeReduction = 12.3; // 12.3分短縮
    const satisfactionScoreGain = 0.7; // 0.7ポイント向上
    const implementationDetails = {
      nutritionBalanceOptimization: true,
      familyPreferenceWeighting: true,
      ingredientInventoryCheck: true,
    };

    // 改善アルゴリズムの詳細情報を確認
    const algorithmDetails = {
      id: improvedAlgorithmId,
      version: improvedAlgorithmVersion,
      status: verificationStatus,
      verificationCompletedAt: verificationCompletedAt,
      metrics: {
        successRateImprovement: successRateImprovement,
        cookingTimeReduction: cookingTimeReduction,
        satisfactionScoreGain: satisfactionScoreGain,
      },
      implementationDetails: implementationDetails,
    };

    // 統合デプロイ機能を実行
    const integrationResult = integrateImprovedAlgorithm({
      improvedAlgorithmId: improvedAlgorithmId,
      algorithmDetails: algorithmDetails,
      integrationTimestamp: "2024-01-15T09:00:00Z",
    });

    // 統合処理が正常に完了したことを検証（エラーがないことを確認）
    expect(integrationResult.status).toBe("success");
    expect(integrationResult.error).toBeNull();

    // 統合後、本番ロジックに改善アルゴリズムが正しくマージされたことを検証
    expect(integrationResult.deployedAlgorithmId).toBe(improvedAlgorithmId);
    expect(integrationResult.deployedVersion).toBe(improvedAlgorithmVersion);
    expect(integrationResult.productionStatus).toBe("active");

    // 本番ロジック内の対象箇所で、改善アルゴリズムの処理内容が正しく反映されていることを確認
    expect(integrationResult.deployedImplementationDetails).toEqual({
      nutritionBalanceOptimization: true,
      familyPreferenceWeighting: true,
      ingredientInventoryCheck: true,
    });

    // 統合前後での処理結果の差分を比較し、改善が適用されていることを検証
    const preIntegrationSuccessRate = 82.5; // 改善前: 82.5%
    const expectedPostIntegrationSuccessRate = preIntegrationSuccessRate + successRateImprovement; // 82.5 + 8.5 = 91.0
    expect(integrationResult.projectedPostIntegrationMetrics.successRate).toBe(91.0);

    const preIntegrationCookingTime = 45.8; // 改善前: 45.8分
    const expectedPostIntegrationCookingTime = preIntegrationCookingTime - cookingTimeReduction; // 45.8 - 12.3 = 33.5
    expect(integrationResult.projectedPostIntegrationMetrics.cookingTime).toBe(33.5);

    const preIntegrationSatisfactionScore = 4.2; // 改善前: 4.2点
    const expectedPostIntegrationSatisfactionScore = preIntegrationSatisfactionScore + satisfactionScoreGain; // 4.2 + 0.7 = 4.9
    expect(integrationResult.projectedPostIntegrationMetrics.satisfactionScore).toBe(4.9);

    // システムログまたは統合履歴に、統合操作の記録が正しく保存されていることを確認
    expect(integrationResult.integrationLog).toBeDefined();
    expect(integrationResult.integrationLog.operationId).toBeTruthy();
    expect(integrationResult.integrationLog.algorithmId).toBe(improvedAlgorithmId);
    expect(integrationResult.integrationLog.integrationTimestamp).toBe("2024-01-15T09:00:00Z");
    expect(integrationResult.integrationLog.integrationStatus).toBe("completed");
    expect(integrationResult.integrationLog.previousVersion).toBeDefined();
    expect(integrationResult.integrationLog.newVersion).toBe(improvedAlgorithmVersion);

    // 統合後のアルゴリズムバージョンが本番環境で正しく反映されていることを確認
    expect(integrationResult.currentProductionAlgorithmVersion).toBe(improvedAlgorithmVersion);

    // 統合後のシステム状態を検証（本番環境での稼働確認）
    expect(integrationResult.isProductionActive).toBe(true);
    expect(integrationResult.rollbackAvailable).toBe(true);
  });
});