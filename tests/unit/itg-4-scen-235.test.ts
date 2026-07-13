import { extractAndAnalyzeDemandPatterns } from '../../src/logic/it-2-br-6-3-2';

const fetchMock = require('jest-fetch-mock');

describe('需要パターン定量化レポート生成機能 - 外部データ統合と季節変動分析', () => {
  // SCEN-235
  test('外部データソース連携データが統合され、季節変動の相関分析が正しく計算される', async () => {
    fetchMock.resetMocks();

    // テストデータ: 過去24ヶ月の売上実績データ
    const salesData = [
      { month: '2022-01', demand: 1000, season: 'winter' },
      { month: '2022-02', demand: 1050, season: 'winter' },
      { month: '2022-03', demand: 1200, season: 'spring' },
      { month: '2022-04', demand: 1300, season: 'spring' },
      { month: '2022-05', demand: 1450, season: 'spring' },
      { month: '2022-06', demand: 1600, season: 'summer' },
      { month: '2022-07', demand: 1700, season: 'summer' },
      { month: '2022-08', demand: 1650, season: 'summer' },
      { month: '2022-09', demand: 1400, season: 'autumn' },
      { month: '2022-10', demand: 1250, season: 'autumn' },
      { month: '2022-11', demand: 1150, season: 'autumn' },
      { month: '2022-12', demand: 1050, season: 'winter' },
      { month: '2023-01', demand: 1020, season: 'winter' },
      { month: '2023-02', demand: 1080, season: 'winter' },
      { month: '2023-03', demand: 1220, season: 'spring' },
      { month: '2023-04', demand: 1330, season: 'spring' },
      { month: '2023-05', demand: 1480, season: 'spring' },
      { month: '2023-06', demand: 1620, season: 'summer' },
      { month: '2023-07', demand: 1730, season: 'summer' },
      { month: '2023-08', demand: 1680, season: 'summer' },
      { month: '2023-09', demand: 1420, season: 'autumn' },
      { month: '2023-10', demand: 1270, season: 'autumn' },
      { month: '2023-11', demand: 1170, season: 'autumn' },
      { month: '2023-12', demand: 1080, season: 'winter' },
    ];

    // Mock 外部データソース1: 気象API（気温）
    fetchMock.mockResponseOnce(
      JSON.stringify({
        source: 'weather_api',
        data: [
          { month: '2022-01', avgTemp: 5.2 },
          { month: '2022-02', avgTemp: 6.1 },
          { month: '2022-03', avgTemp: 11.3 },
          { month: '2022-04', avgTemp: 18.5 },
          { month: '2022-05', avgTemp: 24.2 },
          { month: '2022-06', avgTemp: 28.1 },
          { month: '2022-07', avgTemp: 31.5 },
          { month: '2022-08', avgTemp: 30.8 },
          { month: '2022-09', avgTemp: 25.3 },
          { month: '2022-10', avgTemp: 18.9 },
          { month: '2022-11', avgTemp: 11.7 },
          { month: '2022-12', avgTemp: 6.3 },
          { month: '2023-01', avgTemp: 5.1 },
          { month: '2023-02', avgTemp: 6.2 },
          { month: '2023-03', avgTemp: 11.4 },
          { month: '2023-04', avgTemp: 18.6 },
          { month: '2023-05', avgTemp: 24.3 },
          { month: '2023-06', avgTemp: 28.2 },
          { month: '2023-07', avgTemp: 31.6 },
          { month: '2023-08', avgTemp: 30.9 },
          { month: '2023-09', avgTemp: 25.2 },
          { month: '2023-10', avgTemp: 18.8 },
          { month: '2023-11', avgTemp: 11.6 },
          { month: '2023-12', avgTemp: 6.4 },
        ],
        trustScore: 95,
      }),
      { status: 200 }
    );

    // Mock 外部データソース2: 経済指標API（消費者物価指数）
    fetchMock.mockResponseOnce(
      JSON.stringify({
        source: 'economic_api',
        data: [
          { month: '2022-01', cpi: 101.2 },
          { month: '2022-02', cpi: 101.5 },
          { month: '2022-03', cpi: 102.1 },
          { month: '2022-04', cpi: 102.8 },
          { month: '2022-05', cpi: 103.4 },
          { month: '2022-06', cpi: 103.9 },
          { month: '2022-07', cpi: 104.2 },
          { month: '2022-08', cpi: 104.1 },
          { month: '2022-09', cpi: 103.8 },
          { month: '2022-10', cpi: 103.5 },
          { month: '2022-11', cpi: 103.2 },
          { month: '2022-12', cpi: 102.9 },
          { month: '2023-01', cpi: 102.6 },
          { month: '2023-02', cpi: 102.8 },
          { month: '2023-03', cpi: 103.2 },
          { month: '2023-04', cpi: 103.9 },
          { month: '2023-05', cpi: 104.5 },
          { month: '2023-06', cpi: 105.1 },
          { month: '2023-07', cpi: 105.3 },
          { month: '2023-08', cpi: 105.2 },
          { month: '2023-09', cpi: 104.9 },
          { month: '2023-10', cpi: 104.6 },
          { month: '2023-11', cpi: 104.3 },
          { month: '2023-12', cpi: 104.0 },
        ],
        trustScore: 92,
      }),
      { status: 200 }
    );

    // Mock 外部データソース3: イベント情報API（キャンペーン・セール）
    fetchMock.mockResponseOnce(
      JSON.stringify({
        source: 'event_api',
        data: [
          { month: '2022-01', eventCount: 2, eventImpact: 0.95 },
          { month: '2022-02', eventCount: 1, eventImpact: 0.98 },
          { month: '2022-03', eventCount: 3, eventImpact: 0.92 },
          { month: '2022-04', eventCount: 4, eventImpact: 0.88 },
          { month: '2022-05', eventCount: 5, eventImpact: 0.85 },
          { month: '2022-06', eventCount: 6, eventImpact: 0.80 },
          { month: '2022-07', eventCount: 7, eventImpact: 0.78 },
          { month: '2022-08', eventCount: 6, eventImpact: 0.79 },
          { month: '2022-09', eventCount: 4, eventImpact: 0.86 },
          { month: '2022-10', eventCount: 3, eventImpact: 0.90 },
          { month: '2022-11', eventCount: 2, eventImpact: 0.94 },
          { month: '2022-12', eventCount: 1, eventImpact: 0.97 },
          { month: '2023-01', eventCount: 2, eventImpact: 0.96 },
          { month: '2023-02', eventCount: 1, eventImpact: 0.99 },
          { month: '2023-03', eventCount: 3, eventImpact: 0.93 },
          { month: '2023-04', eventCount: 4, eventImpact: 0.89 },
          { month: '2023-05', eventCount: 5, eventImpact: 0.86 },
          { month: '2023-06', eventCount: 6, eventImpact: 0.81 },
          { month: '2023-07', eventCount: 7, eventImpact: 0.79 },
          { month: '2023-08', eventCount: 6, eventImpact: 0.80 },
          { month: '2023-09', eventCount: 4, eventImpact: 0.87 },
          { month: '2023-10', eventCount: 3, eventImpact: 0.91 },
          { month: '2023-11', eventCount: 2, eventImpact: 0.95 },
          { month: '2023-12', eventCount: 1, eventImpact: 0.98 },
        ],
        trustScore: 88,
      }),
      { status: 200 }
    );

    const analysisStartDate = new Date('2022-01-01T00:00:00Z');
    const analysisEndDate = new Date('2023-12-31T23:59:59Z');

    const result = await extractAndAnalyzeDemandPatterns({
      salesData,
      analysisStartDate,
      analysisEndDate,
      externalDataSources: [
        { sourceId: 'weather_api', endpoint: 'https://api.weather.com/data' },
        { sourceId: 'economic_api', endpoint: 'https://api.economic.com/data' },
        { sourceId: 'event_api', endpoint: 'https://api.event.com/data' },
      ],
    });

    // 期待結果1: レポートが生成されていること
    expect(result).toBeDefined();
    expect(result.reportId).toBeDefined();
    expect(result.generatedAt).toBeDefined();

    // 期待結果2: 3つ以上の外部データソースが統合されていること
    expect(result.integratedDataSources.length).toBeGreaterThanOrEqual(3);
    expect(result.integratedDataSources).toContainEqual(
      expect.objectContaining({ sourceId: 'weather_api', trustScore: 95 })
    );
    expect(result.integratedDataSources).toContainEqual(
      expect.objectContaining({ sourceId: 'economic_api', trustScore: 92 })
    );
    expect(result.integratedDataSources).toContainEqual(
      expect.objectContaining({ sourceId: 'event_api', trustScore: 88 })
    );

    // 期待結果3: 季節変動分析が実施されていること
    expect(result.seasonalAnalysis).toBeDefined();
    expect(result.seasonalAnalysis.seasons).toEqual(['winter', 'spring', 'summer', 'autumn']);

    // 期待結果4: 各季節の平均需要が計算されていること
    expect(result.seasonalAnalysis.seasonalAverageDemand).toEqual({
      winter: 1045,
      spring: 1330,
      summer: 1657.5,
      autumn: 1272.5,
    });

    // 期待結果5: 気象データとの相関分析結果（ピアソン相関係数）
    // 計算式: r = Σ((x_i - mean_x) * (y_i - mean_y)) / sqrt(Σ(x_i - mean_x)^2 * Σ(y_i - mean_y)^2)
    // 気温と需要の相関係数は強い正相関: 期待値 0.89 ± 0.01
    expect(result.correlationAnalysis.weather).toBeDefined();
    expect(result.correlationAnalysis.weather.variable).toBe('avgTemp');
    expect(result.correlationAnalysis.weather.correlationCoefficient).toBeCloseTo(0.89, 2);
    expect(result.correlationAnalysis.weather.pValue).toBeLessThan(0.05);
    expect(result.correlationAnalysis.weather.significanceLevel).toBe('highly_significant');

    // 期待結果6: 経済指標との相関分析結果
    // CPI と需要の相関係数: 期待値 0.72 ± 0.01
    expect(result.correlationAnalysis.economic).toBeDefined();
    expect(result.correlationAnalysis.economic.variable).toBe('cpi');
    expect(result.correlationAnalysis.economic.correlationCoefficient).toBeCloseTo(0.72, 2);
    expect(result.correlationAnalysis.economic.pValue).toBeLessThan(0.05);
    expect(result.correlationAnalysis.economic.significanceLevel).toBe('significant');

    // 期待結果7: イベント情報との相関分析結果
    // イベント影響度と需要の相関係数: 期待値 -0.85 ± 0.01 (負相関)
    expect(result.correlationAnalysis.event).toBeDefined();
    expect(result.correlationAnalysis.event.variable).toBe('eventImpact');
    expect(result.correlationAnalysis.event.correlationCoefficient).toBeCloseTo(-0.85, 2);
    expect(result.correlationAnalysis.event.pValue).toBeLessThan(0.05);
    expect(result.correlationAnalysis.event.significanceLevel).toBe('significant');

    // 期待結果8: 季節変動パターン認識精度が90%以上
    expect(result.seasonalAnalysis.patternRecognitionAccuracy).toBeGreaterThanOrEqual(0.90);

    // 期待結果9: レポートに必須フィールドが含まれていること
    expect(result.report).toBeDefined();
    expect(result.report.analysisPeriod).toEqual({
      startDate: '2022-01-01',
      endDate: '2023-12-31',
    });
    expect(result.report.dataIntegrationSummary).toBeDefined();
    expect(result.report.dataIntegrationSummary.sourcesIntegrated).toBe(3);
    expect(result.report.dataIntegrationSummary.recordsProcessed).toBe(72); // 24 months × 3 sources

    // 期待結果10: 相関分析結果が報告書に記載されていること
    expect(result.report.correlationFindings).toBeDefined();
    expect(result.report.correlationFindings).toContainEqual(
      expect.objectContaining({
        source: 'weather_api',
        correlationCoefficient: expect.any(Number),
        pValue: expect.any(Number),
      })
    );

    // 期待結果11: 変数の優先度マトリクスが計算されていること
    expect(result.variablePrioritization).toBeDefined();
    expect(result.variablePrioritization.variables).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          variableName: 'avgTemp',
          impactOnAccuracy: expect.any(Number),
          implementationDifficulty: expect.any(Number),
          priorityScore: expect.any(Number),
        }),
      ])
    );

    // 期待結果12: すべての相関係数が-1から1の範囲内
    expect(result.correlationAnalysis.weather.correlationCoefficient).toBeGreaterThanOrEqual(-1);
    expect(result.correlationAnalysis.weather.correlationCoefficient).toBeLessThanOrEqual(1);
    expect(result.correlationAnalysis.economic.correlationCoefficient).toBeGreaterThanOrEqual(-1);
    expect(result.correlationAnalysis.economic.correlationCoefficient).toBeLessThanOrEqual(1);
    expect(result.correlationAnalysis.event.correlationCoefficient).toBeGreaterThanOrEqual(-1);
    expect(result.correlationAnalysis.event.correlationCoefficient).toBeLessThanOrEqual(1);

    // 期待結果13: レポートステータスが成功状態
    expect(result.status).toBe('completed');
    expect(result.errors).toEqual([]);
  });
});