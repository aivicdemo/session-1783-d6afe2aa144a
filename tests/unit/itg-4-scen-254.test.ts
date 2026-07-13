import { encryptAndAuditSensitiveData } from '../../src/logic/it-3-br-6-3-3';

describe('予測精度低下要因の可視化ダッシュボード', () => {
  // SCEN-254
  test('暗号化処理失敗時に機密データを隔離し監査ログを記録する', () => {
    const sensitive_data_id = 'cust_20240115_001';
    const customer_info = {
      user_id: 'user_12345',
      name: '田中太郎',
      phone: '09012345678',
    };
    const sales_data = {
      transaction_id: 'txn_20240115_0001',
      amount: 15000,
      date: '2024-01-15',
    };
    const encryption_engine_failure = true;
    const isolation_storage_available = true;
    const audit_log_timestamp = new Date('2024-01-15T14:30:00Z');

    const result = encryptAndAuditSensitiveData({
      sensitive_data_id,
      customer_info,
      sales_data,
      encryption_engine_failure,
      isolation_storage_available,
      audit_log_timestamp,
    });

    // 暗号化失敗時、処理が中断される
    expect(result.encryption_succeeded).toBe(false);

    // 機密データが隔離ストレージに移動される
    expect(result.data_isolation_executed).toBe(true);
    expect(result.isolated_storage_location).toBe(
      `isolation_vault/${sensitive_data_id}`,
    );

    // 元の領域からアクセス不可となる
    expect(result.original_location_accessible).toBe(false);

    // 処理が中断される
    expect(result.processing_continued).toBe(false);

    // 失敗原因を含む監査ログが記録される
    expect(result.audit_log_entry.error_reason).toBe('encryption_engine_failure');
    expect(result.audit_log_entry.timestamp).toEqual(audit_log_timestamp);
    expect(result.audit_log_entry.affected_data_id).toBe(sensitive_data_id);

    // 隔離処理結果が記録される
    expect(result.audit_log_entry.isolation_executed).toBe(true);
    expect(result.audit_log_entry.isolation_timestamp).toEqual(audit_log_timestamp);

    // ユーザーへのエラーメッセージが生成される
    expect(result.error_message).toMatch(/暗号化/);
    expect(result.error_message.length).toBeGreaterThan(0);

    // システムは安全な状態を保つ（他の処理継続可能）
    expect(result.system_safe_state).toBe(true);
    expect(result.other_operations_available).toBe(true);

    // 監査ログに詳細情報が含まれる
    expect(result.audit_log_entry.data_count).toBe(2);
    expect(result.audit_log_entry.isolation_storage_path).toBe(
      `isolation_vault/${sensitive_data_id}`,
    );
    expect(result.audit_log_entry.customer_info_isolated).toBe(true);
    expect(result.audit_log_entry.sales_data_isolated).toBe(true);
  });

  test('暗号化処理失敗時に隔離ストレージが利用不可な場合はエラーをスロー', () => {
    const sensitive_data_id = 'cust_20240115_002';
    const customer_info = { user_id: 'user_67890', name: '佐藤花子' };
    const sales_data = { transaction_id: 'txn_20240115_0002', amount: 25000 };
    const encryption_engine_failure = true;
    const isolation_storage_available = false;
    const audit_log_timestamp = new Date('2024-01-15T15:00:00Z');

    expect(() =>
      encryptAndAuditSensitiveData({
        sensitive_data_id,
        customer_info,
        sales_data,
        encryption_engine_failure,
        isolation_storage_available,
        audit_log_timestamp,
      }),
    ).toThrow(/隔離ストレージ/);
  });

  test('暗号化処理成功時は通常フロー完了', () => {
    const sensitive_data_id = 'cust_20240115_003';
    const customer_info = {
      user_id: 'user_11111',
      name: '鈴木次郎',
    };
    const sales_data = {
      transaction_id: 'txn_20240115_0003',
      amount: 35000,
    };
    const encryption_engine_failure = false;
    const isolation_storage_available = true;
    const audit_log_timestamp = new Date('2024-01-15T16:00:00Z');

    const result = encryptAndAuditSensitiveData({
      sensitive_data_id,
      customer_info,
      sales_data,
      encryption_engine_failure,
      isolation_storage_available,
      audit_log_timestamp,
    });

    // 暗号化成功
    expect(result.encryption_succeeded).toBe(true);

    // 隔離処理は実行されない
    expect(result.data_isolation_executed).toBe(false);

    // 処理は継続される
    expect(result.processing_continued).toBe(true);

    // 監査ログには成功が記録される
    expect(result.audit_log_entry.error_reason).toBeNull();
    expect(result.audit_log_entry.isolation_executed).toBe(false);

    // システムは正常状態
    expect(result.system_safe_state).toBe(true);
  });
});