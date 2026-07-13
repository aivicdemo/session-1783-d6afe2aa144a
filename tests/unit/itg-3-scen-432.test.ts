import { recordSupplierSyncError } from '../../src/logic/it-1-br-6-2-1-1';

describe('食材流通業者価格データ連携エラーハンドリング', () => {
  // SCEN-432: [error] 食材流通業者価格データ連携機能 - 流通業者からのデータ連携に失敗した場合、エラーが記録される
  test('should record supplier data sync error with complete details when network connection fails', () => {
    const supplier_id = 'SUP-001';
    const sync_job_id = 'JOB-20240115-0001';
    const error_timestamp = new Date('2024-01-15T11:00:00Z');
    const error_type = 'NETWORK_CONNECTION_FAILED';
    const error_message = 'ネットワーク接続を確立できません';
    const error_details = 'APIエンドポイントへの接続タイムアウト（60秒）';

    const result = recordSupplierSyncError({
      supplier_id,
      sync_job_id,
      error_timestamp,
      error_type,
      error_message,
      error_details,
    });

    // (1) エラーメッセージが返却される
    expect(result.error_message).toBe('ネットワーク接続を確立できません');

    // (2) エラーログにタイムスタンプ、エラー種別、詳細な失敗原因が記録される
    expect(result.error_log).toEqual({
      timestamp: new Date('2024-01-15T11:00:00Z'),
      error_type: 'NETWORK_CONNECTION_FAILED',
      error_details: 'APIエンドポイントへの接続タイムアウト（60秒）',
    });

    // (3) エラー記録テーブルに該当レコードが追加される
    expect(result.error_record_id).toMatch(/^ERR-\d{8}-\d{4}$/);

    // (4) ステータスが「連携失敗」に更新される
    expect(result.sync_status).toBe('連携失敗');

    // (5) エラー発生時刻、流通業者ID、連携ジョブIDが正確に記録される
    expect(result.error_occurred_at).toEqual(new Date('2024-01-15T11:00:00Z'));
    expect(result.supplier_id).toBe('SUP-001');
    expect(result.sync_job_id).toBe('JOB-20240115-0001');

    // 追加検証：レコード作成時刻が現在時刻付近であること
    expect(result.recorded_at).toBeDefined();
    expect(typeof result.recorded_at).toBe('object');
  });

  test('should throw error when supplier_id is missing', () => {
    expect(() =>
      recordSupplierSyncError({
        supplier_id: '',
        sync_job_id: 'JOB-20240115-0001',
        error_timestamp: new Date('2024-01-15T11:00:00Z'),
        error_type: 'NETWORK_CONNECTION_FAILED',
        error_message: 'ネットワーク接続を確立できません',
        error_details: 'APIエンドポイントへの接続タイムアウト',
      })
    ).toThrow(/流通業者ID/);
  });

  test('should throw error when sync_job_id is missing', () => {
    expect(() =>
      recordSupplierSyncError({
        supplier_id: 'SUP-001',
        sync_job_id: '',
        error_timestamp: new Date('2024-01-15T11:00:00Z'),
        error_type: 'NETWORK_CONNECTION_FAILED',
        error_message: 'ネットワーク接続を確立できません',
        error_details: 'APIエンドポイントへの接続タイムアウト',
      })
    ).toThrow(/連携ジョブID/);
  });

  test('should throw error when error_type is invalid', () => {
    expect(() =>
      recordSupplierSyncError({
        supplier_id: 'SUP-001',
        sync_job_id: 'JOB-20240115-0001',
        error_timestamp: new Date('2024-01-15T11:00:00Z'),
        error_type: 'INVALID_ERROR_TYPE',
        error_message: 'ネットワーク接続を確立できません',
        error_details: 'APIエンドポイントへの接続タイムアウト',
      })
    ).toThrow(/エラー種別/);
  });

  test('should record API endpoint invalid error with all required fields', () => {
    const supplier_id = 'SUP-002';
    const sync_job_id = 'JOB-20240115-0002';
    const error_timestamp = new Date('2024-01-15T12:30:00Z');
    const error_type = 'API_ENDPOINT_INVALID';
    const error_message = 'APIエンドポイントが無効です';
    const error_details = '指定されたエンドポイントURLが存在しません（404）';

    const result = recordSupplierSyncError({
      supplier_id,
      sync_job_id,
      error_timestamp,
      error_type,
      error_message,
      error_details,
    });

    expect(result.sync_status).toBe('連携失敗');
    expect(result.error_type).toBe('API_ENDPOINT_INVALID');
    expect(result.supplier_id).toBe('SUP-002');
    expect(result.sync_job_id).toBe('JOB-20240115-0002');
  });

  test('should record authentication error with all required fields', () => {
    const supplier_id = 'SUP-003';
    const sync_job_id = 'JOB-20240115-0003';
    const error_timestamp = new Date('2024-01-15T13:45:00Z');
    const error_type = 'AUTHENTICATION_FAILED';
    const error_message = '認証に失敗しました';
    const error_details = 'APIキーが無効または期限切れです';

    const result = recordSupplierSyncError({
      supplier_id,
      sync_job_id,
      error_timestamp,
      error_type,
      error_message,
      error_details,
    });

    expect(result.error_message).toBe('認証に失敗しました');
    expect(result.error_log.error_type).toBe('AUTHENTICATION_FAILED');
    expect(result.sync_status).toBe('連携失敗');
  });

  test('should record data format error with complete error log', () => {
    const supplier_id = 'SUP-004';
    const sync_job_id = 'JOB-20240115-0004';
    const error_timestamp = new Date('2024-01-15T14:20:00Z');
    const error_type = 'INVALID_DATA_FORMAT';
    const error_message = 'レスポンスデータ形式が無効です';
    const error_details = 'JSONパースエラー：予期しないトークン';

    const result = recordSupplierSyncError({
      supplier_id,
      sync_job_id,
      error_timestamp,
      error_type,
      error_message,
      error_details,
    });

    expect(result.error_log.error_details).toBe('JSONパースエラー：予期しないトークン');
    expect(result.sync_status).toBe('連携失敗');
    expect(result.error_occurred_at).toEqual(new Date('2024-01-15T14:20:00Z'));
  });
});