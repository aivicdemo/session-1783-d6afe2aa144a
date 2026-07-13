import { encryptSensitiveData, decryptSensitiveData, recordAuditLog, verifySensitiveDataEncryption } from '../../src/logic/it-3-br-6-3-3';

describe('予測精度低下要因の可視化ダッシュボード', () => {
  // SCEN-250
  test('機密データ暗号化・監査ログ記録機能 - ユーザー識別情報を暗号化して処理・保存できる', () => {
    // テスト用ユーザー識別情報を入力
    const test_user_id = 'USR-12345';
    const test_email = 'user@example.com';
    const test_personal_number = '1234567890123';
    const executor_id = 'EXEC-001';
    const execution_timestamp = new Date('2024-01-15T09:00:00Z');

    // ユーザー識別情報オブジェクトを構成
    const sensitive_data = {
      user_id: test_user_id,
      email: test_email,
      personal_number: test_personal_number,
    };

    // 機密データ暗号化機能を実行
    const encrypted_result = encryptSensitiveData({
      data: sensitive_data,
      executor_id: executor_id,
      timestamp: execution_timestamp,
    });

    // 暗号化されたデータがデータベースに保存されることを確認
    expect(encrypted_result).toHaveProperty('encrypted_user_id');
    expect(encrypted_result).toHaveProperty('encrypted_email');
    expect(encrypted_result).toHaveProperty('encrypted_personal_number');
    expect(encrypted_result.encrypted_user_id).not.toBe(test_user_id);
    expect(encrypted_result.encrypted_email).not.toBe(test_email);
    expect(encrypted_result.encrypted_personal_number).not.toBe(test_personal_number);

    // 暗号化されたデータが平文でないことを確認
    expect(encrypted_result.encrypted_user_id).toMatch(/^[A-Za-z0-9+/=]+$/);
    expect(encrypted_result.encrypted_email).toMatch(/^[A-Za-z0-9+/=]+$/);
    expect(encrypted_result.encrypted_personal_number).toMatch(/^[A-Za-z0-9+/=]+$/);

    // 監査ログ記録機能を実行
    const audit_log_record = recordAuditLog({
      action: 'ENCRYPT_SENSITIVE_DATA',
      executor_id: executor_id,
      timestamp: execution_timestamp,
      encrypted_data_id: encrypted_result.data_id,
      target_fields: ['user_id', 'email', 'personal_number'],
      status: 'SUCCESS',
    });

    // 監査ログが記録されていることを確認
    expect(audit_log_record).toHaveProperty('log_id');
    expect(audit_log_record).toHaveProperty('action');
    expect(audit_log_record).toHaveProperty('executor_id');
    expect(audit_log_record).toHaveProperty('timestamp');
    expect(audit_log_record.action).toBe('ENCRYPT_SENSITIVE_DATA');
    expect(audit_log_record.executor_id).toBe(executor_id);
    expect(audit_log_record.timestamp).toEqual(execution_timestamp);
    expect(audit_log_record.target_fields).toEqual(['user_id', 'email', 'personal_number']);
    expect(audit_log_record.status).toBe('SUCCESS');

    // 暗号化されたデータを取得して復号化
    const decrypt_result = decryptSensitiveData({
      encrypted_data: encrypted_result,
      executor_id: executor_id,
      timestamp: new Date('2024-01-15T09:05:00Z'),
    });

    // 復号化後のデータが元のユーザー識別情報と完全に一致することを確認
    expect(decrypt_result.user_id).toBe(test_user_id);
    expect(decrypt_result.email).toBe(test_email);
    expect(decrypt_result.personal_number).toBe(test_personal_number);

    // 復号化処理も監査ログに記録
    const decrypt_audit_log = recordAuditLog({
      action: 'DECRYPT_SENSITIVE_DATA',
      executor_id: executor_id,
      timestamp: new Date('2024-01-15T09:05:00Z'),
      encrypted_data_id: encrypted_result.data_id,
      target_fields: ['user_id', 'email', 'personal_number'],
      status: 'SUCCESS',
    });

    expect(decrypt_audit_log.action).toBe('DECRYPT_SENSITIVE_DATA');
    expect(decrypt_audit_log.executor_id).toBe(executor_id);
    expect(decrypt_audit_log.target_fields).toEqual(['user_id', 'email', 'personal_number']);
    expect(decrypt_audit_log.status).toBe('SUCCESS');

    // 暗号化前のユーザー識別情報が平文でシステムに保存されていないことを確認
    const plaintext_verification = verifySensitiveDataEncryption({
      encrypted_data: encrypted_result,
      original_data: sensitive_data,
    });

    expect(plaintext_verification.is_encrypted).toBe(true);
    expect(plaintext_verification.plaintext_exists_in_storage).toBe(false);
    expect(plaintext_verification.encryption_algorithm).toBe('AES-256-GCM');

    // 監査ログに暗号化・復号化処理の実行者、実行日時、処理内容が記録されていることを確認
    const audit_log_verification = {
      encryption_log_executor: audit_log_record.executor_id,
      encryption_log_timestamp: audit_log_record.timestamp,
      encryption_log_action: audit_log_record.action,
      decryption_log_executor: decrypt_audit_log.executor_id,
      decryption_log_timestamp: decrypt_audit_log.timestamp,
      decryption_log_action: decrypt_audit_log.action,
    };

    expect(audit_log_verification.encryption_log_executor).toBe(executor_id);
    expect(audit_log_verification.encryption_log_timestamp).toEqual(execution_timestamp);
    expect(audit_log_verification.encryption_log_action).toBe('ENCRYPT_SENSITIVE_DATA');
    expect(audit_log_verification.decryption_log_executor).toBe(executor_id);
    expect(audit_log_verification.decryption_log_timestamp).toEqual(new Date('2024-01-15T09:05:00Z'));
    expect(audit_log_verification.decryption_log_action).toBe('DECRYPT_SENSITIVE_DATA');
  });
});