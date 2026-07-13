import { prioritizeImprovementProposals } from "../../src/logic/it-1-br-2-1-2-1";

describe("改善提案優先度通知機能", () => {
  // SCEN-538
  test("優先度スコアが同一の複数提案が存在する場合、すべてが同一通知内に含まれる", () => {
    const identicalScorePriority = 85;

    const improvementProposals = [
      {
        proposalId: "prop_001",
        category: "nutritionBalance",
        description: "栄養バランスの改善",
        priorityScore: identicalScorePriority,
        createdAt: new Date("2024-01-15T09:00:00Z"),
        createdBy: "nutritionist_001",
      },
      {
        proposalId: "prop_002",
        category: "calorieManagement",
        description: "カロリー管理の最適化",
        priorityScore: identicalScorePriority,
        createdAt: new Date("2024-01-15T09:15:00Z"),
        createdBy: "nutritionist_001",
      },
      {
        proposalId: "prop_003",
        category: "foodDiversity",
        description: "食材多様性の向上",
        priorityScore: identicalScorePriority,
        createdAt: new Date("2024-01-15T09:30:00Z"),
        createdBy: "nutritionist_001",
      },
      {
        proposalId: "prop_004",
        category: "allergyManagement",
        description: "アレルギー対応の強化",
        priorityScore: 75,
        createdAt: new Date("2024-01-15T09:45:00Z"),
        createdBy: "nutritionist_001",
      },
    ];

    const notificationResult = prioritizeImprovementProposals(
      improvementProposals
    );

    expect(notificationResult).toBeDefined();
    expect(notificationResult.notificationId).toBeDefined();
    expect(notificationResult.status).toBe("generated");

    expect(notificationResult.groupedProposals).toBeDefined();
    expect(Array.isArray(notificationResult.groupedProposals)).toBe(true);

    const priorityGroup85 = notificationResult.groupedProposals.find(
      (group: { priorityScore: number; proposals: unknown[] }) =>
        group.priorityScore === identicalScorePriority
    );

    expect(priorityGroup85).toBeDefined();
    expect(Array.isArray(priorityGroup85.proposals)).toBe(true);
    expect(priorityGroup85.proposals.length).toBe(3);

    const proposalIds = priorityGroup85.proposals.map(
      (p: { proposalId: string }) => p.proposalId
    );
    expect(proposalIds).toContain("prop_001");
    expect(proposalIds).toContain("prop_002");
    expect(proposalIds).toContain("prop_003");

    const categories = priorityGroup85.proposals.map(
      (p: { category: string }) => p.category
    );
    expect(categories).toContain("nutritionBalance");
    expect(categories).toContain("calorieManagement");
    expect(categories).toContain("foodDiversity");

    const descriptions = priorityGroup85.proposals.map(
      (p: { description: string }) => p.description
    );
    expect(descriptions).toContain("栄養バランスの改善");
    expect(descriptions).toContain("カロリー管理の最適化");
    expect(descriptions).toContain("食材多様性の向上");

    priorityGroup85.proposals.forEach(
      (proposal: {
        proposalId: string;
        category: string;
        description: string;
      }) => {
        expect(proposal).toHaveProperty("proposalId");
        expect(proposal).toHaveProperty("category");
        expect(proposal).toHaveProperty("description");
        expect(typeof proposal.proposalId).toBe("string");
        expect(typeof proposal.category).toBe("string");
        expect(typeof proposal.description).toBe("string");
      }
    );

    const priorityGroup75 = notificationResult.groupedProposals.find(
      (group: { priorityScore: number }) => group.priorityScore === 75
    );
    expect(priorityGroup75).toBeDefined();
    expect(priorityGroup75.proposals.length).toBe(1);

    const groupsByScore = notificationResult.groupedProposals.map(
      (group: { priorityScore: number }) => group.priorityScore
    );
    expect(groupsByScore).toEqual([identicalScorePriority, 75]);

    expect(notificationResult.message).toBeDefined();
    expect(typeof notificationResult.message).toBe("string");
    expect(notificationResult.message.length).toBeGreaterThan(0);

    expect(notificationResult.totalProposalsIncluded).toBe(4);
    expect(notificationResult.groupsCreated).toBe(2);

    expect(notificationResult.notificationTimestamp).toBeDefined();
    expect(new Date(notificationResult.notificationTimestamp).getTime()).toBeGreaterThan(
      0
    );
  });
});