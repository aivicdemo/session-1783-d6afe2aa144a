import { calculateDemandForecastAccuracy, executeDivergenceAnalysis } from "../../src/logic/it-7-2-1";

describe("需要予測精度の乖離分析機能", () => {
  test("SCEN-584: 予測精度が閾値を下回ったとき自動的に乖離分析が実行される", () => {
    // 事前設定: 予測精度の閾値を80%に設定
    const accuracyThreshold = 80;

    // テスト用の需要予測データを準備
    // 予測精度が75%となるシナリオ（閾値80%より下回る）
    const forecastData = {
      predictions: [
        { product_id: 1, forecasted_demand: 100 },
        { product_id: 2, forecasted_demand: 50 },
        { product_id: 3, forecasted_demand: 75 },
        { product_id: 4, forecasted_demand: 200 },
      ],
    };

    const actualData = {
      actuals: [
        { product_id: 1, actual_demand: 95 },
        { product_id: 2, actual_demand: 52 },
        { product_id: 3, actual_demand: 70 },
        { product_id: 4, actual_demand: 210 },
      ],
    };

    // 予測精度を計算
    // 精度計算: (1 - (|95-100| + |52-50| + |70-75| + |210-200|) / (100+50+75+200)) * 100
    // = (1 - (5 + 2 + 5 + 10) / 425) * 100 = (1 - 22/425) * 100 = 94.82%
    // ここで意図的に低精度となるデータを入力
    const forecastDataLowAccuracy = {
      predictions: [
        { product_id: 1, forecasted_demand: 100 },
        { product_id: 2, forecasted_demand: 50 },
        { product_id: 3, forecasted_demand: 75 },
        { product_id: 4, forecasted_demand: 200 },
      ],
    };

    const actualDataLowAccuracy = {
      actuals: [
        { product_id: 1, actual_demand: 70 },
        { product_id: 2, actual_demand: 30 },
        { product_id: 3, actual_demand: 50 },
        { product_id: 4, actual_demand: 150 },
      ],
    };

    // 精度計算: (1 - (|70-100| + |30-50| + |50-75| + |150-200|) / (100+50+75+200)) * 100
    // = (1 - (30 + 20 + 25 + 50) / 425) * 100 = (1 - 125/425) * 100 = 70.59%
    // この値は閾値80%より下回る
    const calculatedAccuracy = calculateDemandForecastAccuracy(
      forecastDataLowAccuracy,
      actualDataLowAccuracy
    );

    // 予測精度が閾値以下であることを確認
    expect(calculatedAccuracy).toBeLessThanOrEqual(75);
    expect(calculatedAccuracy).toBeGreaterThanOrEqual(70);

    // 乖離分析を実行
    const divergenceAnalysisResult = executeDivergenceAnalysis(
      {
        accuracy: calculatedAccuracy,
        threshold: accuracyThreshold,
        forecastData: forecastDataLowAccuracy,
        actualData: actualDataLowAccuracy,
      }
    );

    // 分析結果が実行されたことを確認
    expect(divergenceAnalysisResult).toBeDefined();
    expect(divergenceAnalysisResult.analysis_executed).toBe(true);

    // 分析結果に予測値と実績値の差分が含まれていることを確認
    expect(divergenceAnalysisResult.divergences).toBeDefined();
    expect(divergenceAnalysisResult.divergences).toHaveLength(4);

    // 各商品の乖離度を確認
    expect(divergenceAnalysisResult.divergences[0]).toEqual({
      product_id: 1,
      forecasted: 100,
      actual: 70,
      divergence: 30,
      divergence_rate: expect.closeTo(30, 0.1),
    });

    expect(divergenceAnalysisResult.divergences[1]).toEqual({
      product_id: 2,
      forecasted: 50,
      actual: 30,
      divergence: 20,
      divergence_rate: expect.closeTo(40, 0.1),
    });

    expect(divergenceAnalysisResult.divergences[2]).toEqual({
      product_id: 3,
      forecasted: 75,
      actual: 50,
      divergence: 25,
      divergence_rate: expect.closeTo(33.33, 0.1),
    });

    expect(divergenceAnalysisResult.divergences[3]).toEqual({
      product_id: 4,
      forecasted: 200,
      actual: 150,
      divergence: 50,
      divergence_rate: expect.closeTo(25, 0.1),
    });

    // 分析結果に乖離原因の推定情報が含まれていることを確認
    expect(divergenceAnalysisResult.root_cause_analysis).toBeDefined();
    expect(divergenceAnalysisResult.root_cause_analysis.primary_factors).toBeDefined();
    expect(divergenceAnalysisResult.root_cause_analysis.primary_factors.length).toBeGreaterThan(0);

    // 総乖離度の平均が計算されていることを確認
    expect(divergenceAnalysisResult.average_divergence_rate).toBeDefined();
    // (30 + 20 + 25 + 50) / 4 / 425 のような計算で検証
    expect(divergenceAnalysisResult.average_divergence_rate).toBeGreaterThan(0);

    // 実行ログに記録されたことを確認
    expect(divergenceAnalysisResult.execution_timestamp).toBeDefined();
    expect(divergenceAnalysisResult.execution_timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );

    // 分析状態が「完了」であることを確認
    expect(divergenceAnalysisResult.status).toBe("completed");

    // 分析タイプが「自動実行」であることを確認
    expect(divergenceAnalysisResult.trigger_type).toBe("automatic");
  });
});