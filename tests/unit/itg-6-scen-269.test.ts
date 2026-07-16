import { assignImprovementProposalPriority } from "../../src/logic/it-1-br-8-2-1-1";

describe("改善提案優先度付与機能", () => {
  // SCEN-269
  test("影響度が最高・実装難度が最低の場合に優先度ランク「高」が付与される", () => {
    const improvementProposal = {
      proposal_id: "PROP-001",
      title: "献立生成アルゴリズム最適化",
      impact_score: 100,
      implementation_difficulty: 0,
      user_impact_score: 85,
    };

    const result = assignImprovementProposalPriority(improvementProposal);

    expect(result.priority_rank).toBe("高");
    expect(result.total_priority_score).toBeGreaterThan(0);
    expect(result.proposal_id).toBe("PROP-001");
  });
});