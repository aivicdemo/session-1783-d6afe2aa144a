import { calculateDemandForecastAccuracy } from '../../src/logic/it-7-2-1';

describe('需要予測精度計算機能 - 許容誤差範囲判定', () => {
  test('SCEN-784: 予測値と実績値から誤差率を算出し、許容誤差範囲との比較判定を正確に実行する', () => {
    // ========== 前提条件 ==========
    // 需要予測精度計算機能が複数のデータセットを受け取り、
    // 許容誤差範囲（±5%）に対して誤差率が範囲内/範囲外を正確に判定する

    // ========== テストケース 1: 誤差率が許容範囲内（2.5%） ==========
    const dataset1_within = {
      forecastedValue: 100,
      actualValue: 102.5,
      tolerancePercentage: 5,
    };
    const result1 = calculateDemandForecastAccuracy(dataset1_within);
    expect(result1.errorPercentage).toBe(2.5);
    expect(result1.isWithinTolerance).toBe(true);
    expect(result1.status).toBe('WITHIN_RANGE');

    // ========== テストケース 2: 誤差率が許容範囲外（7.2%） ==========
    const dataset2_exceed = {
      forecastedValue: 100,
      actualValue: 107.2,
      tolerancePercentage: 5,
    };
    const result2 = calculateDemandForecastAccuracy(dataset2_exceed);
    expect(result2.errorPercentage).toBe(7.2);
    expect(result2.isWithinTolerance).toBe(false);
    expect(result2.status).toBe('EXCEEDS_RANGE');

    // ========== テストケース 3: 境界値ケース - 上限ちょうど（5.0%） ==========
    const dataset3_boundary_upper = {
      forecastedValue: 100,
      actualValue: 105.0,
      tolerancePercentage: 5,
    };
    const result3 = calculateDemandForecastAccuracy(dataset3_boundary_upper);
    expect(result3.errorPercentage).toBe(5.0);
    expect(result3.isWithinTolerance).toBe(true);
    expect(result3.status).toBe('WITHIN_RANGE');

    // ========== テストケース 4: 境界値ケース - 下限ちょうど（-5.0%） ==========
    const dataset4_boundary_lower = {
      forecastedValue: 100,
      actualValue: 95.0,
      tolerancePercentage: 5,
    };
    const result4 = calculateDemandForecastAccuracy(dataset4_boundary_lower);
    expect(result4.errorPercentage).toBe(-5.0);
    expect(result4.isWithinTolerance).toBe(true);
    expect(result4.status).toBe('WITHIN_RANGE');

    // ========== テストケース 5: 誤差率がマイナス方向で許容範囲外（-6.3%） ==========
    const dataset5_negative_exceed = {
      forecastedValue: 100,
      actualValue: 93.7,
      tolerancePercentage: 5,
    };
    const result5 = calculateDemandForecastAccuracy(dataset5_negative_exceed);
    expect(result5.errorPercentage).toBe(-6.3);
    expect(result5.isWithinTolerance).toBe(false);
    expect(result5.status).toBe('EXCEEDS_RANGE');

    // ========== テストケース 6: 複数データセット一貫性検証 - 異なる許容誤差幅での判定 ==========
    const dataset6_tolerance_3pct = {
      forecastedValue: 200,
      actualValue: 206,
      tolerancePercentage: 3,
    };
    const result6 = calculateDemandForecastAccuracy(dataset6_tolerance_3pct);
    expect(result6.errorPercentage).toBe(3.0);
    expect(result6.isWithinTolerance).toBe(true);
    expect(result6.status).toBe('WITHIN_RANGE');

    // ========== テストケース 7: 複数データセット一貫性検証 - 許容誤差幅2%で範囲外 ==========
    const dataset7_tolerance_2pct = {
      forecastedValue: 200,
      actualValue: 206,
      tolerancePercentage: 2,
    };
    const result7 = calculateDemandForecastAccuracy(dataset7_tolerance_2pct);
    expect(result7.errorPercentage).toBe(3.0);
    expect(result7.isWithinTolerance).toBe(false);
    expect(result7.status).toBe('EXCEEDS_RANGE');

    // ========== テストケース 8: 誤差0%の完全一致ケース ==========
    const dataset8_perfect_match = {
      forecastedValue: 150,
      actualValue: 150,
      tolerancePercentage: 5,
    };
    const result8 = calculateDemandForecastAccuracy(dataset8_perfect_match);
    expect(result8.errorPercentage).toBe(0);
    expect(result8.isWithinTolerance).toBe(true);
    expect(result8.status).toBe('WITHIN_RANGE');

    // ========== テストケース 9: 小数点精度の検証 - 誤差率4.8%（許容5%） ==========
    const dataset9_small_decimal = {
      forecastedValue: 1000,
      actualValue: 1048,
      tolerancePercentage: 5,
    };
    const result9 = calculateDemandForecastAccuracy(dataset9_small_decimal);
    expect(result9.errorPercentage).toBe(4.8);
    expect(result9.isWithinTolerance).toBe(true);
    expect(result9.status).toBe('WITHIN_RANGE');

    // ========== テストケース 10: 小数点精度の検証 - 誤差率5.1%（許容5%超過） ==========
    const dataset10_small_decimal_exceed = {
      forecastedValue: 1000,
      actualValue: 1051,
      tolerancePercentage: 5,
    };
    const result10 = calculateDemandForecastAccuracy(dataset10_small_decimal_exceed);
    expect(result10.errorPercentage).toBe(5.1);
    expect(result10.isWithinTolerance).toBe(false);
    expect(result10.status).toBe('EXCEEDS_RANGE');
  });
});