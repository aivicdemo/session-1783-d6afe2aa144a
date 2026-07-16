import { validateImprovementProposalTechnicalFeasibility } from "../../src/logic/it-1-br-8-2-1-1";

describe("改善提案のレビューと技術実現性検証", () => {
  // SCEN-230: [error] 改善提案のレビューと技術実現性検証 - 技術実現不可と判定された改善提案が開発ロードマップに組み込まれずエラーハンドリングされる
  test("技術実現不可と判定された改善提案はエラーハンドリングされ、開発ロードマップに組み込まれない", () => {
    const proposal_id = "PROP-20240115-001";
    const proposal_title = "栄養バランスロジック改善案";
    const proposal_type = "algorithm_modification";
    const business_value_score = 85;
    const technical_difficulty_score = 95;
    const user_impact_score = 78;
    const priority_score = 86;
    const implementation_estimate_days = 45;
    const expected_effect_description = "栄養基準達成率を15%向上";
    const kpi_contribution_rate = 0.18;
    const technical_feasibility_status = "not_feasible";
    const feasibility_evaluation_reason = "既存データベーススキーマの抜本的な再設計が必要であり、本番環境への影響リスクが極めて高い";
    const reviewed_by_engineer_id = "ENG-2024-001";
    const review_date = "2024-01-15T14:30:00Z";
    const roadmap_integration_attempted = true;

    const result = validateImprovementProposalTechnicalFeasibility({
      proposal_id,
      proposal_title,
      proposal_type,
      business_value_score,
      technical_difficulty_score,
      user_impact_score,
      priority_score,
      implementation_estimate_days,
      expected_effect_description,
      kpi_contribution_rate,
      technical_feasibility_status,
      feasibility_evaluation_reason,
      reviewed_by_engineer_id,
      review_date,
      roadmap_integration_attempted,
    });

    expect(result.is_feasible).toBe(false);
    expect(result.error_status_code).toBe(400);
    expect(result.error_message).toMatch(/技術実現性/);
    expect(result.is_integrated_into_roadmap).toBe(false);
    expect(result.error_log_recorded).toBe(true);
    expect(result.system_status_healthy).toBe(true);
    expect(result.proposal_id_rejected).toBe(proposal_id);
    expect(result.feasibility_reason_logged).toBe(feasibility_evaluation_reason);
  });
});