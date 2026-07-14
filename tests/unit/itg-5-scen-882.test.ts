import { calculateAlgorithmImprovementMetrics } from "../../src/logic/it-7-2-1";

describe("アルゴリズム改善指標の定量比較", () => {
  // SCEN-882: [edge] アルゴリズム改善指標の定量比較 - 改善指標の値が0の場合に改善なしと判定される
  test("改善指標の値が0の場合、改善なしと正しく判定される", () => {
    const metricsBeforeImprovement = {
      successRate: 75.5,
      cookingTimeReduction: 12.3,
      userSatisfactionScore: 4.2,
    };

    const metricsAfterImprovement = {
      successRate: 75.5,
      cookingTimeReduction: 12.3,
      userSatisfactionScore: 4.2,
    };

    const result = calculateAlgorithmImprovementMetrics(
      metricsBeforeImprovement,
      metricsAfterImprovement
    );

    expect(result.successRateDifference).toBe(0);
    expect(result.cookingTimeReductionDifference).toBe(0);
    expect(result.userSatisfactionScoreDifference).toBe(0);
    expect(result.hasImprovement).toBe(false);
    expect(result.improvementLevel).toBe("改善なし");
    expect(result.totalImprovementScore).toBe(0);
    expect(result.comparisonStatus).toBe("no_change");
  });
});