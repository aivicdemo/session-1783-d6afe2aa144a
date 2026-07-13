import { calculateDemandForecastAccuracy } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-427: [normal] 需要予測精度検証ダッシュボード - 予測値と実績値の乖離が閾値を超過した場合、改善実施と判定される
  test('予測値と実績値の乖離率が閾値を超過する場合、改善実施フラグがtrueで返される', () => {
    const predicted_value = 100;
    const actual_value = 150;
    const threshold_percentage = 20;

    // 期待される乖離率の計算: |100 - 150| / 150 × 100 = 50 / 150 × 100 = 33.333...%
    const expected_deviation_rate = 33.33;
    const expected_should_improve = true;

    const result = calculateDemandForecastAccuracy({
      predicted_value,
      actual_value,
      threshold_percentage,
    });

    // 乖離率が正確に計算されていること
    expect(result.deviation_rate).toBeCloseTo(expected_deviation_rate, 1);

    // 乖離率が閾値（20%）を超過しているため、改善実施フラグがtrueであること
    expect(result.should_improve).toBe(expected_should_improve);

    // 判定ロジックが正しく動作していることを確認
    expect(result.deviation_rate).toBeGreaterThan(result.threshold_percentage);
  });

  // 境界値テスト: 乖離率が閾値と同一の場合
  test('予測値と実績値の乖離率が閾値と同一の場合、改善実施フラグがfalseで返される', () => {
    const predicted_value = 100;
    const actual_value = 125;
    const threshold_percentage = 20;

    // 期待される乖離率: |100 - 125| / 125 × 100 = 25 / 125 × 100 = 20%
    const expected_deviation_rate = 20;
    const expected_should_improve = false;

    const result = calculateDemandForecastAccuracy({
      predicted_value,
      actual_value,
      threshold_percentage,
    });

    expect(result.deviation_rate).toBeCloseTo(expected_deviation_rate, 1);
    expect(result.should_improve).toBe(expected_should_improve);
  });

  // 境界値テスト: 乖離率が閾値以下の場合
  test('予測値と実績値の乖離率が閾値以下の場合、改善実施フラグがfalseで返される', () => {
    const predicted_value = 100;
    const actual_value = 110;
    const threshold_percentage = 20;

    // 期待される乖離率: |100 - 110| / 110 × 100 = 10 / 110 × 100 ≈ 9.09%
    const expected_deviation_rate = 9.09;
    const expected_should_improve = false;

    const result = calculateDemandForecastAccuracy({
      predicted_value,
      actual_value,
      threshold_percentage,
    });

    expect(result.deviation_rate).toBeCloseTo(expected_deviation_rate, 1);
    expect(result.should_improve).toBe(expected_should_improve);
  });

  // エラーテスト: 実績値が0の場合（ゼロ除算）
  test('実績値が0の場合、エラーが発生する', () => {
    const predicted_value = 100;
    const actual_value = 0;
    const threshold_percentage = 20;

    expect(() => {
      calculateDemandForecastAccuracy({
        predicted_value,
        actual_value,
        threshold_percentage,
      });
    }).toThrow(/除数/);
  });

  // エラーテスト: 負の値が入力された場合
  test('予測値または実績値が負の場合、エラーが発生する', () => {
    const predicted_value = -100;
    const actual_value = 150;
    const threshold_percentage = 20;

    expect(() => {
      calculateDemandForecastAccuracy({
        predicted_value,
        actual_value,
        threshold_percentage,
      });
    }).toThrow(/負数/);
  });

  // エラーテスト: 閾値が負の場合
  test('閾値が負の場合、エラーが発生する', () => {
    const predicted_value = 100;
    const actual_value = 150;
    const threshold_percentage = -20;

    expect(() => {
      calculateDemandForecastAccuracy({
        predicted_value,
        actual_value,
        threshold_percentage,
      });
    }).toThrow(/閾値/);
  });
});