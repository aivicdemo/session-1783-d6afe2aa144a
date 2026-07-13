import { sortImprovementProposalsByPriority } from "../../src/logic/it-1-br-2-1-2-1";

describe("改善提案優先度付け - 同一優先度の複数提案を一貫した順序で並び替える", () => {
  // SCEN-494
  test("同一優先度の複数提案が複数回のリロード後も常に同じ順序で表示される", () => {
    const proposal1 = {
      proposalId: "PROP-001",
      nutritionItem: "タンパク質",
      businessValue: 8,
      technicalDifficulty: 5,
      userImpact: 9,
      priorityScore: 22,
      priority: "medium",
      createdAt: new Date("2024-01-10T08:00:00Z"),
      createdBy: "nutritionist-001",
    };

    const proposal2 = {
      proposalId: "PROP-002",
      nutritionItem: "カルシウム",
      businessValue: 7,
      technicalDifficulty: 4,
      userImpact: 8,
      priorityScore: 19,
      priority: "medium",
      createdAt: new Date("2024-01-12T09:30:00Z"),
      createdBy: "nutritionist-002",
    };

    const proposal3 = {
      proposalId: "PROP-003",
      nutritionItem: "ビタミンC",
      businessValue: 9,
      technicalDifficulty: 3,
      userImpact: 7,
      priorityScore: 19,
      priority: "medium",
      createdAt: new Date("2024-01-11T10:15:00Z"),
      createdBy: "nutritionist-001",
    };

    const proposal4 = {
      proposalId: "PROP-004",
      nutritionItem: "食物繊維",
      businessValue: 6,
      technicalDifficulty: 6,
      userImpact: 8,
      priorityScore: 20,
      priority: "medium",
      createdAt: new Date("2024-01-13T07:45:00Z"),
      createdBy: "nutritionist-003",
    };

    const unsortedProposals = [proposal4, proposal1, proposal3, proposal2];

    // 1回目のソート
    const firstSort = sortImprovementProposalsByPriority([
      ...unsortedProposals,
    ]);

    // 2回目のソート（ページリロード後を想定）
    const secondSort = sortImprovementProposalsByPriority([
      ...unsortedProposals,
    ]);

    // 3回目のソート（さらなるリロード後を想定）
    const thirdSort = sortImprovementProposalsByPriority([...unsortedProposals]);

    // 同一優先度内の順序が一貫性を保つことを検証
    expect(firstSort.map((p) => p.proposalId)).toEqual([
      "PROP-001",
      "PROP-003",
      "PROP-002",
      "PROP-004",
    ]);

    expect(secondSort.map((p) => p.proposalId)).toEqual([
      "PROP-001",
      "PROP-003",
      "PROP-002",
      "PROP-004",
    ]);

    expect(thirdSort.map((p) => p.proposalId)).toEqual([
      "PROP-001",
      "PROP-003",
      "PROP-002",
      "PROP-004",
    ]);

    // 全ソート結果が完全に一致することを検証
    expect(firstSort).toEqual(secondSort);
    expect(secondSort).toEqual(thirdSort);

    // 同一優先度内で作成日時でソートされていることを検証
    const mediumPriority = firstSort.filter((p) => p.priority === "medium");
    expect(mediumPriority[0].createdAt).toEqual(new Date("2024-01-10T08:00:00Z"));
    expect(mediumPriority[1].createdAt).toEqual(
      new Date("2024-01-11T10:15:00Z")
    );
    expect(mediumPriority[2].createdAt).toEqual(
      new Date("2024-01-12T09:30:00Z")
    );
    expect(mediumPriority[3].createdAt).toEqual(
      new Date("2024-01-13T07:45:00Z")
    );

    // 同一優先度内の提案IDが作成日時順に並んでいることを確認
    expect(mediumPriority.map((p) => p.proposalId)).toEqual([
      "PROP-001",
      "PROP-003",
      "PROP-002",
      "PROP-004",
    ]);
  });
});