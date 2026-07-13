import { prioritizeImprovementProposals } from "../../src/logic/it-1-br-2-1-2-1";

describe("栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能", () => {
  // SCEN-509
  test("改善提案の優先度付けと通知スケジュール確定 - 優先度が同一である複数提案に対して一貫性のある順序付けが実行される", () => {
    const proposalData = [
      {
        proposalId: "PROP-003",
        title: "タンパク質目標値の精度向上",
        priority: 2,
        createdAt: new Date("2024-01-10T14:30:00Z"),
        businessValue: 7,
        technicalDifficulty: 5,
        userImpact: 8,
      },
      {
        proposalId: "PROP-001",
        title: "カルシウム摂取推奨量の改善",
        priority: 2,
        createdAt: new Date("2024-01-08T09:15:00Z"),
        businessValue: 8,
        technicalDifficulty: 4,
        userImpact: 9,
      },
      {
        proposalId: "PROP-002",
        title: "ビタミンD推奨値の見直し",
        priority: 2,
        createdAt: new Date("2024-01-09T11:20:00Z"),
        businessValue: 7,
        technicalDifficulty: 3,
        userImpact: 7,
      },
      {
        proposalId: "PROP-004",
        title: "鉄分摂取量の算出ロジック改善",
        priority: 1,
        createdAt: new Date("2024-01-07T16:45:00Z"),
        businessValue: 9,
        technicalDifficulty: 6,
        userImpact: 8,
      },
    ];

    const result = prioritizeImprovementProposals(proposalData);

    const priority2Proposals = result.filter(
      (p: { priority: number }) => p.priority === 2
    );
    expect(priority2Proposals.length).toBe(3);

    expect(priority2Proposals[0].proposalId).toBe("PROP-001");
    expect(priority2Proposals[1].proposalId).toBe("PROP-002");
    expect(priority2Proposals[2].proposalId).toBe("PROP-003");

    const secondRun = prioritizeImprovementProposals(proposalData);
    const priority2ProposalsSecondRun = secondRun.filter(
      (p: { priority: number }) => p.priority === 2
    );

    expect(priority2ProposalsSecondRun[0].proposalId).toBe("PROP-001");
    expect(priority2ProposalsSecondRun[1].proposalId).toBe("PROP-002");
    expect(priority2ProposalsSecondRun[2].proposalId).toBe("PROP-003");

    const orderedIds = result.map((p: { proposalId: string }) => p.proposalId);
    expect(orderedIds).toEqual([
      "PROP-004",
      "PROP-001",
      "PROP-002",
      "PROP-003",
    ]);

    const thirdRun = prioritizeImprovementProposals(proposalData);
    const thirdRunOrderedIds = thirdRun.map(
      (p: { proposalId: string }) => p.proposalId
    );
    expect(thirdRunOrderedIds).toEqual([
      "PROP-004",
      "PROP-001",
      "PROP-002",
      "PROP-003",
    ]);

    expect(result[0].priority).toBeLessThan(result[1].priority);
    expect(result[1].priority).toBe(result[2].priority);
    expect(result[2].priority).toBe(result[3].priority);

    expect(
      new Date(result[1].createdAt as string).getTime() <
        new Date(result[2].createdAt as string).getTime()
    ).toBe(true);
    expect(
      new Date(result[2].createdAt as string).getTime() <
        new Date(result[3].createdAt as string).getTime()
    ).toBe(true);
  });
});