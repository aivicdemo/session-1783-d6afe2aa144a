import { prioritizeImprovementProposals } from "../../src/logic/it-1-br-2-1-2-1";

describe("改善提案管理機能 - 改善提案が0件の場合の通知送信ロジック", () => {
  // SCEN-478
  test("改善提案が0件の場合、通知が送信されない", () => {
    const emptyProposalList = [];
    const notificationSettings = {
      enableImprovementProposalNotification: true,
      notificationChannels: ["email", "system"],
      userId: "user_001",
      notificationThreshold: 1,
    };

    const result = prioritizeImprovementProposals(
      emptyProposalList,
      notificationSettings
    );

    expect(result).toEqual({
      prioritizedProposals: [],
      notificationsSent: 0,
      shouldNotify: false,
      proposalCount: 0,
      timestamp: result.timestamp,
    });
    expect(result.notificationsSent).toBe(0);
    expect(result.shouldNotify).toBe(false);
    expect(result.prioritizedProposals).toHaveLength(0);
    expect(result.proposalCount).toBe(0);
  });

  test("改善提案が存在する場合、優先度付けして通知を送信する", () => {
    const proposalList = [
      {
        proposalId: "prop_001",
        title: "栄養基準値の改善",
        businessValue: 8,
        technicalDifficulty: 5,
        userImpact: 7,
        category: "nutrition",
      },
      {
        proposalId: "prop_002",
        title: "食材アレルギー対応強化",
        businessValue: 9,
        technicalDifficulty: 6,
        userImpact: 8,
        category: "allergen",
      },
    ];
    const notificationSettings = {
      enableImprovementProposalNotification: true,
      notificationChannels: ["email", "system"],
      userId: "user_001",
      notificationThreshold: 1,
    };

    const result = prioritizeImprovementProposals(
      proposalList,
      notificationSettings
    );

    expect(result.proposalCount).toBe(2);
    expect(result.notificationsSent).toBeGreaterThan(0);
    expect(result.shouldNotify).toBe(true);
    expect(result.prioritizedProposals).toHaveLength(2);
    expect(result.prioritizedProposals[0].proposalId).toBe("prop_002");
  });

  test("改善提案が存在しても通知が無効化されている場合、通知は送信されない", () => {
    const proposalList = [
      {
        proposalId: "prop_001",
        title: "栄養基準値の改善",
        businessValue: 8,
        technicalDifficulty: 5,
        userImpact: 7,
        category: "nutrition",
      },
    ];
    const notificationSettings = {
      enableImprovementProposalNotification: false,
      notificationChannels: [],
      userId: "user_001",
      notificationThreshold: 1,
    };

    const result = prioritizeImprovementProposals(
      proposalList,
      notificationSettings
    );

    expect(result.proposalCount).toBe(1);
    expect(result.notificationsSent).toBe(0);
    expect(result.shouldNotify).toBe(false);
    expect(result.prioritizedProposals).toHaveLength(1);
  });

  test("改善提案の優先度スコアが正しく計算される", () => {
    const proposalList = [
      {
        proposalId: "prop_001",
        title: "栄養基準値の改善",
        businessValue: 8,
        technicalDifficulty: 4,
        userImpact: 9,
        category: "nutrition",
      },
      {
        proposalId: "prop_002",
        title: "食材アレルギー対応強化",
        businessValue: 6,
        technicalDifficulty: 7,
        userImpact: 5,
        category: "allergen",
      },
    ];
    const notificationSettings = {
      enableImprovementProposalNotification: true,
      notificationChannels: ["email"],
      userId: "user_002",
      notificationThreshold: 1,
    };

    const result = prioritizeImprovementProposals(
      proposalList,
      notificationSettings
    );

    const prop001Priority =
      proposalList[0].businessValue +
      proposalList[0].userImpact -
      proposalList[0].technicalDifficulty;
    const prop002Priority =
      proposalList[1].businessValue +
      proposalList[1].userImpact -
      proposalList[1].technicalDifficulty;

    expect(prop001Priority).toBe(13);
    expect(prop002Priority).toBe(4);
    expect(result.prioritizedProposals[0].proposalId).toBe("prop_001");
  });

  test("改善提案が閾値を下回る場合、通知が送信されない", () => {
    const proposalList = [
      {
        proposalId: "prop_001",
        title: "軽微な改善",
        businessValue: 2,
        technicalDifficulty: 8,
        userImpact: 1,
        category: "minor",
      },
    ];
    const notificationSettings = {
      enableImprovementProposalNotification: true,
      notificationChannels: ["email"],
      userId: "user_003",
      notificationThreshold: 5,
    };

    const result = prioritizeImprovementProposals(
      proposalList,
      notificationSettings
    );

    expect(result.shouldNotify).toBe(false);
    expect(result.notificationsSent).toBe(0);
  });
});