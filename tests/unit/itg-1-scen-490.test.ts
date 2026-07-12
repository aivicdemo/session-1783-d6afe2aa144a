import { detectDietaryRestrictionConflicts } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-490: [edge] 食事制限条件変更の抵触検出と監査ログ記録 - 過去献立が存在しない場合、抵触検出は実行されず正常にログが記録される
  test("過去献立が存在しない場合、抵触検出をスキップして監査ログを記録する", () => {
    const userId = "user_001";
    const newRestriction = {
      restriction_id: "rest_123",
      user_id: userId,
      allergen: "peanut",
      restriction_type: "allergen",
      effective_date: "2024-01-15T09:00:00Z",
    };
    const pastMenus: never[] = [];
    const timestamp = new Date("2024-01-15T09:00:00Z");

    const result = detectDietaryRestrictionConflicts({
      user_id: userId,
      new_restriction: newRestriction,
      past_menus: pastMenus,
      timestamp: timestamp,
    });

    // 正常完了ステータスが返される
    expect(result.status).toBe("success");

    // 抵触検出がスキップされたことを確認
    expect(result.conflict_detection_executed).toBe(false);

    // 監査ログが記録されたことを確認
    expect(result.audit_log_recorded).toBe(true);

    // 監査ログに必須情報が含まれていることを確認
    expect(result.audit_log).toMatchObject({
      user_id: userId,
      action: "dietary_restriction_change",
      timestamp: "2024-01-15T09:00:00Z",
      status: "success",
    });

    // 監査ログにタイムスタンプが含まれていることを確認
    expect(result.audit_log.timestamp).toBeDefined();

    // 監査ログに変更内容が含まれていることを確認
    expect(result.audit_log.change_details).toBeDefined();
    expect(result.audit_log.change_details.allergen).toBe("peanut");
    expect(result.audit_log.change_details.restriction_type).toBe("allergen");

    // 抵触検出結果が空配列であることを確認
    expect(result.conflicts).toEqual([]);

    // エラーが発生していないことを確認
    expect(result.error).toBeUndefined();

    // 処理完了メッセージが含まれていることを確認
    expect(result.message).toBe("Dietary restriction changed successfully. No past menus to check for conflicts.");
  });
});