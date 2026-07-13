import { encryptSensitiveData } from '../../src/logic/it-3-br-6-3-3';

describe('予測精度低下要因の可視化ダッシュボード', () => {
  // SCEN-253: [edge] 機密データ暗号化・監査ログ記録機能 - 機密データが空またはnullの場合に暗号化処理をスキップしエラーハンドリングする
  test('should handle empty and null sensitive data by skipping encryption and recording audit logs', () => {
    const user_id = 'user_12345';
    const timestamp_utc = '2024-01-15T09:00:00Z';

    // Case 1: Empty string sensitive data
    const result_empty = encryptSensitiveData({
      sensitive_data: '',
      user_id,
      timestamp_utc,
    });

    expect(result_empty.encryption_skipped).toBe(true);
    expect(result_empty.skip_reason).toBe('empty_data_detected');
    expect(result_empty.encrypted_value).toBeNull();
    expect(result_empty.error_message).toMatch(/機密データ/);
    expect(result_empty.error_code).toBe('SENSITIVE_DATA_EMPTY');
    expect(result_empty.audit_log_entry).toEqual({
      event_type: '暗号化スキップ（空データ検出）',
      user_id,
      timestamp_utc,
      skip_reason: 'empty_data_detected',
      data_length: 0,
      status: 'skipped',
    });
    expect(result_empty.system_stable).toBe(true);

    // Case 2: Null sensitive data
    const result_null = encryptSensitiveData({
      sensitive_data: null,
      user_id,
      timestamp_utc,
    });

    expect(result_null.encryption_skipped).toBe(true);
    expect(result_null.skip_reason).toBe('null_data_detected');
    expect(result_null.encrypted_value).toBeNull();
    expect(result_null.error_message).toMatch(/機密データ/);
    expect(result_null.error_code).toBe('SENSITIVE_DATA_NULL');
    expect(result_null.audit_log_entry).toEqual({
      event_type: '暗号化スキップ（null検出）',
      user_id,
      timestamp_utc,
      skip_reason: 'null_data_detected',
      data_length: 0,
      status: 'skipped',
    });
    expect(result_null.system_stable).toBe(true);

    // Verify error response structure
    expect(result_empty).toHaveProperty('error_code');
    expect(result_empty).toHaveProperty('error_message');
    expect(result_empty).toHaveProperty('timestamp_utc');
    expect(result_empty).toHaveProperty('user_id');

    // Verify system continues to operate normally
    const result_valid = encryptSensitiveData({
      sensitive_data: 'valid_confidential_data',
      user_id,
      timestamp_utc,
    });

    expect(result_valid.encryption_skipped).toBe(false);
    expect(result_valid.encrypted_value).not.toBeNull();
    expect(result_valid.system_stable).toBe(true);
    expect(result_valid.audit_log_entry.status).toBe('encrypted');
  });
});