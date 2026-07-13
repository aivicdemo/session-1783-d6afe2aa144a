import { recordPurchaseAndCalculateMonthlyReduction } from "../../src/logic/it-1-br-3-2-1";

describe("Purchase recording and monthly food expense reduction auto-aggregation & analysis", () => {
  // SCEN-359: [normal] 改善提案の優先度付けと自動通知機能 - 栄養士が改善提案を優先度付け完了に変更したとき、開発チームへの通知が正常に生成される
  test("should generate notification to development team when nutritionist completes priority assignment on improvement proposal", () => {
    const nutritionistUserId = "nutritionist_001";
    const improvementProposalId = "proposal_2024_001";
    const proposalContent = "Increase calcium intake in weekly menus for family members";
    const priorityLevel = 1;
    const previousStatus = "pending_approval";
    const newStatus = "priority_assignment_completed";
    const nutritionistEvaluationContent = "High impact on nutritional goals, implementable within current budget";
    const developmentTeamMemberIds = ["dev_lead_001", "dev_backend_002", "dev_frontend_003"];
    const notificationTimestamp = new Date("2024-01-15T14:30:00Z");

    const result = recordPurchaseAndCalculateMonthlyReduction({
      nutritionistUserId,
      improvementProposalId,
      proposalContent,
      priorityLevel,
      previousStatus,
      newStatus,
      nutritionistEvaluationContent,
      developmentTeamMemberIds,
      notificationTimestamp,
    });

    // Verify status update
    expect(result.statusUpdateSuccess).toBe(true);
    expect(result.updatedProposal.status).toBe("priority_assignment_completed");
    expect(result.updatedProposal.id).toBe("proposal_2024_001");
    expect(result.updatedProposal.priority).toBe(1);

    // Verify notification generation for development team
    expect(result.notificationsGenerated).toBe(true);
    expect(result.notificationCount).toBe(3); // one per dev team member
    expect(result.notificationRecipients).toEqual([
      "dev_lead_001",
      "dev_backend_002",
      "dev_frontend_003",
    ]);

    // Verify notification content includes required fields
    expect(result.notifications).toHaveLength(3);
    result.notifications.forEach((notification) => {
      expect(notification.proposalId).toBe("proposal_2024_001");
      expect(notification.proposalContent).toBe(proposalContent);
      expect(notification.priorityLevel).toBe(1);
      expect(notification.nutritionistEvaluation).toBe(
        nutritionistEvaluationContent
      );
      expect(notification.timestamp).toEqual(notificationTimestamp);
    });

    // Verify first notification recipient
    expect(result.notifications[0].recipientId).toBe("dev_lead_001");

    // Verify notification log entry
    expect(result.notificationLogRecorded).toBe(true);
    expect(result.notificationLog.proposalId).toBe("proposal_2024_001");
    expect(result.notificationLog.statusTransition).toBe(
      `${previousStatus} → ${newStatus}`
    );
    expect(result.notificationLog.notificationsSent).toBe(3);

    // Verify proposal content is included in notification log
    expect(result.notificationLog.proposalSummary).toBe(proposalContent);

    // Verify timestamp consistency
    expect(result.updatedProposal.lastModifiedAt).toEqual(notificationTimestamp);
  });
});