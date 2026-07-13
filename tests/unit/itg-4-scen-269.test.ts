import { externalDataSourceIntegration } from "../../src/logic/it-1-br-6-3-1";

describe("External Data Source Integration with Cache Fallback", () => {
  // SCEN-269
  test("should use cached data when external API times out and complete forecast/inventory optimization", async () => {
    const cached_weather_data = {
      date: "2024-01-15",
      temperature: 18,
      precipitation: 0,
      wind_speed: 5,
      cached_at: "2024-01-15T08:00:00Z",
      source: "cache",
    };

    const cached_event_data = {
      event_id: "evt_001",
      event_name: "Winter Sale",
      event_start: "2024-01-15",
      event_end: "2024-01-20",
      impact_category: "sales_promotion",
      cached_at: "2024-01-15T08:00:00Z",
      source: "cache",
    };

    const cached_competitor_data = {
      competitor_id: "comp_001",
      competitor_name: "SuperMart A",
      campaign_type: "price_discount",
      discount_rate: 15,
      campaign_start: "2024-01-15",
      campaign_end: "2024-01-17",
      cached_at: "2024-01-15T08:00:00Z",
      source: "cache",
    };

    const input_params = {
      external_data_source_id: "eds_001",
      timeout_milliseconds: 1000,
      cache_available: true,
      cached_weather: cached_weather_data,
      cached_events: [cached_event_data],
      cached_competitor_tactics: [cached_competitor_data],
      user_id: "user_001",
      analysis_date: "2024-01-15",
    };

    const result = await externalDataSourceIntegration(input_params);

    expect(result.integration_status).toBe("completed_with_cache_fallback");
    expect(result.data_source_used).toBe("cache");
    expect(result.timeout_occurred).toBe(true);
    expect(result.weather_data).toEqual(cached_weather_data);
    expect(result.event_data).toEqual([cached_event_data]);
    expect(result.competitor_data).toEqual([cached_competitor_data]);
    expect(result.forecast_completed).toBe(true);
    expect(result.inventory_optimization_completed).toBe(true);
    expect(result.user_notification).toBe(
      "Processing completed using cached data due to external source timeout"
    );
    expect(result.notification_indicator_type).toBe("cache_fallback_warning");
    expect(result.system_log_entries).toContainEqual(
      expect.objectContaining({
        timestamp: expect.any(String),
        log_level: "WARN",
        event_type: "EXTERNAL_DATA_TIMEOUT",
        message: expect.stringMatching(/タイムアウト発生/),
      })
    );
    expect(result.system_log_entries).toContainEqual(
      expect.objectContaining({
        timestamp: expect.any(String),
        log_level: "INFO",
        event_type: "CACHE_DATA_USED",
        message: expect.stringMatching(/キャッシュデータ使用/),
      })
    );
    expect(result.forecast_result_summary.demand_forecast_value).toBe(245);
    expect(result.inventory_optimization_summary.recommended_stock_level).toBe(
      180
    );
    expect(result.cache_data_age_seconds).toBeLessThan(3600);
    expect(result.recovery_status).toBe("ready_for_normal_operation");
  });
});