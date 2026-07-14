import { calculateDemandForecastAccuracy } from '../../src/logic/it-7-2-1';

describe('需要予測精度計算ダッシュボード - 境界値精度検証', () => {
  test('SCEN-785: 予測精度が許容誤差範囲の境界値と同一の場合に判定を正確に実行する', () => {
    // ===== 初期化フェーズ =====
    const tolerance_percentage = 5; // 許容誤差範囲：±5%
    const tolerance_decimal = tolerance_percentage / 100; // 0.05

    // ===== ケース1: 下限値（-5%）と同一の予測精度 =====
    // 予測値 100、実績値 105 → 乖離度 -4.76% ≈ -5.0%
    const forecast_value_lower = 100;
    const actual_value_lower = 105;
    const expected_accuracy_lower = forecast_value_lower / actual_value_lower; // 0.952381...
    const accuracy_percentage_lower = (expected_accuracy_lower - 1) * 100; // -4.7619%

    const result_lower = calculateDemandForecastAccuracy({
      forecast_value: forecast_value_lower,
      actual_value: actual_value_lower,
      tolerance_percentage: tolerance_percentage,
    });

    // 下限値判定：誤差 ≤ -5% は許容範囲内
    expect(result_lower.is_within_tolerance).toBe(true);
    expect(result_lower.accuracy_percentage).toBeCloseTo(accuracy_percentage_lower, 1);
    expect(result_lower.judgment_status).toBe('acceptable');
    expect(result_lower.deviation_magnitude).toBeCloseTo(Math.abs(accuracy_percentage_lower), 1);

    // ===== ケース2: 上限値（+5%）と同一の予測精度 =====
    // 予測値 105、実績値 100 → 乖離度 +5.0%
    const forecast_value_upper = 105;
    const actual_value_upper = 100;
    const expected_accuracy_upper = forecast_value_upper / actual_value_upper; // 1.05
    const accuracy_percentage_upper = (expected_accuracy_upper - 1) * 100; // 5.0%

    const result_upper = calculateDemandForecastAccuracy({
      forecast_value: forecast_value_upper,
      actual_value: actual_value_upper,
      tolerance_percentage: tolerance_percentage,
    });

    // 上限値判定：誤差 ≤ +5% は許容範囲内
    expect(result_upper.is_within_tolerance).toBe(true);
    expect(result_upper.accuracy_percentage).toBeCloseTo(accuracy_percentage_upper, 1);
    expect(result_upper.judgment_status).toBe('acceptable');
    expect(result_upper.deviation_magnitude).toBeCloseTo(Math.abs(accuracy_percentage_upper), 1);

    // ===== ケース3: 許容範囲外（下限を超過）=====
    // 予測値 95、実績値 100 → 乖離度 -5.26% < -5.0%（許容範囲外）
    const forecast_value_out_lower = 95;
    const actual_value_out_lower = 100;
    const result_out_lower = calculateDemandForecastAccuracy({
      forecast_value: forecast_value_out_lower,
      actual_value: actual_value_out_lower,
      tolerance_percentage: tolerance_percentage,
    });

    expect(result_out_lower.is_within_tolerance).toBe(false);
    expect(result_out_lower.judgment_status).toBe('out_of_range');

    // ===== ケース4: 許容範囲外（上限を超過）=====
    // 予測値 106、実績値 100 → 乖離度 +6.0% > +5.0%（許容範囲外）
    const forecast_value_out_upper = 106;
    const actual_value_out_upper = 100;
    const result_out_upper = calculateDemandForecastAccuracy({
      forecast_value: forecast_value_out_upper,
      actual_value: actual_value_out_upper,
      tolerance_percentage: tolerance_percentage,
    });

    expect(result_out_upper.is_within_tolerance).toBe(false);
    expect(result_out_upper.judgment_status).toBe('out_of_range');

    // ===== ダッシュボード表示の正確性検証 =====
    // 境界値での判定結果がダッシュボード表示仕様と一致
    expect(result_lower.dashboard_display.status_label).toBe('許容範囲内');
    expect(result_lower.dashboard_display.status_color).toBe('green');
    expect(result_lower.dashboard_display.accuracy_display).toContain('-');

    expect(result_upper.dashboard_display.status_label).toBe('許容範囲内');
    expect(result_upper.dashboard_display.status_color).toBe('green');
    expect(result_upper.dashboard_display.accuracy_display).toContain('+');

    expect(result_out_lower.dashboard_display.status_label).toBe('許容範囲外');
    expect(result_out_lower.dashboard_display.status_color).toBe('red');

    expect(result_out_upper.dashboard_display.status_label).toBe('許容範囲外');
    expect(result_out_upper.dashboard_display.status_color).toBe('red');

    // ===== 浮動小数点演算精度の確認 =====
    // 境界値での誤差計算結果が精度要件を満たすこと
    expect(Math.abs(result_lower.accuracy_percentage - accuracy_percentage_lower)).toBeLessThan(0.1);
    expect(Math.abs(result_upper.accuracy_percentage - accuracy_percentage_upper)).toBeLessThan(0.1);

    // 境界値の等号条件が正確に実装されていることを検証
    const boundary_test_lower = Math.abs(accuracy_percentage_lower + tolerance_percentage);
    const boundary_test_upper = Math.abs(accuracy_percentage_upper - tolerance_percentage);
    expect(boundary_test_lower).toBeLessThan(0.1); // ほぼ 0（境界値）
    expect(boundary_test_upper).toBeLessThan(0.1); // ほぼ 0（境界値）
  });
});