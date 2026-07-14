import { calculateDemandForecastPrecision } from '../../src/logic/it-7-2-1';

describe('需要予測精度の乖離分析機能 - 境界値判定', () => {
  test('SCEN-585: 予測精度がちょうど閾値の境界値のとき、乖離分析が正確に判定される', () => {
    const precision_threshold = 80.0;

    // 境界値の直前（79.99%）- 基準未達
    const result_before_threshold = calculateDemandForecastPrecision({
      predicted_demand: 100,
      actual_demand: 125.01,
      threshold_percentage: precision_threshold,
    });
    expect(result_before_threshold.meets_threshold).toBe(false);
    expect(result_before_threshold.precision_percentage).toBeCloseTo(79.99, 2);
    expect(result_before_threshold.judgment_status).toBe('below_threshold');

    // 閾値と同一（80.00%）- 基準達成
    const result_at_threshold = calculateDemandForecastPrecision({
      predicted_demand: 100,
      actual_demand: 125.0,
      threshold_percentage: precision_threshold,
    });
    expect(result_at_threshold.meets_threshold).toBe(true);
    expect(result_at_threshold.precision_percentage).toBeCloseTo(80.0, 2);
    expect(result_at_threshold.judgment_status).toBe('meets_threshold');

    // 閾値の直後（80.01%）- 基準超過
    const result_after_threshold = calculateDemandForecastPrecision({
      predicted_demand: 100,
      actual_demand: 124.99,
      threshold_percentage: precision_threshold,
    });
    expect(result_after_threshold.meets_threshold).toBe(true);
    expect(result_after_threshold.precision_percentage).toBeCloseTo(80.01, 2);
    expect(result_after_threshold.judgment_status).toBe('exceeds_threshold');

    // 3パターンの判定結果が一貫性を持ち、誤分類が発生していないことを検証
    expect(result_before_threshold.meets_threshold).not.toBe(
      result_at_threshold.meets_threshold
    );
    expect(result_at_threshold.meets_threshold).toBe(
      result_after_threshold.meets_threshold
    );
    expect(result_before_threshold.judgment_status).not.toBe(
      result_at_threshold.judgment_status
    );
    expect(result_at_threshold.judgment_status).not.toBe(
      result_after_threshold.judgment_status
    );

    // 3パターンの精度が昇順を保つことを検証
    expect(result_before_threshold.precision_percentage).toBeLessThan(
      result_at_threshold.precision_percentage
    );
    expect(result_at_threshold.precision_percentage).toBeLessThan(
      result_after_threshold.precision_percentage
    );
  });
});