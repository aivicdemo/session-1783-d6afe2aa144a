import { distributeRuleSpecificationAndTrackConfirmation } from "../../src/logic/it-1-1-1";

describe("ルール仕様書の配布と確認追跡機能", () => {
  // SCEN-561
  test("指定タイミングでルール仕様書が対象者全員に正常に配布され、配布確認追跡が正確に記録される", () => {
    const distributionConfig = {
      ruleSpecificationId: "rule-spec-001",
      ruleSpecificationFileName: "seasonal_pattern_q1_2024.pdf",
      ruleSpecificationContent: Buffer.from(
        "Seasonal Pattern Q1 2024: Spring vegetables priority"
      ),
      targetUserSegment: "all",
      distributionTiming: "2024-01-15T09:00:00Z",
      distributionFrequency: "weekly",
      distributionDayOfWeek: 1,
      distributionTimeUtc: "09:00",
    };

    const targetUserIds = ["user-001", "user-002", "user-003"];
    const currentTimestamp = new Date("2024-01-15T09:00:00Z");

    const result = distributeRuleSpecificationAndTrackConfirmation(
      distributionConfig,
      targetUserIds,
      currentTimestamp
    );

    // 配布が実行されたことの確認
    expect(result.distributionExecuted).toBe(true);
    expect(result.distributionTimestamp).toEqual(
      new Date("2024-01-15T09:00:00Z")
    );

    // 配布対象者数の確認
    expect(result.totalTargetUsers).toBe(3);
    expect(result.successfulDistributions).toBe(3);
    expect(result.failedDistributions).toBe(0);

    // 配布ログ記録の確認
    expect(result.distributionLog).toBeDefined();
    expect(result.distributionLog.length).toBe(3);
    expect(result.distributionLog[0].userId).toBe("user-001");
    expect(result.distributionLog[0].status).toBe("delivered");
    expect(result.distributionLog[0].deliveryTimestamp).toEqual(
      new Date("2024-01-15T09:00:00Z")
    );

    // 配布されたファイルの検証
    expect(result.distributionLog[0].fileChecksum).toBeDefined();
    expect(result.distributionLog[0].fileChecksum).toBe(
      "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ae11b77936e78cccce541426341b"
    );

    // 通知の確認
    expect(result.notificationsGenerated).toBe(3);
    expect(result.notificationHistory[0].userId).toBe("user-001");
    expect(result.notificationHistory[0].notificationType).toBe(
      "rule_specification_distributed"
    );
    expect(result.notificationHistory[0].notificationSentAt).toEqual(
      new Date("2024-01-15T09:00:00Z")
    );

    // 配布確認追跡データ
    expect(result.confirmationTracking).toBeDefined();
    expect(result.confirmationTracking.length).toBe(3);
    expect(result.confirmationTracking[0].userId).toBe("user-001");
    expect(result.confirmationTracking[0].notificationReceived).toBe(true);
    expect(result.confirmationTracking[0].notificationReceivedAt).toEqual(
      new Date("2024-01-15T09:00:00Z")
    );
    expect(result.confirmationTracking[0].fileDownloaded).toBe(false);
    expect(result.confirmationTracking[0].fileDownloadedAt).toBeNull();
    expect(result.confirmationTracking[0].contentConfirmed).toBe(false);
    expect(result.confirmationTracking[0].contentConfirmedAt).toBeNull();

    // スケジュール情報の確認
    expect(result.scheduleInfo.nextDistributionTiming).toEqual(
      new Date("2024-01-22T09:00:00Z")
    );
    expect(result.scheduleInfo.distributionFrequency).toBe("weekly");

    // エラーログが空であることの確認
    expect(result.errorLog.length).toBe(0);

    // 配布サマリーの確認
    expect(result.distributionSummary.executionStartTime).toEqual(
      new Date("2024-01-15T09:00:00Z")
    );
    expect(result.distributionSummary.executionEndTime).toBeDefined();
    expect(
      result.distributionSummary.executionEndTime.getTime() -
        result.distributionSummary.executionStartTime.getTime()
    ).toBeLessThan(5000);
    expect(result.distributionSummary.deliverySuccessRate).toBe(100);
  });

  test("配布対象外ユーザーが配布されたルール仕様書にアクセスできないことを確認", () => {
    const distributionConfig = {
      ruleSpecificationId: "rule-spec-002",
      ruleSpecificationFileName: "discount_threshold_2024.pdf",
      ruleSpecificationContent: Buffer.from(
        "Discount Threshold Rules for 2024"
      ),
      targetUserSegment: "development_team_only",
      distributionTiming: "2024-01-22T09:00:00Z",
      distributionFrequency: "weekly",
      distributionDayOfWeek: 1,
      distributionTimeUtc: "09:00",
    };

    const targetUserIds = ["dev-user-001", "dev-user-002"];
    const currentTimestamp = new Date("2024-01-22T09:00:00Z");

    const result = distributeRuleSpecificationAndTrackConfirmation(
      distributionConfig,
      targetUserIds,
      currentTimestamp
    );

    expect(result.distributionExecuted).toBe(true);
    expect(result.successfulDistributions).toBe(2);
    expect(result.confirmationTracking.every((ct) => ct.userId.startsWith("dev-user-"))).toBe(
      true
    );
  });

  test("ルール仕様書の配布タイミングが過去の場合、即座に配布されることを確認", () => {
    const distributionConfig = {
      ruleSpecificationId: "rule-spec-003",
      ruleSpecificationFileName: "urgent_update.pdf",
      ruleSpecificationContent: Buffer.from("Urgent Update Content"),
      targetUserSegment: "all",
      distributionTiming: "2024-01-10T09:00:00Z",
      distributionFrequency: "one_time",
      distributionDayOfWeek: null,
      distributionTimeUtc: null,
    };

    const targetUserIds = ["user-001", "user-002"];
    const currentTimestamp = new Date("2024-01-15T14:30:00Z");

    const result = distributeRuleSpecificationAndTrackConfirmation(
      distributionConfig,
      targetUserIds,
      currentTimestamp
    );

    expect(result.distributionExecuted).toBe(true);
    expect(result.successfulDistributions).toBe(2);
    expect(result.distributionLog[0].status).toBe("delivered");
  });

  test("無効なルール仕様書 ID で配布が要求された場合、エラーが発生すること", () => {
    const distributionConfig = {
      ruleSpecificationId: "",
      ruleSpecificationFileName: "invalid.pdf",
      ruleSpecificationContent: Buffer.from("Invalid"),
      targetUserSegment: "all",
      distributionTiming: "2024-01-15T09:00:00Z",
      distributionFrequency: "weekly",
      distributionDayOfWeek: 1,
      distributionTimeUtc: "09:00",
    };

    const targetUserIds = ["user-001"];
    const currentTimestamp = new Date("2024-01-15T09:00:00Z");

    expect(() =>
      distributeRuleSpecificationAndTrackConfirmation(
        distributionConfig,
        targetUserIds,
        currentTimestamp
      )
    ).toThrow(/仕様書ID/);
  });

  test("配布対象ユーザーリストが空の場合、エラーが発生すること", () => {
    const distributionConfig = {
      ruleSpecificationId: "rule-spec-004",
      ruleSpecificationFileName: "test.pdf",
      ruleSpecificationContent: Buffer.from("Test"),
      targetUserSegment: "all",
      distributionTiming: "2024-01-15T09:00:00Z",
      distributionFrequency: "weekly",
      distributionDayOfWeek: 1,
      distributionTimeUtc: "09:00",
    };

    const targetUserIds: string[] = [];
    const currentTimestamp = new Date("2024-01-15T09:00:00Z");

    expect(() =>
      distributeRuleSpecificationAndTrackConfirmation(
        distributionConfig,
        targetUserIds,
        currentTimestamp
      )
    ).toThrow(/対象ユーザー/);
  });

  test("複数週にわたる定期配布スケジュールが正しく設定されることを確認", () => {
    const distributionConfig = {
      ruleSpecificationId: "rule-spec-005",
      ruleSpecificationFileName: "recurring_schedule.pdf",
      ruleSpecificationContent: Buffer.from("Recurring Schedule"),
      targetUserSegment: "all",
      distributionTiming: "2024-01-15T09:00:00Z",
      distributionFrequency: "weekly",
      distributionDayOfWeek: 1,
      distributionTimeUtc: "09:00",
    };

    const targetUserIds = ["user-001"];
    const currentTimestamp = new Date("2024-01-15T09:00:00Z");

    const result = distributeRuleSpecificationAndTrackConfirmation(
      distributionConfig,
      targetUserIds,
      currentTimestamp
    );

    expect(result.scheduleInfo.nextDistributionTiming).toEqual(
      new Date("2024-01-22T09:00:00Z")
    );
    expect(result.scheduleInfo.distributionFrequency).toBe("weekly");

    // 再度同じ config で呼び出すと翌週配布予定になることを確認
    const nextWeekTimestamp = new Date("2024-01-22T09:00:00Z");
    const result2 = distributeRuleSpecificationAndTrackConfirmation(
      distributionConfig,
      targetUserIds,
      nextWeekTimestamp
    );

    expect(result2.distributionExecuted).toBe(true);
    expect(result2.scheduleInfo.nextDistributionTiming).toEqual(
      new Date("2024-01-29T09:00:00Z")
    );
  });

  test("配布ファイルの完全性検証（チェックサム）が正しく実行されることを確認", () => {
    const fileContent = Buffer.from(
      "Complete file content for seasonal pattern"
    );
    const distributionConfig = {
      ruleSpecificationId: "rule-spec-006",
      ruleSpecificationFileName: "checksum_verify.pdf",
      ruleSpecificationContent: fileContent,
      targetUserSegment: "all",
      distributionTiming: "2024-01-15T09:00:00Z",
      distributionFrequency: "weekly",
      distributionDayOfWeek: 1,
      distributionTimeUtc: "09:00",
    };

    const targetUserIds = ["user-001", "user-002"];
    const currentTimestamp = new Date("2024-01-15T09:00:00Z");

    const result = distributeRuleSpecificationAndTrackConfirmation(
      distributionConfig,
      targetUserIds,
      currentTimestamp
    );

    // 同じファイルが配布されたため、チェックサムが一致すること
    expect(result.distributionLog[0].fileChecksum).toBe(
      result.distributionLog[1].fileChecksum
    );

    // チェックサムが計算されていることを確認
    expect(result.distributionLog[0].fileChecksum).toBeDefined();
    expect(result.distributionLog[0].fileChecksum.length).toBe(64);
  });

  test("配布通知が正しいユーザーに正しい内容で送信されることを確認", () => {
    const distributionConfig = {
      ruleSpecificationId: "rule-spec-007",
      ruleSpecificationFileName: "notification_content.pdf",
      ruleSpecificationContent: Buffer.from("Notification Test Content"),
      targetUserSegment: "all",
      distributionTiming: "2024-01-15T09:00:00Z",
      distributionFrequency: "weekly",
      distributionDayOfWeek: 1,
      distributionTimeUtc: "09:00",
    };

    const targetUserIds = ["user-001", "user-002", "user-003"];
    const currentTimestamp = new Date("2024-01-15T09:00:00Z");

    const result = distributeRuleSpecificationAndTrackConfirmation(
      distributionConfig,
      targetUserIds,
      currentTimestamp
    );

    // 通知数が対象ユーザー数と一致することを確認
    expect(result.notificationsGenerated).toBe(targetUserIds.length);

    // 各通知が正しいユーザーに送信されたことを確認
    result.notificationHistory.forEach((notification, index) => {
      expect(notification.userId).toBe(targetUserIds[index]);
      expect(notification.notificationType).toBe(
        "rule_specification_distributed"
      );
      expect(notification.ruleSpecificationId).toBe("rule-spec-007");
      expect(notification.notificationSentAt).toEqual(currentTimestamp);
      expect(notification.notificationStatus).toBe("sent");
    });
  });

  test("配布確認追跡でユーザーの受信・確認状況が段階的に更新されることを確認", () => {
    const distributionConfig = {
      ruleSpecificationId: "rule-spec-008",
      ruleSpecificationFileName: "tracking_progress.pdf",
      ruleSpecificationContent: Buffer.from("Tracking Progress Content"),
      targetUserSegment: "all",
      distributionTiming: "2024-01-15T09:00:00Z",
      distributionFrequency: "weekly",
      distributionDayOfWeek: 1,
      distributionTimeUtc: "09:00",
    };

    const targetUserIds = ["user-001"];
    const currentTimestamp = new Date("2024-01-15T09:00:00Z");

    const result = distributeRuleSpecificationAndTrackConfirmation(
      distributionConfig,
      targetUserIds,
      currentTimestamp
    );

    // 初期状態では受信のみ確認
    const tracking = result.confirmationTracking[0];
    expect(tracking.notificationReceived).toBe(true);
    expect(tracking.notificationReceivedAt).toEqual(currentTimestamp);
    expect(tracking.fileDownloaded).toBe(false);
    expect(tracking.fileDownloadedAt).toBeNull();
    expect(tracking.contentConfirmed).toBe(false);
    expect(tracking.contentConfirmedAt).toBeNull();

    // 追跡情報にメタデータが含まれていることを確認
    expect(tracking.downloadUrl).toBeDefined();
    expect(tracking.confirmationDeadline).toBeDefined();
  });
});