import { calculateDivergenceAnalysis } from '../../src/logic/it-7-2-1';

describe('需要予測精度の乖離分析ダッシュボード', () => {
  // SCEN-583: 予測値と実績値の乖離度が自動計算され、カテゴリ別・時期別の誤差パターンが可視化される
  test('予測値と実績値の乖離度を自動計算し、カテゴリ別・時期別の誤差パターンを可視化する', () => {
    // Precondition: 需要予測データと実績需要データが蓄積されている状態
    const forecastData = [
      { date: '2024-01-01', category: '青菜', forecastDemand: 100, unit: '束' },
      { date: '2024-01-02', category: '青菜', forecastDemand: 95, unit: '束' },
      { date: '2024-01-03', category: '青菜', forecastDemand: 110, unit: '束' },
      { date: '2024-01-08', category: '青菜', forecastDemand: 105, unit: '束' },
      { date: '2024-01-01', category: '肉類', forecastDemand: 50, unit: 'kg' },
      { date: '2024-01-02', category: '肉類', forecastDemand: 52, unit: 'kg' },
      { date: '2024-01-03', category: '肉類', forecastDemand: 48, unit: 'kg' },
      { date: '2024-01-08', category: '肉類', forecastDemand: 55, unit: 'kg' },
    ];

    const actualData = [
      { date: '2024-01-01', category: '青菜', actualDemand: 98, unit: '束' },
      { date: '2024-01-02', category: '青菜', actualDemand: 92, unit: '束' },
      { date: '2024-01-03', category: '青菜', actualDemand: 115, unit: '束' },
      { date: '2024-01-08', category: '青菜', actualDemand: 103, unit: '束' },
      { date: '2024-01-01', category: '肉類', actualDemand: 51, unit: 'kg' },
      { date: '2024-01-02', category: '肉類', actualDemand: 50, unit: 'kg' },
      { date: '2024-01-03', category: '肉類', actualDemand: 49, unit: 'kg' },
      { date: '2024-01-08', category: '肉類', actualDemand: 56, unit: 'kg' },
    ];

    const analysisParams = {
      periodStart: '2024-01-01',
      periodEnd: '2024-01-08',
      timeUnit: 'daily',
      categories: ['青菜', '肉類'],
    };

    // Trigger: 乖離度自動計算機能を実行する
    const result = calculateDivergenceAnalysis({
      forecastData,
      actualData,
      params: analysisParams,
    });

    // Outcome: 予測値と実績値の乖離度が自動計算される
    // 青菜の乖離度計算: MAPE = (|100-98|/100 + |95-92|/95 + |110-115|/110 + |105-103|/105) / 4
    // = (0.02 + 0.0316 + 0.0454 + 0.0190) / 4 = 0.025625 (2.5625%)
    expect(result.categoryAnalysis).toBeDefined();
    expect(result.categoryAnalysis.length).toBe(2);

    // 青菜カテゴリの乖離度検証
    const vegetableAnalysis = result.categoryAnalysis.find(
      (c) => c.category === '青菜'
    );
    expect(vegetableAnalysis).toBeDefined();
    expect(vegetableAnalysis.mapePercent).toBeCloseTo(2.5625, 2);
    expect(vegetableAnalysis.rmse).toBeCloseTo(3.2015, 2);
    expect(vegetableAnalysis.mae).toBeCloseTo(3.0, 1);

    // 肉類カテゴリの乖離度検証
    // MAPE = (|50-51|/50 + |52-50|/52 + |48-49|/48 + |55-56|/55) / 4
    // = (0.02 + 0.0385 + 0.0208 + 0.0182) / 4 = 0.0194 (1.94%)
    const meatAnalysis = result.categoryAnalysis.find((c) => c.category === '肉類');
    expect(meatAnalysis).toBeDefined();
    expect(meatAnalysis.mapePercent).toBeCloseTo(1.9375, 2);
    expect(meatAnalysis.rmse).toBeCloseTo(1.1180, 2);
    expect(meatAnalysis.mae).toBeCloseTo(1.0, 1);

    // カテゴリ別に集計されていることを確認する
    expect(result.categoryAnalysis).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: '青菜',
          sampleCount: 4,
          divergenceLevel: 'normal',
        }),
        expect.objectContaining({
          category: '肉類',
          sampleCount: 4,
          divergenceLevel: 'normal',
        }),
      ])
    );

    // 時期別（日次）の誤差パターンが表示されていることを確認する
    expect(result.timeSeriesAnalysis).toBeDefined();
    expect(result.timeSeriesAnalysis.length).toBe(4);

    // 日次1（2024-01-01）の誤差検証
    const day1Analysis = result.timeSeriesAnalysis.find(
      (t) => t.date === '2024-01-01'
    );
    expect(day1Analysis).toBeDefined();
    expect(day1Analysis.vegetableError).toBeCloseTo(2.0, 1);
    expect(day1Analysis.meatError).toBeCloseTo(2.0, 1);
    expect(day1Analysis.averageMapePercent).toBeCloseTo(2.25, 1);

    // 日次2（2024-01-02）の誤差検証
    const day2Analysis = result.timeSeriesAnalysis.find(
      (t) => t.date === '2024-01-02'
    );
    expect(day2Analysis).toBeDefined();
    expect(day2Analysis.vegetableError).toBeCloseTo(3.0, 1);
    expect(day2Analysis.meatError).toBeCloseTo(2.0, 1);

    // 日次3（2024-01-03）の誤差検証
    const day3Analysis = result.timeSeriesAnalysis.find(
      (t) => t.date === '2024-01-03'
    );
    expect(day3Analysis).toBeDefined();
    expect(day3Analysis.vegetableError).toBeCloseTo(5.0, 1);
    expect(day3Analysis.meatError).toBeCloseTo(1.0, 1);

    // 日次4（2024-01-08）の誤差検証
    const day4Analysis = result.timeSeriesAnalysis.find(
      (t) => t.date === '2024-01-08'
    );
    expect(day4Analysis).toBeDefined();
    expect(day4Analysis.vegetableError).toBeCloseTo(2.0, 1);
    expect(day4Analysis.meatError).toBeCloseTo(1.0, 1);

    // 可視化用データ構造が生成されていることを確認する
    expect(result.visualization).toBeDefined();
    expect(result.visualization.lineChartData).toBeDefined();
    expect(result.visualization.heatmapData).toBeDefined();

    // 折れ線グラフデータの構造検証
    expect(result.visualization.lineChartData.labels).toEqual([
      '2024-01-01',
      '2024-01-02',
      '2024-01-03',
      '2024-01-08',
    ]);
    expect(result.visualization.lineChartData.datasets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: '青菜_MAPE',
          data: expect.arrayContaining([2.0, 3.16, 4.54, 1.9]),
        }),
        expect.objectContaining({
          label: '肉類_MAPE',
          data: expect.arrayContaining([2.0, 3.85, 2.08, 1.82]),
        }),
      ])
    );

    // ヒートマップデータの構造検証
    expect(result.visualization.heatmapData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: '青菜',
          date: '2024-01-01',
          errorPercent: 2.0,
          severity: 'low',
        }),
        expect.objectContaining({
          category: '青菜',
          date: '2024-01-03',
          errorPercent: 4.54,
          severity: 'medium',
        }),
        expect.objectContaining({
          category: '肉類',
          date: '2024-01-02',
          errorPercent: 3.85,
          severity: 'low',
        }),
      ])
    );

    // 複数カテゴリを選択した場合の動的更新テスト
    const filteredByVegetable = result.categoryAnalysis.filter(
      (c) => c.category === '青菜'
    );
    expect(filteredByVegetable.length).toBe(1);
    expect(filteredByVegetable[0].mapePercent).toBeCloseTo(2.5625, 2);

    // 異なる期間を選択した場合の時期別誤差パターン更新テスト
    const day1And2Data = result.timeSeriesAnalysis.filter((t) =>
      ['2024-01-01', '2024-01-02'].includes(t.date)
    );
    expect(day1And2Data.length).toBe(2);
    expect(day1And2Data[0].averageMapePercent).toBeCloseTo(2.25, 1);
    expect(day1And2Data[1].averageMapePercent).toBeCloseTo(3.505, 2);

    // 乖離度の計算式が正確に適用されていることを検証する
    // 全体MAPE = (全カテゴリの全乖離度の合計) / (全データポイント数)
    const totalMape = result.overallMetrics.mapePercent;
    const expectedTotalMape = (2.5625 + 1.9375) / 2;
    expect(totalMape).toBeCloseTo(expectedTotalMape, 2);

    // RMSE検証: sqrt(mean of squared errors)
    expect(result.overallMetrics.rmse).toBeCloseTo(2.1698, 2);

    // MAE検証: mean absolute error
    expect(result.overallMetrics.mae).toBeCloseTo(2.0, 1);

    // 異常検出: 誤差が大きいデータ点が特定されていることを確認
    const anomalies = result.anomalyDetection;
    expect(anomalies).toBeDefined();
    expect(
      anomalies.some(
        (a) => a.date === '2024-01-03' && a.category === '青菜'
      )
    ).toBe(true);

    // 傾向分析: 日次別の誤差パターンから傾向が抽出されていることを確認
    expect(result.trendAnalysis).toBeDefined();
    expect(result.trendAnalysis.direction).toMatch(/up|down|stable/);
    expect(result.trendAnalysis.volatility).toBeGreaterThanOrEqual(0);
    expect(result.trendAnalysis.volatility).toBeLessThanOrEqual(100);

    // 総合評価スコア: 0-100の範囲で精度を評価
    expect(result.overallMetrics.accuracyScore).toBeGreaterThanOrEqual(0);
    expect(result.overallMetrics.accuracyScore).toBeLessThanOrEqual(100);
    // MAPE 2.25%相当では精度スコア = 100 - 2.25 = 97.75
    expect(result.overallMetrics.accuracyScore).toBeCloseTo(97.75, 1);

    // メタデータ確認
    expect(result.metadata).toBeDefined();
    expect(result.metadata.analysisDate).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );
    expect(result.metadata.dataPoints).toBe(8);
    expect(result.metadata.categoriesAnalyzed).toBe(2);
    expect(result.metadata.timeUnitUsed).toBe('daily');
  });
});