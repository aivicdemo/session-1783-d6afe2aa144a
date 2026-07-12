import { detectAndPrioritizeDietaryRestrictionChanges } from "../../src/logic/it-1-1-1";

describe("食事制限・アレルギー情報の変更検出と優先度付け", () => {
  // SCEN-332: [normal] 食事制限・アレルギー情報の変更検出と優先度付け
  test("新規入力された食事制限条件が正常に優先度付けされ、即時反映の要否が正しく判定される", () => {
    const userId = "user-001";
    const familyMemberId = "family-member-001";
    const currentRestrictions = [
      {
        id: "restrict-001",
        type: "allergy",
        ingredient: "えび",
        severity: 3,
        addedAt: new Date("2024-01-10T08:00:00Z"),
      },
    ];

    const newRestrictions = [
      {
        type: "allergy",
        ingredient: "ナッツ",
        severity: 3,
      },
      {
        type: "dietary",
        description: "グルテンフリー",
        severity: 2,
      },
    ];

    const pastMenus = [
      {
        id: "menu-001",
        dishName: "えびフライ",
        ingredients: ["えび", "小麦粉", "油"],
        createdAt: new Date("2024-01-08T10:00:00Z"),
      },
      {
        id: "menu-002",
        dishName: "ナッツバター和え",
        ingredients: ["ナッツ", "野菜", "調味料"],
        createdAt: new Date("2024-01-12T14:00:00Z"),
      },
      {
        id: "menu-003",
        dishName: "グルテンフリーパスタ",
        ingredients: ["米粉パスタ", "トマトソース", "チーズ"],
        createdAt: new Date("2024-01-14T19:00:00Z"),
      },
    ];

    const lastUpdateDate = new Date("2024-01-03T09:00:00Z");
    const currentDate = new Date("2024-01-15T11:00:00Z");
    const daysSinceLastUpdate = 12;

    const result = detectAndPrioritizeDietaryRestrictionChanges({
      userId,
      familyMemberId,
      currentRestrictions,
      newRestrictions,
      pastMenus,
      lastUpdateDate,
      currentDate,
    });

    expect(result).toEqual({
      changeDetected: true,
      newRestrictionsCount: 2,
      prioritizedRestrictions: [
        {
          type: "allergy",
          ingredient: "ナッツ",
          severity: 3,
          priority: 1,
          immediateReflectionRequired: true,
          reason: "高優先度アレルギー（重症度3）、過去献立で抵触検出",
          conflictingMenuIds: ["menu-002"],
        },
        {
          type: "dietary",
          description: "グルテンフリー",
          severity: 2,
          priority: 2,
          immediateReflectionRequired: false,
          reason: "中優先度制限（重症度2）、過去献立との抵触なし",
          conflictingMenuIds: [],
        },
      ],
      immediateReflectionCount: 1,
      totalConflictingMenus: 1,
      requiresAlgorithmUpdate: true,
      updateReason:
        "新規高優先度制限により献立生成ロジック即座更新が必要",
      timeSinceLastUpdate: daysSinceLastUpdate,
      shouldTriggerMenuRegeneration: true,
      changeTimestamp: new Date("2024-01-15T11:00:00Z"),
      changeSource: "user_input",
      validationStatus: "valid",
      dbPersistenceRequired: true,
    });

    expect(result.changeDetected).toBe(true);
    expect(result.newRestrictionsCount).toBe(2);
    expect(result.prioritizedRestrictions.length).toBe(2);
    expect(result.prioritizedRestrictions[0].priority).toBe(1);
    expect(result.prioritizedRestrictions[0].immediateReflectionRequired).toBe(
      true
    );
    expect(result.prioritizedRestrictions[0].conflictingMenuIds).toContain(
      "menu-002"
    );
    expect(result.prioritizedRestrictions[1].priority).toBe(2);
    expect(result.prioritizedRestrictions[1].immediateReflectionRequired).toBe(
      false
    );
    expect(result.immediateReflectionCount).toBe(1);
    expect(result.totalConflictingMenus).toBe(1);
    expect(result.requiresAlgorithmUpdate).toBe(true);
    expect(result.shouldTriggerMenuRegeneration).toBe(true);
    expect(result.timeSinceLastUpdate).toBe(12);
    expect(result.changeSource).toBe("user_input");
    expect(result.validationStatus).toBe("valid");
    expect(result.dbPersistenceRequired).toBe(true);
  });
});