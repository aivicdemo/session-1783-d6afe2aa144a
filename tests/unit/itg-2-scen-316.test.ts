import { detectAndPrioritizeDietaryRestrictions } from "../../src/logic/it-1-br-2-1-1-1";

describe("食事制限・アレルギー情報の変更検出・優先度判定機能", () => {
  // SCEN-316
  test("新規入力された食事制限情報が優先度付けして検出され、即時反映判定が正確に行われる", () => {
    // 前提条件: ユーザーが新規の食事制限・アレルギー情報を入力済み
    const userId = "user_001";
    const newRestrictions = [
      {
        type: "gluten_free",
        description: "グルテンフリー",
        severity: "high",
        inputTimestamp: new Date("2024-02-15T10:30:00Z"),
      },
      {
        type: "peanut_allergy",
        description: "ピーナッツアレルギー",
        severity: "critical",
        inputTimestamp: new Date("2024-02-15T10:30:00Z"),
      },
    ];

    const previousRestrictionUpdateDate = new Date("2024-02-08T00:00:00Z");
    const currentDate = new Date("2024-02-15T10:30:00Z");

    // 実行: 優先度判定ロジックの実行
    const result = detectAndPrioritizeDietaryRestrictions({
      userId,
      newRestrictions,
      previousUpdateDate: previousRestrictionUpdateDate,
      currentDate,
    });

    // 検証1: 新規入力された制限情報が検出されていること
    expect(result.detectedRestrictions).toHaveLength(2);
    expect(result.detectedRestrictions[0]).toMatchObject({
      type: "peanut_allergy",
      description: "ピーナッツアレルギー",
      severity: "critical",
    });
    expect(result.detectedRestrictions[1]).toMatchObject({
      type: "gluten_free",
      description: "グルテンフリー",
      severity: "high",
    });

    // 検証2: 優先度が正確に付与されていること
    // 期待値: severity が critical > high の順序で優先度付け
    expect(result.detectedRestrictions[0].priority).toBe(1);
    expect(result.detectedRestrictions[1].priority).toBe(2);

    // 検証3: 即時反映判定が正確に行われていること
    // 7日以上経過している場合は即時反映対象
    expect(result.shouldReflectImmediately).toBe(true);

    // 検証4: 前回更新からの経過日数が正確に計算されていること
    // 2024-02-15 から 2024-02-08 は 7日
    expect(result.daysSinceLastUpdate).toBe(7);

    // 検証5: 各制限情報の重要度スコア（1～10）が計算されていること
    expect(result.detectedRestrictions[0].importanceScore).toBe(10);
    expect(result.detectedRestrictions[1].importanceScore).toBe(8);

    // 検証6: リスク度が正確に分類されていること
    expect(result.detectedRestrictions[0].riskLevel).toBe("critical");
    expect(result.detectedRestrictions[1].riskLevel).toBe("high");

    // 検証7: ダッシュボード反映用の表示順序が優先度に基づいていること
    expect(result.displayOrder).toStrictEqual([
      "peanut_allergy",
      "gluten_free",
    ]);

    // 検証8: 関連する献立提案の更新フラグが立っていること
    expect(result.shouldUpdateMealProposals).toBe(true);

    // 検証9: 関連する栄養提案の更新フラグが立っていること
    expect(result.shouldUpdateNutritionProposals).toBe(true);

    // 検証10: システム全体への反映状態が正確に記録されていること
    expect(result.reflectionStatus).toBe("ready_to_reflect");

    // 検証11: 入力タイムスタンプが正確に記録されていること
    expect(result.processedTimestamp).toStrictEqual(
      new Date("2024-02-15T10:30:00Z")
    );

    // 検証12: ユーザーIDが正確に紐付けられていること
    expect(result.userId).toBe("user_001");
  });
});