import { prioritizeAndNotifyImprovementProposals } from "../../src/logic/it-1-br-2-1-2-1";

describe("改善提案優先度付けと開発チーム通知", () => {
  // SCEN-493
  test("改善提案を優先度に基づいて正確に順序付けして開発チームに通知する", () => {
    const fetchMock = require("jest-fetch-mock");
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    const improvementProposals = [
      {
        proposalId: "PROP-001",
        title: "栄養項目別の推奨値設定ロジック改善",
        description: "カルシウム摂取量の基準値が低すぎる問題を修正",
        businessValue: 8,
        technicalDifficulty: 3,
        userImpact: 9,
        createdAt: "2024-01-15T10:00:00Z",
        createdBy: "nutritionist-001",
      },
      {
        proposalId: "PROP-002",
        title: "献立生成アルゴリズムの調理時間見積改善",
        description: "複合調理の時間計算が過小評価されている問題",
        businessValue: 6,
        technicalDifficulty: 5,
        userImpact: 7,
        createdAt: "2024-01-15T09:30:00Z",
        createdBy: "nutritionist-002",
      },
      {
        proposalId: "PROP-003",
        title: "アレルギー情報の同期タイムラグ解消",
        description: "新規登録アレルギーが献立生成に反映されるまでの遅延を減らす",
        businessValue: 9,
        technicalDifficulty: 2,
        userImpact: 10,
        createdAt: "2024-01-15T11:00:00Z",
        createdBy: "nutritionist-001",
      },
      {
        proposalId: "PROP-004",
        title: "家族嗜好学習の精度向上",
        description: "過去の食事評価データから好みパターンをより正確に抽出",
        businessValue: 7,
        technicalDifficulty: 7,
        userImpact: 8,
        createdAt: "2024-01-15T08:45:00Z",
        createdBy: "nutritionist-003",
      },
    ];

    const priorityWeights = {
      businessValue: 0.4,
      technicalDifficulty: 0.3,
      userImpact: 0.3,
    };

    const developerTeamEndpoint = "https://api.example.com/notify/developers";

    fetchMock.mockResponseOnce(
      JSON.stringify({
        notificationId: "NOTIF-20240115-001",
        status: "sent",
        recipientCount: 12,
        timestamp: "2024-01-15T11:15:00Z",
      }),
      { status: 200 }
    );

    const result = prioritizeAndNotifyImprovementProposals(
      improvementProposals,
      priorityWeights,
      developerTeamEndpoint
    );

    const expectedPriorityScores = [
      {
        proposalId: "PROP-003",
        priorityScore: 7.7,
        priorityRank: "high",
      },
      {
        proposalId: "PROP-001",
        priorityScore: 7.4,
        priorityRank: "high",
      },
      {
        proposalId: "PROP-004",
        priorityScore: 7.3,
        priorityRank: "high",
      },
      {
        proposalId: "PROP-002",
        priorityScore: 6.1,
        priorityRank: "medium",
      },
    ];

    expect(result.prioritizedProposals).toHaveLength(4);
    expect(result.prioritizedProposals[0].proposalId).toBe("PROP-003");
    expect(result.prioritizedProposals[0].priorityScore).toBe(7.7);
    expect(result.prioritizedProposals[0].priorityRank).toBe("high");
    expect(result.prioritizedProposals[0].title).toBe(
      "アレルギー情報の同期タイムラグ解消"
    );
    expect(result.prioritizedProposals[0].description).toBe(
      "新規登録アレルギーが献立生成に反映されるまでの遅延を減らす"
    );

    expect(result.prioritizedProposals[1].proposalId).toBe("PROP-001");
    expect(result.prioritizedProposals[1].priorityScore).toBe(7.4);
    expect(result.prioritizedProposals[1].priorityRank).toBe("high");

    expect(result.prioritizedProposals[2].proposalId).toBe("PROP-004");
    expect(result.prioritizedProposals[2].priorityScore).toBe(7.3);
    expect(result.prioritizedProposals[2].priorityRank).toBe("high");

    expect(result.prioritizedProposals[3].proposalId).toBe("PROP-002");
    expect(result.prioritizedProposals[3].priorityScore).toBe(6.1);
    expect(result.prioritizedProposals[3].priorityRank).toBe("medium");

    expect(result.notificationResult.status).toBe("sent");
    expect(result.notificationResult.notificationId).toBe("NOTIF-20240115-001");
    expect(result.notificationResult.recipientCount).toBe(12);
    expect(result.notificationResult.timestamp).toBe("2024-01-15T11:15:00Z");

    expect(fetch).toHaveBeenCalledTimes(1);
    const callArgs = (fetch as jest.Mock).mock.calls[0];
    expect(callArgs[0]).toBe(developerTeamEndpoint);
    expect(callArgs[1].method).toBe("POST");

    const requestBody = JSON.parse(callArgs[1].body);
    expect(requestBody.proposals).toHaveLength(4);
    expect(requestBody.proposals[0].proposalId).toBe("PROP-003");
    expect(requestBody.proposals[0].priorityScore).toBe(7.7);
    expect(requestBody.proposals[1].proposalId).toBe("PROP-001");
    expect(requestBody.proposals[2].proposalId).toBe("PROP-004");
    expect(requestBody.proposals[3].proposalId).toBe("PROP-002");

    expect(result.totalProposalsProcessed).toBe(4);
    expect(result.highPriorityCount).toBe(3);
    expect(result.mediumPriorityCount).toBe(1);
    expect(result.lowPriorityCount).toBe(0);
  });
});