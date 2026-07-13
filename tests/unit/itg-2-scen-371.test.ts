import { describe, test, expect } from '@jest/globals';
import { calculateCorrelationCoefficients } from '../../src/logic/it-1-br-2-1-1-1';

describe('外部データ相関分析による予測精度低下要因特定', () => {
  // SCEN-371
  test('気象・イベント・競合施策と実績需要の相関係数が正しく計算される', () => {
    // 入力データ：気象データ
    const weatherData = {
      temperature: [15, 18, 20, 22, 25, 28, 30, 29, 26, 23, 19, 16],
      precipitation: [10, 5, 0, 2, 15, 8, 3, 5, 12, 8, 6, 11],
    };

    // 入力データ：イベント情報
    const eventData = {
      isWeekend: [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
      isSale: [0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0],
    };

    // 入力データ：競合施策
    const competitorData = {
      discountRate: [0, 5, 0, 10, 0, 15, 20, 5, 10, 0, 5, 0],
      campaignIntensity: [0, 3, 0, 5, 0, 8, 10, 2, 6, 0, 3, 0],
    };

    // 基準データ：実績需要
    const actualDemand = [100, 120, 105, 135, 110, 180, 200, 125, 145, 115, 130, 108];

    const result = calculateCorrelationCoefficients({
      weatherData,
      eventData,
      competitorData,
      actualDemand,
    });

    // 相関係数が計算されていることを確認
    expect(result).toHaveProperty('weatherCorrelation');
    expect(result).toHaveProperty('eventCorrelation');
    expect(result).toHaveProperty('competitorCorrelation');

    // 気象データとの相関係数が-1から1の範囲内であることを検証
    expect(result.weatherCorrelation.temperature).toBeGreaterThanOrEqual(-1);
    expect(result.weatherCorrelation.temperature).toBeLessThanOrEqual(1);
    expect(result.weatherCorrelation.precipitation).toBeGreaterThanOrEqual(-1);
    expect(result.weatherCorrelation.precipitation).toBeLessThanOrEqual(1);

    // イベント情報との相関係数が-1から1の範囲内であることを検証
    expect(result.eventCorrelation.isWeekend).toBeGreaterThanOrEqual(-1);
    expect(result.eventCorrelation.isWeekend).toBeLessThanOrEqual(1);
    expect(result.eventCorrelation.isSale).toBeGreaterThanOrEqual(-1);
    expect(result.eventCorrelation.isSale).toBeLessThanOrEqual(1);

    // 競合施策との相関係数が-1から1の範囲内であることを検証
    expect(result.competitorCorrelation.discountRate).toBeGreaterThanOrEqual(-1);
    expect(result.competitorCorrelation.discountRate).toBeLessThanOrEqual(1);
    expect(result.competitorCorrelation.campaignIntensity).toBeGreaterThanOrEqual(-1);
    expect(result.competitorCorrelation.campaignIntensity).toBeLessThanOrEqual(1);

    // 計算された相関係数が数学的に正確であることをサンプルデータで検証
    // 気温と実績需要の相関係数：正の相関が期待される（気温上昇で需要増加傾向）
    expect(result.weatherCorrelation.temperature).toBeGreaterThan(0.5);

    // イベント情報（セール）と実績需要の相関係数：正の相関が期待される
    expect(result.eventCorrelation.isSale).toBeGreaterThan(0.6);

    // 競合施策（割引率）と実績需要の相関係数：正の相関が期待される
    expect(result.competitorCorrelation.discountRate).toBeGreaterThan(0.7);

    // 相関係数の精度が小数点以下4桁まで正確に表示されていることを確認
    const temperatureCorrelationStr = result.weatherCorrelation.temperature.toString();
    const decimalPlaces = temperatureCorrelationStr.includes('.')
      ? temperatureCorrelationStr.split('.')[1].length
      : 0;
    expect(decimalPlaces).toBeGreaterThanOrEqual(4);

    // 複数の外部データ要因の相関係数が同時に正しく表示されていることを確認
    const allCorrelations = [
      result.weatherCorrelation.temperature,
      result.weatherCorrelation.precipitation,
      result.eventCorrelation.isWeekend,
      result.eventCorrelation.isSale,
      result.competitorCorrelation.discountRate,
      result.competitorCorrelation.campaignIntensity,
    ];

    expect(allCorrelations.length).toBe(6);
    allCorrelations.forEach((correlation) => {
      expect(typeof correlation).toBe('number');
      expect(correlation).toBeGreaterThanOrEqual(-1);
      expect(correlation).toBeLessThanOrEqual(1);
      expect(Number.isFinite(correlation)).toBe(true);
    });

    // 構造化された結果が返されていることを確認
    expect(result.timestamp).toBeDefined();
    expect(typeof result.timestamp).toBe('string');
  });
});