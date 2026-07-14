import { aggregateFunctionUsageMetrics } from '../../src/logic/it-7-2-1';

describe('It-7-2-1: Weekly behavior metrics aggregation and algorithm improvement effect comparison dashboard', () => {
  // SCEN-599: [error] 機能別使用パターン分析機能 - 利用ログが存在しない機能について、使用頻度0として適切に集計・表示できる
  test('should aggregate and display functions with zero usage frequency when utilization logs do not exist', () => {
    const input_functions = [
      {
        function_id: 'func_001',
        function_name: '献立自動生成',
        function_category: 'core',
      },
      {
        function_id: 'func_002',
        function_name: 'アレルギー設定',
        function_category: 'settings',
      },
      {
        function_id: 'func_003',
        function_name: '栄養分析ダッシュボード',
        function_category: 'analytics',
      },
      {
        function_id: 'func_004',
        function_name: '買い物リスト生成',
        function_category: 'core',
      },
    ];

    const input_usage_logs = [
      {
        usage_log_id: 'log_001',
        function_id: 'func_001',
        user_id: 'user_101',
        usage_timestamp: new Date('2024-11-11T08:00:00Z'),
        session_duration_seconds: 300,
      },
      {
        usage_log_id: 'log_002',
        function_id: 'func_001',
        user_id: 'user_102',
        usage_timestamp: new Date('2024-11-11T09:30:00Z'),
        session_duration_seconds: 450,
      },
      {
        usage_log_id: 'log_003',
        function_id: 'func_002',
        user_id: 'user_101',
        usage_timestamp: new Date('2024-11-11T10:15:00Z'),
        session_duration_seconds: 180,
      },
    ];

    const input_week_start_date = new Date('2024-11-11T00:00:00Z');
    const input_week_end_date = new Date('2024-11-17T23:59:59Z');

    const result = aggregateFunctionUsageMetrics({
      functions: input_functions,
      usage_logs: input_usage_logs,
      week_start_date: input_week_start_date,
      week_end_date: input_week_end_date,
    });

    // 期待値: 全4機能の集計結果が返される
    expect(result.aggregated_metrics).toHaveLength(4);

    // func_001: 献立自動生成 - 2回の利用ログがある
    const metrics_func_001 = result.aggregated_metrics.find(
      (m) => m.function_id === 'func_001'
    );
    expect(metrics_func_001).toBeDefined();
    expect(metrics_func_001!.function_name).toBe('献立自動生成');
    expect(metrics_func_001!.usage_frequency).toBe(2);
    expect(metrics_func_001!.total_session_duration_seconds).toBe(750);
    expect(metrics_func_001!.average_session_duration_seconds).toBe(375);
    expect(metrics_func_001!.unique_user_count).toBe(2);

    // func_002: アレルギー設定 - 1回の利用ログがある
    const metrics_func_002 = result.aggregated_metrics.find(
      (m) => m.function_id === 'func_002'
    );
    expect(metrics_func_002).toBeDefined();
    expect(metrics_func_002!.function_name).toBe('アレルギー設定');
    expect(metrics_func_002!.usage_frequency).toBe(1);
    expect(metrics_func_002!.total_session_duration_seconds).toBe(180);
    expect(metrics_func_002!.average_session_duration_seconds).toBe(180);
    expect(metrics_func_002!.unique_user_count).toBe(1);

    // func_003: 栄養分析ダッシュボード - 利用ログが存在しない（使用頻度0）
    const metrics_func_003 = result.aggregated_metrics.find(
      (m) => m.function_id === 'func_003'
    );
    expect(metrics_func_003).toBeDefined();
    expect(metrics_func_003!.function_name).toBe('栄養分析ダッシュボード');
    expect(metrics_func_003!.usage_frequency).toBe(0);
    expect(metrics_func_003!.total_session_duration_seconds).toBe(0);
    expect(metrics_func_003!.average_session_duration_seconds).toBe(0);
    expect(metrics_func_003!.unique_user_count).toBe(0);

    // func_004: 買い物リスト生成 - 利用ログが存在しない（使用頻度0）
    const metrics_func_004 = result.aggregated_metrics.find(
      (m) => m.function_id === 'func_004'
    );
    expect(metrics_func_004).toBeDefined();
    expect(metrics_func_004!.function_name).toBe('買い物リスト生成');
    expect(metrics_func_004!.usage_frequency).toBe(0);
    expect(metrics_func_004!.total_session_duration_seconds).toBe(0);
    expect(metrics_func_004!.average_session_duration_seconds).toBe(0);
    expect(metrics_func_004!.unique_user_count).toBe(0);

    // ダッシュボード表示用フォーマットの検証
    expect(result.dashboard_display).toBeDefined();
    expect(result.dashboard_display.chart_data).toHaveLength(4);

    const chart_entry_func_003 = result.dashboard_display.chart_data.find(
      (c) => c.function_id === 'func_003'
    );
    expect(chart_entry_func_003).toBeDefined();
    expect(chart_entry_func_003!.display_name).toBe('栄養分析ダッシュボード');
    expect(chart_entry_func_003!.usage_frequency_display).toBe(0);
    expect(chart_entry_func_003!.chart_color).toBe('#CCCCCC');

    const chart_entry_func_004 = result.dashboard_display.chart_data.find(
      (c) => c.function_id === 'func_004'
    );
    expect(chart_entry_func_004).toBeDefined();
    expect(chart_entry_func_004!.display_name).toBe('買い物リスト生成');
    expect(chart_entry_func_004!.usage_frequency_display).toBe(0);
    expect(chart_entry_func_004!.chart_color).toBe('#CCCCCC');

    // テーブル表示用データの検証
    expect(result.dashboard_display.table_data).toHaveLength(4);

    const table_row_func_003 = result.dashboard_display.table_data.find(
      (t) => t.function_id === 'func_003'
    );
    expect(table_row_func_003).toBeDefined();
    expect(table_row_func_003!.function_name).toBe('栄養分析ダッシュボード');
    expect(table_row_func_003!.usage_frequency).toBe(0);
    expect(table_row_func_003!.average_session_duration_display).toBe('0分');
    expect(table_row_func_003!.unique_user_display).toBe('0人');

    const table_row_func_004 = result.dashboard_display.table_data.find(
      (t) => t.function_id === 'func_004'
    );
    expect(table_row_func_004).toBeDefined();
    expect(table_row_func_004!.function_name).toBe('買い物リスト生成');
    expect(table_row_func_004!.usage_frequency).toBe(0);
    expect(table_row_func_004!.average_session_duration_display).toBe('0分');
    expect(table_row_func_004!.unique_user_display).toBe('0人');

    // 集計データベースレコードの検証
    expect(result.database_records).toHaveLength(4);

    const db_record_func_003 = result.database_records.find(
      (r) => r.function_id === 'func_003'
    );
    expect(db_record_func_003).toBeDefined();
    expect(db_record_func_003!.weekly_aggregation_id).toBeDefined();
    expect(db_record_func_003!.week_start_date).toEqual(input_week_start_date);
    expect(db_record_func_003!.week_end_date).toEqual(input_week_end_date);
    expect(db_record_func_003!.usage_frequency_count).toBe(0);
    expect(db_record_func_003!.total_duration_seconds).toBe(0);
    expect(db_record_func_003!.average_duration_seconds).toBe(0);
    expect(db_record_func_003!.unique_user_count).toBe(0);
    expect(db_record_func_003!.aggregation_timestamp).toBeDefined();

    const db_record_func_004 = result.database_records.find(
      (r) => r.function_id === 'func_004'
    );
    expect(db_record_func_004).toBeDefined();
    expect(db_record_func_004!.weekly_aggregation_id).toBeDefined();
    expect(db_record_func_004!.week_start_date).toEqual(input_week_start_date);
    expect(db_record_func_004!.week_end_date).toEqual(input_week_end_date);
    expect(db_record_func_004!.usage_frequency_count).toBe(0);
    expect(db_record_func_004!.total_duration_seconds).toBe(0);
    expect(db_record_func_004!.average_duration_seconds).toBe(0);
    expect(db_record_func_004!.unique_user_count).toBe(0);
    expect(db_record_func_004!.aggregation_timestamp).toBeDefined();

    // 利用ログが存在する機能との比較
    const metrics_func_001_check = result.aggregated_metrics.find(
      (m) => m.function_id === 'func_001'
    );
    expect(metrics_func_001_check!.usage_frequency).toBeGreaterThan(0);
    expect(metrics_func_003!.usage_frequency).toBe(0);
    expect(metrics_func_003!.usage_frequency).toBeLessThan(
      metrics_func_001_check!.usage_frequency
    );

    // メタデータの確認
    expect(result.metadata).toBeDefined();
    expect(result.metadata.total_functions_analyzed).toBe(4);
    expect(result.metadata.functions_with_zero_usage).toBe(2);
    expect(result.metadata.functions_with_usage).toBe(2);
    expect(result.metadata.aggregation_period_start).toEqual(
      input_week_start_date
    );
    expect(result.metadata.aggregation_period_end).toEqual(input_week_end_date);
  });
});