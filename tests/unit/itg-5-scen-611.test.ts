import { validateAlgorithmImprovementThresholds } from "../../src/logic/it-7-2-1";

describe("IT-7-2-1: アルゴリズム改善案の精度向上判定機能", () => {
  // SCEN-611: [normal] アルゴリズム改善案の精度向上判定機能 - 改善案が献立生成成功率5%以上向上・満足度スコア0.5ポイント以上向上の両閾値を満たす場合、本番反映可と判定される
  test("改善案が成功率5%以上・満足度スコア0.5ポイント以上向上時に本番反映可と判定される", () => {
    const baseline_success_rate = 75;
    const improved_success_rate = 81;
    const success_rate_improvement = improved_success_rate - baseline_success_rate;

    const baseline_satisfaction_score = 3.2;
    const improved_satisfaction_score = 3.8;
    const satisfaction_score_improvement =
      improved_satisfaction_score - baseline_satisfaction_score;

    const improvement_proposal = {
      proposal_id: "ALG-2024-001",
      baseline_metrics: {
        success_rate: baseline_success_rate,
        satisfaction_score: baseline_satisfaction_score,
      },
      improved_metrics: {
        success_rate: improved_success_rate,
        satisfaction_score: improved_satisfaction_score,
      },
      improvement_details: {
        success_rate_improvement: success_rate_improvement,
        satisfaction_score_improvement: satisfaction_score_improvement,
      },
    };

    const result = validateAlgorithmImprovementThresholds(improvement_proposal);

    expect(result.can_deploy_to_production).toBe(true);
    expect(result.success_rate_improvement_pct).toBe(6);
    expect(result.satisfaction_score_improvement_points).toBe(0.6);
    expect(result.meets_success_rate_threshold).toBe(true);
    expect(result.meets_satisfaction_threshold).toBe(true);
    expect(result.judgment_reason).toMatch(/成功率/);
    expect(result.judgment_reason).toMatch(/満足度/);
  });
});