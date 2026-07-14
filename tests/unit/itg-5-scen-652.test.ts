import { detectDietaryRestrictionConflicts } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能", () => {
  // SCEN-652: [edge] 食事制限条件変更の抵触検出機能 - 抵触パターン検出時に検出対象献立が存在しない場合も正常に処理される
  test("食事制限条件変更で抵触検出対象献立が0件の場合、エラーなく正常に完了し『抵触献立なし』を返却する", () => {
    // Arrange: 食事制限条件を定義（新たに「卵」アレルギーを追加）
    const restrictionChange = {
      user_id: "user_001",
      restriction_type: "allergy",
      allergen_name: "egg",
      action: "add",
      changed_at: new Date("2024-02-15T10:30:00Z"),
      changed_by: "spouse_002",
    };

    // 既存献立データベース：該当する献立が0件の状態
    // （献立テーブルには「卵」を含む献立がない、または全献立が存在しない）
    const existingRecipeDatabase = {
      total_recipes: 0,
      recipes_containing_allergen: [],
      recipes_to_check: [],
    };

    const userId = "user_001";

    // Act: 食事制限条件変更を実行して抵触検出機能を起動
    const result = detectDietaryRestrictionConflicts({
      user_id: userId,
      restriction_change: restrictionChange,
      recipe_database: existingRecipeDatabase,
    });

    // Assert: 抵触検出処理がエラーなく完了し、正常なレスポンスが返却される
    expect(result).toBeDefined();
    expect(result.status).toBe("success");
    expect(result.conflict_detected).toBe(false);
    expect(result.affected_recipes).toEqual([]);
    expect(result.total_conflicts).toBe(0);
    expect(result.message).toBe("抵触献立なし");

    // Assert: ログに検出対象献立が存在しないことが適切に記録されている
    expect(result.audit_log).toBeDefined();
    expect(result.audit_log.event_type).toBe("dietary_restriction_change");
    expect(result.audit_log.user_id).toBe("user_001");
    expect(result.audit_log.timestamp).toEqual(new Date("2024-02-15T10:30:00Z"));
    expect(result.audit_log.log_message).toContain("検出対象献立が存在しません");
    expect(result.audit_log.recipes_checked_count).toBe(0);
  });
});