import { calculateImprovementProposalPriority } from "../../src/logic/it-7-2-1";

describe("改善提案優先順位付け機能", () => {
  // SCEN-913: [error] 改善提案優先順位付け機能 - 評価値が0またはnullの提案が含まれる場合にエラーが発生する
  test("評価値が0またはnullの提案が含まれる場合、適切なエラーを発生させる", () => {
    const proposalsWithZeroValue = [
      {
        proposal_id: "P001",
        business_value_score: 0,
        technical_difficulty_score: 50,
        user_impact_score: 75,
      },
      {
        proposal_id: "P002",
        business_value_score: 60,
        technical_difficulty_score: 40,
        user_impact_score: 80,
      },
    ];

    const proposalsWithNullValue = [
      {
        proposal_id: "P003",
        business_value_score: null,
        technical_difficulty_score: 55,
        user_impact_score: 70,
      },
      {
        proposal_id: "P004",
        business_value_score: 65,
        technical_difficulty_score: 35,
        user_impact_score: 85,
      },
    ];

    const proposalsWithMixedInvalidValues = [
      {
        proposal_id: "P005",
        business_value_score: 0,
        technical_difficulty_score: 50,
        user_impact_score: 75,
      },
      {
        proposal_id: "P006",
        business_value_score: null,
        technical_difficulty_score: 40,
        user_impact_score: 80,
      },
      {
        proposal_id: "P007",
        business_value_score: 70,
        technical_difficulty_score: 45,
        user_impact_score: 90,
      },
    ];

    expect(() =>
      calculateImprovementProposalPriority(proposalsWithZeroValue)
    ).toThrow(/評価値/);

    expect(() =>
      calculateImprovementProposalPriority(proposalsWithNullValue)
    ).toThrow(/評価値/);

    expect(() =>
      calculateImprovementProposalPriority(proposalsWithMixedInvalidValues)
    ).toThrow(/評価値/);

    const validProposals = [
      {
        proposal_id: "P008",
        business_value_score: 75,
        technical_difficulty_score: 50,
        user_impact_score: 80,
      },
      {
        proposal_id: "P009",
        business_value_score: 60,
        technical_difficulty_score: 40,
        user_impact_score: 85,
      },
      {
        proposal_id: "P010",
        business_value_score: 85,
        technical_difficulty_score: 55,
        user_impact_score: 90,
      },
    ];

    const result = calculateImprovementProposalPriority(validProposals);

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);
    expect(result[0]).toHaveProperty("proposal_id");
    expect(result[0]).toHaveProperty("total_priority_score");
    expect(result[0]).toHaveProperty("priority_rank");

    const firstProposal = result[0];
    expect(typeof firstProposal.total_priority_score).toBe("number");
    expect(firstProposal.total_priority_score).toBeGreaterThanOrEqual(0);
    expect(firstProposal.total_priority_score).toBeLessThanOrEqual(100);

    if (result.length > 1) {
      const secondProposal = result[1];
      expect(firstProposal.total_priority_score).toBeGreaterThanOrEqual(
        secondProposal.total_priority_score
      );
    }

    const allValidRanks = result.every(
      (item) => item.priority_rank === "高" ||
        item.priority_rank === "中" ||
        item.priority_rank === "低"
    );
    expect(allValidRanks).toBe(true);
  });
});