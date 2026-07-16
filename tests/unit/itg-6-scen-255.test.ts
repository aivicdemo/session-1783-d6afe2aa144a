import { analyzeMenuGenerationSuccessRateImprovement } from "../../src/logic/it-1-br-8-2-2-1";

describe("機能別使用頻度・離脱ポイント自動抽出・分析", () => {
  // SCEN-255
  test("献立生成成功率の改善効果定量比較・優先度決定 - 改善前後の献立生成成功率を比較し、改善後成功率が最小閾値以上かつ改善目標値に向けて進捗している場合、次の改善優先度が根拠付けられて決定される", () => {
    // 改善前の献立生成成功率を取得する
    const preImprovementSuccessRate = 72.5;

    // 改善後の献立生成成功率を取得する
    const postImprovementSuccessRate = 85.0;

    // 最小閾値と改善目標値を定義する
    const minimumThreshold = 80.0;
    const improvementTargetRate = 95.0;

    // 改善優先度決定ロジックを実行する
    const result = analyzeMenuGenerationSuccessRateImprovement({
      preImprovementSuccessRate,
      postImprovementSuccessRate,
      minimumThreshold,
      improvementTargetRate,
    });

    // 改善後成功率が最小閾値以上であることを確認する
    expect(postImprovementSuccessRate).toBeGreaterThanOrEqual(minimumThreshold);

    // 改善後成功率が改善前成功率より向上していることを確認する
    expect(postImprovementSuccessRate).toBeGreaterThan(preImprovementSuccessRate);

    // 改善後成功率と改善目標値の差分を計算する
    const remainingGapToTarget = improvementTargetRate - postImprovementSuccessRate;
    expect(remainingGapToTarget).toBe(10.0);

    // 改善前後の成功率改善値を計算する
    const successRateImprovement = postImprovementSuccessRate - preImprovementSuccessRate;
    expect(successRateImprovement).toBe(12.5);

    // 進捗率を算出する（改善幅／目標改善幅）
    const totalTargetImprovement = improvementTargetRate - preImprovementSuccessRate;
    const progressRate = (successRateImprovement / totalTargetImprovement) * 100;
    expect(progressRate).toBeCloseTo(59.52, 1);

    // 進捗率が0%を超えていることを確認する
    expect(progressRate).toBeGreaterThan(0);

    // 決定された優先度に根拠情報が紐付けられていることを確認する
    expect(result).toHaveProperty("priorityDecision");
    expect(result).toHaveProperty("justificationDetails");

    // 根拠情報に成功率の改善値が含まれていることを検証する
    expect(result.justificationDetails).toHaveProperty("successRateImprovement");
    expect(result.justificationDetails.successRateImprovement).toBe(12.5);

    // 根拠情報に進捗率が含まれていることを検証する
    expect(result.justificationDetails).toHaveProperty("progressRate");
    expect(result.justificationDetails.progressRate).toBeCloseTo(59.52, 1);

    // 根拠情報に閾値判定結果が含まれていることを検証する
    expect(result.justificationDetails).toHaveProperty("meetsMinimumThreshold");
    expect(result.justificationDetails.meetsMinimumThreshold).toBe(true);

    // 根拠情報に優先度スコアが含まれていることを検証する
    expect(result.justificationDetails).toHaveProperty("priorityScore");
    expect(typeof result.justificationDetails.priorityScore).toBe("number");
    expect(result.justificationDetails.priorityScore).toBeGreaterThan(0);

    // 優先度決定が高優先度に分類されることを確認する
    expect(result.priorityDecision).toBe("HIGH");
  });
});