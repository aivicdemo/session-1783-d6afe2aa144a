import { integrateExternalDataSources } from '../../src/logic/it-1-br-6-3-1';

const fetchMock = require('jest-fetch-mock');

describe('External Data Source Automatic Integration', () => {
  test('SCEN-267: External data sources are automatically collected and integrated into demand forecast model', async () => {
    fetchMock.resetMocks();

    // Mock weather API response
    const weatherData = {
      timestamp: '2024-01-15T09:00:00Z',
      temperature: 15.5,
      precipitation: 2.3,
      weather_condition: 'rainy',
      confidence_score: 95,
    };
    fetchMock.mockResponseOnce(JSON.stringify(weatherData), { status: 200 });

    // Mock event information API response
    const eventData = {
      timestamp: '2024-01-15T09:00:00Z',
      events: [
        {
          event_id: 'EVT-001',
          event_name: 'Winter Sale',
          event_date: '2024-01-20',
          impact_category: 'promotional',
          confidence_score: 88,
        },
        {
          event_id: 'EVT-002',
          event_name: 'National Holiday',
          event_date: '2024-01-22',
          impact_category: 'holiday',
          confidence_score: 100,
        },
      ],
    };
    fetchMock.mockResponseOnce(JSON.stringify(eventData), { status: 200 });

    // Mock competitor store tactics API response
    const competitorData = {
      timestamp: '2024-01-15T09:00:00Z',
      competitor_tactics: [
        {
          competitor_id: 'COMP-001',
          tactic_type: 'price_discount',
          discount_rate: 0.2,
          target_categories: ['frozen_food', 'vegetables'],
          confidence_score: 92,
        },
        {
          competitor_id: 'COMP-002',
          tactic_type: 'bundle_promotion',
          promotion_name: 'Weekly Bundle',
          confidence_score: 85,
        },
      ],
    };
    fetchMock.mockResponseOnce(JSON.stringify(competitorData), { status: 200 });

    // Input configuration for external data source integration
    const integrationConfig = {
      weather_api_url: 'https://weather-api.example.com/current',
      event_info_api_url: 'https://event-api.example.com/upcoming',
      competitor_tactics_api_url: 'https://competitor-api.example.com/tactics',
      collection_interval_seconds: 3600,
      data_validation_enabled: true,
      error_handling_mode: 'continue_with_last_valid',
      timestamp: '2024-01-15T09:00:00Z',
    };

    // Execute integration
    const result = await integrateExternalDataSources(integrationConfig);

    // Verify scheduled collection is configured
    expect(result.collection_schedule_configured).toBe(true);
    expect(result.collection_interval_seconds).toBe(3600);

    // Verify weather data retrieval
    expect(result.weather_data).toBeDefined();
    expect(result.weather_data.temperature).toBe(15.5);
    expect(result.weather_data.precipitation).toBe(2.3);
    expect(result.weather_data.weather_condition).toBe('rainy');
    expect(result.weather_data.confidence_score).toBe(95);
    expect(result.weather_data.data_status).toBe('valid');

    // Verify event information retrieval
    expect(result.event_data).toBeDefined();
    expect(result.event_data.events).toHaveLength(2);
    expect(result.event_data.events[0]).toEqual({
      event_id: 'EVT-001',
      event_name: 'Winter Sale',
      event_date: '2024-01-20',
      impact_category: 'promotional',
      confidence_score: 88,
      data_status: 'valid',
    });
    expect(result.event_data.events[1]).toEqual({
      event_id: 'EVT-002',
      event_name: 'National Holiday',
      event_date: '2024-01-22',
      impact_category: 'holiday',
      confidence_score: 100,
      data_status: 'valid',
    });

    // Verify competitor tactics data retrieval
    expect(result.competitor_data).toBeDefined();
    expect(result.competitor_data.competitor_tactics).toHaveLength(2);
    expect(result.competitor_data.competitor_tactics[0]).toEqual({
      competitor_id: 'COMP-001',
      tactic_type: 'price_discount',
      discount_rate: 0.2,
      target_categories: ['frozen_food', 'vegetables'],
      confidence_score: 92,
      data_status: 'valid',
    });
    expect(result.competitor_data.competitor_tactics[1]).toEqual({
      competitor_id: 'COMP-002',
      tactic_type: 'bundle_promotion',
      promotion_name: 'Weekly Bundle',
      confidence_score: 85,
      data_status: 'valid',
    });

    // Verify data integration into model input variables
    expect(result.model_input_variables_integrated).toBe(true);
    expect(result.integrated_variables).toEqual({
      weather_temperature: 15.5,
      weather_precipitation: 2.3,
      weather_condition_encoded: 'rainy',
      event_count_current_period: 2,
      event_impact_weights: {
        promotional: 0.88,
        holiday: 1.0,
      },
      competitor_discount_pressure: 0.2,
      competitor_tactic_count: 2,
      data_fusion_timestamp: '2024-01-15T09:00:00Z',
    });

    // Verify data validation
    expect(result.data_validation_completed).toBe(true);
    expect(result.validation_results).toEqual({
      weather_data_valid: true,
      event_data_valid: true,
      competitor_data_valid: true,
      missing_values_handled: false,
      data_type_consistency: true,
      confidence_threshold_met: true,
    });

    // Verify API call counts
    expect(fetchMock.calls()).toHaveLength(3);

    // Verify demand forecast model receives integrated data
    expect(result.forecast_model_updated).toBe(true);
    expect(result.forecast_generation_triggered).toBe(true);

    // Verify continuous operation tracking
    expect(result.continuous_operation_duration_hours).toBeGreaterThanOrEqual(24);
    expect(result.auto_collection_cycles_completed).toBeGreaterThanOrEqual(24);

    // Verify error handling capability
    expect(result.error_handling_configured).toBe(true);
    expect(result.error_handling_mode).toBe('continue_with_last_valid');
    expect(result.fallback_to_previous_data_enabled).toBe(true);

    // Verify logging
    expect(result.logging_enabled).toBe(true);
    expect(result.integration_log_entries).toBeGreaterThan(0);
    expect(result.last_successful_collection_timestamp).toBe('2024-01-15T09:00:00Z');

    // Verify successful completion status
    expect(result.integration_status).toBe('success');
    expect(result.all_data_sources_operational).toBe(true);
    expect(result.system_stability_maintained).toBe(true);
  });
});