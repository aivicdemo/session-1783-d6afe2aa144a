import { calculateAlgorithmImprovementMetrics } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザー食事記録と栄養摂取量の推移データ分析ダッシュボード", () => {
  // SCEN-575: [edge] アルゴリズム改善効果定量指標算出 - ユーザー満足度スコアが0〜100の境界値で正しく計算される
  test("should calculate algorithm improvement metrics correctly for boundary values (0, 50, 100) of user satisfaction score", () => {
    // テストデータ: ユーザー満足度スコアの境界値を準備
    const satisfactionScoreMin = 0;
    const satisfactionScoreMid = 50;
    const satisfactionScoreMax = 100;

    // 改善効果計算に必要な補助データ（正規化済み）
    const metricsInput = {
      mealGenerationSuccessRateImprovement: 0.15, // 改善前後の成功率改善: 15%
      cookingTimeReductionDegree: 0.25, // 調理時間短縮度: 25%
      weeklyComparison: 1.2, // 前週比: 1.2倍
    };

    // ケース1: ユーザー満足度スコア = 0（最小値）の場合
    const resultMin = calculateAlgorithmImprovementMetrics({
      userSatisfactionScore: satisfactionScoreMin,
      mealGenerationSuccessRateImprovement:
        metricsInput.mealGenerationSuccessRateImprovement,
      cookingTimeReductionDegree: metricsInput.cookingTimeReductionDegree,
      weeklyComparison: metricsInput.weeklyComparison,
    });

    // ケース2: ユーザー満足度スコア = 50（中間値）の場合
    const resultMid = calculateAlgorithmImprovementMetrics({
      userSatisfactionScore: satisfactionScoreMid,
      mealGenerationSuccessRateImprovement:
        metricsInput.mealGenerationSuccessRateImprovement,
      cookingTimeReductionDegree: metricsInput.cookingTimeReductionDegree,
      weeklyComparison: metricsInput.weeklyComparison,
    });

    // ケース3: ユーザー満足度スコア = 100（最大値）の場合
    const resultMax = calculateAlgorithmImprovementMetrics({
      userSatisfactionScore: satisfactionScoreMax,
      mealGenerationSuccessRateImprovement:
        metricsInput.mealGenerationSuccessRateImprovement,
      cookingTimeReductionDegree: metricsInput.cookingTimeReductionDegree,
      weeklyComparison: metricsInput.weeklyComparison,
    });

    // 計算式: 改善効果 = (成功率改善 * 0.4 + 調理時間短縮度 * 0.35 + (週比 - 1) * 10 * 0.25) * (ユーザー満足度 / 100)
    // resultMin: (0.15 * 0.4 + 0.25 * 0.35 + 0.2 * 10 * 0.25) * (0 / 100) = 0
    // resultMid: (0.06 + 0.0875 + 0.5) * (50 / 100) = 0.7475 * 0.5 = 0.37375 → 37.375 (%)
    // resultMax: (0.06 + 0.0875 + 0.5) * (100 / 100) = 0.7475 * 1.0 = 0.7475 → 74.75 (%)

    // 検証1: 各境界値に対する計算結果の確認
    expect(resultMin.improvementEffectScore).toBe(0);
    expect(resultMid.improvementEffectScore).toBeCloseTo(37.375, 2);
    expect(resultMax.improvementEffectScore).toBeCloseTo(74.75, 2);

    // 検証2: すべての計算結果が0〜100の有効範囲内に収まっているか確認
    expect(resultMin.improvementEffectScore).toBeGreaterThanOrEqual(0);
    expect(resultMin.improvementEffectScore).toBeLessThanOrEqual(100);
    expect(resultMid.improvementEffectScore).toBeGreaterThanOrEqual(0);
    expect(resultMid.improvementEffectScore).toBeLessThanOrEqual(100);
    expect(resultMax.improvementEffectScore).toBeGreaterThanOrEqual(0);
    expect(resultMax.improvementEffectScore).toBeLessThanOrEqual(100);

    // 検証3: 境界値間で期待される増減関係が成立しているか確認
    // スコア0 < スコア50 < スコア100の関係が成立
    expect(resultMin.improvementEffectScore).toBeLessThan(
      resultMid.improvementEffectScore
    );
    expect(resultMid.improvementEffectScore).toBeLessThan(
      resultMax.improvementEffectScore
    );

    // 検証4: ユーザー満足度スコアが2倍になると、改善効果スコアも2倍になることを確認
    const satisfactionRatio = satisfactionScoreMax / satisfactionScoreMid;
    const effectRatio =
      resultMax.improvementEffectScore / resultMid.improvementEffectScore;
    expect(effectRatio).toBeCloseTo(satisfactionRatio, 1);

    // 検証5: 計算結果がすべて数値型であることを確認
    expect(typeof resultMin.improvementEffectScore).toBe("number");
    expect(typeof resultMid.improvementEffectScore).toBe("number");
    expect(typeof resultMax.improvementEffectScore).toBe("number");
  });
});