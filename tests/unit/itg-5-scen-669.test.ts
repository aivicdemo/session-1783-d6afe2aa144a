import { describe, test, expect } from "@jest/globals";
import {
  calculateAlgorithmComparisonMetrics,
} from "../../src/logic/it-7-2-1";

describe("アルゴリズム改善前後効果比較機能", () => {
  // SCEN-669: [normal] アルゴリズム改善前後効果比較機能 - 異なるアルゴリズムバージョン間で週次集計結果を正確に比較し、効果差を定量化できる
  test("異なるアルゴリズムバージョン間の週次集計結果を比較し、効果差を定量化する", () => {
    // v1.0 週次集計結果（比較期間：2024-01-01 ～ 2024-01-07）
    const versionV1Metrics = {
      algorithmVersionId: "v1.0",
      weekStartDate: "2024-01-01",
      weekEndDate: "2024-01-07",
      mealGenerationSuccessRate: 78.5, // %
      avgCookingTimeMinutes: 45.2,
      userSatisfactionScore: 3.8, // 5段階
      mealCompletionRate: 82.0, // %
      resourceUsagePercent: 68.5,
    };

    // v2.0 週次集計結果（同一期間：2024-01-01 ～ 2024-01-07）
    const versionV2Metrics = {
      algorithmVersionId: "v2.0",
      weekStartDate: "2024-01-01",
      weekEndDate: "2024-01-07",
      mealGenerationSuccessRate: 86.2, // %
      avgCookingTimeMinutes: 38.7,
      userSatisfactionScore: 4.3, // 5段階
      mealCompletionRate: 89.5, // %
      resourceUsagePercent: 54.2,
    };

    // 効果比較を実行
    const comparisonResult = calculateAlgorithmComparisonMetrics(
      versionV1Metrics,
      versionV2Metrics
    );

    // 期待値の計算
    // 成功率差分：86.2 - 78.5 = 7.7 (% ポイント)
    // 成功率増加率：(7.7 / 78.5) × 100 ≈ 9.81%
    const expectedSuccessRateDiff = 7.7;
    const expectedSuccessRateChangePercent = 9.81;

    // 調理時間短縮：45.2 - 38.7 = 6.5 (分)
    // 調理時間短縮率：(6.5 / 45.2) × 100 ≈ 14.38%
    const expectedCookingTimeDiff = 6.5;
    const expectedCookingTimeReductionPercent = 14.38;

    // 満足度スコア差：4.3 - 3.8 = 0.5
    // 満足度増加率：(0.5 / 3.8) × 100 ≈ 13.16%
    const expectedSatisfactionScoreDiff = 0.5;
    const expectedSatisfactionIncreasePercent = 13.16;

    // 完食率差分：89.5 - 82.0 = 7.5 (% ポイント)
    // 完食率増加率：(7.5 / 82.0) × 100 ≈ 9.15%
    const expectedCompletionRateDiff = 7.5;
    const expectedCompletionRateChangePercent = 9.15;

    // リソース削減：68.5 - 54.2 = 14.3 (% ポイント)
    // リソース削減率：(14.3 / 68.5) × 100 ≈ 20.88%
    const expectedResourceReductionPercent = 20.88;

    // 結果の検証：成功率の効果差
    expect(comparisonResult.successRateDiff).toBeCloseTo(expectedSuccessRateDiff, 1);
    expect(comparisonResult.successRateChangePercent).toBeCloseTo(
      expectedSuccessRateChangePercent,
      1
    );

    // 結果の検証：調理時間短縮の効果差
    expect(comparisonResult.cookingTimeDiff).toBeCloseTo(expectedCookingTimeDiff, 1);
    expect(comparisonResult.cookingTimeReductionPercent).toBeCloseTo(
      expectedCookingTimeReductionPercent,
      1
    );

    // 結果の検証：満足度スコアの効果差
    expect(comparisonResult.satisfactionScoreDiff).toBeCloseTo(
      expectedSatisfactionScoreDiff,
      1
    );
    expect(comparisonResult.satisfactionIncreasePercent).toBeCloseTo(
      expectedSatisfactionIncreasePercent,
      1
    );

    // 結果の検証：完食率の効果差
    expect(comparisonResult.completionRateDiff).toBeCloseTo(
      expectedCompletionRateDiff,
      1
    );
    expect(comparisonResult.completionRateChangePercent).toBeCloseTo(
      expectedCompletionRateChangePercent,
      1
    );

    // 結果の検証：リソース使用量の削減率
    expect(comparisonResult.resourceReductionPercent).toBeCloseTo(
      expectedResourceReductionPercent,
      1
    );

    // 結果の検証：改善判定（効果差が正の値か）
    expect(comparisonResult.improvementJudgment).toBe("向上");

    // 複数期間での一貫性検証：別の週次期間でも同様の比較を実行
    const versionV1MetricsWeek2 = {
      algorithmVersionId: "v1.0",
      weekStartDate: "2024-01-08",
      weekEndDate: "2024-01-14",
      mealGenerationSuccessRate: 79.0, // %
      avgCookingTimeMinutes: 44.8,
      userSatisfactionScore: 3.9, // 5段階
      mealCompletionRate: 83.2, // %
      resourceUsagePercent: 67.8,
    };

    const versionV2MetricsWeek2 = {
      algorithmVersionId: "v2.0",
      weekStartDate: "2024-01-08",
      weekEndDate: "2024-01-14",
      mealGenerationSuccessRate: 85.9, // %
      avgCookingTimeMinutes: 39.1,
      userSatisfactionScore: 4.2, // 5段階
      mealCompletionRate: 88.8, // %
      resourceUsagePercent: 54.5,
    };

    const comparisonResultWeek2 = calculateAlgorithmComparisonMetrics(
      versionV1MetricsWeek2,
      versionV2MetricsWeek2
    );

    // 2 週目の期待値計算
    // 成功率差分：85.9 - 79.0 = 6.9 (% ポイント)
    const expectedSuccessRateDiffWeek2 = 6.9;

    // 結果の一貫性を確認（同一方向の改善）
    expect(comparisonResultWeek2.successRateDiff).toBeCloseTo(
      expectedSuccessRateDiffWeek2,
      1
    );
    expect(comparisonResultWeek2.improvementJudgment).toBe("向上");

    // 改善方向の一貫性：両週ともに v2.0 が v1.0 を上回る
    expect(comparisonResult.improvementJudgment).toBe(
      comparisonResultWeek2.improvementJudgment
    );
  });
});