import {
  encryptSensitiveData,
  decryptSensitiveData,
  recordAuditLog,
  getAuditLogsByOperation,
} from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能 - 機密データ暗号化・監査ログ記録", () => {
  // SCEN-775
  test("ユーザー識別情報・家族食事評価・購入履歴の暗号化・復号化・監査ログ記録", () => {
    // 1. ユーザー識別情報の暗号化
    const user_id = "user_12345";
    const user_name = "田中太郎";
    const user_email = "tanaka@example.com";

    const encrypted_user_id = encryptSensitiveData(user_id);
    const encrypted_user_name = encryptSensitiveData(user_name);
    const encrypted_user_email = encryptSensitiveData(user_email);

    // 暗号化されたデータは元のデータと異なることを確認
    expect(encrypted_user_id).not.toBe(user_id);
    expect(encrypted_user_name).not.toBe(user_name);
    expect(encrypted_user_email).not.toBe(user_email);

    // 暗号化されたデータは文字列であることを確認
    expect(typeof encrypted_user_id).toBe("string");
    expect(typeof encrypted_user_name).toBe("string");
    expect(typeof encrypted_user_email).toBe("string");

    // 2. ユーザー識別情報の復号化検証
    const decrypted_user_id = decryptSensitiveData(encrypted_user_id);
    const decrypted_user_name = decryptSensitiveData(encrypted_user_name);
    const decrypted_user_email = decryptSensitiveData(encrypted_user_email);

    expect(decrypted_user_id).toBe(user_id);
    expect(decrypted_user_name).toBe(user_name);
    expect(decrypted_user_email).toBe(user_email);

    // 3. 家族食事評価データの暗号化
    const family_evaluation_score = "4.5";
    const family_evaluation_comment = "味が良くて家族みんなで完食しました";
    const food_item = "トマトリゾット";

    const encrypted_score = encryptSensitiveData(family_evaluation_score);
    const encrypted_comment = encryptSensitiveData(family_evaluation_comment);
    const encrypted_food_item = encryptSensitiveData(food_item);

    expect(encrypted_score).not.toBe(family_evaluation_score);
    expect(encrypted_comment).not.toBe(family_evaluation_comment);
    expect(encrypted_food_item).not.toBe(food_item);

    // 4. 家族食事評価データの復号化検証
    const decrypted_score = decryptSensitiveData(encrypted_score);
    const decrypted_comment = decryptSensitiveData(encrypted_comment);
    const decrypted_food_item = decryptSensitiveData(encrypted_food_item);

    expect(decrypted_score).toBe(family_evaluation_score);
    expect(decrypted_comment).toBe(family_evaluation_comment);
    expect(decrypted_food_item).toBe(food_item);

    // 5. 購入履歴データの暗号化
    const purchase_product_name = "鶏肉（国産・1kg）";
    const purchase_datetime = "2024-01-15T14:30:00Z";
    const purchase_amount = "1800";

    const encrypted_product = encryptSensitiveData(purchase_product_name);
    const encrypted_datetime = encryptSensitiveData(purchase_datetime);
    const encrypted_amount = encryptSensitiveData(purchase_amount);

    expect(encrypted_product).not.toBe(purchase_product_name);
    expect(encrypted_datetime).not.toBe(purchase_datetime);
    expect(encrypted_amount).not.toBe(purchase_amount);

    // 6. 購入履歴データの復号化検証
    const decrypted_product = decryptSensitiveData(encrypted_product);
    const decrypted_datetime = decryptSensitiveData(encrypted_datetime);
    const decrypted_amount = decryptSensitiveData(encrypted_amount);

    expect(decrypted_product).toBe(purchase_product_name);
    expect(decrypted_datetime).toBe(purchase_datetime);
    expect(decrypted_amount).toBe(purchase_amount);

    // 7. ユーザー識別情報の暗号化操作の監査ログ記録
    const audit_log_user_encrypt: {
      timestamp: string;
      operator_user_id: string;
      operation: string;
      target_data_type: string;
      target_data_id: string;
      action_type: string;
      status: string;
    } = {
      timestamp: "2024-01-15T14:30:00Z",
      operator_user_id: "admin_001",
      operation: "encrypt_user_identification",
      target_data_type: "user_id",
      target_data_id: user_id,
      action_type: "encrypt",
      status: "success",
    };

    recordAuditLog(audit_log_user_encrypt);

    // 8. 家族食事評価データの暗号化操作の監査ログ記録
    const audit_log_evaluation_encrypt: {
      timestamp: string;
      operator_user_id: string;
      operation: string;
      target_data_type: string;
      target_data_id: string;
      action_type: string;
      status: string;
    } = {
      timestamp: "2024-01-15T14:35:00Z",
      operator_user_id: "admin_001",
      operation: "encrypt_family_evaluation",
      target_data_type: "evaluation_score",
      target_data_id: family_evaluation_score,
      action_type: "encrypt",
      status: "success",
    };

    recordAuditLog(audit_log_evaluation_encrypt);

    // 9. 購入履歴データの暗号化操作の監査ログ記録
    const audit_log_purchase_encrypt: {
      timestamp: string;
      operator_user_id: string;
      operation: string;
      target_data_type: string;
      target_data_id: string;
      action_type: string;
      status: string;
    } = {
      timestamp: "2024-01-15T14:40:00Z",
      operator_user_id: "admin_001",
      operation: "encrypt_purchase_history",
      target_data_type: "purchase_amount",
      target_data_id: purchase_amount,
      action_type: "encrypt",
      status: "success",
    };

    recordAuditLog(audit_log_purchase_encrypt);

    // 10. ユーザー識別情報の復号化操作の監査ログ記録
    const audit_log_user_decrypt: {
      timestamp: string;
      operator_user_id: string;
      operation: string;
      target_data_type: string;
      target_data_id: string;
      action_type: string;
      status: string;
    } = {
      timestamp: "2024-01-15T14:45:00Z",
      operator_user_id: "admin_001",
      operation: "decrypt_user_identification",
      target_data_type: "user_id",
      target_data_id: encrypted_user_id,
      action_type: "decrypt",
      status: "success",
    };

    recordAuditLog(audit_log_user_decrypt);

    // 11. 家族食事評価データの復号化操作の監査ログ記録
    const audit_log_evaluation_decrypt: {
      timestamp: string;
      operator_user_id: string;
      operation: string;
      target_data_type: string;
      target_data_id: string;
      action_type: string;
      status: string;
    } = {
      timestamp: "2024-01-15T14:50:00Z",
      operator_user_id: "admin_001",
      operation: "decrypt_family_evaluation",
      target_data_type: "evaluation_score",
      target_data_id: encrypted_score,
      action_type: "decrypt",
      status: "success",
    };

    recordAuditLog(audit_log_evaluation_decrypt);

    // 12. 購入履歴データの復号化操作の監査ログ記録
    const audit_log_purchase_decrypt: {
      timestamp: string;
      operator_user_id: string;
      operation: string;
      target_data_type: string;
      target_data_id: string;
      action_type: string;
      status: string;
    } = {
      timestamp: "2024-01-15T14:55:00Z",
      operator_user_id: "admin_001",
      operation: "decrypt_purchase_history",
      target_data_type: "purchase_amount",
      target_data_id: encrypted_amount,
      action_type: "decrypt",
      status: "success",
    };

    recordAuditLog(audit_log_purchase_decrypt);

    // 13. ユーザー識別情報のアクセス操作の監査ログ記録
    const audit_log_user_access: {
      timestamp: string;
      operator_user_id: string;
      operation: string;
      target_data_type: string;
      target_data_id: string;
      action_type: string;
      status: string;
    } = {
      timestamp: "2024-01-15T15:00:00Z",
      operator_user_id: "admin_001",
      operation: "access_user_identification",
      target_data_type: "user_email",
      target_data_id: encrypted_user_email,
      action_type: "access",
      status: "success",
    };

    recordAuditLog(audit_log_user_access);

    // 14. 家族食事評価データのアクセス操作の監査ログ記録
    const audit_log_evaluation_access: {
      timestamp: string;
      operator_user_id: string;
      operation: string;
      target_data_type: string;
      target_data_id: string;
      action_type: string;
      status: string;
    } = {
      timestamp: "2024-01-15T15:05:00Z",
      operator_user_id: "admin_001",
      operation: "access_family_evaluation",
      target_data_type: "evaluation_comment",
      target_data_id: encrypted_comment,
      action_type: "access",
      status: "success",
    };

    recordAuditLog(audit_log_evaluation_access);

    // 15. 購入履歴データのアクセス操作の監査ログ記録
    const audit_log_purchase_access: {
      timestamp: string;
      operator_user_id: string;
      operation: string;
      target_data_type: string;
      target_data_id: string;
      action_type: string;
      status: string;
    } = {
      timestamp: "2024-01-15T15:10:00Z",
      operator_user_id: "admin_001",
      operation: "access_purchase_history",
      target_data_type: "purchase_product_name",
      target_data_id: encrypted_product,
      action_type: "access",
      status: "success",
    };

    recordAuditLog(audit_log_purchase_access);

    // 16. 監査ログの暗号化操作の記録確認
    const user_encrypt_logs = getAuditLogsByOperation(
      "encrypt_user_identification"
    );
    expect(user_encrypt_logs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operation: "encrypt_user_identification",
          action_type: "encrypt",
          status: "success",
        }),
      ])
    );

    // 17. 監査ログの家族食事評価暗号化操作の記録確認
    const evaluation_encrypt_logs = getAuditLogsByOperation(
      "encrypt_family_evaluation"
    );
    expect(evaluation_encrypt_logs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operation: "encrypt_family_evaluation",
          action_type: "encrypt",
          status: "success",
        }),
      ])
    );

    // 18. 監査ログの購入履歴暗号化操作の記録確認
    const purchase_encrypt_logs = getAuditLogsByOperation(
      "encrypt_purchase_history"
    );
    expect(purchase_encrypt_logs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operation: "encrypt_purchase_history",
          action_type: "encrypt",
          status: "success",
        }),
      ])
    );

    // 19. 監査ログの復号化操作の記録確認
    const user_decrypt_logs = getAuditLogsByOperation(
      "decrypt_user_identification"
    );
    expect(user_decrypt_logs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operation: "decrypt_user_identification",
          action_type: "decrypt",
          status: "success",
        }),
      ])
    );

    // 20. 監査ログの家族食事評価復号化操作の記録確認
    const evaluation_decrypt_logs = getAuditLogsByOperation(
      "decrypt_family_evaluation"
    );
    expect(evaluation_decrypt_logs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operation: "decrypt_family_evaluation",
          action_type: "decrypt",
          status: "success",
        }),
      ])
    );

    // 21. 監査ログの購入履歴復号化操作の記録確認
    const purchase_decrypt_logs = getAuditLogsByOperation(
      "decrypt_purchase_history"
    );
    expect(purchase_decrypt_logs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operation: "decrypt_purchase_history",
          action_type: "decrypt",
          status: "success",
        }),
      ])
    );

    // 22. 監査ログのアクセス操作の記録確認
    const user_access_logs = getAuditLogsByOperation(
      "access_user_identification"
    );
    expect(user_access_logs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operation: "access_user_identification",
          action_type: "access",
          status: "success",
        }),
      ])
    );

    // 23. 監査ログの家族食事評価アクセス操作の記録確認
    const evaluation_access_logs = getAuditLogsByOperation(
      "access_family_evaluation"
    );
    expect(evaluation_access_logs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operation: "access_family_evaluation",
          action_type: "access",
          status: "success",
        }),
      ])
    );

    // 24. 監査ログの購入履歴アクセス操作の記録確認
    const purchase_access_logs = getAuditLogsByOperation(
      "access_purchase_history"
    );
    expect(purchase_access_logs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operation: "access_purchase_history",
          action_type: "access",
          status: "success",
        }),
      ])
    );

    // 25. 監査ログの詳細情報確認（タイムスタンプ）
    expect(audit_log_user_encrypt.timestamp).toBe("2024-01-15T14:30:00Z");
    expect(audit_log_evaluation_encrypt.timestamp).toBe(
      "2024-01-15T14:35:00Z"
    );
    expect(audit_log_purchase_encrypt.timestamp).toBe("2024-01-15T14:40:00Z");

    // 26. 監査ログの詳細情報確認（操作ユーザー）
    expect(audit_log_user_encrypt.operator_user_id).toBe("admin_001");
    expect(audit_log_evaluation_encrypt.operator_user_id).toBe("admin_001");
    expect(audit_log_purchase_encrypt.operator_user_id).toBe("admin_001");

    // 27. 監査ログの詳細情報確認（操作内容）
    expect(audit_log_user_encrypt.action_type).toBe("encrypt");
    expect(audit_log_evaluation_decrypt.action_type).toBe("decrypt");
    expect(audit_log_purchase_access.action_type).toBe("access");

    // 28. 監査ログの詳細情報確認（対象データ型）
    expect(audit_log_user_encrypt.target_data_type).toBe("user_id");
    expect(audit_log_evaluation_encrypt.target_data_type).toBe(
      "evaluation_score"
    );
    expect(audit_log_purchase_encrypt.target_data_type).toBe("purchase_amount");

    // 29. ダッシュボード内での復号化・表示検証
    const dashboard_display_user_id = decryptSensitiveData(encrypted_user_id);
    const dashboard_display_score = decryptSensitiveData(encrypted_score);
    const dashboard_display_product = decryptSensitiveData(encrypted_product);

    expect(dashboard_display_user_id).toBe(user_id);
    expect(dashboard_display_score).toBe(family_evaluation_score);
    expect(dashboard_display_product).toBe(purchase_product_name);

    // 30. 監査ログの総数確認（6つの操作 × 複数のレコード = 全操作が記録されている）
    const all_encrypt_ops = getAuditLogsByOperation("encrypt_user_identification")
      .length +
      getAuditLogsByOperation("encrypt_family_evaluation").length +
      getAuditLogsByOperation("encrypt_purchase_history").length;
    expect(all_encrypt_ops).toBeGreaterThanOrEqual(3);

    const all_decrypt_ops = getAuditLogsByOperation("decrypt_user_identification")
      .length +
      getAuditLogsByOperation("decrypt_family_evaluation").length +
      getAuditLogsByOperation("decrypt_purchase_history").length;
    expect(all_decrypt_ops).toBeGreaterThanOrEqual(3);

    const all_access_ops = getAuditLogsByOperation("access_user_identification")
      .length +
      getAuditLogsByOperation("access_family_evaluation").length +
      getAuditLogsByOperation("access_purchase_history").length;
    expect(all_access_ops).toBeGreaterThanOrEqual(3);

    // 31. 暗号化されたデータが一貫性を持つことを確認
    const re_encrypt_user_id = encryptSensitiveData(user_id);
    const re_decrypt_user_id = decryptSensitiveData(re_encrypt_user_id);
    expect(re_decrypt_user_id).toBe(user_id);

    // 32. すべての機密データの暗号化が成功していることを確認
    expect(encrypted_user_id.length).toBeGreaterThan(0);
    expect(encrypted_user_name.length).toBeGreaterThan(0);
    expect(encrypted_user_email.length).toBeGreaterThan(0);
    expect(encrypted_score.length).toBeGreaterThan(0);
    expect(encrypted_comment.length).toBeGreaterThan(0);
    expect(encrypted_food_item.length).toBeGreaterThan(0);
    expect(encrypted_product.length).toBeGreaterThan(0);
    expect(encrypted_datetime.length).toBeGreaterThan(0);
    expect(encrypted_amount.length).toBeGreaterThan(0);
  });
});