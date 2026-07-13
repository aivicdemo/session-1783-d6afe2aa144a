import {
  encryptUserIdentification,
  encryptNutritionData,
  encryptPurchaseHistory,
  recordAuditLog,
  verifyAuditLogIntegrity,
} from "../../src/logic/it-1-br-2-1-1-1";

describe("機密データ暗号化・監査ログ管理機能", () => {
  // SCEN-567
  test("ユーザー識別情報・栄養データ・購入履歴が正常に暗号化され、監査ログに記録される", () => {
    // ===== Precondition: テストユーザーのプロフィール情報を準備 =====
    const user_id = "USR_20240115_001";
    const user_email = "user@example.com";
    const user_name = "山田太郎";
    const timestamp_profile_view = new Date("2024-01-15T11:00:00Z");
    const operator_id = "OP_20240115_001";

    // ===== Step 1: ユーザー識別情報を暗号化 =====
    const encrypted_user_id = encryptUserIdentification({
      user_id: user_id,
      email: user_email,
      name: user_name,
    });

    // 暗号化結果の検証: 暗号化されたデータは元の文字列と異なり、バイナリ/ハッシュ形式であること
    expect(encrypted_user_id).toBeDefined();
    expect(typeof encrypted_user_id).toBe("string");
    expect(encrypted_user_id).not.toBe(user_id);
    expect(encrypted_user_id).not.toBe(user_email);
    expect(encrypted_user_id).not.toBe(user_name);
    // 暗号化アルゴリズムがAES-256またはそれ以上であることを期待
    expect(encrypted_user_id.length).toBeGreaterThan(32);

    // ===== Step 2: 栄養データを暗号化 =====
    const nutrition_data = {
      user_id: user_id,
      calorie_intake: 1850,
      protein_g: 65,
      fat_g: 58,
      carbohydrate_g: 275,
      timestamp: new Date("2024-01-15T12:30:00Z"),
    };
    const encrypted_nutrition = encryptNutritionData(nutrition_data);

    // 暗号化結果の検証
    expect(encrypted_nutrition).toBeDefined();
    expect(typeof encrypted_nutrition).toBe("string");
    expect(encrypted_nutrition).not.toContain(nutrition_data.calorie_intake.toString());
    expect(encrypted_nutrition).not.toContain(nutrition_data.protein_g.toString());
    expect(encrypted_nutrition.length).toBeGreaterThan(32);

    // ===== Step 3: 購入履歴データを暗号化 =====
    const purchase_history = {
      user_id: user_id,
      purchase_id: "PUR_20240115_001",
      item_name: "鶏むね肉",
      item_price: 1200,
      purchase_date: new Date("2024-01-15T10:00:00Z"),
      supermarket_name: "スーパー太郎",
    };
    const encrypted_purchase = encryptPurchaseHistory(purchase_history);

    // 暗号化結果の検証
    expect(encrypted_purchase).toBeDefined();
    expect(typeof encrypted_purchase).toBe("string");
    expect(encrypted_purchase).not.toContain(purchase_history.item_name);
    expect(encrypted_purchase).not.toContain(purchase_history.item_price.toString());
    expect(encrypted_purchase).not.toContain(purchase_history.supermarket_name);
    expect(encrypted_purchase.length).toBeGreaterThan(32);

    // ===== Step 4: ユーザー識別情報の表示操作を監査ログに記録 =====
    const audit_log_profile = recordAuditLog({
      user_id: user_id,
      operation_type: "VIEW",
      target_entity: "USER_IDENTIFICATION",
      target_data_hash: encrypted_user_id,
      timestamp: timestamp_profile_view,
      operator_id: operator_id,
    });

    // 監査ログ記録の検証
    expect(audit_log_profile).toBeDefined();
    expect(audit_log_profile.user_id).toBe(user_id);
    expect(audit_log_profile.operation_type).toBe("VIEW");
    expect(audit_log_profile.target_entity).toBe("USER_IDENTIFICATION");
    expect(audit_log_profile.target_data_hash).toBe(encrypted_user_id);
    expect(audit_log_profile.timestamp.getTime()).toBe(
      timestamp_profile_view.getTime()
    );
    expect(audit_log_profile.operator_id).toBe(operator_id);
    expect(audit_log_profile.audit_log_id).toBeDefined();

    // ===== Step 5: 栄養データの入力・保存操作を監査ログに記録 =====
    const timestamp_nutrition_save = new Date("2024-01-15T12:35:00Z");
    const audit_log_nutrition = recordAuditLog({
      user_id: user_id,
      operation_type: "CREATE",
      target_entity: "NUTRITION_DATA",
      target_data_hash: encrypted_nutrition,
      timestamp: timestamp_nutrition_save,
      operator_id: operator_id,
    });

    // 監査ログ記録の検証
    expect(audit_log_nutrition).toBeDefined();
    expect(audit_log_nutrition.operation_type).toBe("CREATE");
    expect(audit_log_nutrition.target_entity).toBe("NUTRITION_DATA");
    expect(audit_log_nutrition.target_data_hash).toBe(encrypted_nutrition);
    expect(audit_log_nutrition.timestamp.getTime()).toBe(
      timestamp_nutrition_save.getTime()
    );

    // ===== Step 6: 購入履歴の参照操作を監査ログに記録 =====
    const timestamp_purchase_view = new Date("2024-01-15T14:00:00Z");
    const audit_log_purchase = recordAuditLog({
      user_id: user_id,
      operation_type: "READ",
      target_entity: "PURCHASE_HISTORY",
      target_data_hash: encrypted_purchase,
      timestamp: timestamp_purchase_view,
      operator_id: operator_id,
    });

    // 監査ログ記録の検証
    expect(audit_log_purchase).toBeDefined();
    expect(audit_log_purchase.operation_type).toBe("READ");
    expect(audit_log_purchase.target_entity).toBe("PURCHASE_HISTORY");
    expect(audit_log_purchase.target_data_hash).toBe(encrypted_purchase);

    // ===== Step 7: 監査ログの改ざん防止検証 =====
    // 複数のログレコードを集約してハッシュチェーンを構築
    const audit_logs = [
      audit_log_profile,
      audit_log_nutrition,
      audit_log_purchase,
    ];

    const integrity_result = verifyAuditLogIntegrity({
      audit_logs: audit_logs,
    });

    // 監査ログの整合性と改ざん防止の検証
    expect(integrity_result).toBeDefined();
    expect(integrity_result.is_valid).toBe(true);
    expect(integrity_result.total_logs_verified).toBe(3);
    expect(integrity_result.tampered_logs_count).toBe(0);
    expect(integrity_result.verification_timestamp).toBeDefined();

    // ===== 統合検証: 期待結果の完全性を確認 =====
    // 1. すべてのユーザーデータが暗号化されていることを確認
    expect(encrypted_user_id).toMatch(/^[A-Za-z0-9+/=]{32,}$/); // Base64形式の暗号化データ
    expect(encrypted_nutrition).toMatch(/^[A-Za-z0-9+/=]{32,}$/);
    expect(encrypted_purchase).toMatch(/^[A-Za-z0-9+/=]{32,}$/);

    // 2. すべての監査ログにタイムスタンプ、ユーザーID、操作内容が含まれていることを確認
    [audit_log_profile, audit_log_nutrition, audit_log_purchase].forEach(
      (log) => {
        expect(log.timestamp).toBeInstanceOf(Date);
        expect(log.user_id).toBe(user_id);
        expect(log.operator_id).toBe(operator_id);
        expect(log.operation_type).toMatch(
          /^(VIEW|CREATE|READ|UPDATE|DELETE)$/
        );
        expect(log.target_entity).toMatch(
          /^(USER_IDENTIFICATION|NUTRITION_DATA|PURCHASE_HISTORY)$/
        );
      }
    );

    // 3. 監査ログの改ざん防止が有効であることを確認
    expect(integrity_result.is_valid).toBe(true);
    expect(integrity_result.chain_hash).toBeDefined();
    expect(integrity_result.chain_hash.length).toBeGreaterThan(32);
  });
});