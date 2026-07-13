import { generateImprovementProposal } from "../../src/logic/it-1-br-2-1-2-1";

describe("改善提案書生成機能 - 優先度スコアリング", () => {
  // SCEN-524
  test("優先度スコアリング値が0の場合、改善提案書生成がスキップされる", () => {
    const improvementProposalInput = {
      proposalId: "proposal-001",
      businessValue: 0,
      technicalDifficulty: 5,
      userImpact: 8,
      implementationEstimate: "2 weeks",
      expectedEffect: "高い",
      kpiContribution: "売上向上"
    };

    const result = generateImprovementProposal(improvementProposalInput);

    expect(result.priorityScore).toBe(0);
    expect(result.proposalGenerated).toBe(false);
    expect(result.status).toBe("skipped");
    expect(result.logMessage).toMatch(/優先度スコアリング値が0/);
  });
});