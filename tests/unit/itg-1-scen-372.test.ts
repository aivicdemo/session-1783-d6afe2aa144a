import { notifyDevelopmentTeamOfPrioritizedProposal } from "../../src/logic/it-1-1-1";

describe("改善提案の優先度自動通知機能", () => {
  // SCEN-372: [normal] 改善提案の優先度自動通知機能 - 栄養士が改善提案を『優先度付け完了』に変更した場合、開発チームへの自動通知が送信される
  test("栄養士が改善提案の優先度付けを完了すると、開発チームに自動通知が送信される", async () => {
    const proposalId = "proposal-001";
    const nutritionistId = "nutritionist-user-123";
    const nutritionistName = "山田太郎";
    const priorityLevel = "high";
    const proposalTitle = "献立生成ロジックの栄養バランス改善案";
    const developmentTeamUserId = "dev-team-group-001";
    const completedAt = new Date("2024-01-15T14:30:00Z");

    const improvementProposal = {
      id: proposalId,
      title: proposalTitle,
      description: "タンパク質摂取量の計算ロジックを改善し、栄養基準値との誤差を±5%以内に抑える",
      status: "prioritization_completed",
      priorityLevel: priorityLevel,
      nutritionistId: nutritionistId,
      nutritionistName: nutritionistName,
      completedAt: completedAt,
      targetDevTeamId: developmentTeamUserId,
    };

    const notificationResult = await notifyDevelopmentTeamOfPrioritizedProposal({
      proposalId: proposalId,
      proposalTitle: proposalTitle,
      priorityLevel: priorityLevel,
      nutritionistName: nutritionistName,
      targetDevTeamId: developmentTeamUserId,
      completedAt: completedAt,
    });

    expect(notificationResult.success).toBe(true);
    expect(notificationResult.notificationId).toBeDefined();
    expect(notificationResult.notificationContent).toEqual({
      type: "prioritized_proposal_notification",
      title: "新しい優先度付け済み改善提案が登録されました",
      proposalTitle: proposalTitle,
      priorityLevel: priorityLevel,
      nutritionistName: nutritionistName,
      message: `栄養士 ${nutritionistName} から、優先度「${priorityLevel}」の改善提案「${proposalTitle}」が提出されました。`,
    });
    expect(notificationResult.sentToDevTeamId).toBe(developmentTeamUserId);
    expect(notificationResult.sentAt).toEqual(completedAt);
    expect(notificationResult.proposalIdReference).toBe(proposalId);

    // 通知に含まれる必須情報の確認
    expect(
      notificationResult.notificationContent.message.includes(proposalTitle)
    ).toBe(true);
    expect(
      notificationResult.notificationContent.message.includes(priorityLevel)
    ).toBe(true);
    expect(
      notificationResult.notificationContent.message.includes(nutritionistName)
    ).toBe(true);
  });
});