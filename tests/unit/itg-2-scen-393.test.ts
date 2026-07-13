import { prioritizeImprovementProposals } from "../../src/logic/it-1-br-2-1-2-1";

describe("改善提案優先度付け機能", () => {
  // SCEN-393
  test("栄養士からの改善提案が優先度順に正確に付与される", () => {
    const proposal1 = {
      id: "prop_001",
      title: "タンパク質摂取量の基準値を引き上げ",
      description: "高齢者向け栄養基準で筋肉維持を促進",
      businessValue: 8,
      technicalDifficulty: 5,
      userImpact: 9,
      createdAt: new Date("2024-01-10T10:00:00Z"),
    };

    const proposal2 = {
      id: "prop_002",
      title: "カルシウム摂取不足検知アラート",
      description: "骨密度低下リスク予測機能の追加",
      businessValue: 6,
      technicalDifficulty: 7,
      userImpact: 5,
      createdAt: new Date("2024-01-11T10:00:00Z"),
    };

    const proposal3 = {
      id: "prop_003",
      title: "食物繊維摂取量の最適化",
      description: "腸内環境改善のための食材推奨",
      businessValue: 7,
      technicalDifficulty: 4,
      userImpact: 7,
      createdAt: new Date("2024-01-12T10:00:00Z"),
    };

    const proposal4 = {
      id: "prop_004",
      title: "塩分摂取量監視機能",
      description: "高血圧患者向けの警告表示",
      businessValue: 8,
      technicalDifficulty: 3,
      userImpact: 8,
      createdAt: new Date("2024-01-09T10:00:00Z"),
    };

    const input = {
      proposals: [proposal1, proposal2, proposal3, proposal4],
      priorityWeights: {
        businessValue: 0.4,
        technicalDifficulty: 0.3,
        userImpact: 0.3,
      },
    };

    const result = prioritizeImprovementProposals(input);

    expect(result.prioritizedProposals).toHaveLength(4);

    expect(result.prioritizedProposals[0].id).toBe("prop_004");
    expect(result.prioritizedProposals[0].priority).toBe("high");
    expect(result.prioritizedProposals[0].priorityScore).toBe(6.5);

    expect(result.prioritizedProposals[1].id).toBe("prop_001");
    expect(result.prioritizedProposals[1].priority).toBe("high");
    expect(result.prioritizedProposals[1].priorityScore).toBe(6.4);

    expect(result.prioritizedProposals[2].id).toBe("prop_003");
    expect(result.prioritizedProposals[2].priority).toBe("medium");
    expect(result.prioritizedProposals[2].priorityScore).toBe(5.9);

    expect(result.prioritizedProposals[3].id).toBe("prop_002");
    expect(result.prioritizedProposals[3].priority).toBe("low");
    expect(result.prioritizedProposals[3].priorityScore).toBe(4.9);

    expect(result.highPriorityCount).toBe(2);
    expect(result.mediumPriorityCount).toBe(1);
    expect(result.lowPriorityCount).toBe(1);

    const filtered = result.prioritizedProposals.filter(
      (p) => p.priority === "high"
    );
    expect(filtered).toHaveLength(2);
    expect(filtered[0].id).toBe("prop_004");
    expect(filtered[1].id).toBe("prop_001");

    const mediumFiltered = result.prioritizedProposals.filter(
      (p) => p.priority === "medium"
    );
    expect(mediumFiltered).toHaveLength(1);
    expect(mediumFiltered[0].id).toBe("prop_003");

    const lowFiltered = result.prioritizedProposals.filter(
      (p) => p.priority === "low"
    );
    expect(lowFiltered).toHaveLength(1);
    expect(lowFiltered[0].id).toBe("prop_002");

    const updatedProposal1 = {
      ...proposal1,
      businessValue: 5,
      technicalDifficulty: 8,
      userImpact: 3,
    };

    const updatedInput = {
      proposals: [updatedProposal1, proposal2, proposal3, proposal4],
      priorityWeights: {
        businessValue: 0.4,
        technicalDifficulty: 0.3,
        userImpact: 0.3,
      },
    };

    const updatedResult = prioritizeImprovementProposals(updatedInput);

    expect(updatedResult.prioritizedProposals[0].id).toBe("prop_004");
    expect(updatedResult.prioritizedProposals[1].id).toBe("prop_003");
    expect(updatedResult.prioritizedProposals[2].id).toBe("prop_002");
    expect(updatedResult.prioritizedProposals[3].id).toBe("prop_001");

    expect(updatedResult.prioritizedProposals[3].priority).toBe("low");
    expect(updatedResult.highPriorityCount).toBe(1);
    expect(updatedResult.mediumPriorityCount).toBe(2);
    expect(updatedResult.lowPriorityCount).toBe(1);

    expect(result.prioritizedProposals.every((p, i, arr) =>
      i === 0 || p.priorityScore <= arr[i - 1].priorityScore
    )).toBe(true);
  });
});