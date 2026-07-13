import { extractVariablesFromCorrelationAnalysis } from '../../src/logic/it-2-br-6-3-2';

describe('External Factor Correlation Analysis & Variable Extraction', () => {
  // SCEN-274
  test('should fail variable extraction and log error when correlation analysis data is insufficient', () => {
    const insufficient_sample_count = 4;
    const minimum_required_samples = 30;
    
    const correlation_analysis_input = {
      samples: Array.from({ length: insufficient_sample_count }, (_, i) => ({
        demand_actual: 100 + i * 10,
        weather_temperature: 20 + i,
        event_flag: i % 2 === 0 ? 1 : 0,
        competitor_discount_rate: 0.05 + i * 0.01,
      })),
      analysis_period_start: new Date('2024-01-01T00:00:00Z'),
      analysis_period_end: new Date('2024-01-31T23:59:59Z'),
      minimum_sample_threshold: minimum_required_samples,
    };

    const result = extractVariablesFromCorrelationAnalysis(correlation_analysis_input);

    expect(result.status).toBe('failure');
    expect(result.extracted_variables).toEqual([]);
    expect(result.error_log).toBeDefined();
    expect(result.error_log.error_message).toMatch(/データ不足/);
    expect(result.error_log.actual_sample_count).toBe(insufficient_sample_count);
    expect(result.error_log.required_sample_count).toBe(minimum_required_samples);
    expect(result.error_log.shortage_count).toBe(minimum_required_samples - insufficient_sample_count);
    expect(result.model_proceed_allowed).toBe(false);
    expect(result.user_notification_required).toBe(true);
    expect(result.notification_message).toMatch(/データ補充/);
  });
});