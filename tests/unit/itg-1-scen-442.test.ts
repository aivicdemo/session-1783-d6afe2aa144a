import { integrateAndDeployAlgorithm } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-442
  test("改善されたアルゴリズムを献立生成ロジックに統合・デプロイし、翌週の献立生成から新ロジックが適用される", () => {
    const algorithmPayload = {
      algorithmVersionId: "algo_v2_20240115",
      algorithmCode: `
        function generateMenuWithImprovement(constraints) {
          const nutritionBoost = 1.15;
          const diversityFactor = 1.2;
          const satisfactionTarget = 85;
          return {
            menus: optimizeByConstraints(constraints, nutritionBoost, diversityFactor),
            satisfactionScore: satisfactionTarget
          };
        }
      `,
      testResultsPassed: true,
      regressionTestsPassed: true,
      deploymentTargetDate: "2024-01-22T00:00:00Z",
    };

    const deploymentContext = {
      currentDate: "2024-01-15T10:00:00Z",
      targetWeekStartDate: "2024-01-22T00:00:00Z",
      userSegments: ["homemaker_30s", "homemaker_40s", "homemaker_50s"],
      stagingDeploymentCompleted: true,
      minRequiredTestPass: 100,
    };

    const menuGenerationBefore = {
      menuId: "menu_pre_v1",
      satisfactionScore: 72,
      nutritionBalanceScore: 68,
      foodDiversityScore: 65,
      constraintComplianceRate: 92,
      algorithmVersionApplied: "algo_v1_20231201",
      generatedDate: "2024-01-08T09:00:00Z",
    };

    const result = integrateAndDeployAlgorithm({
      algorithmPayload,
      deploymentContext,
      menuGenerationBefore,
    });

    expect(result.deploymentStatus).toBe("success");
    expect(result.algorithmVersionDeployed).toBe("algo_v2_20240115");
    expect(result.deploymentTimestamp).toBe("2024-01-15T10:00:00Z");
    expect(result.targetWeekStartDate).toBe("2024-01-22T00:00:00Z");
    expect(result.regressionTestVerified).toBe(true);
    expect(result.integrationTestsPassRate).toBe(100);

    const menuGenerationAfter = result.menuGenerationAfter;
    expect(menuGenerationAfter.algorithmVersionApplied).toBe("algo_v2_20240115");
    expect(menuGenerationAfter.generatedDate).toBe("2024-01-22T09:00:00Z");

    expect(menuGenerationAfter.satisfactionScore).toBeGreaterThanOrEqual(85);
    expect(menuGenerationAfter.satisfactionScore).toBe(87);

    expect(menuGenerationAfter.nutritionBalanceScore).toBeGreaterThan(
      menuGenerationBefore.nutritionBalanceScore
    );
    expect(menuGenerationAfter.nutritionBalanceScore).toBe(78);

    expect(menuGenerationAfter.foodDiversityScore).toBeGreaterThan(
      menuGenerationBefore.foodDiversityScore
    );
    expect(menuGenerationAfter.foodDiversityScore).toBe(78);

    expect(menuGenerationAfter.constraintComplianceRate).toBeGreaterThanOrEqual(
      92
    );
    expect(menuGenerationAfter.constraintComplianceRate).toBe(96);

    const improvementMetrics = result.improvementMetrics;
    expect(improvementMetrics.satisfactionScoreDelta).toBe(15);
    expect(improvementMetrics.nutritionBalanceImprovement).toBe(10);
    expect(improvementMetrics.foodDiversityImprovement).toBe(13);
    expect(improvementMetrics.constraintComplianceImprovement).toBe(4);

    expect(result.deploymentCompletedForAllSegments).toBe(true);
    expect(result.newLogicAppliedFromDate).toBe("2024-01-22T00:00:00Z");
    expect(result.rollbackAvailable).toBe(true);
    expect(result.previousAlgorithmVersion).toBe("algo_v1_20231201");

    const deploymentLog = result.deploymentLog;
    expect(deploymentLog.integrationPhaseCompleted).toBe(true);
    expect(deploymentLog.testingPhaseCompleted).toBe(true);
    expect(deploymentLog.productionDeploymentCompleted).toBe(true);
    expect(deploymentLog.allConstraintsValidated).toBe(true);
  });
});