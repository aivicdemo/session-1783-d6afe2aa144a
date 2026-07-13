import { analyzeExternalFactorsAndExtractVariables } from '../../src/logic/it-2-br-6-3-2';

describe('外部要因との相関分析・変数抽出', () => {
  // SCEN-271
  test('気象・イベント・競合施策データから有意な相関を持つ変数を自動抽出する', () => {
    // 準備: 気象データ（気温、降水量、湿度）、イベント、競合施策、実績需要データを構築
    const weatherData = [
      { timestamp: '2024-01-01T00:00:00Z', temperature: 5.2, precipitation: 0.0, humidity: 65 },
      { timestamp: '2024-01-02T00:00:00Z', temperature: 6.1, precipitation: 2.5, humidity: 72 },
      { timestamp: '2024-01-03T00:00:00Z', temperature: 4.8, precipitation: 0.0, humidity: 58 },
      { timestamp: '2024-01-04T00:00:00Z', temperature: 8.3, precipitation: 1.2, humidity: 68 },
      { timestamp: '2024-01-05T00:00:00Z', temperature: 7.9, precipitation: 0.0, humidity: 62 },
      { timestamp: '2024-01-06T00:00:00Z', temperature: 9.1, precipitation: 3.8, humidity: 75 },
      { timestamp: '2024-01-07T00:00:00Z', temperature: 6.5, precipitation: 0.5, humidity: 70 },
      { timestamp: '2024-01-08T00:00:00Z', temperature: 5.3, precipitation: 0.0, humidity: 60 },
      { timestamp: '2024-01-09T00:00:00Z', temperature: 10.2, precipitation: 5.1, humidity: 80 },
      { timestamp: '2024-01-10T00:00:00Z', temperature: 11.0, precipitation: 2.3, humidity: 73 }
    ];

    const eventData = [
      { timestamp: '2024-01-01T00:00:00Z', isHoliday: true, eventType: 'new_year' },
      { timestamp: '2024-01-02T00:00:00Z', isHoliday: false, eventType: 'none' },
      { timestamp: '2024-01-03T00:00:00Z', isHoliday: false, eventType: 'none' },
      { timestamp: '2024-01-04T00:00:00Z', isHoliday: false, eventType: 'none' },
      { timestamp: '2024-01-05T00:00:00Z', isHoliday: false, eventType: 'none' },
      { timestamp: '2024-01-06T00:00:00Z', isHoliday: true, eventType: 'winter_sale' },
      { timestamp: '2024-01-07T00:00:00Z', isHoliday: false, eventType: 'none' },
      { timestamp: '2024-01-08T00:00:00Z', isHoliday: false, eventType: 'none' },
      { timestamp: '2024-01-09T00:00:00Z', isHoliday: false, eventType: 'seasonal_promotion' },
      { timestamp: '2024-01-10T00:00:00Z', isHoliday: false, eventType: 'none' }
    ];

    const competitorData = [
      { timestamp: '2024-01-01T00:00:00Z', discountRate: 0.0, campaignActive: false },
      { timestamp: '2024-01-02T00:00:00Z', discountRate: 0.0, campaignActive: false },
      { timestamp: '2024-01-03T00:00:00Z', discountRate: 0.0, campaignActive: false },
      { timestamp: '2024-01-04T00:00:00Z', discountRate: 0.0, campaignActive: false },
      { timestamp: '2024-01-05T00:00:00Z', discountRate: 0.0, campaignActive: false },
      { timestamp: '2024-01-06T00:00:00Z', discountRate: 0.15, campaignActive: true },
      { timestamp: '2024-01-07T00:00:00Z', discountRate: 0.15, campaignActive: true },
      { timestamp: '2024-01-08T00:00:00Z', discountRate: 0.0, campaignActive: false },
      { timestamp: '2024-01-09T00:00:00Z', discountRate: 0.2, campaignActive: true },
      { timestamp: '2024-01-10T00:00:00Z', discountRate: 0.2, campaignActive: true }
    ];

    const actualDemandData = [
      { timestamp: '2024-01-01T00:00:00Z', demandQuantity: 250 },
      { timestamp: '2024-01-02T00:00:00Z', demandQuantity: 245 },
      { timestamp: '2024-01-03T00:00:00Z', demandQuantity: 240 },
      { timestamp: '2024-01-04T00:00:00Z', demandQuantity: 280 },
      { timestamp: '2024-01-05T00:00:00Z', demandQuantity: 275 },
      { timestamp: '2024-01-06T00:00:00Z', demandQuantity: 320 },
      { timestamp: '2024-01-07T00:00:00Z', demandQuantity: 310 },
      { timestamp: '2024-01-08T00:00:00Z', demandQuantity: 260 },
      { timestamp: '2024-01-09T00:00:00Z', demandQuantity: 340 },
      { timestamp: '2024-01-10T00:00:00Z', demandQuantity: 350 }
    ];

    // 関数実行: 相関分析・有意変数抽出
    const result = analyzeExternalFactorsAndExtractVariables({
      weatherData,
      eventData,
      competitorData,
      actualDemandData
    });

    // 検証: 結果構造が正しいこと
    expect(result).toBeDefined();
    expect(Array.isArray(result.significantVariables)).toBe(true);
    expect(typeof result.analysisTimestamp).toBe('string');

    // 検証: 抽出された有意変数が複数存在すること（相関が十分に存在することを想定）
    expect(result.significantVariables.length).toBeGreaterThan(0);

    // 検証: 各変数に必須フィールドが存在し、型が正しいこと
    result.significantVariables.forEach((variable: any) => {
      expect(typeof variable.variableName).toBe('string');
      expect(typeof variable.correlationCoefficient).toBe('number');
      expect(typeof variable.pValue).toBe('number');
      expect(typeof variable.dataSource).toBe('string');
    });

    // 検証: 相関係数が-1.0～1.0の範囲内であること
    result.significantVariables.forEach((variable: any) => {
      expect(variable.correlationCoefficient).toBeGreaterThanOrEqual(-1.0);
      expect(variable.correlationCoefficient).toBeLessThanOrEqual(1.0);
    });

    // 検証: p値がすべて0.05未満（有意水準内）であること
    result.significantVariables.forEach((variable: any) => {
      expect(variable.pValue).toBeLessThan(0.05);
      expect(variable.pValue).toBeGreaterThanOrEqual(0.0);
    });

    // 検証: 相関係数の絶対値で降順にソートされていること
    for (let i = 0; i < result.significantVariables.length - 1; i++) {
      const currentAbsCorr = Math.abs(result.significantVariables[i].correlationCoefficient);
      const nextAbsCorr = Math.abs(result.significantVariables[i + 1].correlationCoefficient);
      expect(currentAbsCorr).toBeGreaterThanOrEqual(nextAbsCorr);
    }

    // 検証: 気象・イベント・競合施策のいずれかのデータソースが含まれていること
    const validDataSources = ['weather', 'event', 'competitor'];
    result.significantVariables.forEach((variable: any) => {
      expect(validDataSources).toContain(variable.dataSource);
    });

    // 検証: 変数名が空でないこと
    result.significantVariables.forEach((variable: any) => {
      expect(variable.variableName.length).toBeGreaterThan(0);
    });

    // 検証: 具体的な相関係数値を確認（気温・降水量・イベント・割引率などが高い相関を示すことを期待）
    const highestCorrelation = result.significantVariables[0];
    expect(Math.abs(highestCorrelation.correlationCoefficient)).toBeGreaterThan(0.5);

    // 検証: 複数の変数が抽出されていることを確認（データセットの複雑性から複数の有意変数が期待される）
    expect(result.significantVariables.length).toBeGreaterThanOrEqual(2);
  });
});