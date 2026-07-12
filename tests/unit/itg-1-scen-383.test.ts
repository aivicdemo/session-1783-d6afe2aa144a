import { calculateDemandForecastDeviation } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-383: [normal] 需要予測精度の乖離分析機能 - 需要予測データと実績在庫・売上データから予測値と実績値の乖離度が自動計算される
  test('需要予測値と実績値の乖離度が自動計算され、乖離率・絶対乖離値・分類が正確に表示される', () => {
    // 【ハッピーパス】標準的な予測・実績データセット
    const forecastData1 = {
      predictedSalesQuantity: 100,
      predictedInventoryQuantity: 50,
      forecastTimestamp: new Date('2024-01-15T09:00:00Z')
    };
    const actualData1 = {
      actualSalesQuantity: 95,
      actualInventoryQuantity: 48,
      actualTimestamp: new Date('2024-01-15T17:00:00Z')
    };

    const result1 = calculateDemandForecastDeviation(forecastData1, actualData1);

    // 期待値計算: 売上数量の乖離度 = |95 - 100| / 100 * 100 = 5%
    // 在庫量の乖離度 = |48 - 50| / 50 * 100 = 4%
    // 平均乖離度 = (5 + 4) / 2 = 4.5%
    expect(result1.salesDeviationRate).toBe(5);
    expect(result1.inventoryDeviationRate).toBe(4);
    expect(result1.averageDeviationRate).toBe(4.5);
    expect(result1.absoluteSalesDeviation).toBe(5);
    expect(result1.absoluteInventoryDeviation).toBe(2);
    expect(result1.deviationClassification).toBe('standard');

    // 【境界値】乖離度が小さい場合（良好）
    const forecastData2 = {
      predictedSalesQuantity: 1000,
      predictedInventoryQuantity: 500,
      forecastTimestamp: new Date('2024-01-16T09:00:00Z')
    };
    const actualData2 = {
      actualSalesQuantity: 998,
      actualInventoryQuantity: 499,
      actualTimestamp: new Date('2024-01-16T17:00:00Z')
    };

    const result2 = calculateDemandForecastDeviation(forecastData2, actualData2);

    // 売上数量の乖離度 = |998 - 1000| / 1000 * 100 = 0.2%
    // 在庫量の乖離度 = |499 - 500| / 500 * 100 = 0.2%
    // 平均乖離度 = (0.2 + 0.2) / 2 = 0.2%
    expect(result2.salesDeviationRate).toBe(0.2);
    expect(result2.inventoryDeviationRate).toBe(0.2);
    expect(result2.averageDeviationRate).toBe(0.2);
    expect(result2.absoluteSalesDeviation).toBe(2);
    expect(result2.absoluteInventoryDeviation).toBe(1);
    expect(result2.deviationClassification).toBe('good');

    // 【境界値】乖離度が大きい場合（要改善）
    const forecastData3 = {
      predictedSalesQuantity: 100,
      predictedInventoryQuantity: 50,
      forecastTimestamp: new Date('2024-01-17T09:00:00Z')
    };
    const actualData3 = {
      actualSalesQuantity: 75,
      actualInventoryQuantity: 35,
      actualTimestamp: new Date('2024-01-17T17:00:00Z')
    };

    const result3 = calculateDemandForecastDeviation(forecastData3, actualData3);

    // 売上数量の乖離度 = |75 - 100| / 100 * 100 = 25%
    // 在庫量の乖離度 = |35 - 50| / 50 * 100 = 30%
    // 平均乖離度 = (25 + 30) / 2 = 27.5%
    expect(result3.salesDeviationRate).toBe(25);
    expect(result3.inventoryDeviationRate).toBe(30);
    expect(result3.averageDeviationRate).toBe(27.5);
    expect(result3.absoluteSalesDeviation).toBe(25);
    expect(result3.absoluteInventoryDeviation).toBe(15);
    expect(result3.deviationClassification).toBe('needsImprovement');

    // 【詳細内訳チェック】乖離度の分類と詳細が含まれていることを確認
    expect(result1).toHaveProperty('deviationTrend');
    expect(result1).toHaveProperty('categoryBreakdown');
    expect(result1.categoryBreakdown).toHaveLength(2);
    expect(result1.categoryBreakdown[0]).toHaveProperty('category');
    expect(result1.categoryBreakdown[0]).toHaveProperty('deviationRate');

    // 【エラーハンドリング】予測値がゼロの場合
    const forecastDataZero = {
      predictedSalesQuantity: 0,
      predictedInventoryQuantity: 50,
      forecastTimestamp: new Date('2024-01-18T09:00:00Z')
    };
    const actualDataZero = {
      actualSalesQuantity: 10,
      actualInventoryQuantity: 48,
      actualTimestamp: new Date('2024-01-18T17:00:00Z')
    };

    expect(() => calculateDemandForecastDeviation(forecastDataZero, actualDataZero)).toThrow(/予測値/);

    // 【エラーハンドリ】実績値が負の場合
    const forecastDataNeg = {
      predictedSalesQuantity: 100,
      predictedInventoryQuantity: 50,
      forecastTimestamp: new Date('2024-01-19T09:00:00Z')
    };
    const actualDataNeg = {
      actualSalesQuantity: -10,
      actualInventoryQuantity: 48,
      actualTimestamp: new Date('2024-01-19T17:00:00Z')
    };

    expect(() => calculateDemandForecastDeviation(forecastDataNeg, actualDataNeg)).toThrow(/実績値/);
  });
});