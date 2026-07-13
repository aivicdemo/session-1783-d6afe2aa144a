import { encryptAndAuditSensitiveData } from '../../src/logic/it-1-br-6-2-1-1';

describe('食材流通業者・スーパーの在庫・価格データ連携インターフェース - 機密データ暗号化と監査ログ記録', () => {
  // SCEN-445: [normal] 機密データの暗号化と監査ログ記録
  test('ユーザー識別情報・家族食事評価・購入履歴・栄養データが暗号化された状態で保存・転送される', () => {
    const user_id = 'user_12345';
    const user_email = 'household_manager@example.com';
    const user_name = 'Taro Yamada';
    const family_member_id = 'member_001';
    const family_member_name = 'Hanako Yamada';
    const satisfaction_score = 4.5;
    const taste_score = 4.0;
    const volume_score = 3.8;
    const purchase_product_name = 'Salmon Fillet 200g';
    const purchase_price = 1200;
    const purchase_timestamp = '2024-01-15T10:30:00Z';
    const store_name = 'SuperA Shibuya';
    const nutrition_calorie = 280;
    const nutrition_protein = 25.5;
    const nutrition_fat = 18.2;
    const nutrition_carbs = 0.0;
    const nutrition_vitamin_d = 12.5;
    const nutrition_omega_3 = 2.1;

    const input = {
      user_id,
      user_email,
      user_name,
      family_members: [
        {
          family_member_id,
          family_member_name,
          food_evaluation: {
            satisfaction_score,
            taste_score,
            volume_score,
          },
        },
      ],
      purchase_history: [
        {
          purchase_product_name,
          purchase_price,
          purchase_timestamp,
          store_name,
        },
      ],
      nutrition_data: [
        {
          nutrition_calorie,
          nutrition_protein,
          nutrition_fat,
          nutrition_carbs,
          nutrition_vitamin_d,
          nutrition_omega_3,
        },
      ],
    };

    const result = encryptAndAuditSensitiveData(input);

    // ユーザー識別情報がデータベース保存時に暗号化されていることを確認
    expect(result.database_storage.user_identifier_encrypted).toBe(true);
    expect(result.database_storage.user_identifier_cipher_length).toBeGreaterThan(0);
    expect(result.database_storage.user_identifier_is_plaintext).toBe(false);

    // 家族食事評価データがデータベース保存時に暗号化されていることを確認
    expect(result.database_storage.family_evaluation_encrypted).toBe(true);
    expect(result.database_storage.family_evaluation_cipher_length).toBeGreaterThan(0);
    expect(result.database_storage.family_evaluation_is_plaintext).toBe(false);

    // 購入履歴データがデータベース保存時に暗号化されていることを確認
    expect(result.database_storage.purchase_history_encrypted).toBe(true);
    expect(result.database_storage.purchase_history_cipher_length).toBeGreaterThan(0);
    expect(result.database_storage.purchase_history_is_plaintext).toBe(false);

    // 栄養データがデータベース保存時に暗号化されていることを確認
    expect(result.database_storage.nutrition_data_encrypted).toBe(true);
    expect(result.database_storage.nutrition_data_cipher_length).toBeGreaterThan(0);
    expect(result.database_storage.nutrition_data_is_plaintext).toBe(false);

    // ネットワーク通信時のユーザー識別情報が暗号化されていることを確認
    expect(result.network_transmission.user_identifier_tls_encrypted).toBe(true);
    expect(result.network_transmission.user_identifier_protocol).toBe('TLS 1.3');

    // ネットワーク通信時の家族食事評価データが暗号化されていることを確認
    expect(result.network_transmission.family_evaluation_tls_encrypted).toBe(true);
    expect(result.network_transmission.family_evaluation_protocol).toBe('TLS 1.3');

    // ネットワーク通信時の購入履歴データが暗号化されていることを確認
    expect(result.network_transmission.purchase_history_tls_encrypted).toBe(true);
    expect(result.network_transmission.purchase_history_protocol).toBe('TLS 1.3');

    // ネットワーク通信時の栄養データが暗号化されていることを確認
    expect(result.network_transmission.nutrition_data_tls_encrypted).toBe(true);
    expect(result.network_transmission.nutrition_data_protocol).toBe('TLS 1.3');

    // 監査ログにタイムスタンプが記録されていることを確認
    expect(result.audit_log.user_identifier_access_count).toBe(1);
    expect(result.audit_log.user_identifier_access_timestamp).toBe('2024-01-15T10:30:00Z');
    expect(result.audit_log.user_identifier_operation_type).toBe('CREATE');
    expect(result.audit_log.user_identifier_actor).toBe(user_id);

    // 監査ログに家族食事評価データアクセス記録が含まれていることを確認
    expect(result.audit_log.family_evaluation_access_count).toBe(1);
    expect(result.audit_log.family_evaluation_access_timestamp).toBe('2024-01-15T10:30:00Z');
    expect(result.audit_log.family_evaluation_operation_type).toBe('CREATE');
    expect(result.audit_log.family_evaluation_actor).toBe(user_id);

    // 監査ログに購入履歴データアクセス記録が含まれていることを確認
    expect(result.audit_log.purchase_history_access_count).toBe(1);
    expect(result.audit_log.purchase_history_access_timestamp).toBe('2024-01-15T10:30:00Z');
    expect(result.audit_log.purchase_history_operation_type).toBe('CREATE');
    expect(result.audit_log.purchase_history_actor).toBe(user_id);

    // 監査ログに栄養データアクセス記録が含まれていることを確認
    expect(result.audit_log.nutrition_data_access_count).toBe(1);
    expect(result.audit_log.nutrition_data_access_timestamp).toBe('2024-01-15T10:30:00Z');
    expect(result.audit_log.nutrition_data_operation_type).toBe('CREATE');
    expect(result.audit_log.nutrition_data_actor).toBe(user_id);

    // アプリケーション層で復号化されたユーザー識別情報が正しく表示されることを確認
    expect(result.application_layer_decrypted.decrypted_user_id).toBe(user_id);
    expect(result.application_layer_decrypted.decrypted_user_email).toBe(user_email);
    expect(result.application_layer_decrypted.decrypted_user_name).toBe(user_name);

    // アプリケーション層で復号化された家族食事評価データが正しく表示されることを確認
    expect(result.application_layer_decrypted.decrypted_satisfaction_score).toBe(satisfaction_score);
    expect(result.application_layer_decrypted.decrypted_taste_score).toBe(taste_score);
    expect(result.application_layer_decrypted.decrypted_volume_score).toBe(volume_score);

    // アプリケーション層で復号化された購入履歴データが正しく表示されることを確認
    expect(result.application_layer_decrypted.decrypted_purchase_product_name).toBe(purchase_product_name);
    expect(result.application_layer_decrypted.decrypted_purchase_price).toBe(purchase_price);
    expect(result.application_layer_decrypted.decrypted_purchase_timestamp).toBe(purchase_timestamp);
    expect(result.application_layer_decrypted.decrypted_store_name).toBe(store_name);

    // アプリケーション層で復号化された栄養データが正しく表示されることを確認
    expect(result.application_layer_decrypted.decrypted_nutrition_calorie).toBe(nutrition_calorie);
    expect(result.application_layer_decrypted.decrypted_nutrition_protein).toBe(nutrition_protein);
    expect(result.application_layer_decrypted.decrypted_nutrition_fat).toBe(nutrition_fat);
    expect(result.application_layer_decrypted.decrypted_nutrition_carbs).toBe(nutrition_carbs);
    expect(result.application_layer_decrypted.decrypted_nutrition_vitamin_d).toBe(nutrition_vitamin_d);
    expect(result.application_layer_decrypted.decrypted_nutrition_omega_3).toBe(nutrition_omega_3);

    // 規制要件準拠フラグが設定されていることを確認
    expect(result.compliance.gdpr_compliant).toBe(true);
    expect(result.compliance.personal_data_protection_law_compliant).toBe(true);
    expect(result.compliance.encryption_standard).toBe('AES-256-GCM');
    expect(result.compliance.audit_trail_retention_days).toBe(2555); // 7年間
  });
});