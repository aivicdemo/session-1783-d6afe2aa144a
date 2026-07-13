import { prioritizeImprovementProposals } from "../../src/logic/it-1-br-2-1-2-1";

describe("改善提案の優先度付け機能", () => {
  // SCEN-395
  test("同一優先度の改善提案が複数存在する場合に安定ソートされる", () => {
    // 準備: 同一優先度（優先度3）を持つ改善提案を5件作成
    const improvementProposals = [
      {
        proposalId: "PROP-001",
        proposalTitle: "栄養基準ロジック改善案A",
        priorityLevel: 3,
        createdAt: new Date("2024-01-15T10:00:00Z"),
        businessValue: 8,
        technicalDifficulty: 5,
        userImpact: 7,
      },
      {
        proposalId: "PROP-002",
        proposalTitle: "栄養基準ロジック改善案B",
        priorityLevel: 3,
        createdAt: new Date("2024-01-15T10:05:00Z"),
        businessValue: 8,
        technicalDifficulty: 5,
        userImpact: 7,
      },
      {
        proposalId: "PROP-003",
        proposalTitle: "栄養基準ロジック改善案C",
        priorityLevel: 3,
        createdAt: new Date("2024-01-15T10:10:00Z"),
        businessValue: 8,
        technicalDifficulty: 5,
        userImpact: 7,
      },
      {
        proposalId: "PROP-004",
        proposalTitle: "栄養基準ロジック改善案D",
        priorityLevel: 3,
        createdAt: new Date("2024-01-15T10:15:00Z"),
        businessValue: 8,
        technicalDifficulty: 5,
        userImpact: 7,
      },
      {
        proposalId: "PROP-005",
        proposalTitle: "栄養基準ロジック改善案E",
        priorityLevel: 3,
        createdAt: new Date("2024-01-15T10:20:00Z"),
        businessValue: 8,
        technicalDifficulty: 5,
        userImpact: 7,
      },
    ];

    // 手順1: 最初のソート実行
    const firstSortResult = prioritizeImprovementProposals(improvementProposals);

    // 手順2: 最初のソート結果から順序を記録
    const firstSortOrder = firstSortResult.map((p) => p.proposalId);

    // 手順3: 異なる順序で入力した場合の2回目のソート実行
    const shuffledProposals = [
      improvementProposals[3],
      improvementProposals[0],
      improvementProposals[4],
      improvementProposals[1],
      improvementProposals[2],
    ];

    const secondSortResult = prioritizeImprovementProposals(shuffledProposals);
    const secondSortOrder = secondSortResult.map((p) => p.proposalId);

    // 手順4: 3回目のソート実行（別の順序で入力）
    const thirdInputOrder = [
      improvementProposals[2],
      improvementProposals[4],
      improvementProposals[1],
      improvementProposals[3],
      improvementProposals[0],
    ];

    const thirdSortResult = prioritizeImprovementProposals(thirdInputOrder);
    const thirdSortOrder = thirdSortResult.map((p) => p.proposalId);

    // 検証: 同一優先度の改善提案に対して、すべてのソート操作後の順序が一貫性を保つ
    // 期待値: 作成日時の昇順（createdAt順）で安定ソートされる
    expect(firstSortOrder).toEqual([
      "PROP-001",
      "PROP-002",
      "PROP-003",
      "PROP-004",
      "PROP-005",
    ]);

    // 検証: 入力順序が異なっても、同じ結果になることを確認
    expect(secondSortOrder).toEqual(firstSortOrder);
    expect(thirdSortOrder).toEqual(firstSortOrder);

    // 検証: ページ再読み込み後も同じ順序を維持することを確認
    // （再度同じデータでソート）
    const reloadedSortResult = prioritizeImprovementProposals(firstSortResult);
    const reloadedSortOrder = reloadedSortResult.map((p) => p.proposalId);
    expect(reloadedSortOrder).toEqual(firstSortOrder);

    // 検証: 各改善提案が正しい構造を持っていることを確認
    expect(firstSortResult[0]).toEqual({
      proposalId: "PROP-001",
      proposalTitle: "栄養基準ロジック改善案A",
      priorityLevel: 3,
      createdAt: new Date("2024-01-15T10:00:00Z"),
      businessValue: 8,
      technicalDifficulty: 5,
      userImpact: 7,
    });

    // 検証: ソート結果の長さが元の配列と同じことを確認
    expect(firstSortResult.length).toBe(5);
    expect(secondSortResult.length).toBe(5);
    expect(thirdSortResult.length).toBe(5);
  });
});