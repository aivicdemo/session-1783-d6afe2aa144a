import { validateMonthlyForecastExecutionTiming } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase Record and Monthly Food Cost Reduction Analysis - Demand Forecast Verification Execution Judgment', () => {
  // SCEN-449
  test('should return correct forecast verification execution judgment when analyst checks during valid period (1st to 5th of month)', async () => {
    const current_date = new Date('2024-01-03T10:30:00Z');
    const analyst_user_id = 'analyst_001';
    const previous_month_start = new Date('2023-12-01T00:00:00Z');
    const previous_month_end = new Date('2023-12-31T23:59:59Z');
    const forecast_data_count = 45;
    const actual_data_count = 45;

    const input_params = {
      current_date: current_date,
      analyst_user_id: analyst_user_id,
      previous_month_start: previous_month_start,
      previous_month_end: previous_month_end,
      forecast_data_count: forecast_data_count,
      actual_data_count: actual_data_count
    };

    const result = validateMonthlyForecastExecutionTiming(input_params);

    expect(result).toEqual({
      should_execute_verification: true,
      execution_status: 'ready',
      message: '前月の需要予測精度検証を実行する準備が整っています',
      timing_valid: true,
      data_available: true,
      next_action: 'start_verification'
    });

    expect(result.should_execute_verification).toBe(true);
    expect(result.execution_status).toBe('ready');
    expect(result.timing_valid).toBe(true);
    expect(result.data_available).toBe(true);
  });

  test('should return not execute when date is outside valid period (6th to 31st of month)', async () => {
    const current_date = new Date('2024-01-15T10:30:00Z');
    const analyst_user_id = 'analyst_001';
    const previous_month_start = new Date('2023-12-01T00:00:00Z');
    const previous_month_end = new Date('2023-12-31T23:59:59Z');
    const forecast_data_count = 45;
    const actual_data_count = 45;

    const input_params = {
      current_date: current_date,
      analyst_user_id: analyst_user_id,
      previous_month_start: previous_month_start,
      previous_month_end: previous_month_end,
      forecast_data_count: forecast_data_count,
      actual_data_count: actual_data_count
    };

    const result = validateMonthlyForecastExecutionTiming(input_params);

    expect(result.should_execute_verification).toBe(false);
    expect(result.execution_status).toBe('wait');
    expect(result.timing_valid).toBe(false);
  });

  test('should return not execute when forecast data is missing', async () => {
    const current_date = new Date('2024-01-03T10:30:00Z');
    const analyst_user_id = 'analyst_001';
    const previous_month_start = new Date('2023-12-01T00:00:00Z');
    const previous_month_end = new Date('2023-12-31T23:59:59Z');
    const forecast_data_count = 0;
    const actual_data_count = 45;

    const input_params = {
      current_date: current_date,
      analyst_user_id: analyst_user_id,
      previous_month_start: previous_month_start,
      previous_month_end: previous_month_end,
      forecast_data_count: forecast_data_count,
      actual_data_count: actual_data_count
    };

    const result = validateMonthlyForecastExecutionTiming(input_params);

    expect(result.should_execute_verification).toBe(false);
    expect(result.data_available).toBe(false);
  });

  test('should return not execute when actual data is missing', async () => {
    const current_date = new Date('2024-01-02T10:30:00Z');
    const analyst_user_id = 'analyst_001';
    const previous_month_start = new Date('2023-12-01T00:00:00Z');
    const previous_month_end = new Date('2023-12-31T23:59:59Z');
    const forecast_data_count = 45;
    const actual_data_count = 0;

    const input_params = {
      current_date: current_date,
      analyst_user_id: analyst_user_id,
      previous_month_start: previous_month_start,
      previous_month_end: previous_month_end,
      forecast_data_count: forecast_data_count,
      actual_data_count: actual_data_count
    };

    const result = validateMonthlyForecastExecutionTiming(input_params);

    expect(result.should_execute_verification).toBe(false);
    expect(result.data_available).toBe(false);
  });

  test('should return execute ready on month boundary (1st day)', async () => {
    const current_date = new Date('2024-02-01T09:00:00Z');
    const analyst_user_id = 'analyst_001';
    const previous_month_start = new Date('2024-01-01T00:00:00Z');
    const previous_month_end = new Date('2024-01-31T23:59:59Z');
    const forecast_data_count = 31;
    const actual_data_count = 31;

    const input_params = {
      current_date: current_date,
      analyst_user_id: analyst_user_id,
      previous_month_start: previous_month_start,
      previous_month_end: previous_month_end,
      forecast_data_count: forecast_data_count,
      actual_data_count: actual_data_count
    };

    const result = validateMonthlyForecastExecutionTiming(input_params);

    expect(result.should_execute_verification).toBe(true);
    expect(result.execution_status).toBe('ready');
  });

  test('should return execute ready on month boundary (5th day)', async () => {
    const current_date = new Date('2024-03-05T23:59:59Z');
    const analyst_user_id = 'analyst_001';
    const previous_month_start = new Date('2024-02-01T00:00:00Z');
    const previous_month_end = new Date('2024-02-29T23:59:59Z');
    const forecast_data_count = 29;
    const actual_data_count = 29;

    const input_params = {
      current_date: current_date,
      analyst_user_id: analyst_user_id,
      previous_month_start: previous_month_start,
      previous_month_end: previous_month_end,
      forecast_data_count: forecast_data_count,
      actual_data_count: actual_data_count
    };

    const result = validateMonthlyForecastExecutionTiming(input_params);

    expect(result.should_execute_verification).toBe(true);
    expect(result.execution_status).toBe('ready');
    expect(result.next_action).toBe('start_verification');
  });

  test('should throw error when analyst_user_id is missing', () => {
    const current_date = new Date('2024-01-03T10:30:00Z');
    const analyst_user_id = '';
    const previous_month_start = new Date('2023-12-01T00:00:00Z');
    const previous_month_end = new Date('2023-12-31T23:59:59Z');
    const forecast_data_count = 45;
    const actual_data_count = 45;

    const input_params = {
      current_date: current_date,
      analyst_user_id: analyst_user_id,
      previous_month_start: previous_month_start,
      previous_month_end: previous_month_end,
      forecast_data_count: forecast_data_count,
      actual_data_count: actual_data_count
    };

    expect(() => validateMonthlyForecastExecutionTiming(input_params)).toThrow(/ユーザーID/);
  });

  test('should throw error when current_date is invalid', () => {
    const current_date = null as any;
    const analyst_user_id = 'analyst_001';
    const previous_month_start = new Date('2023-12-01T00:00:00Z');
    const previous_month_end = new Date('2023-12-31T23:59:59Z');
    const forecast_data_count = 45;
    const actual_data_count = 45;

    const input_params = {
      current_date: current_date,
      analyst_user_id: analyst_user_id,
      previous_month_start: previous_month_start,
      previous_month_end: previous_month_end,
      forecast_data_count: forecast_data_count,
      actual_data_count: actual_data_count
    };

    expect(() => validateMonthlyForecastExecutionTiming(input_params)).toThrow(/日付/);
  });

  test('should throw error when forecast_data_count is negative', () => {
    const current_date = new Date('2024-01-03T10:30:00Z');
    const analyst_user_id = 'analyst_001';
    const previous_month_start = new Date('2023-12-01T00:00:00Z');
    const previous_month_end = new Date('2023-12-31T23:59:59Z');
    const forecast_data_count = -1;
    const actual_data_count = 45;

    const input_params = {
      current_date: current_date,
      analyst_user_id: analyst_user_id,
      previous_month_start: previous_month_start,
      previous_month_end: previous_month_end,
      forecast_data_count: forecast_data_count,
      actual_data_count: actual_data_count
    };

    expect(() => validateMonthlyForecastExecutionTiming(input_params)).toThrow(/予測データ/);
  });

  test('should throw error when actual_data_count is negative', () => {
    const current_date = new Date('2024-01-03T10:30:00Z');
    const analyst_user_id = 'analyst_001';
    const previous_month_start = new Date('2023-12-01T00:00:00Z');
    const previous_month_end = new Date('2023-12-31T23:59:59Z');
    const forecast_data_count = 45;
    const actual_data_count = -5;

    const input_params = {
      current_date: current_date,
      analyst_user_id: analyst_user_id,
      previous_month_start: previous_month_start,
      previous_month_end: previous_month_end,
      forecast_data_count: forecast_data_count,
      actual_data_count: actual_data_count
    };

    expect(() => validateMonthlyForecastExecutionTiming(input_params)).toThrow(/実績データ/);
  });

  test('should return correct status when partial data exists but validation still proceeds', async () => {
    const current_date = new Date('2024-01-04T14:25:00Z');
    const analyst_user_id = 'analyst_002';
    const previous_month_start = new Date('2023-12-01T00:00:00Z');
    const previous_month_end = new Date('2023-12-31T23:59:59Z');
    const forecast_data_count = 15;
    const actual_data_count = 20;

    const input_params = {
      current_date: current_date,
      analyst_user_id: analyst_user_id,
      previous_month_start: previous_month_start,
      previous_month_end: previous_month_end,
      forecast_data_count: forecast_data_count,
      actual_data_count: actual_data_count
    };

    const result = validateMonthlyForecastExecutionTiming(input_params);

    expect(result.should_execute_verification).toBe(true);
    expect(result.timing_valid).toBe(true);
    expect(result.data_available).toBe(true);
  });
});