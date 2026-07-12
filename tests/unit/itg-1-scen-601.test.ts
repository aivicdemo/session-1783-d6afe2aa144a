import { evaluateAlgorithmImprovement } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-601
  test("[normal] アルゴリズム改善効果判定・優先度決定機能 - 改善後の成功率が最小閾値以上かつ改善目標値に向けて進捗している場合、改善承認と次優先度が決定される", () => {
    const preImprovementSuccessRate = 0.70;
    const postImprovementSuccessRate = 0.75;
    const minimumThreshold = 0.72;
    const improvementTarget = 0.80;
    const priorityList = ["high", "medium", "low"];

    const result = evaluateAlgorithmImprovement({
      preImprovementSuccessRate,
      postImprovementSuccessRate,
      minimumThreshold,
      improvementTarget,
      priorityList,
    });

    expect(result.isApproved).toBe(true);
    expect(postImprovementSuccessRate).toBeGreaterThanOrEqual(minimumThreshold);
    expect(postImprovementSuccessRate).toBeGreaterThan(preImprovementSuccessRate);
    expect(postImprovementSuccessRate).toBeLessThan(improvementTarget);
    expect(result.nextPriority).toBe("medium");
    expect(priorityList).toContain(result.nextPriority);
    expect(result.progressPercentage).toBe(
      ((postImprovementSuccessRate - preImprovementSuccessRate) / (improvementTarget - preImprovementSuccessRate)) * 100
    );
  });
});