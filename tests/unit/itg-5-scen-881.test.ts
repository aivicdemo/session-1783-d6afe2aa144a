import {
  compareAlgorithmImprovementMetrics
} from "../../src/logic/it-7-2-1";

describe("アルゴリズム改善指標の定量比較", () => {
  // SCEN-881
  test("改善前後で全ての指標が負の変化を示す場合に改善失敗と判定される", () => {
    const before_metrics = {
      accuracy_percentage: 90,
      response_time_ms: 100,
      memory_usage_percentage: 80,
      user_satisfaction_score: 8.5
    };

    const after_metrics = {
      accuracy_percentage: 85,
      response_time_ms: 120,
      memory_usage_percentage: 85,
      user_satisfaction_score: 7.9
    };

    const result = compareAlgorithmImprovementMetrics(
      before_metrics,
      after_metrics
    );

    expect(result.status).toBe("failure");
    expect(result.accuracy_change_percentage).toBe(-5.56);
    expect(result.response_time_change_percentage).toBe(20);
    expect(result.memory_usage_change_percentage).toBe(6.25);
    expect(result.user_satisfaction_change_percentage).toBe(-7.06);
    expect(result.all_metrics_degraded).toBe(true);
    expect(result.improvement_realized).toBe(false);
  });
});