import { filterAnomaliesAndMissingValues } from '../../src/logic/it-7-2-1';

describe('献立生成の成功率・調理時間短縮度・ユーザー満足度スコアの行動指標集計', () => {
  // SCEN-762: [normal] 異常値・欠損値フィルタリング機能 - 検出された異常値・欠損値が分析対象外として隔離される
  test('異常値・欠損値が正常なデータセットから完全に隔離され、分析対象外として区分される', () => {
    const testDataset = [
      {
        user_id: 'user_001',
        generation_success_rate: 85.5,
        cooking_time_reduction_degree: 12.3,
        user_satisfaction_score: 4.2,
        timestamp: '2024-01-15T10:00:00Z',
      },
      {
        user_id: 'user_002',
        generation_success_rate: 92.0,
        cooking_time_reduction_degree: 18.7,
        user_satisfaction_score: 4.8,
        timestamp: '2024-01-15T11:00:00Z',
      },
      {
        user_id: 'user_003',
        generation_success_rate: -5.0, // 異常値: 負の値
        cooking_time_reduction_degree: 15.2,
        user_satisfaction_score: 3.9,
        timestamp: '2024-01-15T12:00:00Z',
      },
      {
        user_id: 'user_004',
        generation_success_rate: 150.5, // 異常値: 100以上
        cooking_time_reduction_degree: 22.1,
        user_satisfaction_score: 4.5,
        timestamp: '2024-01-15T13:00:00Z',
      },
      {
        user_id: 'user_005',
        generation_success_rate: 78.3,
        cooking_time_reduction_degree: null, // 欠損値
        user_satisfaction_score: 4.1,
        timestamp: '2024-01-15T14:00:00Z',
      },
      {
        user_id: 'user_006',
        generation_success_rate: 88.9,
        cooking_time_reduction_degree: 16.4,
        user_satisfaction_score: undefined, // 欠損値
        timestamp: '2024-01-15T15:00:00Z',
      },
      {
        user_id: 'user_007',
        generation_success_rate: 81.2,
        cooking_time_reduction_degree: 25.8, // 外れ値（統計的に異常）
        user_satisfaction_score: 4.3,
        timestamp: '2024-01-15T16:00:00Z',
      },
      {
        user_id: 'user_008',
        generation_success_rate: 94.1,
        cooking_time_reduction_degree: 19.5,
        user_satisfaction_score: 5.1, // 異常値: 5.0を超過
        timestamp: '2024-01-15T17:00:00Z',
      },
    ];

    const result = filterAnomaliesAndMissingValues(testDataset);

    // 正常データが分析対象に含まれていることを確認
    expect(result.analysis_target_data).toEqual([
      {
        user_id: 'user_001',
        generation_success_rate: 85.5,
        cooking_time_reduction_degree: 12.3,
        user_satisfaction_score: 4.2,
        timestamp: '2024-01-15T10:00:00Z',
      },
      {
        user_id: 'user_002',
        generation_success_rate: 92.0,
        cooking_time_reduction_degree: 18.7,
        user_satisfaction_score: 4.8,
        timestamp: '2024-01-15T11:00:00Z',
      },
    ]);

    // 隔離されたデータに異常値・欠損値が含まれていることを確認
    expect(result.isolated_data).toHaveLength(6);
    expect(result.isolated_data).toContainEqual({
      user_id: 'user_003',
      generation_success_rate: -5.0,
      cooking_time_reduction_degree: 15.2,
      user_satisfaction_score: 3.9,
      timestamp: '2024-01-15T12:00:00Z',
      reason: '負数値',
    });
    expect(result.isolated_data).toContainEqual({
      user_id: 'user_004',
      generation_success_rate: 150.5,
      cooking_time_reduction_degree: 22.1,
      user_satisfaction_score: 4.5,
      timestamp: '2024-01-15T13:00:00Z',
      reason: '上限超過',
    });
    expect(result.isolated_data).toContainEqual({
      user_id: 'user_005',
      generation_success_rate: 78.3,
      cooking_time_reduction_degree: null,
      user_satisfaction_score: 4.1,
      timestamp: '2024-01-15T14:00:00Z',
      reason: '欠損値',
    });
    expect(result.isolated_data).toContainEqual({
      user_id: 'user_006',
      generation_success_rate: 88.9,
      cooking_time_reduction_degree: 16.4,
      user_satisfaction_score: undefined,
      timestamp: '2024-01-15T15:00:00Z',
      reason: '欠損値',
    });
    expect(result.isolated_data).toContainEqual({
      user_id: 'user_007',
      generation_success_rate: 81.2,
      cooking_time_reduction_degree: 25.8,
      user_satisfaction_score: 4.3,
      timestamp: '2024-01-15T16:00:00Z',
      reason: '外れ値',
    });
    expect(result.isolated_data).toContainEqual({
      user_id: 'user_008',
      generation_success_rate: 94.1,
      cooking_time_reduction_degree: 19.5,
      user_satisfaction_score: 5.1,
      timestamp: '2024-01-15T17:00:00Z',
      reason: '上限超過',
    });

    // 隔離されたレコードが追跡可能なレポートに記録されていることを確認
    expect(result.isolation_report).toEqual({
      total_input_records: 8,
      analysis_target_records: 2,
      isolated_records: 6,
      isolation_rate_percent: 75.0,
      isolation_details: [
        {
          category: '負数値',
          count: 1,
          affected_users: ['user_003'],
        },
        {
          category: '上限超過',
          count: 2,
          affected_users: ['user_004', 'user_008'],
        },
        {
          category: '欠損値',
          count: 2,
          affected_users: ['user_005', 'user_006'],
        },
        {
          category: '外れ値',
          count: 1,
          affected_users: ['user_007'],
        },
      ],
      timestamp: '2024-01-15T18:00:00Z',
    });

    // 隔離されたデータが分析ロジックに渡されないことを確認
    expect(result.analysis_target_data).not.toContainEqual(
      expect.objectContaining({ user_id: 'user_003' })
    );
    expect(result.analysis_target_data).not.toContainEqual(
      expect.objectContaining({ user_id: 'user_004' })
    );
    expect(result.analysis_target_data).not.toContainEqual(
      expect.objectContaining({ user_id: 'user_005' })
    );
    expect(result.analysis_target_data).not.toContainEqual(
      expect.objectContaining({ user_id: 'user_006' })
    );
    expect(result.analysis_target_data).not.toContainEqual(
      expect.objectContaining({ user_id: 'user_007' })
    );
    expect(result.analysis_target_data).not.toContainEqual(
      expect.objectContaining({ user_id: 'user_008' })
    );

    // ログレコードが作成されていることを確認
    expect(result.filtering_log).toEqual({
      operation: 'filter_anomalies_and_missing_values',
      status: 'completed',
      start_timestamp: '2024-01-15T18:00:00Z',
      end_timestamp: '2024-01-15T18:00:01Z',
      records_processed: 8,
      records_passed: 2,
      records_filtered: 6,
      filter_rules_applied: [
        'generation_success_rate_range_0_to_100',
        'cooking_time_reduction_degree_not_null',
        'user_satisfaction_score_range_0_to_5',
        'outlier_detection_iqr_method',
      ],
      quality_validation: {
        schema_validation_passed: true,
        data_type_validation_passed: true,
        range_validation_passed: true,
      },
    });
  });
});