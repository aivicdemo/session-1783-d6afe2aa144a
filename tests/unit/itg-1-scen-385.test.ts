import { analyzeForecasterAccuracyDeviation } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-385: 需要予測精度の乖離分析機能 - 予測精度が事前設定の閾値を下回った場合、アラートが生成され分析が強制実行される
  test("予測精度が閾値を下回る場合、アラートと乖離分析が自動実行される", () => {
    const accuracyThreshold = 70;
    const predictedAccuracy = 65;
    const deviationRate = accuracyThreshold - predictedAccuracy;

    const result = analyzeForecasterAccuracyDeviation({
      accuracyThreshold,
      predictedAccuracy,
      analysisTriggeredAt: new Date("2024-01-15T14:30:00Z"),
      forecastModelVersion: "v2.1",
      pastDemandDataCount: 150,
    });

    // (1) 予測精度低下を示すアラートが即座に生成される
    expect(result.alertGenerated).toBe(true);

    // (2) 乖離分析が自動的に強制実行される
    expect(result.deviationAnalysisForceExecuted).toBe(true);

    // (3) アラートには予測精度値（65%）と閾値との乖離率（5%）が正確に記録される
    expect(result.alertContent.predictedAccuracyPercent).toBe(65);
    expect(result.alertContent.deviationRatePercent).toBe(5);
    expect(result.alertContent.thresholdPercent).toBe(70);

    // (4) 分析完了後に原因特定と改善提案を含むレポートが自動生成される
    expect(result.analysisReportGenerated).toBe(true);
    expect(result.analysisReport.rootCauseIdentified).toBe(true);
    expect(result.analysisReport.improvementSuggestionsIncluded).toBe(true);

    // アラート発生時刻が記録されている
    expect(result.alertContent.generatedAtIso).toBe("2024-01-15T14:30:00Z");

    // 乖離分析結果の内容検証
    expect(result.analysisReport.categories).toContain("seasonal_variation");
    expect(result.analysisReport.categories).toContain("external_factors");
    expect(result.analysisReport.recommendedActions.length).toBeGreaterThan(0);
  });
});