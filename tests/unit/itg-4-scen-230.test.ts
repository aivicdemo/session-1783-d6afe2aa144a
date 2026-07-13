import { evaluateDemandForecastImprovement } from "../../src/logic/it-2-br-6-3-2";

describe("需要予測精度改善判定機能", () => {
  // SCEN-230
  test("予測値と実績値の乖離が閾値以下の場合、改善見送りが判定される", () => {
    const forecast_value = 1000;
    const actual_value = 980;
    const threshold_percentage = 3;

    const divergence_percentage = Math.abs(
      (forecast_value - actual_value) / forecast_value
    ) * 100;

    expect(divergence_percentage).toBe(2);

    const result = evaluateDemandForecastImprovement({
      forecast_value,
      actual_value,
      threshold_percentage,
    });

    expect(result.divergence_percentage).toBe(2);
    expect(result.improvement_required).toBe(false);
    expect(result.improvement_status).toBe("改善不要");
    expect(result.decision_display).toBe("改善見送り");
    expect(result.log_recorded).toBe(true);
  });
});