import { calculateCorrelationCoefficients } from '../../src/logic/it-7-2-1';

describe('外部データ相関分析機能 - 気象・イベント・競合施策データと実績需要の相関分析', () => {
  // SCEN-589: 外部データ相関分析機能 - 相関係数計算と予測精度低下要因特定
  test('should correctly calculate correlation coefficients for weather, events, and competitor data against actual demand and identify accuracy reduction factors', () => {
    // 気象データ: 気温、湿度などの外部要因
    const weatherData = [
      { date: '2024-01-01', temperature: 5, humidity: 65 },
      { date: '2024-01-02', temperature: 6, humidity: 70 },
      { date: '2024-01-03', temperature: 8, humidity: 68 },
      { date: '2024-01-04', temperature: 7, humidity: 72 },
      { date: '2024-01-05', temperature: 9, humidity: 71 },
    ];

    // イベントデータ: セール、キャンペーンなどの影響要因
    const eventData = [
      { date: '2024-01-01', eventType: 'sale', intensity: 0.8 },
      { date: '2024-01-02', eventType: 'none', intensity: 0 },
      { date: '2024-01-03', eventType: 'campaign', intensity: 0.6 },
      { date: '2024-01-04', eventType: 'none', intensity: 0 },
      { date: '2024-01-05', eventType: 'sale', intensity: 0.9 },
    ];

    // 競合施策データ: 競合店舗の割引率、キャンペーン等
    const competitorData = [
      { date: '2024-01-01', competitorDiscount: 0.15, campaignActive: 1 },
      { date: '2024-01-02', competitorDiscount: 0.1, campaignActive: 0 },
      { date: '2024-01-03', competitorDiscount: 0.2, campaignActive: 1 },
      { date: '2024-01-04', competitorDiscount: 0.05, campaignActive: 0 },
      { date: '2024-01-05', competitorDiscount: 0.25, campaignActive: 1 },
    ];

    // 実績需要データ: 実際の食材購買・献立需要
    const actualDemand = [
      { date: '2024-01-01', demand: 450 },
      { date: '2024-01-02', demand: 380 },
      { date: '2024-01-03', demand: 520 },
      { date: '2024-01-04', demand: 390 },
      { date: '2024-01-05', demand: 580 },
    ];

    // 相関分析を実行
    const result = calculateCorrelationCoefficients({
      weatherData,
      eventData,
      competitorData,
      actualDemand,
    });

    // 相関係数が-1.0～1.0の範囲内であることを確認
    expect(result.weatherCorrelation).toBeGreaterThanOrEqual(-1.0);
    expect(result.weatherCorrelation).toBeLessThanOrEqual(1.0);
    expect(result.eventCorrelation).toBeGreaterThanOrEqual(-1.0);
    expect(result.eventCorrelation).toBeLessThanOrEqual(1.0);
    expect(result.competitorCorrelation).toBeGreaterThanOrEqual(-1.0);
    expect(result.competitorCorrelation).toBeLessThanOrEqual(1.0);

    // 相関強度の分類が正しく行われていることを確認（強い:≧0.7, 中程度:0.4～0.69, 弱い:<0.4）
    expect(result.weatherStrength).toMatch(/^(strong|moderate|weak)$/);
    expect(result.eventStrength).toMatch(/^(strong|moderate|weak)$/);
    expect(result.competitorStrength).toMatch(/^(strong|moderate|weak)$/);

    // 予測精度低下要因が特定されていることを確認
    expect(result.accuracyReductionFactors).toBeDefined();
    expect(Array.isArray(result.accuracyReductionFactors)).toBe(true);
    expect(result.accuracyReductionFactors.length).toBeGreaterThan(0);

    // 各要因の影響度が0～100%の範囲内であることを確認
    result.impactFactors.forEach((factor: any) => {
      expect(factor.impactPercentage).toBeGreaterThanOrEqual(0);
      expect(factor.impactPercentage).toBeLessThanOrEqual(100);
    });

    // 各要因の影響度の合計が100%であることを確認
    const totalImpact = result.impactFactors.reduce(
      (sum: number, factor: any) => sum + factor.impactPercentage,
      0
    );
    expect(totalImpact).toBe(100);

    // 詳細分析レポートが生成可能な形式で含まれていることを確認
    expect(result.detailedReport).toBeDefined();
    expect(typeof result.detailedReport).toBe('string');
    expect(result.detailedReport.length).toBeGreaterThan(0);

    // 分析実行タイムスタンプが記録されていることを確認
    expect(result.analysisTimestamp).toBeDefined();
    expect(new Date(result.analysisTimestamp).getTime()).toBeGreaterThan(0);

    // 相関分析の統計的有意性判定結果が含まれていることを確認
    expect(result.statisticalSignificance).toBeDefined();
    expect(typeof result.statisticalSignificance.isSignificant).toBe('boolean');
    expect(typeof result.statisticalSignificance.pValue).toBe('number');
  });
});