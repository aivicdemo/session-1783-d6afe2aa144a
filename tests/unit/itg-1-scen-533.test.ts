import { evaluateMealPredictionAccuracy } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-533: [error] 需要予測精度改善判定機能 - 乖離分析結果が空の場合にエラーが返される
  test("乖離分析結果が空の状態で精度判定処理を実行するとエラーが返される", () => {
    const emptyDivergenceAnalysisResults: any[] = [];
    const predictionThreshold = 0.85;
    const minSampleSize = 30;

    expect(() => {
      evaluateMealPredictionAccuracy({
        divergenceAnalysisResults: emptyDivergenceAnalysisResults,
        predictionThreshold: predictionThreshold,
        minSampleSize: minSampleSize,
      });
    }).toThrow(/乖離分析結果/);
  });
});