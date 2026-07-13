import { generateDemandPatternReport } from "../../src/logic/it-1-br-6-3-1";

describe("外部データソース自動連携と統合 - 需要パターン定量化レポート生成", () => {
  // SCEN-236: [error] 需要パターン定量化レポート生成機能 - 外部データが欠落している場合、レポート生成がエラーとなる
  test("外部データが欠落している場合、エラーメッセージと例外がスローされる", () => {
    const reportParams = {
      period_start_date: "2024-01-01",
      period_end_date: "2024-01-31",
      product_id: "P00001",
      report_type: "seasonal_demand_analysis",
      external_data_sources: [
        {
          source_name: "weather_api",
          is_connected: false,
          last_sync_timestamp: null,
        },
        {
          source_name: "competitor_price_data",
          is_connected: true,
          last_sync_timestamp: "2024-01-15T10:00:00Z",
        },
        {
          source_name: "sns_trend_data",
          is_connected: false,
          last_sync_timestamp: null,
        },
      ],
    };

    const expectedErrorPattern = /外部データ/;
    const missingDataSources = ["weather_api", "sns_trend_data"];

    expect(() => generateDemandPatternReport(reportParams)).toThrow(
      expectedErrorPattern
    );

    const errorCheckParams = {
      period_start_date: "2024-01-01",
      period_end_date: "2024-01-31",
      product_id: "P00001",
      report_type: "seasonal_demand_analysis",
      external_data_sources: [
        {
          source_name: "weather_api",
          is_connected: false,
          last_sync_timestamp: null,
        },
      ],
    };

    expect(() => generateDemandPatternReport(errorCheckParams)).toThrow(
      /weather_api/
    );
  });

  test("すべての外部データが接続されている場合、レポート生成に成功する", () => {
    const reportParams = {
      period_start_date: "2024-01-01",
      period_end_date: "2024-01-31",
      product_id: "P00001",
      report_type: "seasonal_demand_analysis",
      external_data_sources: [
        {
          source_name: "weather_api",
          is_connected: true,
          last_sync_timestamp: "2024-01-15T10:00:00Z",
        },
        {
          source_name: "competitor_price_data",
          is_connected: true,
          last_sync_timestamp: "2024-01-15T09:30:00Z",
        },
        {
          source_name: "sns_trend_data",
          is_connected: true,
          last_sync_timestamp: "2024-01-15T08:00:00Z",
        },
      ],
    };

    const result = generateDemandPatternReport(reportParams);

    expect(result).toBeDefined();
    expect(result.report_id).toBeDefined();
    expect(result.period_start_date).toBe("2024-01-01");
    expect(result.period_end_date).toBe("2024-01-31");
    expect(result.product_id).toBe("P00001");
    expect(result.report_type).toBe("seasonal_demand_analysis");
    expect(result.status).toBe("success");
    expect(result.data_sources_used).toContain("weather_api");
    expect(result.data_sources_used).toContain("competitor_price_data");
    expect(result.data_sources_used).toContain("sns_trend_data");
    expect(result.generation_timestamp).toBeDefined();
  });

  test("一部の外部データが欠落している場合、欠落データソース名を含むエラーメッセージがスローされる", () => {
    const reportParams = {
      period_start_date: "2024-02-01",
      period_end_date: "2024-02-28",
      product_id: "P00002",
      report_type: "weekly_demand_analysis",
      external_data_sources: [
        {
          source_name: "weather_api",
          is_connected: true,
          last_sync_timestamp: "2024-02-15T10:00:00Z",
        },
        {
          source_name: "competitor_price_data",
          is_connected: false,
          last_sync_timestamp: null,
        },
      ],
    };

    expect(() => generateDemandPatternReport(reportParams)).toThrow(
      /competitor_price_data/
    );
  });

  test("外部データソースがすべて未接続の場合、複数のデータソース名を含むエラーメッセージがスローされる", () => {
    const reportParams = {
      period_start_date: "2024-03-01",
      period_end_date: "2024-03-31",
      product_id: "P00003",
      report_type: "category_demand_analysis",
      external_data_sources: [
        {
          source_name: "weather_api",
          is_connected: false,
          last_sync_timestamp: null,
        },
        {
          source_name: "competitor_price_data",
          is_connected: false,
          last_sync_timestamp: null,
        },
        {
          source_name: "sns_trend_data",
          is_connected: false,
          last_sync_timestamp: null,
        },
      ],
    };

    expect(() => generateDemandPatternReport(reportParams)).toThrow(
      /外部データ/
    );
  });
});