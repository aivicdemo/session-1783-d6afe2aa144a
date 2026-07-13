import { generateDevelopmentTeamNotification } from "../../src/logic/it-1-br-2-1-2-1";

describe("改善提案から開発チーム向け通知生成", () => {
  // SCEN-496
  test("改善提案情報から開発チーム向けの通知ペイロードを生成する", () => {
    // Arrange
    const proposalId = "PROP-20240115-001";
    const proposalInfo = {
      proposalId: proposalId,
      title: "栄養基準ロジック改善案：タンパク質目標値の段階的調整",
      description:
        "年代別・性別・活動量に基づいたタンパク質推奨値を動的に計算し、献立生成時に栄養バランスの精度を向上させる",
      category: "栄養基準ロジック",
      priority: 1,
      businessValue: 8,
      technicalDifficulty: 6,
      userImpact: 7,
      proposalDate: "2024-01-15T10:30:00Z",
      proposerInfo: {
        proposerId: "NUTRI-001",
        proposerName: "栄養士太郎",
        proposerRole: "栄養士",
        department: "栄養管理部",
      },
      estimatedImplementationDays: 14,
      expectedEffectDescription: "栄養項目別達成度が平均5%向上することを期待",
      kpiContribution: "献立生成成功率を95%以上に維持",
    };

    const currentTimestamp = "2024-01-15T11:00:00Z";

    // Act
    const notificationPayload = generateDevelopmentTeamNotification(
      proposalInfo,
      currentTimestamp
    );

    // Assert
    // 1. ペイロードが JSON 形式であることを検証
    expect(typeof notificationPayload).toBe("object");
    expect(notificationPayload).not.toBeNull();

    // 2. 必須フィールドがすべて含まれていることを確認
    expect(notificationPayload).toHaveProperty("notificationType");
    expect(notificationPayload).toHaveProperty("teamId");
    expect(notificationPayload).toHaveProperty("proposalId");
    expect(notificationPayload).toHaveProperty("title");
    expect(notificationPayload).toHaveProperty("description");
    expect(notificationPayload).toHaveProperty("priority");
    expect(notificationPayload).toHaveProperty("proposalDate");
    expect(notificationPayload).toHaveProperty("proposerInfo");
    expect(notificationPayload).toHaveProperty("timestamp");

    // 3. ペイロード内のデータが改善提案情報と一致していることを検証
    expect(notificationPayload.notificationType).toBe(
      "IMPROVEMENT_PROPOSAL_FOR_DEV"
    );
    expect(notificationPayload.teamId).toBe("DEV_TEAM");
    expect(notificationPayload.proposalId).toBe(proposalId);
    expect(notificationPayload.title).toBe(proposalInfo.title);
    expect(notificationPayload.description).toBe(proposalInfo.description);
    expect(notificationPayload.priority).toBe(1);
    expect(notificationPayload.proposalDate).toBe(proposalInfo.proposalDate);

    // 4. 提案者情報が正確に反映されていることを検証
    expect(notificationPayload.proposerInfo).toEqual({
      proposerId: "NUTRI-001",
      proposerName: "栄養士太郎",
      proposerRole: "栄養士",
      department: "栄養管理部",
    });

    // 5. ペイロードのタイムスタンプが指定時刻と一致していることを確認
    expect(notificationPayload.timestamp).toBe(currentTimestamp);

    // 6. 開発チーム向けに適切にフォーマットされていることを確認
    expect(notificationPayload).toHaveProperty("estimatedImplementationDays");
    expect(notificationPayload.estimatedImplementationDays).toBe(14);
    expect(notificationPayload).toHaveProperty("expectedEffectDescription");
    expect(notificationPayload.expectedEffectDescription).toBe(
      "栄養項目別達成度が平均5%向上することを期待"
    );
    expect(notificationPayload).toHaveProperty("kpiContribution");
    expect(notificationPayload.kpiContribution).toBe(
      "献立生成成功率を95%以上に維持"
    );

    // 7. 優先度スコアリング情報が含まれていることを確認
    expect(notificationPayload).toHaveProperty("businessValue");
    expect(notificationPayload.businessValue).toBe(8);
    expect(notificationPayload).toHaveProperty("technicalDifficulty");
    expect(notificationPayload.technicalDifficulty).toBe(6);
    expect(notificationPayload).toHaveProperty("userImpact");
    expect(notificationPayload.userImpact).toBe(7);

    // 8. 提案カテゴリが正確に反映されていることを確認
    expect(notificationPayload).toHaveProperty("category");
    expect(notificationPayload.category).toBe("栄養基準ロジック");

    // 9. ペイロードの構造が開発チーム向けに最適化されていることを確認
    expect(Object.keys(notificationPayload).length).toBeGreaterThan(8);
    expect(notificationPayload.notificationType).toMatch(
      /IMPROVEMENT_PROPOSAL/
    );
  });
});