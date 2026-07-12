import {
  distributeRuleSpecification,
  trackDistributionStatus,
  confirmRuleSpecification,
} from "../../src/logic/it-1-1-1";

describe("ルール仕様書の配布と確認追跡機能", () => {
  // SCEN-562
  test("各対象者の確認状況がシステムで正しく追跡される", () => {
    const ruleSpecId = "rule-spec-2024-001";
    const ruleSpecTitle = "2024年Q1季節パターン・割引率・販売期間の優先度ルール";
    const ruleSpecContent = {
      seasonalPatterns: ["春野菜", "春魚"],
      discountThresholds: [10, 15, 20],
      salesPeriods: ["2024-03-01", "2024-05-31"],
    };

    const distributionTimestamp = new Date("2024-03-15T09:00:00Z");
    const recipientA = {
      userId: "user-001",
      name: "開発者A",
      email: "dev-a@example.com",
      role: "developer",
    };
    const recipientB = {
      userId: "user-002",
      name: "開発者B",
      email: "dev-b@example.com",
      role: "developer",
    };
    const recipientC = {
      userId: "user-003",
      name: "開発者C",
      email: "dev-c@example.com",
      role: "developer",
    };

    const recipients = [recipientA, recipientB, recipientC];

    const distributionResult = distributeRuleSpecification({
      ruleSpecId,
      ruleSpecTitle,
      ruleSpecContent,
      recipients,
      distributionTimestamp,
    });

    expect(distributionResult.distributionId).toBeDefined();
    expect(distributionResult.totalRecipients).toBe(3);
    expect(distributionResult.status).toBe("distributed");
    expect(distributionResult.distributionTimestamp).toEqual(distributionTimestamp);

    const initialTrackingStatus = trackDistributionStatus({
      distributionId: distributionResult.distributionId,
    });

    expect(initialTrackingStatus.recipientStatuses).toHaveLength(3);
    expect(
      initialTrackingStatus.recipientStatuses.every(
        (s: any) => s.confirmationStatus === "unconfirmed"
      )
    ).toBe(true);

    const confirmationTimestampA = new Date("2024-03-15T10:30:00Z");
    const confirmResultA = confirmRuleSpecification({
      distributionId: distributionResult.distributionId,
      userId: recipientA.userId,
      confirmationTimestamp: confirmationTimestampA,
    });

    expect(confirmResultA.userId).toBe(recipientA.userId);
    expect(confirmResultA.confirmationStatus).toBe("confirmed");
    expect(confirmResultA.confirmationTimestamp).toEqual(confirmationTimestampA);

    const confirmationTimestampC = new Date("2024-03-15T11:45:00Z");
    const confirmResultC = confirmRuleSpecification({
      distributionId: distributionResult.distributionId,
      userId: recipientC.userId,
      confirmationTimestamp: confirmationTimestampC,
    });

    expect(confirmResultC.userId).toBe(recipientC.userId);
    expect(confirmResultC.confirmationStatus).toBe("confirmed");
    expect(confirmResultC.confirmationTimestamp).toEqual(confirmationTimestampC);

    const trackingStatusAfterConfirmations = trackDistributionStatus({
      distributionId: distributionResult.distributionId,
    });

    expect(trackingStatusAfterConfirmations.recipientStatuses).toHaveLength(3);

    const statusA = trackingStatusAfterConfirmations.recipientStatuses.find(
      (s: any) => s.userId === recipientA.userId
    );
    expect(statusA.confirmationStatus).toBe("confirmed");
    expect(statusA.confirmationTimestamp).toEqual(confirmationTimestampA);

    const statusB = trackingStatusAfterConfirmations.recipientStatuses.find(
      (s: any) => s.userId === recipientB.userId
    );
    expect(statusB.confirmationStatus).toBe("unconfirmed");
    expect(statusB.confirmationTimestamp).toBeNull();

    const statusC = trackingStatusAfterConfirmations.recipientStatuses.find(
      (s: any) => s.userId === recipientC.userId
    );
    expect(statusC.confirmationStatus).toBe("confirmed");
    expect(statusC.confirmationTimestamp).toEqual(confirmationTimestampC);

    const trackingStatusFinal = trackDistributionStatus({
      distributionId: distributionResult.distributionId,
    });

    expect(trackingStatusFinal.recipientStatuses).toHaveLength(3);
    expect(
      trackingStatusFinal.recipientStatuses.find(
        (s: any) => s.userId === recipientA.userId
      ).confirmationStatus
    ).toBe("confirmed");
    expect(
      trackingStatusFinal.recipientStatuses.find(
        (s: any) => s.userId === recipientB.userId
      ).confirmationStatus
    ).toBe("unconfirmed");
    expect(
      trackingStatusFinal.recipientStatuses.find(
        (s: any) => s.userId === recipientC.userId
      ).confirmationStatus
    ).toBe("confirmed");

    const confirmedCount = trackingStatusFinal.recipientStatuses.filter(
      (s: any) => s.confirmationStatus === "confirmed"
    ).length;
    const unconfirmedCount = trackingStatusFinal.recipientStatuses.filter(
      (s: any) => s.confirmationStatus === "unconfirmed"
    ).length;

    expect(confirmedCount).toBe(2);
    expect(unconfirmedCount).toBe(1);
    expect(confirmedCount + unconfirmedCount).toBe(3);
  });
});