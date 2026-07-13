import { assignPriorityToImprovementProposal } from "../../src/logic/it-1-br-2-1-2-1";

describe("改善提案管理機能 - 優先度付与ロジック", () => {
  // SCEN-474
  test("栄養士からの改善提案に優先度が正しく付与される", () => {
    // 高優先度の提案
    const highPriorityProposal = {
      proposalId: "prop_001",
      title: "タンパク質摂取目標の引き上げ",
      description: "ユーザーセグメント別にタンパク質推奨量を調整",
      targetUserSegment: "active_male",
      selectedPriority: "high",
      businessValue: 9,
      technicalDifficulty: 3,
      userImpact: 8,
      submittedAt: new Date("2024-01-15T10:00:00Z"),
    };

    const resultHigh = assignPriorityToImprovementProposal(highPriorityProposal);

    expect(resultHigh.proposalId).toBe("prop_001");
    expect(resultHigh.assignedPriority).toBe("high");
    expect(resultHigh.priorityScore).toBe(26);
    expect(resultHigh.displayOrder).toBe(1);
    expect(resultHigh.notificationStatus).toBe("pending");

    // 中優先度の提案
    const mediumPriorityProposal = {
      proposalId: "prop_002",
      title: "塩分摂取削減施策",
      description: "加工食品の塩分含有量表示を改善",
      targetUserSegment: "senior_female",
      selectedPriority: "medium",
      businessValue: 6,
      technicalDifficulty: 4,
      userImpact: 5,
      submittedAt: new Date("2024-01-15T11:30:00Z"),
    };

    const resultMedium = assignPriorityToImprovementProposal(
      mediumPriorityProposal
    );

    expect(resultMedium.proposalId).toBe("prop_002");
    expect(resultMedium.assignedPriority).toBe("medium");
    expect(resultMedium.priorityScore).toBe(15);
    expect(resultMedium.displayOrder).toBe(2);
    expect(resultMedium.notificationStatus).toBe("pending");

    // 低優先度の提案
    const lowPriorityProposal = {
      proposalId: "prop_003",
      title: "UI表示改善提案",
      description: "栄養ダッシュボードのグラフ表示方式を変更",
      targetUserSegment: "general",
      selectedPriority: "low",
      businessValue: 3,
      technicalDifficulty: 8,
      userImpact: 2,
      submittedAt: new Date("2024-01-15T13:00:00Z"),
    };

    const resultLow = assignPriorityToImprovementProposal(lowPriorityProposal);

    expect(resultLow.proposalId).toBe("prop_003");
    expect(resultLow.assignedPriority).toBe("low");
    expect(resultLow.priorityScore).toBe(7);
    expect(resultLow.displayOrder).toBe(3);
    expect(resultLow.notificationStatus).toBe("pending");

    // 提案一覧を優先度順にソート
    const proposalList = [resultLow, resultMedium, resultHigh];
    const sortedByPriority = proposalList.sort(
      (a, b) => b.priorityScore - a.priorityScore
    );

    expect(sortedByPriority[0].proposalId).toBe("prop_001");
    expect(sortedByPriority[0].assignedPriority).toBe("high");
    expect(sortedByPriority[1].proposalId).toBe("prop_002");
    expect(sortedByPriority[1].assignedPriority).toBe("medium");
    expect(sortedByPriority[2].proposalId).toBe("prop_003");
    expect(sortedByPriority[2].assignedPriority).toBe("low");

    // フィルタリング検証：高優先度のみ取得
    const highPriorityFilter = proposalList.filter(
      (p) => p.assignedPriority === "high"
    );
    expect(highPriorityFilter).toHaveLength(1);
    expect(highPriorityFilter[0].proposalId).toBe("prop_001");

    // フィルタリング検証：中・低優先度を除外
    const excludeLowPriority = proposalList.filter(
      (p) => p.assignedPriority !== "low"
    );
    expect(excludeLowPriority).toHaveLength(2);
    expect(excludeLowPriority.map((p) => p.proposalId)).toEqual([
      "prop_003",
      "prop_002",
    ]);
  });
});