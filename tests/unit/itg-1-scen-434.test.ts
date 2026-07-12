import { calculateImprovementDegree } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-434: [normal] アルゴリズム改善度判定機能 - 複数の定量指標（満足度スコア、完食度、却下率、調理時間短縮度）を前週比で計算し、改善度が最小閾値を超えたことを判定できる
  test("should calculate improvement degree across multiple quantitative metrics and determine overall improvement status", () => {
    // 前週データ
    const previousWeekData = {
      satisfactionScore: 75,
      completionRate: 80,
      rejectionRate: 15,
      averageCookingTimeMinutes: 30,
    };

    // 当週データ
    const currentWeekData = {
      satisfactionScore: 82,
      completionRate: 88,
      rejectionRate: 10,
      averageCookingTimeMinutes: 25,
    };

    // 改善度判定を実行
    const result = calculateImprovementDegree(previousWeekData, currentWeekData);

    // 満足度スコアの改善度を検証: (82-75)/75 = 0.0933... ≈ 9.33%
    expect(result.satisfactionScoreImprovement).toBeCloseTo(9.33, 1);

    // 完食度の改善度を検証: (88-80)/80 = 0.1 = 10%
    expect(result.completionRateImprovement).toBeCloseTo(10, 1);

    // 却下率の改善度を検証: (15-10)/15 = 0.3333... ≈ 33.33%
    expect(result.rejectionRateImprovement).toBeCloseTo(33.33, 1);

    // 調理時間短縮度を検証: (30-25)/30 = 0.1666... ≈ 16.67%
    expect(result.cookingTimeReductionDegree).toBeCloseTo(16.67, 1);

    // 最小閾値（5%）を超えていることを確認
    expect(result.satisfactionScoreImprovement).toBeGreaterThan(5);
    expect(result.completionRateImprovement).toBeGreaterThan(5);
    expect(result.rejectionRateImprovement).toBeGreaterThan(5);
    expect(result.cookingTimeReductionDegree).toBeGreaterThan(5);

    // 総合改善度スコアを検証（各指標の平均値）
    // (9.33 + 10 + 33.33 + 16.67) / 4 = 17.3325
    const expectedOverallScore = 17.33;
    expect(result.overallImprovementScore).toBeCloseTo(expectedOverallScore, 1);

    // 改善判定結果が『改善あり』であることを確認
    expect(result.improvementStatus).toBe("改善あり");

    // 結果の構造を検証
    expect(result).toHaveProperty("satisfactionScoreImprovement");
    expect(result).toHaveProperty("completionRateImprovement");
    expect(result).toHaveProperty("rejectionRateImprovement");
    expect(result).toHaveProperty("cookingTimeReductionDegree");
    expect(result).toHaveProperty("overallImprovementScore");
    expect(result).toHaveProperty("improvementStatus");
  });
});