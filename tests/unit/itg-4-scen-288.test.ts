import { extractPredictionAccuracyFactorsWithExternalCorrelation } from '../../src/logic/it-2-br-6-3-2';

describe('外部データと実績需要の相関分析・変数抽出機能', () => {
  // SCEN-288: [normal] 予測精度低下要因と外部要因の相関判定 - 複数の外部要因（気象・イベント・競合施策）が同時に精度低下に影響している場合にすべてが抽出される
  test('複数の外部要因が同時に存在する場合、すべての要因を正確に抽出し相関係数と寄与度を計算する', () => {
    const test_period_start = '2024-01-01';
    const test_period_end = '2024-01-31';
    const forecast_accuracy_previous_month = 0.92;
    const forecast_accuracy_current_month = 0.82;
    const accuracy_decline_rate = (forecast_accuracy_previous_month - forecast_accuracy_current_month) / forecast_accuracy_previous_month;

    const weather_factor_input = {
      external_factor_id: 'weather_001',
      factor_type: 'weather',
      factor_name: '降雨',
      measurement_period_start: test_period_start,
      measurement_period_end: test_period_end,
      weather_condition: 'heavy_rain',
      occurrence_days: 8,
      correlation_coefficient: 0.78,
      reliability_score: 95,
    };

    const event_factor_input = {
      external_factor_id: 'event_001',
      factor_type: 'event',
      factor_name: '大型セール',
      measurement_period_start: test_period_start,
      measurement_period_end: test_period_end,
      event_category: 'large_sale',
      event_duration_days: 7,
      correlation_with_forecast_error: 0.65,
      reliability_score: 88,
    };

    const competitor_factor_input = {
      external_factor_id: 'competitor_001',
      factor_type: 'competitor_strategy',
      factor_name: '値引きキャンペーン',
      measurement_period_start: test_period_start,
      measurement_period_end: test_period_end,
      strategy_type: 'discount_campaign',
      discount_rate_percent: 15,
      correlation_with_demand_variation: 0.72,
      reliability_score: 92,
    };

    const external_factors = [weather_factor_input, event_factor_input, competitor_factor_input];

    const actual_demand_data = [
      { date: '2024-01-08', actual_quantity: 450, forecasted_quantity: 600, category: 'food_a' },
      { date: '2024-01-15', actual_quantity: 800, forecasted_quantity: 650, category: 'food_b' },
      { date: '2024-01-22', actual_quantity: 520, forecasted_quantity: 700, category: 'food_a' },
    ];

    const predicted_demand_data = [
      { date: '2024-01-08', predicted_quantity: 600, category: 'food_a' },
      { date: '2024-01-15', predicted_quantity: 650, category: 'food_b' },
      { date: '2024-01-22', predicted_quantity: 700, category: 'food_a' },
    ];

    const result = extractPredictionAccuracyFactorsWithExternalCorrelation({
      analysis_period_start: test_period_start,
      analysis_period_end: test_period_end,
      forecast_accuracy_previous_month,
      forecast_accuracy_current_month,
      external_factors,
      actual_demand_records: actual_demand_data,
      predicted_demand_records: predicted_demand_data,
    });

    expect(result.identified_accuracy_decline_factors).toBeDefined();
    expect(result.identified_accuracy_decline_factors.length).toBe(3);

    const extracted_factor_types = result.identified_accuracy_decline_factors.map((f) => f.factor_type);
    expect(extracted_factor_types).toContain('weather');
    expect(extracted_factor_types).toContain('event');
    expect(extracted_factor_types).toContain('competitor_strategy');

    const weather_factor = result.identified_accuracy_decline_factors.find((f) => f.factor_type === 'weather');
    expect(weather_factor).toBeDefined();
    expect(weather_factor!.correlation_coefficient).toBe(0.78);
    expect(weather_factor!.correlation_strength_level).toBe('strong');
    expect(weather_factor!.reliability_score).toBe(95);

    const event_factor = result.identified_accuracy_decline_factors.find((f) => f.factor_type === 'event');
    expect(event_factor).toBeDefined();
    expect(event_factor!.correlation_coefficient).toBe(0.65);
    expect(event_factor!.correlation_strength_level).toBe('medium');
    expect(event_factor!.reliability_score).toBe(88);

    const competitor_factor = result.identified_accuracy_decline_factors.find((f) => f.factor_type === 'competitor_strategy');
    expect(competitor_factor).toBeDefined();
    expect(competitor_factor!.correlation_coefficient).toBe(0.72);
    expect(competitor_factor!.correlation_strength_level).toBe('strong');
    expect(competitor_factor!.reliability_score).toBe(92);

    const weighted_weather_contribution = 0.78 * 0.95;
    const weighted_event_contribution = 0.65 * 0.88;
    const weighted_competitor_contribution = 0.72 * 0.92;
    const total_weighted_contribution = weighted_weather_contribution + weighted_event_contribution + weighted_competitor_contribution;

    const weather_contribution_rate = weighted_weather_contribution / total_weighted_contribution;
    const event_contribution_rate = weighted_event_contribution / total_weighted_contribution;
    const competitor_contribution_rate = weighted_competitor_contribution / total_weighted_contribution;

    expect(result.composite_impact_analysis).toBeDefined();
    expect(result.composite_impact_analysis.combined_impact_degree).toBeCloseTo(0.3787, 4);
    expect(result.composite_impact_analysis.contribution_rates.weather).toBeCloseTo(weather_contribution_rate, 4);
    expect(result.composite_impact_analysis.contribution_rates.event).toBeCloseTo(event_contribution_rate, 4);
    expect(result.composite_impact_analysis.contribution_rates.competitor).toBeCloseTo(competitor_contribution_rate, 4);

    expect(result.analysis_report).toBeDefined();
    expect(result.analysis_report.includes('降雨')).toBe(true);
    expect(result.analysis_report.includes('大型セール')).toBe(true);
    expect(result.analysis_report.includes('値引きキャンペーン')).toBe(true);
    expect(result.analysis_report.includes('0.78')).toBe(true);
    expect(result.analysis_report.includes('0.65')).toBe(true);
    expect(result.analysis_report.includes('0.72')).toBe(true);

    expect(result.accuracy_decline_rate).toBeCloseTo(0.1087, 4);
    expect(result.analysis_status).toBe('completed');
  });
});