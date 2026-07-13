import { validateAlgorithmImprovement } from "../../src/logic/it-1-br-2-1-1-1";

describe("アルゴリズム改善成功判定・次優先度決定", () => {
  // SCEN-589
  test("改善後の成功率が最小閾値以上かつ改善目標値に向けて進捗している場合に承認判定される", () => {
    // 初期化: 改善評価パラメータを設定
    const baselineSuccessRate = 70;
    const minimumThreshold = 75;
    const improvementTarget = 85;
    const improvedSuccessRate = 78;

    // 改善後の成功率が最小閾値以上であるか検証
    expect(improvedSuccessRate).toBeGreaterThanOrEqual(minimumThreshold);

    // 改善後の成功率がベースラインより向上しているか確認
    expect(improvedSuccessRate).toBeGreaterThan(baselineSuccessRate);

    // 改善目標値に向けた進捗率を計算
    const progressTowardTarget =
      (improvedSuccessRate - baselineSuccessRate) /
      (improvementTarget - baselineSuccessRate);

    // 期待値: (78 - 70) / (85 - 70) = 8 / 15 = 0.5333...
    expect(progressTowardTarget).toBeCloseTo(0.5333, 3);

    // 進捗率がプラスの値であるか検証
    expect(progressTowardTarget).toBeGreaterThan(0);

    // 承認判定ロジックの実行
    const evaluationInput = {
      baselineSuccessRate,
      minimumThreshold,
      improvementTarget,
      improvedSuccessRate,
    };

    const result = validateAlgorithmImprovement(evaluationInput);

    // 承認フラグがtrueを返すことを検証
    expect(result.isApproved).toBe(true);

    // 改善状況が正常に記録されることを検証
    expect(result.progressRate).toBeCloseTo(0.5333, 3);
    expect(result.meetMinimumThreshold).toBe(true);
    expect(result.improvementConfirmed).toBe(true);
    expect(result.nextPriorityDecisionTriggered).toBe(true);
  });
});