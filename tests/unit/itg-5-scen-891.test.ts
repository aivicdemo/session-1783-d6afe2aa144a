import { assignAlgorithmImprovementPriority } from "../../src/logic/it-7-2-1";

describe("献立生成アルゴリズム改善提案の優先度付与", () => {
  // SCEN-891: [normal] 改善提案の2軸優先度自動付与 - 影響度が低く実装難度が高い改善提案に優先度ランク低が付与される
  test("影響度が低く実装難度が高い場合、優先度ランクが低となる", () => {
    const improvement_proposal = {
      proposal_id: "PROP-001",
      title: "栄養バランス計算ロジック修正",
      impact_level: "low",
      implementation_difficulty: "high",
      kpi_contribution_score: 30,
      user_impact_score: 20,
      technical_difficulty_score: 85,
    };

    const result = assignAlgorithmImprovementPriority(improvement_proposal);

    expect(result.priority_rank).toBe("low");
    expect(result.total_priority_score).toBe(35);
    expect(result.proposal_id).toBe("PROP-001");
  });
});