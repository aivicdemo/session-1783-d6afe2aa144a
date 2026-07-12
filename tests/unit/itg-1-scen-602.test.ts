import { evaluateAlgorithmImprovement } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-602: [error] アルゴリズム改善効果判定・優先度決定機能 - 改善後の成功率が最小閾値未満の場合、改善却下またはさらなる検証が必要と判定される
  test("should reject algorithm improvement and record rejection reason when post-improvement success rate falls below minimum threshold", () => {
    const minSuccessRateThreshold = 80;
    const baselineSuccessRate = 75;
    const postImprovementSuccessRate = 72;
    const testDatasetCount = 150;
    const expectedStatus = "rejected";
    const expectedRejectionReason = "成功率が最小閾値未満";

    const result = evaluateAlgorithmImprovement({
      baselineSuccessRate,
      postImprovementSuccessRate,
      minSuccessRateThreshold,
      testDatasetCount,
      evaluationTimestamp: new Date("2024-02-15T10:30:00Z"),
    });

    expect(result.status).toBe(expectedStatus);
    expect(result.successRateImprovement).toBe(-3);
    expect(result.isAboveMinimumThreshold).toBe(false);
    expect(result.rejectionReason).toBe(expectedRejectionReason);
    expect(result.recommendedAction).toBe("さらなる検証が必要");
    expect(result.evaluationLog).toMatch(/成功率が最小閾値未満/);
    expect(result.evaluationLog).toMatch(/72/);
    expect(result.evaluationLog).toMatch(/80/);
  });
});