import { extractDemandForecastAnomalies } from '../../src/logic/it-1-br-6-2-1';

describe('需要予測精度検証ダッシュボード：予測値と実績値の照合・乖離分析機能', () => {
  // SCEN-266
  test('乖離度データが不完全な場合、エラーハンドリングされ処理が中断される', () => {
    // 正常なデータセット（期待値計算用ベース）
    const validDivergenceData = {
      period_id: 'P202401',
      product_id: 'PROD_001',
      forecast_value: 100,
      actual_value: 85,
      divergence: 15,
      divergence_rate: 0.15,
      category: 'VEGETABLES',
      external_factors: ['WEATHER_RAIN'],
      timestamp: '2024-01-15T10:00:00Z',
    };

    // ケース1: divergence フィールドが undefined（欠損値）
    const incomplete_missing_divergence = {
      period_id: 'P202401',
      product_id: 'PROD_001',
      forecast_value: 100,
      actual_value: 85,
      divergence: undefined,
      divergence_rate: 0.15,
      category: 'VEGETABLES',
      external_factors: ['WEATHER_RAIN'],
      timestamp: '2024-01-15T10:00:00Z',
    };

    expect(() =>
      extractDemandForecastAnomalies([incomplete_missing_divergence])
    ).toThrow(/乖離度/);

    // ケース2: divergence_rate が null（NULL値）
    const incomplete_null_rate = {
      period_id: 'P202401',
      product_id: 'PROD_001',
      forecast_value: 100,
      actual_value: 85,
      divergence: 15,
      divergence_rate: null,
      category: 'VEGETABLES',
      external_factors: ['WEATHER_RAIN'],
      timestamp: '2024-01-15T10:00:00Z',
    };

    expect(() =>
      extractDemandForecastAnomalies([incomplete_null_rate])
    ).toThrow(/乖離度/);

    // ケース3: forecast_value が文字列型（型が不正）
    const incomplete_invalid_type = {
      period_id: 'P202401',
      product_id: 'PROD_001',
      forecast_value: '100',
      actual_value: 85,
      divergence: 15,
      divergence_rate: 0.15,
      category: 'VEGETABLES',
      external_factors: ['WEATHER_RAIN'],
      timestamp: '2024-01-15T10:00:00Z',
    };

    expect(() =>
      extractDemandForecastAnomalies([incomplete_invalid_type])
    ).toThrow(/予測値/);

    // ケース4: actual_value が負の値（ビジネス妥当性外）
    const incomplete_invalid_actual = {
      period_id: 'P202401',
      product_id: 'PROD_001',
      forecast_value: 100,
      actual_value: -5,
      divergence: 105,
      divergence_rate: 1.05,
      category: 'VEGETABLES',
      external_factors: ['WEATHER_RAIN'],
      timestamp: '2024-01-15T10:00:00Z',
    };

    expect(() =>
      extractDemandForecastAnomalies([incomplete_invalid_actual])
    ).toThrow(/実績値/);

    // ケース5: period_id が空文字列（不完全なキー）
    const incomplete_empty_period = {
      period_id: '',
      product_id: 'PROD_001',
      forecast_value: 100,
      actual_value: 85,
      divergence: 15,
      divergence_rate: 0.15,
      category: 'VEGETABLES',
      external_factors: ['WEATHER_RAIN'],
      timestamp: '2024-01-15T10:00:00Z',
    };

    expect(() =>
      extractDemandForecastAnomalies([incomplete_empty_period])
    ).toThrow(/期間/);

    // ケース6: timestamp が無効な ISO 文字列
    const incomplete_invalid_timestamp = {
      period_id: 'P202401',
      product_id: 'PROD_001',
      forecast_value: 100,
      actual_value: 85,
      divergence: 15,
      divergence_rate: 0.15,
      category: 'VEGETABLES',
      external_factors: ['WEATHER_RAIN'],
      timestamp: 'invalid-date',
    };

    expect(() =>
      extractDemandForecastAnomalies([incomplete_invalid_timestamp])
    ).toThrow(/タイムスタンプ/);

    // ケース7: 複数の欠損が同時に存在する場合
    const incomplete_multiple_missing = {
      period_id: 'P202401',
      product_id: 'PROD_001',
      forecast_value: undefined,
      actual_value: undefined,
      divergence: 15,
      divergence_rate: 0.15,
      category: 'VEGETABLES',
      external_factors: ['WEATHER_RAIN'],
      timestamp: '2024-01-15T10:00:00Z',
    };

    expect(() =>
      extractDemandForecastAnomalies([incomplete_multiple_missing])
    ).toThrow(/予測値|実績値/);

    // ケース8: category が空（カテゴリ不明）
    const incomplete_empty_category = {
      period_id: 'P202401',
      product_id: 'PROD_001',
      forecast_value: 100,
      actual_value: 85,
      divergence: 15,
      divergence_rate: 0.15,
      category: '',
      external_factors: ['WEATHER_RAIN'],
      timestamp: '2024-01-15T10:00:00Z',
    };

    expect(() =>
      extractDemandForecastAnomalies([incomplete_empty_category])
    ).toThrow(/カテゴリ/);

    // ケース9: 正常なデータでは処理が成功し、主要因が抽出される
    const result = extractDemandForecastAnomalies([validDivergenceData]);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('anomaly_id');
    expect(result[0]).toHaveProperty('detected_at');
    expect(result[0].divergence_rate).toBe(0.15);
    expect(result[0].primary_factors).toBeDefined();
    expect(Array.isArray(result[0].primary_factors)).toBe(true);

    // ケース10: 乖離度が閾値を超える場合（10%以上低下）、異常として検出される
    const high_divergence_data = {
      period_id: 'P202401',
      product_id: 'PROD_002',
      forecast_value: 100,
      actual_value: 89,
      divergence: 11,
      divergence_rate: 0.11,
      category: 'MEAT',
      external_factors: ['COMPETITOR_PROMOTION'],
      timestamp: '2024-01-15T10:00:00Z',
    };

    const high_divergence_result = extractDemandForecastAnomalies([
      high_divergence_data,
    ]);
    expect(high_divergence_result).toBeDefined();
    expect(high_divergence_result.length).toBe(1);
    expect(high_divergence_result[0].is_anomaly).toBe(true);
    expect(high_divergence_result[0].divergence_rate).toBe(0.11);
  });
});