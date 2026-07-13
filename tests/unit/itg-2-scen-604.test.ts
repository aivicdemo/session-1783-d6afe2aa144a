import { notifyDevelopmentTeamOfImprovementProposals } from "../../src/logic/it-1-br-2-1-2-1";

describe("改善提案の開発チーム定期通知", () => {
  // SCEN-604
  test("優先度付けされた改善提案が開発チームに正しく通知される", () => {
    // ===== Precondition: 栄養士が改善提案を優先度付けして入力済み状態 =====
    const improvementProposals = [
      {
        id: "prop_001",
        title: "栄養基準値の自動更新機能",
        description:
          "月次検証時に栄養基準値を自動更新し、最新の栄養ガイドラインに対応させる",
        priority: "high",
        createdAt: new Date("2024-01-15T10:00:00Z"),
        createdBy: "nutritionist_001",
        status: "pending_review",
        estimatedDays: 5,
        expectedImpact: "栄養推奨値との乖離を20%削減",
        affectedSegments: ["shared_household", "working_couple"],
      },
      {
        id: "prop_002",
        title: "アレルギー情報の段階的更新UI",
        description:
          "複数のアレルギー条件入力時に、優先度付けされたリスク警告を表示",
        priority: "medium",
        createdAt: new Date("2024-01-15T11:30:00Z"),
        createdBy: "nutritionist_001",
        status: "pending_review",
        estimatedDays: 3,
        expectedImpact: "ユーザー入力エラー率を15%削減",
        affectedSegments: ["families_with_allergies"],
      },
      {
        id: "prop_003",
        title: "調理時間制限の週単位集計レポート",
        description:
          "週次で調理時間短縮度を集計し、トレンド分析可能なレポート形式で表示",
        priority: "low",
        createdAt: new Date("2024-01-15T13:00:00Z"),
        createdBy: "nutritionist_001",
        status: "pending_review",
        estimatedDays: 2,
        expectedImpact: "ユーザー満足度スコア+5%",
        affectedSegments: ["time_constrained_users"],
      },
    ];

    const developmentTeamEmails = [
      "dev_team_lead@company.com",
      "algorithm_engineer@company.com",
      "backend_engineer@company.com",
    ];

    const notificationSchedule = {
      frequency: "weekly",
      triggerDay: "monday",
      triggerTime: "09:00",
      slaCompletionDays: 5,
    };

    // ===== Trigger: 開発チーム向けの定期通知スケジュールに到達 =====
    const currentDateTime = new Date("2024-01-15T09:00:00Z"); // Monday 09:00

    // ===== Execution: 通知関数を実行 =====
    const notificationResult = notifyDevelopmentTeamOfImprovementProposals({
      proposals: improvementProposals,
      recipientEmails: developmentTeamEmails,
      notificationSchedule: notificationSchedule,
      executionTime: currentDateTime,
    });

    // ===== Outcome Assertions =====

    // 1. 通知が正常に送信されたこと
    expect(notificationResult.success).toBe(true);
    expect(notificationResult.notificationId).toBeDefined();
    expect(typeof notificationResult.notificationId).toBe("string");

    // 2. 全受信者に通知が送信されたこと
    expect(notificationResult.recipientsSentCount).toBe(3);
    expect(notificationResult.recipientsFailed).toEqual([]);

    // 3. 提案が優先度順（高→中→低）に整列されていること
    expect(notificationResult.sortedProposals.length).toBe(3);
    expect(notificationResult.sortedProposals[0].id).toBe("prop_001");
    expect(notificationResult.sortedProposals[0].priority).toBe("high");
    expect(notificationResult.sortedProposals[1].id).toBe("prop_002");
    expect(notificationResult.sortedProposals[1].priority).toBe("medium");
    expect(notificationResult.sortedProposals[2].id).toBe("prop_003");
    expect(notificationResult.sortedProposals[2].priority).toBe("low");

    // 4. 各提案の詳細情報がすべて含まれていること
    expect(notificationResult.notificationContent.proposals[0]).toEqual({
      id: "prop_001",
      title: "栄養基準値の自動更新機能",
      description:
        "月次検証時に栄養基準値を自動更新し、最新の栄養ガイドラインに対応させる",
      priority: "high",
      estimatedDays: 5,
      expectedImpact: "栄養推奨値との乖離を20%削減",
      affectedSegments: ["shared_household", "working_couple"],
      slaDeadline: new Date("2024-01-20T09:00:00Z"), // 5営業日後
      actionLinks: {
        viewDetails: "https://app.example.com/proposals/prop_001/details",
        approve: "https://app.example.com/proposals/prop_001/approve",
        reject: "https://app.example.com/proposals/prop_001/reject",
      },
    });

    expect(notificationResult.notificationContent.proposals[1]).toEqual({
      id: "prop_002",
      title: "アレルギー情報の段階的更新UI",
      description:
        "複数のアレルギー条件入力時に、優先度付けされたリスク警告を表示",
      priority: "medium",
      estimatedDays: 3,
      expectedImpact: "ユーザー入力エラー率を15%削減",
      affectedSegments: ["families_with_allergies"],
      slaDeadline: new Date("2024-01-20T09:00:00Z"),
      actionLinks: {
        viewDetails: "https://app.example.com/proposals/prop_002/details",
        approve: "https://app.example.com/proposals/prop_002/approve",
        reject: "https://app.example.com/proposals/prop_002/reject",
      },
    });

    expect(notificationResult.notificationContent.proposals[2]).toEqual({
      id: "prop_003",
      title: "調理時間制限の週単位集計レポート",
      description:
        "週次で調理時間短縮度を集計し、トレンド分析可能なレポート形式で表示",
      priority: "low",
      estimatedDays: 2,
      expectedImpact: "ユーザー満足度スコア+5%",
      affectedSegments: ["time_constrained_users"],
      slaDeadline: new Date("2024-01-20T09:00:00Z"),
      actionLinks: {
        viewDetails: "https://app.example.com/proposals/prop_003/details",
        approve: "https://app.example.com/proposals/prop_003/approve",
        reject: "https://app.example.com/proposals/prop_003/reject",
      },
    });

    // 5. 通知内容にメタデータが含まれていること
    expect(notificationResult.notificationContent.sentAt).toEqual(
      new Date("2024-01-15T09:00:00Z")
    );
    expect(notificationResult.notificationContent.totalProposalsCount).toBe(3);
    expect(notificationResult.notificationContent.highPriorityCount).toBe(1);
    expect(notificationResult.notificationContent.mediumPriorityCount).toBe(1);
    expect(notificationResult.notificationContent.lowPriorityCount).toBe(1);

    // 6. 各アクションリンクが有効な形式であること
    const highPriorityProposal = notificationResult.notificationContent
      .proposals[0];
    expect(highPriorityProposal.actionLinks.viewDetails).toMatch(
      /^https:\/\/app\.example\.com\/proposals\/prop_001\/details$/
    );
    expect(highPriorityProposal.actionLinks.approve).toMatch(
      /^https:\/\/app\.example\.com\/proposals\/prop_001\/approve$/
    );
    expect(highPriorityProposal.actionLinks.reject).toMatch(
      /^https:\/\/app\.example\.com\/proposals\/prop_001\/reject$/
    );

    // 7. SLA期限が正しく計算されていること（5営業日後）
    expect(notificationResult.notificationContent.proposals[0].slaDeadline).toEqual(
      new Date("2024-01-20T09:00:00Z")
    );
    expect(notificationResult.notificationContent.proposals[1].slaDeadline).toEqual(
      new Date("2024-01-20T09:00:00Z")
    );
    expect(notificationResult.notificationContent.proposals[2].slaDeadline).toEqual(
      new Date("2024-01-20T09:00:00Z")
    );

    // 8. 通知履歴が記録されていること
    expect(notificationResult.auditLog).toBeDefined();
    expect(notificationResult.auditLog.notificationId).toBe(
      notificationResult.notificationId
    );
    expect(notificationResult.auditLog.triggeredAt).toEqual(
      new Date("2024-01-15T09:00:00Z")
    );
    expect(notificationResult.auditLog.proposalCount).toBe(3);
    expect(notificationResult.auditLog.recipientCount).toBe(3);
    expect(notificationResult.auditLog.status).toBe("sent");

    // 9. 優先度順でソートされたことが検証可能な形式で記録されていること
    expect(notificationResult.auditLog.priorityDistribution).toEqual({
      high: 1,
      medium: 1,
      low: 1,
    });

    // 10. 受信者ごとの送信結果が記録されていること
    expect(notificationResult.recipientResults.length).toBe(3);
    notificationResult.recipientResults.forEach((result) => {
      expect(result.email).toBeDefined();
      expect(result.delivered).toBe(true);
      expect(result.deliveredAt).toBeDefined();
      expect(
        ["dev_team_lead@company.com", "algorithm_engineer@company.com", "backend_engineer@company.com"].includes(
          result.email
        )
      ).toBe(true);
    });
  });
});