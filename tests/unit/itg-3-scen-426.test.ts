import { calculateDemandForecastAccuracy } from '../../src/logic/it-1-br-3-2-1';

describe('需要予測精度検証ダッシュボード - 乖離率閾値判定', () => {
  // SCEN-426
  test('予測値と実績値の乖離が閾値以下の場合、改善見送りと判定される', () => {
    // Arrange: テスト用の予測データと実績データを準備（乖離率が閾値以下）
    const forecast_value = 1000;
    const actual_value = 1050;
    const threshold_percentage = 10; // 閾値: 10%

    // 乖離率計算: |実績 - 予測| / 予測 × 100
    // = |1050 - 1000| / 1000 × 100 = 50 / 1000 × 100 = 5%
    const expected_deviation_rate = 5;
    const expected_improvement_decision = 'skip';
    const expected_status = 'normal';
    const expected_show_recommendation = false;

    // Act: 乖離率の計算処理と判定ロジックを実行
    const result = calculateDemandForecastAccuracy({
      forecast_value,
      actual_value,
      threshold_percentage,
    });

    // Assert: 結果を検証
    expect(result.deviation_rate).toBe(expected_deviation_rate);
    expect(result.improvement_decision).toBe(expected_improvement_decision);
    expect(result.status).toBe(expected_status);
    expect(result.show_recommendation).toBe(expected_show_recommendation);
  });
});