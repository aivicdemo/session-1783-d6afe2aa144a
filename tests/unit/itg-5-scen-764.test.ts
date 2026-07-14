import { filterAnomalousAndMissingValues } from '../../src/logic/it-7-2-1';

describe('異常値・欠損値フィルタリング機能', () => {
  // SCEN-764
  test('フィルタリング結果がログに記録される', () => {
    const userId = 'user_001';
    const timestamp_start = new Date('2024-01-15T09:00:00Z');
    const timestamp_end = new Date('2024-01-15T09:00:30Z');

    const input_records = [
      { recipe_id: 'r001', satisfaction_score: 85, cooking_time_minutes: 30, completion_rate: 0.95 },
      { recipe_id: 'r002', satisfaction_score: null, cooking_time_minutes: 45, completion_rate: 0.88 },
      { recipe_id: 'r003', satisfaction_score: 92, cooking_time_minutes: 999, completion_rate: 0.90 },
      { recipe_id: 'r004', satisfaction_score: 78, cooking_time_minutes: undefined, completion_rate: 0.92 },
      { recipe_id: 'r005', satisfaction_score: 88, cooking_time_minutes: 35, completion_rate: 0.85 },
    ];

    const filter_config = {
      anomaly_threshold_cooking_time_upper: 120,
      anomaly_threshold_cooking_time_lower: 10,
      missing_value_handling: 'exclude',
      fields_to_validate: ['satisfaction_score', 'cooking_time_minutes', 'completion_rate'],
    };

    const result = filterAnomalousAndMissingValues({
      user_id: userId,
      records: input_records,
      filter_config: filter_config,
      execution_timestamp: timestamp_start,
    });

    expect(result).toEqual({
      filtered_records: [
        { recipe_id: 'r001', satisfaction_score: 85, cooking_time_minutes: 30, completion_rate: 0.95 },
        { recipe_id: 'r005', satisfaction_score: 88, cooking_time_minutes: 35, completion_rate: 0.85 },
      ],
      excluded_records: [
        { recipe_id: 'r002', reason: 'missing_value', field: 'satisfaction_score' },
        { recipe_id: 'r003', reason: 'anomaly', field: 'cooking_time_minutes', value: 999 },
        { recipe_id: 'r004', reason: 'missing_value', field: 'cooking_time_minutes' },
      ],
      log_entry: {
        user_id: userId,
        operation_type: 'filter_anomalous_and_missing_values',
        timestamp_start: timestamp_start.toISOString(),
        timestamp_end: timestamp_end.toISOString(),
        filter_conditions: {
          anomaly_threshold_cooking_time_upper: 120,
          anomaly_threshold_cooking_time_lower: 10,
          missing_value_handling: 'exclude',
          fields_validated: ['satisfaction_score', 'cooking_time_minutes', 'completion_rate'],
        },
        input_record_count: 5,
        excluded_record_count: 3,
        filtered_record_count: 2,
        exclusion_summary: {
          missing_value_count: 2,
          anomaly_count: 1,
        },
      },
    });

    expect(result.log_entry.timestamp_start).toBe('2024-01-15T09:00:00Z');
    expect(result.log_entry.user_id).toBe('user_001');
    expect(result.log_entry.input_record_count).toBe(5);
    expect(result.log_entry.filtered_record_count).toBe(2);
    expect(result.log_entry.excluded_record_count).toBe(3);
    expect(result.log_entry.exclusion_summary.missing_value_count).toBe(2);
    expect(result.log_entry.exclusion_summary.anomaly_count).toBe(1);
    expect(result.filtered_records.length).toBe(2);
    expect(result.excluded_records.length).toBe(3);
  });
});