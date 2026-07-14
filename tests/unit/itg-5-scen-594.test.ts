import { aggregateWeeklyMetrics } from '../../src/logic/it-7-2-1';

describe('週次集計・ダッシュボード機能 - 境界値検証', () => {
  test('SCEN-594: 集計対象期間の開始日・終了日の境界値で正しく週次データを抽出・集計できる', () => {
    // 集計対象期間: 月曜日 00:00:00 ～ 日曜日 23:59:59
    const start_date_iso = '2024-01-08T00:00:00Z'; // 月曜日 00:00:00
    const end_date_iso = '2024-01-14T23:59:59Z';   // 日曜日 23:59:59

    // テストデータセット
    const test_records = [
      // 開始日時の1秒前（含まれない）
      {
        record_id: 1,
        timestamp_iso: '2024-01-07T23:59:59Z',
        success_rate_percent: 85.0,
        cooking_time_reduction_minutes: 15,
        satisfaction_score: 4.2,
      },
      // 開始日時ちょうど（含まれる）
      {
        record_id: 2,
        timestamp_iso: '2024-01-08T00:00:00Z',
        success_rate_percent: 88.5,
        cooking_time_reduction_minutes: 18,
        satisfaction_score: 4.5,
      },
      // 開始日時の1秒後（含まれる）
      {
        record_id: 3,
        timestamp_iso: '2024-01-08T00:00:01Z',
        success_rate_percent: 87.0,
        cooking_time_reduction_minutes: 16,
        satisfaction_score: 4.3,
      },
      // 期間内のデータ（含まれる）
      {
        record_id: 4,
        timestamp_iso: '2024-01-10T12:30:45Z',
        success_rate_percent: 90.0,
        cooking_time_reduction_minutes: 20,
        satisfaction_score: 4.7,
      },
      {
        record_id: 5,
        timestamp_iso: '2024-01-12T14:15:30Z',
        success_rate_percent: 89.5,
        cooking_time_reduction_minutes: 19,
        satisfaction_score: 4.6,
      },
      // 終了日時の1秒前（含まれる）
      {
        record_id: 6,
        timestamp_iso: '2024-01-14T23:59:58Z',
        success_rate_percent: 86.0,
        cooking_time_reduction_minutes: 17,
        satisfaction_score: 4.4,
      },
      // 終了日時ちょうど（含まれる）
      {
        record_id: 7,
        timestamp_iso: '2024-01-14T23:59:59Z',
        success_rate_percent: 91.0,
        cooking_time_reduction_minutes: 21,
        satisfaction_score: 4.8,
      },
      // 終了日時の1秒後（含まれない）
      {
        record_id: 8,
        timestamp_iso: '2024-01-15T00:00:00Z',
        success_rate_percent: 84.0,
        cooking_time_reduction_minutes: 14,
        satisfaction_score: 4.1,
      },
    ];

    // 週次集計を実行
    const aggregation_result = aggregateWeeklyMetrics({
      all_records: test_records,
      period_start_iso: start_date_iso,
      period_end_iso: end_date_iso,
    });

    // 検証1: 集計結果に含まれるレコード数が正確であること
    // 期間内レコード: record_id 2, 3, 4, 5, 6, 7 = 6件
    expect(aggregation_result.aggregated_records.length).toBe(6);

    // 検証2: 含まれるべきレコード ID を確認
    const included_record_ids = aggregation_result.aggregated_records.map(
      (r: any) => r.record_id,
    );
    expect(included_record_ids).toEqual([2, 3, 4, 5, 6, 7]);

    // 検証3: 各レコードのタイムスタンプが開始日時以上かつ終了日時以下であること
    const start_timestamp_ms = new Date(start_date_iso).getTime();
    const end_timestamp_ms = new Date(end_date_iso).getTime();

    for (const record of aggregation_result.aggregated_records) {
      const record_timestamp_ms = new Date(record.timestamp_iso).getTime();
      expect(record_timestamp_ms >= start_timestamp_ms).toBe(true);
      expect(record_timestamp_ms <= end_timestamp_ms).toBe(true);
    }

    // 検証4: 境界外のデータが正確に除外されていること
    const excluded_record_ids = aggregation_result.excluded_records.map(
      (r: any) => r.record_id,
    );
    expect(excluded_record_ids).toEqual([1, 8]);
    expect(excluded_record_ids.length).toBe(2);

    // 検証5: 集計統計値が正確に計算されていること
    // 含まれるレコード: record_id 2, 3, 4, 5, 6, 7
    // 成功率の平均: (88.5 + 87.0 + 90.0 + 89.5 + 86.0 + 91.0) / 6 = 532.0 / 6 = 88.666...%
    expect(aggregation_result.aggregate_stats.avg_success_rate_percent).toBeCloseTo(
      88.67,
      1,
    );

    // 調理時間短縮度の合計: 18 + 16 + 20 + 19 + 17 + 21 = 111 分
    expect(aggregation_result.aggregate_stats.total_cooking_time_reduction_minutes).toBe(111);

    // ユーザー満足度スコアの平均: (4.5 + 4.3 + 4.7 + 4.6 + 4.4 + 4.8) / 6 = 27.3 / 6 = 4.55
    expect(aggregation_result.aggregate_stats.avg_satisfaction_score).toBeCloseTo(4.55, 1);

    // 検証6: 集計対象期間メタデータが正確に記録されていること
    expect(aggregation_result.period_metadata.start_iso).toBe(start_date_iso);
    expect(aggregation_result.period_metadata.end_iso).toBe(end_date_iso);
    expect(aggregation_result.period_metadata.week_start_day_of_week).toBe('Monday');
    expect(aggregation_result.period_metadata.week_end_day_of_week).toBe('Sunday');

    // 検証7: 全体サマリーの整合性
    expect(aggregation_result.summary.total_records_in_period).toBe(6);
    expect(aggregation_result.summary.total_records_excluded).toBe(2);
    expect(aggregation_result.summary.aggregation_status).toBe('completed');
  });
});