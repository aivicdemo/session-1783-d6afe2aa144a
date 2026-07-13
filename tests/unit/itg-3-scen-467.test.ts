import { validateMonthlyForecastCycle } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase Record and Monthly Food Cost Reduction Analysis', () => {
  // SCEN-467
  test('should interrupt forecast verification flow and trigger exception handling when SLA or data quality violations occur', () => {
    const poor_data_input = {
      month_year: '2024-01',
      forecast_data: {
        predicted_demand: [100, 150, null, 200, 180, null, 220, 190, null, 210, 200, 170],
        category: 'vegetables',
      },
      actual_data: {
        sales_actual: [95, null, 160, 195, null, 215, 185, 225, null, 205, 198, null],
        inventory_change: [5, 8, null, 12, 10, null, 15, 9, null, 11, 6, 8],
      },
      timestamp_start: new Date('2024-01-01T09:00:00Z').toISOString(),
      timestamp_sla_limit_ms: 5 * 60 * 1000,
    };

    const missing_count_forecast = poor_data_input.forecast_data.predicted_demand.filter(
      (v) => v === null
    ).length;
    const missing_count_actual = poor_data_input.actual_data.sales_actual.filter(
      (v) => v === null
    ).length;
    const total_records_forecast = poor_data_input.forecast_data.predicted_demand.length;
    const total_records_actual = poor_data_input.actual_data.sales_actual.length;

    const data_quality_rate_forecast = ((total_records_forecast - missing_count_forecast) / total_records_forecast) * 100;
    const data_quality_rate_actual = ((total_records_actual - missing_count_actual) / total_records_actual) * 100;

    expect(data_quality_rate_forecast).toBeLessThan(70);
    expect(data_quality_rate_actual).toBeLessThan(75);

    expect(() => validateMonthlyForecastCycle(poor_data_input)).toThrow(/データ品質/);
  });

  test('should detect SLA violation when processing exceeds time limit', () => {
    const delayed_input = {
      month_year: '2024-01',
      forecast_data: {
        predicted_demand: [100, 150, 160, 200, 180, 210, 220, 190, 205, 210, 200, 170],
        category: 'vegetables',
      },
      actual_data: {
        sales_actual: [95, 155, 160, 195, 185, 215, 185, 225, 200, 205, 198, 175],
        inventory_change: [5, 8, 9, 12, 10, 11, 15, 9, 8, 11, 6, 8],
      },
      timestamp_start: new Date('2024-01-01T08:55:00Z').toISOString(),
      timestamp_sla_limit_ms: 5 * 60 * 1000,
      processing_delay_ms: 6 * 60 * 1000,
    };

    const sla_exceeded = delayed_input.processing_delay_ms > delayed_input.timestamp_sla_limit_ms;
    expect(sla_exceeded).toBe(true);

    expect(() => validateMonthlyForecastCycle(delayed_input)).toThrow(/SLA/);
  });

  test('should successfully complete forecast cycle when data quality and SLA constraints are met', () => {
    const valid_input = {
      month_year: '2024-01',
      forecast_data: {
        predicted_demand: [100, 150, 160, 200, 180, 210, 220, 190, 205, 210, 200, 170],
        category: 'vegetables',
      },
      actual_data: {
        sales_actual: [95, 155, 160, 195, 185, 215, 185, 225, 200, 205, 198, 175],
        inventory_change: [5, 8, 9, 12, 10, 11, 15, 9, 8, 11, 6, 8],
      },
      timestamp_start: new Date('2024-01-01T09:00:00Z').toISOString(),
      timestamp_sla_limit_ms: 5 * 60 * 1000,
    };

    const valid_data_count = valid_input.forecast_data.predicted_demand.filter((v) => v !== null).length;
    const valid_data_rate = (valid_data_count / valid_input.forecast_data.predicted_demand.length) * 100;
    expect(valid_data_rate).toBeGreaterThanOrEqual(100);

    const result = validateMonthlyForecastCycle(valid_input);

    expect(result).toHaveProperty('cycle_status');
    expect(result.cycle_status).toBe('completed');
    expect(result).toHaveProperty('verification_results');
    expect(result.verification_results).toHaveProperty('accuracy_rate');
    expect(result.verification_results.accuracy_rate).toBeGreaterThanOrEqual(0);
    expect(result.verification_results.accuracy_rate).toBeLessThanOrEqual(100);
  });

  test('should calculate forecast accuracy and deviation correctly when all data is valid', () => {
    const complete_input = {
      month_year: '2024-01',
      forecast_data: {
        predicted_demand: [100, 150, 160, 200, 180, 210, 220, 190, 205, 210, 200, 170],
        category: 'vegetables',
      },
      actual_data: {
        sales_actual: [105, 148, 162, 198, 182, 208, 218, 192, 203, 212, 199, 172],
        inventory_change: [5, 8, 9, 12, 10, 11, 15, 9, 8, 11, 6, 8],
      },
      timestamp_start: new Date('2024-01-01T09:00:00Z').toISOString(),
      timestamp_sla_limit_ms: 5 * 60 * 1000,
    };

    const result = validateMonthlyForecastCycle(complete_input);

    const absolute_deviations = complete_input.forecast_data.predicted_demand.map(
      (pred, idx) => Math.abs(pred - complete_input.actual_data.sales_actual[idx])
    );
    const mean_absolute_error = absolute_deviations.reduce((a, b) => a + b, 0) / absolute_deviations.length;
    const accuracy_percentage = Math.max(0, 100 - (mean_absolute_error / 200) * 100);

    expect(result.verification_results.accuracy_rate).toBeCloseTo(accuracy_percentage, 1);
    expect(result.verification_results).toHaveProperty('deviation_analysis');
    expect(Array.isArray(result.verification_results.deviation_analysis)).toBe(true);
  });

  test('should log exception details when verification flow is interrupted', () => {
    const interrupted_input = {
      month_year: '2024-01',
      forecast_data: {
        predicted_demand: [null, null, null, null, null, null, null, null, null, null, null, null],
        category: 'vegetables',
      },
      actual_data: {
        sales_actual: [95, 155, 160, 195, 185, 215, 185, 225, 200, 205, 198, 175],
        inventory_change: [5, 8, 9, 12, 10, 11, 15, 9, 8, 11, 6, 8],
      },
      timestamp_start: new Date('2024-01-01T09:00:00Z').toISOString(),
      timestamp_sla_limit_ms: 5 * 60 * 1000,
    };

    const missing_rate = 100;
    expect(missing_rate).toBeGreaterThan(30);

    expect(() => validateMonthlyForecastCycle(interrupted_input)).toThrow(/品質基準/);
  });

  test('should reject input when data quality threshold is below 70 percent', () => {
    const threshold_breach_input = {
      month_year: '2024-01',
      forecast_data: {
        predicted_demand: [null, null, null, null, 180, 210, 220, 190, null, 210, 200, 170],
        category: 'vegetables',
      },
      actual_data: {
        sales_actual: [95, 155, 160, 195, 185, 215, 185, 225, 200, 205, 198, 175],
        inventory_change: [5, 8, 9, 12, 10, 11, 15, 9, 8, 11, 6, 8],
      },
      timestamp_start: new Date('2024-01-01T09:00:00Z').toISOString(),
      timestamp_sla_limit_ms: 5 * 60 * 1000,
    };

    const valid_forecast_count = threshold_breach_input.forecast_data.predicted_demand.filter(
      (v) => v !== null
    ).length;
    const quality_rate = (valid_forecast_count / threshold_breach_input.forecast_data.predicted_demand.length) * 100;
    expect(quality_rate).toBeLessThan(70);

    expect(() => validateMonthlyForecastCycle(threshold_breach_input)).toThrow(/品質/);
  });
});