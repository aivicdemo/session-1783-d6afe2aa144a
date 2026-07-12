import { aggregateImprovementProposals } from "../../src/logic/it-1-br-4-2-1";

describe("失敗パターンに基づく改善提案の分類", () => {
  // SCEN-626
  test("複数の失敗パターンが同一提案に紐付く場合に適切に集約される", () => {
    const failurePatterns = [
      {
        patternId: "FP001",
        category: "nutrition_imbalance",
        severity: 8,
        affectedMealId: "MEAL001",
        description: "タンパク質不足",
      },
      {
        patternId: "FP002",
        category: "duplicate_ingredients",
        severity: 5,
        affectedMealId: "MEAL001",
        description: "同じ食材が重複",
      },
      {
        patternId: "FP003",
        category: "cooking_time_exceeded",
        severity: 6,
        affectedMealId: "MEAL001",
        description: "調理時間超過",
      },
      {
        patternId: "FP004",
        category: "nutrition_imbalance",
        severity: 7,
        affectedMealId: "MEAL002",
        description: "タンパク質不足",
      },
    ];

    const result = aggregateImprovementProposals(failurePatterns);

    expect(result.proposals).toHaveLength(3);

    const proteinProposal = result.proposals.find(
      (p) => p.proposalType === "nutrition_improvement"
    );
    expect(proteinProposal).toBeDefined();
    expect(proteinProposal?.linkedPatterns).toHaveLength(2);
    expect(
      proteinProposal?.linkedPatterns.map((p) => p.patternId).sort()
    ).toEqual(["FP001", "FP004"]);
    expect(proteinProposal?.proposalDescription).toBe("タンパク質を増やす");
    expect(proteinProposal?.aggregatedSeverity).toBe(7.5);
    expect(proteinProposal?.priorityScore).toBe(85);

    const duplicateProposal = result.proposals.find(
      (p) => p.proposalType === "ingredient_deduplication"
    );
    expect(duplicateProposal).toBeDefined();
    expect(duplicateProposal?.linkedPatterns).toHaveLength(1);
    expect(duplicateProposal?.linkedPatterns[0].patternId).toBe("FP002");
    expect(duplicateProposal?.proposalDescription).toBe("食材の重複を排除");
    expect(duplicateProposal?.aggregatedSeverity).toBe(5);
    expect(duplicateProposal?.priorityScore).toBe(55);

    const timingProposal = result.proposals.find(
      (p) => p.proposalType === "cooking_optimization"
    );
    expect(timingProposal).toBeDefined();
    expect(timingProposal?.linkedPatterns).toHaveLength(1);
    expect(timingProposal?.linkedPatterns[0].patternId).toBe("FP003");
    expect(timingProposal?.proposalDescription).toBe(
      "調理時間を短縮する工程を提案"
    );
    expect(timingProposal?.aggregatedSeverity).toBe(6);
    expect(timingProposal?.priorityScore).toBe(65);

    expect(result.aggregationTimestamp).toBeDefined();
    expect(result.totalFailurePatternsProcessed).toBe(4);
    expect(result.totalProposalsGenerated).toBe(3);
    expect(result.dataIntegrityCheck).toBe(true);

    result.proposals.forEach((proposal) => {
      expect(proposal.linkedPatterns.length).toBeGreaterThan(0);
      proposal.linkedPatterns.forEach((pattern) => {
        expect(failurePatterns.some((fp) => fp.patternId === pattern.patternId))
          .toBe(true);
      });
    });

    const sortedByPriority = [...result.proposals].sort(
      (a, b) => b.priorityScore - a.priorityScore
    );
    expect(result.proposals[0].priorityScore).toBeGreaterThanOrEqual(
      sortedByPriority[1].priorityScore
    );
  });
});