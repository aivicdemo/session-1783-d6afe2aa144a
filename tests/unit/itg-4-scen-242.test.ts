import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { filterAnomalousData } from '../../src/logic/it-1-br-6-2-1';

describe('需要予測精度検証ダッシュボード：異常値・欠損値フィルタリング機能', () => {
  // SCEN-242: [normal] 異常値・欠損値フィルタリング機能 - 買い物リスト生成データから異常値を検出し分析対象外として隔離できる
  test('買い物リスト生成データから異常値を検出し、正常値と隔離してフィルタリングする', () => {
    // Arrange: 入力データ（正常値と異常値を混在させたサンプルデータセット）
    const shopping_list_data = [
      {
        user_id: 'USR001',
        date: '2024-01-15',
        item_name: 'トマト',
        quantity: 5,
        unit_price: 200,
        total_amount: 1000,
        category: '野菜',
      },
      {
        user_id: 'USR001',
        date: '2024-01-15',
        item_name: '卵',
        quantity: 10,
        unit_price: 150,
        total_amount: 1500,
        category: '卵類',
      },
      {
        user_id: 'USR001',
        date: '2024-01-15',
        item_name: '牛肉',
        quantity: 2,
        unit_price: 1500,
        total_amount: 3000,
        category: '肉類',
      },
      {
        user_id: 'USR001',
        date: '2024-01-15',
        item_name: '異常高価品',
        quantity: 1,
        unit_price: 999999,
        total_amount: 999999,
        category: '高級品',
      },
      {
        user_id: 'USR001',
        date: '2024-01-15',
        item_name: 'ニンジン',
        quantity: -3,
        unit_price: 150,
        total_amount: -450,
        category: '野菜',
      },
      {
        user_id: 'USR001',
        date: '2024-01-15',
        item_name: 'タマネギ',
        quantity: null,
        unit_price: 100,
        total_amount: null,
        category: '野菜',
      },
      {
        user_id: 'USR001',
        date: '2024-01-15',
        item_name: 'キャベツ',
        quantity: 0,
        unit_price: 120,
        total_amount: 0,
        category: '野菜',
      },
      {
        user_id: 'USR002',
        date: '2024-01-15',
        item_name: 'バナナ',
        quantity: 8,
        unit_price: 100,
        total_amount: 800,
        category: '果実',
      },
    ];

    // Act: 異常値フィルタリング関数を実行
    const result = filterAnomalousData(shopping_list_data);

    // Assert: 正常値の検証
    expect(result.normal_data).toHaveLength(5);
    expect(result.normal_data[0]).toEqual({
      user_id: 'USR001',
      date: '2024-01-15',
      item_name: 'トマト',
      quantity: 5,
      unit_price: 200,
      total_amount: 1000,
      category: '野菜',
    });
    expect(result.normal_data[1]).toEqual({
      user_id: 'USR001',
      date: '2024-01-15',
      item_name: '卵',
      quantity: 10,
      unit_price: 150,
      total_amount: 1500,
      category: '卵類',
    });
    expect(result.normal_data[2]).toEqual({
      user_id: 'USR001',
      date: '2024-01-15',
      item_name: '牛肉',
      quantity: 2,
      unit_price: 1500,
      total_amount: 3000,
      category: '肉類',
    });
    expect(result.normal_data[3]).toEqual({
      user_id: 'USR001',
      date: '2024-01-15',
      item_name: 'キャベツ',
      quantity: 0,
      unit_price: 120,
      total_amount: 0,
      category: '野菜',
    });
    expect(result.normal_data[4]).toEqual({
      user_id: 'USR002',
      date: '2024-01-15',
      item_name: 'バナナ',
      quantity: 8,
      unit_price: 100,
      total_amount: 800,
      category: '果実',
    });

    // Assert: 異常値の検証
    expect(result.anomalous_data).toHaveLength(3);
    expect(result.anomalous_data[0]).toEqual({
      user_id: 'USR001',
      date: '2024-01-15',
      item_name: '異常高価品',
      quantity: 1,
      unit_price: 999999,
      total_amount: 999999,
      category: '高級品',
      anomaly_reason: '異常高価値',
      anomaly_type: 'outlier_extreme_high',
    });
    expect(result.anomalous_data[1]).toEqual({
      user_id: 'USR001',
      date: '2024-01-15',
      item_name: 'ニンジン',
      quantity: -3,
      unit_price: 150,
      total_amount: -450,
      category: '野菜',
      anomaly_reason: '負の値',
      anomaly_type: 'negative_value',
    });
    expect(result.anomalous_data[2]).toEqual({
      user_id: 'USR001',
      date: '2024-01-15',
      item_name: 'タマネギ',
      quantity: null,
      unit_price: 100,
      total_amount: null,
      category: '野菜',
      anomaly_reason: 'NULL値',
      anomaly_type: 'null_value',
    });

    // Assert: フィルタリング統計情報の検証
    expect(result.filter_statistics).toEqual({
      total_records: 8,
      normal_records: 5,
      anomalous_records: 3,
      filter_rate: 0.625,
      anomaly_types_breakdown: {
        outlier_extreme_high: 1,
        negative_value: 1,
        null_value: 1,
      },
    });

    // Assert: 隔離レコード領域フラグの検証
    expect(result.isolation_status).toEqual({
      is_isolated: true,
      isolation_timestamp: expect.any(String),
      isolation_region: 'ANOMALOUS_QUARANTINE',
      audit_trail_logged: true,
    });

    // Assert: 監査ログの記録検証
    expect(result.audit_log).toHaveLength(1);
    expect(result.audit_log[0]).toEqual({
      action: 'FILTER_ANOMALOUS_DATA',
      timestamp: expect.any(String),
      filtered_count: 3,
      reason: 'Automatic anomaly detection and isolation for demand forecast analysis',
      status: 'success',
    });

    // Assert: 正常値を用いた分析対象データの確認
    expect(result.analysis_ready_data).toEqual(result.normal_data);
    expect(result.analysis_ready_data).toHaveLength(5);

    // Assert: 異常値統計レポート
    expect(result.anomaly_report).toEqual({
      report_generated_timestamp: expect.any(String),
      anomaly_summary: {
        total_anomalies: 3,
        extreme_high_values: 1,
        negative_values: 1,
        null_missing_values: 1,
      },
      anomaly_distribution_by_category: {
        野菜: 2,
        高級品: 1,
      },
      anomaly_distribution_by_user: {
        USR001: 3,
      },
      statistical_impact: {
        normal_data_mean_total_amount: 1620,
        normal_data_max_total_amount: 3000,
        normal_data_min_total_amount: 0,
      },
    });
  });
});