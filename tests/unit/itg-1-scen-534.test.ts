import { calculateDemandForecastAccuracy } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-534
  test('需要予測精度改善判定機能 - 予測値と実績値の乖離率が0%の場合に改善見送りと判定される', () => {
    const forecast_value = 100;
    const actual_value = 100;

    const result = calculateDemandForecastAccuracy({
      forecast_value,
      actual_value,
    });

    expect(result.deviation_rate_percent).toBe(0);
    expect(result.improvement_decision).toBe('改善見送り');
    expect(result.is_improvement_target).toBe(false);
    expect(result.recorded_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });
});