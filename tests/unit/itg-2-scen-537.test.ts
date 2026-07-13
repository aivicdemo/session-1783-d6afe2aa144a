import { notifyImprovementProposalsByPriority } from "../../src/logic/it-1-br-2-1-2-1";

describe("栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能", () => {
  // SCEN-537: [error] 改善提案優先度通知機能 - 優先度付け基準の確認ステップが未完了の場合、通知が送信されない
  test("優先度付け基準の確認ステップが未完了の場合、改善提案に関する優先度通知は一切送信されず、通知ログ、メール、管理者ダッシュボードのいずれにも通知記録が存在しないこと", () => {
    const input = {
      nutritionistId: "dietitian_001",
      improvementProposalId: "proposal_2024_001",
      priorityFrameworkConfirmed: false,
      proposalStatus: "pending_priority_framework_confirmation",
      proposalTitle: "栄養基準値の推奨値調整",
      proposalDescription: "ビタミンD摂取基準を季節別に最適化する提案",
      businessValue: 8,
      technicalDifficulty: 5,
      userImpactScore: 7,
      createdAt: new Date("2024-01-15T10:00:00Z"),
      notificationHistoryCount: 0,
      systemMailBoxCount: 0,
      adminDashboardNotificationRecordCount: 0,
    };

    const result = notifyImprovementProposalsByPriority(input);

    // 優先度付け基準の確認ステップが未完了の場合、通知は送信されない
    expect(result.notificationSent).toBe(false);

    // 通知ログに記録が存在しない
    expect(result.notificationHistoryCount).toBe(0);

    // メール受信トレイに通知記録が存在しない
    expect(result.systemMailBoxCount).toBe(0);

    // 管理者ダッシュボードの通知送信履歴に記録が存在しない
    expect(result.adminDashboardNotificationRecordCount).toBe(0);

    // システムが適切なエラーメッセージを返す
    expect(result.errorMessage).toBeDefined();
    expect(result.errorMessage).toMatch(/優先度付け基準/);

    // 改善提案のステータスが「優先度付け基準確認待ち」のままである
    expect(result.proposalStatus).toBe("pending_priority_framework_confirmation");

    // ユーザーに確認ステップの完了を促すメッセージが表示される
    expect(result.userPromptMessage).toBeDefined();
    expect(result.userPromptMessage).toMatch(/確認/);
  });
});