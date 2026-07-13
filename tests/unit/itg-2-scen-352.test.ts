import { prioritizeNutritionistProposals, scheduleNotificationsForDevelopmentTeam } from "../../src/logic/it-1-br-2-1-2-1";

describe("改善提案の優先度付けと定期通知", () => {
  // SCEN-352
  test("栄養士が監修した改善提案が優先度付けされ、定期通知スケジュールに従って開発チームに通知される", () => {
    // Precondition: 栄養士ユーザーが複数の改善提案を作成し、監修完了マークを付けている状態
    const nutritionistProposals = [
      {
        proposalId: "PROP-001",
        title: "カルシウム摂取量向上",
        description: "乳製品の摂取機会を増加",
        businessValue: 8,
        technicalDifficulty: 3,
        userImpact: 7,
        nutritionistReviewStatus: "completed",
        nutritionistReviewContent: "栄養基準値の引き上げが有効",
        urgencyLevel: 9,
        impactRange: "all_segments",
        createdAt: new Date("2024-01-15T10:00:00Z"),
      },
      {
        proposalId: "PROP-002",
        title: "調理時間最適化",
        description: "簡易調理メニューの導入",
        businessValue: 6,
        technicalDifficulty: 5,
        userImpact: 5,
        nutritionistReviewStatus: "completed",
        nutritionistReviewContent: "栄養損失を最小限に抑える調理法確認済み",
        urgencyLevel: 5,
        impactRange: "time_constrained_segment",
        createdAt: new Date("2024-01-15T11:00:00Z"),
      },
      {
        proposalId: "PROP-003",
        title: "アレルギー対応食材の拡充",
        description: "代替食材ライブラリの拡張",
        businessValue: 7,
        technicalDifficulty: 4,
        userImpact: 8,
        nutritionistReviewStatus: "completed",
        nutritionistReviewContent: "栄養価同等の代替食材を検証完了",
        urgencyLevel: 8,
        impactRange: "allergy_constrained_segment",
        createdAt: new Date("2024-01-15T12:00:00Z"),
      },
    ];

    // Trigger: 改善提案の優先度付けアルゴリズムを実行
    const prioritizedResult = prioritizeNutritionistProposals(
      nutritionistProposals
    );

    // Outcome: 優先度付けが正しく適用されている
    // 優先度スコア = (businessValue * 0.4) + (userImpact * 0.35) + (urgencyLevel * 0.25) で計算
    // PROP-001: (8 * 0.4) + (7 * 0.35) + (9 * 0.25) = 3.2 + 2.45 + 2.25 = 7.9
    // PROP-003: (7 * 0.4) + (8 * 0.35) + (8 * 0.25) = 2.8 + 2.8 + 2.0 = 7.6
    // PROP-002: (6 * 0.4) + (5 * 0.35) + (5 * 0.25) = 2.4 + 1.75 + 1.25 = 5.4
    expect(prioritizedResult.proposals.length).toBe(3);
    expect(prioritizedResult.proposals[0].proposalId).toBe("PROP-001");
    expect(prioritizedResult.proposals[0].priorityScore).toBe(7.9);
    expect(prioritizedResult.proposals[0].priorityRank).toBe("high");
    expect(prioritizedResult.proposals[1].proposalId).toBe("PROP-003");
    expect(prioritizedResult.proposals[1].priorityScore).toBe(7.6);
    expect(prioritizedResult.proposals[1].priorityRank).toBe("high");
    expect(prioritizedResult.proposals[2].proposalId).toBe("PROP-002");
    expect(prioritizedResult.proposals[2].priorityScore).toBe(5.4);
    expect(prioritizedResult.proposals[2].priorityRank).toBe("medium");

    // 優先度付けの監修情報確認
    expect(prioritizedResult.proposals[0].nutritionistReviewStatus).toBe(
      "completed"
    );
    expect(prioritizedResult.proposals[0].nutritionistReviewContent).toBe(
      "栄養基準値の引き上げが有効"
    );

    // Trigger: 定期通知スケジュール設定を「毎日09:00」で設定
    const notificationScheduleConfig = {
      scheduleType: "daily",
      scheduleTime: "09:00",
      frequencyPattern: "every_day",
      targetTeam: "development_team",
      proposalFilter: { priorityRankMinimum: "medium" },
    };

    // Trigger: 定期通知スケジュール実行シミュレーション
    const notificationResult = scheduleNotificationsForDevelopmentTeam(
      prioritizedResult.proposals,
      notificationScheduleConfig
    );

    // Outcome: 通知スケジュールが正確に実行される
    expect(notificationResult.notificationsSent).toBe(3);
    expect(notificationResult.scheduledTime).toBe("09:00");
    expect(notificationResult.notificationDetails[0].recipientTeam).toBe(
      "development_team"
    );
    expect(notificationResult.notificationDetails[0].proposalId).toBe(
      "PROP-001"
    );
    expect(notificationResult.notificationDetails[0].priorityRank).toBe("high");
    expect(notificationResult.notificationDetails[0].nutritionistReview).toBe(
      "栄養基準値の引き上げが有効"
    );

    // Outcome: 通知内容に栄養士の監修情報が含まれている
    expect(notificationResult.notificationDetails[0].reviewStatus).toBe(
      "completed"
    );
    expect(notificationResult.notificationDetails[0].reviewContent).toContain(
      "栄養"
    );

    // Trigger: 複数の定期通知スケジュール（日次・週次）を設定
    const multipleScheduleConfigs = [
      {
        scheduleType: "daily",
        scheduleTime: "09:00",
        frequencyPattern: "every_day",
        targetTeam: "development_team",
        proposalFilter: { priorityRankMinimum: "high" },
      },
      {
        scheduleType: "weekly",
        scheduleTime: "10:00",
        frequencyPattern: "monday",
        targetTeam: "development_team",
        proposalFilter: { priorityRankMinimum: "medium" },
      },
    ];

    // Outcome: 複数スケジュールが正確に実行される
    const dailyNotifications = scheduleNotificationsForDevelopmentTeam(
      prioritizedResult.proposals,
      multipleScheduleConfigs[0]
    );
    expect(dailyNotifications.scheduleType).toBe("daily");
    expect(dailyNotifications.notificationsSent).toBe(2); // "high" ランクは 2 件

    const weeklyNotifications = scheduleNotificationsForDevelopmentTeam(
      prioritizedResult.proposals,
      multipleScheduleConfigs[1]
    );
    expect(weeklyNotifications.scheduleType).toBe("weekly");
    expect(weeklyNotifications.scheduledFrequency).toBe("monday");
    expect(weeklyNotifications.scheduledTime).toBe("10:00");
    expect(weeklyNotifications.notificationsSent).toBe(3); // "medium" 以上は 3 件

    // Outcome: 通知スケジュール履歴が正確に記録されている
    expect(notificationResult.lastExecutionTime).toBeDefined();
    expect(notificationResult.nextExecutionTime).toBeDefined();
    expect(notificationResult.executionStatus).toBe("success");
    expect(notificationResult.totalScheduledNotifications).toBe(3);
  });
});