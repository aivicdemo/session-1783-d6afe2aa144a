import { fetchExternalFactorData, integrateExternalFactorData } from "../../src/logic/it-1-br-6-2-1-1";

describe("外部要因データ自動取得・統合機能", () => {
  // SCEN-459
  test("月次需要予測検証サイクルで気象API・イベント情報・競合店舗施策が定期自動取得され、モデル入力変数として統合される", () => {
    const cycle_start_date = new Date("2024-01-01T00:00:00Z");
    const cycle_end_date = new Date("2024-01-31T23:59:59Z");
    const trigger_time = new Date("2024-02-01T09:00:00Z");

    const weather_api_response = {
      source: "weather_api",
      data: [
        {
          date: "2024-01-15",
          temperature: 12.5,
          humidity: 65,
          precipitation: 2.3,
          confidence_score: 92,
        },
        {
          date: "2024-01-22",
          temperature: 8.0,
          humidity: 72,
          precipitation: 5.1,
          confidence_score: 88,
        },
      ],
      retrieved_at: "2024-02-01T09:15:00Z",
      status: "success",
    };

    const event_info_response = {
      source: "event_info",
      data: [
        {
          event_id: "evt_001",
          event_name: "正月セール",
          event_type: "sale",
          start_date: "2024-01-01",
          end_date: "2024-01-15",
          store_count: 45,
          confidence_score: 95,
        },
        {
          event_id: "evt_002",
          event_name: "バレンタイン準備フェア",
          event_type: "campaign",
          start_date: "2024-01-20",
          end_date: "2024-02-14",
          store_count: 38,
          confidence_score: 90,
        },
      ],
      retrieved_at: "2024-02-01T09:20:00Z",
      status: "success",
    };

    const competitor_strategy_response = {
      source: "competitor_strategy",
      data: [
        {
          store_id: "comp_store_001",
          strategy_type: "discount",
          target_category: "vegetables",
          discount_rate: 15,
          campaign_period_start: "2024-01-10",
          campaign_period_end: "2024-01-31",
          confidence_score: 88,
        },
        {
          store_id: "comp_store_002",
          strategy_type: "bundling",
          target_category: "dairy",
          bundle_discount_rate: 12,
          campaign_period_start: "2024-01-15",
          campaign_period_end: "2024-02-05",
          confidence_score: 85,
        },
      ],
      retrieved_at: "2024-02-01T09:25:00Z",
      status: "success",
    };

    const fetch_result = fetchExternalFactorData({
      cycle_id: "monthly_cycle_2024_01",
      cycle_period_start: cycle_start_date,
      cycle_period_end: cycle_end_date,
      trigger_datetime: trigger_time,
      data_sources: [
        {
          source_type: "weather_api",
          endpoint: "https://api.weather.example.com/monthly",
          timeout_sec: 30,
        },
        {
          source_type: "event_info",
          endpoint: "https://api.event.example.com/active",
          timeout_sec: 30,
        },
        {
          source_type: "competitor_strategy",
          endpoint: "https://api.competitor.example.com/strategies",
          timeout_sec: 30,
        },
      ],
    });

    expect(fetch_result).toEqual({
      cycle_id: "monthly_cycle_2024_01",
      fetch_status: "success",
      fetched_at: expect.any(String),
      data_sources_fetched: 3,
      weather_data: expect.arrayContaining([
        expect.objectContaining({
          date: expect.any(String),
          temperature: expect.any(Number),
          confidence_score: expect.any(Number),
        }),
      ]),
      event_data: expect.arrayContaining([
        expect.objectContaining({
          event_id: expect.any(String),
          event_type: expect.any(String),
          confidence_score: expect.any(Number),
        }),
      ]),
      competitor_data: expect.arrayContaining([
        expect.objectContaining({
          store_id: expect.any(String),
          strategy_type: expect.any(String),
          confidence_score: expect.any(Number),
        }),
      ]),
      data_quality_check: {
        missing_values: 0,
        duplicate_records: 0,
        validation_passed: true,
      },
    });

    const integration_result = integrateExternalFactorData({
      cycle_id: "monthly_cycle_2024_01",
      fetched_data: {
        weather: weather_api_response.data,
        events: event_info_response.data,
        competitor_strategies: competitor_strategy_response.data,
      },
      target_model_version: "demand_forecast_v2_3",
      integration_rules: {
        weather_aggregation: "daily_average",
        event_weighting_strategy: "confidence_based",
        competitor_strategy_merge: "union",
      },
    });

    expect(integration_result).toEqual({
      cycle_id: "monthly_cycle_2024_01",
      integration_status: "success",
      integrated_at: expect.any(String),
      model_input_variables: {
        weather_features: {
          count: 2,
          avg_temperature: 10.25,
          avg_humidity: 68.5,
          avg_precipitation: 3.7,
          min_confidence: 88,
        },
        event_features: {
          count: 2,
          active_events: 2,
          avg_confidence: 92.5,
          event_types: ["sale", "campaign"],
        },
        competitor_features: {
          count: 2,
          active_strategies: 2,
          avg_discount_rate: 13.5,
          min_confidence: 85,
        },
      },
      data_consistency: {
        no_duplicates: true,
        no_missing_values: true,
        date_range_aligned: true,
      },
      prediction_readiness: {
        ready_for_forecast: true,
        input_variables_complete: true,
        quality_threshold_met: true,
      },
    });

    expect(integration_result.model_input_variables.weather_features.count).toBe(
      2
    );
    expect(
      integration_result.model_input_variables.weather_features.avg_temperature
    ).toBe(10.25);
    expect(
      integration_result.model_input_variables.event_features.avg_confidence
    ).toBe(92.5);
    expect(
      integration_result.model_input_variables.competitor_features.avg_discount_rate
    ).toBe(13.5);
    expect(integration_result.data_consistency.no_duplicates).toBe(true);
    expect(integration_result.data_consistency.no_missing_values).toBe(true);
    expect(integration_result.prediction_readiness.ready_for_forecast).toBe(
      true
    );

    const second_cycle_result = fetchExternalFactorData({
      cycle_id: "monthly_cycle_2024_02",
      cycle_period_start: new Date("2024-02-01T00:00:00Z"),
      cycle_period_end: new Date("2024-02-29T23:59:59Z"),
      trigger_datetime: new Date("2024-03-01T09:00:00Z"),
      data_sources: [
        {
          source_type: "weather_api",
          endpoint: "https://api.weather.example.com/monthly",
          timeout_sec: 30,
        },
        {
          source_type: "event_info",
          endpoint: "https://api.event.example.com/active",
          timeout_sec: 30,
        },
        {
          source_type: "competitor_strategy",
          endpoint: "https://api.competitor.example.com/strategies",
          timeout_sec: 30,
        },
      ],
    });

    expect(second_cycle_result.fetch_status).toBe("success");
    expect(second_cycle_result.data_sources_fetched).toBe(3);
    expect(second_cycle_result.data_quality_check.validation_passed).toBe(true);
    expect(second_cycle_result.cycle_id).toBe("monthly_cycle_2024_02");
  });
});