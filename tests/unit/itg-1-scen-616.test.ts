import { detectAndExcludeAnomalies } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  test('SCEN-616: ユーザーデータの欠損値・異常値検出と補正 - 検出された欠損値・異常値が分析対象から正常に除外される', () => {
    // テスト用入力データセット（欠損値・異常値を含む）
    const testDataset = [
      {
        user_id: 'user_001',
        satisfaction_score: 4,
        meal_completion_rate: 95,
        timestamp: '2024-01-15T12:00:00Z',
      },
      {
        user_id: 'user_002',
        satisfaction_score: null, // 欠損値
        meal_completion_rate: 85,
        timestamp: '2024-01-15T12:15:00Z',
      },
      {
        user_id: 'user_003',
        satisfaction_score: 2,
        meal_completion_rate: 100,
        timestamp: '2024-01-15T12:30:00Z',
      },
      {
        user_id: 'user_004',
        satisfaction_score: 10, // 異常値（範囲外：1～5）
        meal_completion_rate: 95,
        timestamp: '2024-01-15T12:45:00Z',
      },
      {
        user_id: 'user_005',
        satisfaction_score: 3,
        meal_completion_rate: -10, // 異常値（負数）
        timestamp: '2024-01-15T13:00:00Z',
      },
      {
        user_id: 'user_006',
        satisfaction_score: 5,
        meal_completion_rate: 88,
        timestamp: '2024-01-15T13:15:00Z',
      },
      {
        user_id: 'user_007',
        satisfaction_score: 1,
        meal_completion_rate: undefined, // 欠損値
        timestamp: '2024-01-15T13:30:00Z',
      },
    ];

    // 処理実行
    const result = detectAndExcludeAnomalies(testDataset);

    // 有効なデータレコードの検証
    expect(result.valid_data).toHaveLength(3);
    expect(result.valid_data[0]).toEqual({
      user_id: 'user_001',
      satisfaction_score: 4,
      meal_completion_rate: 95,
      timestamp: '2024-01-15T12:00:00Z',
    });
    expect(result.valid_data[1]).toEqual({
      user_id: 'user_003',
      satisfaction_score: 2,
      meal_completion_rate: 100,
      timestamp: '2024-01-15T12:30:00Z',
    });
    expect(result.valid_data[2]).toEqual({
      user_id: 'user_006',
      satisfaction_score: 5,
      meal_completion_rate: 88,
      timestamp: '2024-01-15T13:15:00Z',
    });

    // 除外されたデータレコードの検証
    expect(result.excluded_data).toHaveLength(4);
    expect(result.excluded_data[0]).toEqual({
      user_id: 'user_002',
      reason: '欠損値',
      field: 'satisfaction_score',
    });
    expect(result.excluded_data[1]).toEqual({
      user_id: 'user_004',
      reason: '異常値',
      field: 'satisfaction_score',
    });
    expect(result.excluded_data[2]).toEqual({
      user_id: 'user_005',
      reason: '異常値',
      field: 'meal_completion_rate',
    });
    expect(result.excluded_data[3]).toEqual({
      user_id: 'user_007',
      reason: '欠損値',
      field: 'meal_completion_rate',
    });

    // 除外統計の検証
    expect(result.exclusion_summary).toEqual({
      total_records: 7,
      valid_records: 3,
      excluded_records: 4,
      exclusion_reasons: {
        欠損値: 2,
        異常値: 2,
      },
    });

    // 分析対象外レコードが分析結果に含まれていないことを確認
    const valid_user_ids = result.valid_data.map((record: any) => record.user_id);
    expect(valid_user_ids).toContain('user_001');
    expect(valid_user_ids).toContain('user_003');
    expect(valid_user_ids).toContain('user_006');
    expect(valid_user_ids).not.toContain('user_002');
    expect(valid_user_ids).not.toContain('user_004');
    expect(valid_user_ids).not.toContain('user_005');
    expect(valid_user_ids).not.toContain('user_007');

    // 分析ログの生成確認
    expect(result.analysis_log).toBeDefined();
    expect(result.analysis_log.execution_timestamp).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/);
    expect(result.analysis_log.status).toBe('completed');
    expect(result.analysis_log.message).toMatch(/欠損値/);
  });
});