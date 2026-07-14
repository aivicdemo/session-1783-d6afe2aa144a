import { manageRuleSpecificationVersioning } from "../../src/logic/it-7-2-1";

describe("ルール仕様書バージョン管理機能", () => {
  // SCEN-819
  test("作成されたルール仕様書がバージョン管理され、形式・更新頻度・変更履歴が統一基準で記録される", () => {
    // 初回作成：ルール仕様書v1.0を作成
    const initialSpec = {
      ruleId: "rule_seasonal_001",
      seasonalPattern: ["春野菜", "夏野菜"],
      discountThreshold: 0.15,
      campaignPeriod: "2024-Q1",
      createdBy: "pm_user_001",
    };

    const createResult = manageRuleSpecificationVersioning({
      action: "create",
      specification: initialSpec,
      userId: "pm_user_001",
      timestamp: new Date("2024-01-15T09:00:00Z"),
    });

    expect(createResult.versionNumber).toBe("v1.0");
    expect(createResult.format).toBe("JSON");
    expect(createResult.createdAt).toBe("2024-01-15T09:00:00Z");
    expect(createResult.updatedAt).toBe("2024-01-15T09:00:00Z");
    expect(createResult.changeLog).toEqual([]);
    expect(createResult.specContent).toEqual(initialSpec);

    // 1回目の更新：バージョンをv1.1に自動インクリメント
    const updateSpec1 = {
      ...initialSpec,
      seasonalPattern: ["春野菜", "夏野菜", "秋野菜"],
    };

    const updateResult1 = manageRuleSpecificationVersioning({
      action: "update",
      specification: updateSpec1,
      previousVersion: createResult,
      userId: "pm_user_002",
      timestamp: new Date("2024-01-16T10:30:00Z"),
    });

    expect(updateResult1.versionNumber).toBe("v1.1");
    expect(updateResult1.format).toBe("JSON");
    expect(updateResult1.createdAt).toBe("2024-01-15T09:00:00Z");
    expect(updateResult1.updatedAt).toBe("2024-01-16T10:30:00Z");
    expect(updateResult1.changeLog.length).toBe(1);
    expect(updateResult1.changeLog[0]).toEqual({
      versionBefore: "v1.0",
      versionAfter: "v1.1",
      changedAt: "2024-01-16T10:30:00Z",
      changedBy: "pm_user_002",
      changes: [
        {
          field: "seasonalPattern",
          oldValue: ["春野菜", "夏野菜"],
          newValue: ["春野菜", "夏野菜", "秋野菜"],
        },
      ],
    });

    // 2回目の更新：バージョンをv1.2に自動インクリメント
    const updateSpec2 = {
      ...updateSpec1,
      discountThreshold: 0.2,
    };

    const updateResult2 = manageRuleSpecificationVersioning({
      action: "update",
      specification: updateSpec2,
      previousVersion: updateResult1,
      userId: "pm_user_001",
      timestamp: new Date("2024-01-17T14:15:00Z"),
    });

    expect(updateResult2.versionNumber).toBe("v1.2");
    expect(updateResult2.updatedAt).toBe("2024-01-17T14:15:00Z");
    expect(updateResult2.changeLog.length).toBe(2);
    expect(updateResult2.changeLog[1]).toEqual({
      versionBefore: "v1.1",
      versionAfter: "v1.2",
      changedAt: "2024-01-17T14:15:00Z",
      changedBy: "pm_user_001",
      changes: [
        {
          field: "discountThreshold",
          oldValue: 0.15,
          newValue: 0.2,
        },
      ],
    });

    // 変更履歴が時系列で正確に記録されていることを確認
    expect(updateResult2.changeLog[0].changedAt).toBe("2024-01-16T10:30:00Z");
    expect(updateResult2.changeLog[1].changedAt).toBe("2024-01-17T14:15:00Z");

    // バージョン履歴から過去のバージョンを参照
    const versionHistory = manageRuleSpecificationVersioning({
      action: "getHistory",
      versionedSpec: updateResult2,
    });

    expect(versionHistory.versions.length).toBe(3);
    expect(versionHistory.versions[0]).toEqual({
      versionNumber: "v1.0",
      createdAt: "2024-01-15T09:00:00Z",
      updatedAt: "2024-01-15T09:00:00Z",
      createdBy: "pm_user_001",
    });
    expect(versionHistory.versions[1]).toEqual({
      versionNumber: "v1.1",
      createdAt: "2024-01-15T09:00:00Z",
      updatedAt: "2024-01-16T10:30:00Z",
      createdBy: "pm_user_001",
      lastModifiedBy: "pm_user_002",
    });
    expect(versionHistory.versions[2]).toEqual({
      versionNumber: "v1.2",
      createdAt: "2024-01-15T09:00:00Z",
      updatedAt: "2024-01-17T14:15:00Z",
      createdBy: "pm_user_001",
      lastModifiedBy: "pm_user_001",
    });

    // 特定バージョンの復元可能性を確認
    const restoreResult = manageRuleSpecificationVersioning({
      action: "restore",
      targetVersion: "v1.1",
      versionedSpec: updateResult2,
      userId: "pm_user_001",
      timestamp: new Date("2024-01-18T11:00:00Z"),
    });

    expect(restoreResult.versionNumber).toBe("v1.3");
    expect(restoreResult.specContent).toEqual(updateResult1.specContent);
    expect(restoreResult.changeLog.length).toBe(3);
    expect(restoreResult.changeLog[2]).toEqual({
      versionBefore: "v1.2",
      versionAfter: "v1.3",
      changedAt: "2024-01-18T11:00:00Z",
      changedBy: "pm_user_001",
      changes: [
        {
          field: "restoredFrom",
          oldValue: "v1.2",
          newValue: "v1.1",
        },
      ],
    });
  });
});