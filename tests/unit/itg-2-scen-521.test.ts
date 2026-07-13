import { prioritizeImprovementProposals } from "../../src/logic/it-1-br-2-1-2-1";

describe("栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能", () => {
  test("SCEN-521: [edge] 改善課題の優先度スコアリング - すべてのスコアが 0 の課題が境界値として処理され、一貫した順序付けが実行される", () => {
    // スコアがすべて0の複数課題を作成
    const improvementProposals = [
      {
        id: "proposal_001",
        title: "栄養バランス基準の改善案A",
        businessValue: 0,
        technicalDifficulty: 0,
        userImpact: 0,
        createdAt: new Date("2024-01-10T09:00:00Z"),
      },
      {
        id: "proposal_002",
        title: "栄養バランス基準の改善案B",
        businessValue: 0,
        technicalDifficulty: 0,
        userImpact: 0,
        createdAt: new Date("2024-01-11T09:00:00Z"),
      },
      {
        id: "proposal_003",
        title: "栄養バランス基準の改善案C",
        businessValue: 0,
        technicalDifficulty: 0,
        userImpact: 0,
        createdAt: new Date("2024-01-12T09:00:00Z"),
      },
    ];

    // 第1回目のスコアリング実行
    const firstSortResult = prioritizeImprovementProposals(improvementProposals);

    // スコアが0の課題は作成日時順でソートされることを検証
    expect(firstSortResult).toEqual([
      {
        id: "proposal_001",
        title: "栄養バランス基準の改善案A",
        businessValue: 0,
        technicalDifficulty: 0,
        userImpact: 0,
        createdAt: new Date("2024-01-10T09:00:00Z"),
        priorityScore: 0,
      },
      {
        id: "proposal_002",
        title: "栄養バランス基準の改善案B",
        businessValue: 0,
        technicalDifficulty: 0,
        userImpact: 0,
        createdAt: new Date("2024-01-11T09:00:00Z"),
        priorityScore: 0,
      },
      {
        id: "proposal_003",
        title: "栄養バランス基準の改善案C",
        businessValue: 0,
        technicalDifficulty: 0,
        userImpact: 0,
        createdAt: new Date("2024-01-12T09:00:00Z"),
        priorityScore: 0,
      },
    ]);

    // 第2回目のスコアリング実行 - 同じ入力で再実行
    const secondSortResult = prioritizeImprovementProposals(improvementProposals);

    // 順序が変わらないことを検証
    expect(secondSortResult).toEqual(firstSortResult);

    // 第3回目のスコアリング実行 - 同じ入力で再実行
    const thirdSortResult = prioritizeImprovementProposals(improvementProposals);

    // 順序が変わらないことを検証
    expect(thirdSortResult).toEqual(firstSortResult);
    expect(thirdSortResult).toEqual(secondSortResult);

    // 各回の結果の順序が完全に一致することを検証
    for (let i = 0; i < firstSortResult.length; i++) {
      expect(firstSortResult[i].id).toBe(secondSortResult[i].id);
      expect(secondSortResult[i].id).toBe(thirdSortResult[i].id);
    }

    // すべてのスコアが0で計算された総合スコアも0であることを検証
    expect(firstSortResult[0].priorityScore).toBe(0);
    expect(firstSortResult[1].priorityScore).toBe(0);
    expect(firstSortResult[2].priorityScore).toBe(0);
  });
});