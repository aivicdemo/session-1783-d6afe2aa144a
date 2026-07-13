import { correlateExternalFactorsWithAccuracyDecline } from "../../src/logic/it-2-br-6-3-2";

describe("外部データと実績需要の相関分析・変数抽出機能", () => {
  // SCEN-289: [error] 予測精度低下要因と外部要因の相関判定 - 外部データソース連携が同期失敗状態の場合にエラーが発生する
  test("should throw error with EXTERNAL_DATASOURCE_SYNC_ERR when external data source is in sync failure state", () => {
    const accuracyDeclineFactorId = "factor_001";
    const externalDataSourceId = "eds_weather_001";
    const syncFailureReason = "Connection timeout to weather API";
    const syncFailureTimestamp = new Date("2024-01-15T14:30:00Z");

    const correlationInput = {
      accuracyDeclineFactorId,
      externalDataSourceId,
      syncStatus: "SYNC_FAILED" as const,
      syncFailureReason,
      syncFailureTimestamp,
      dataSourceName: "WeatherDataAPI",
      correlationThreshold: 0.65,
      analysisStartDate: new Date("2024-01-01T00:00:00Z"),
      analysisEndDate: new Date("2024-01-31T23:59:59Z"),
    };

    expect(() =>
      correlateExternalFactorsWithAccuracyDecline(correlationInput)
    ).toThrow(/外部データソース同期失敗/);
  });

  test("should include error code EXTERNAL_DATASOURCE_SYNC_ERR in thrown error message", () => {
    const accuracyDeclineFactorId = "factor_002";
    const externalDataSourceId = "eds_market_001";
    const syncFailureReason = "Invalid authentication credentials";
    const syncFailureTimestamp = new Date("2024-01-16T09:15:00Z");

    const correlationInput = {
      accuracyDeclineFactorId,
      externalDataSourceId,
      syncStatus: "SYNC_FAILED" as const,
      syncFailureReason,
      syncFailureTimestamp,
      dataSourceName: "MarketTrendDataAPI",
      correlationThreshold: 0.60,
      analysisStartDate: new Date("2024-01-08T00:00:00Z"),
      analysisEndDate: new Date("2024-01-14T23:59:59Z"),
    };

    try {
      correlateExternalFactorsWithAccuracyDecline(correlationInput);
      fail("Expected error to be thrown");
    } catch (error: any) {
      expect(error.message).toContain("EXTERNAL_DATASOURCE_SYNC_ERR");
      expect(error.errorCode).toBe("EXTERNAL_DATASOURCE_SYNC_ERR");
    }
  });

  test("should include data source name and sync failure timestamp in error details", () => {
    const accuracyDeclineFactorId = "factor_003";
    const externalDataSourceId = "eds_competitor_001";
    const syncFailureReason = "Database connection pool exhausted";
    const syncFailureTimestamp = new Date("2024-01-17T11:45:30Z");
    const dataSourceName = "CompetitorStrategyDataDB";

    const correlationInput = {
      accuracyDeclineFactorId,
      externalDataSourceId,
      syncStatus: "SYNC_FAILED" as const,
      syncFailureReason,
      syncFailureTimestamp,
      dataSourceName,
      correlationThreshold: 0.70,
      analysisStartDate: new Date("2024-01-10T00:00:00Z"),
      analysisEndDate: new Date("2024-01-16T23:59:59Z"),
    };

    try {
      correlateExternalFactorsWithAccuracyDecline(correlationInput);
      fail("Expected error to be thrown");
    } catch (error: any) {
      expect(error.errorDetails).toBeDefined();
      expect(error.errorDetails.dataSourceName).toBe(dataSourceName);
      expect(error.errorDetails.syncFailureTimestamp).toEqual(syncFailureTimestamp);
      expect(error.errorDetails.syncFailureReason).toBe(syncFailureReason);
    }
  });

  test("should record sync failure details in error log", () => {
    const accuracyDeclineFactorId = "factor_004";
    const externalDataSourceId = "eds_event_001";
    const syncFailureReason = "Network unreachable";
    const syncFailureTimestamp = new Date("2024-01-18T16:20:00Z");
    const dataSourceName = "EventManagementAPI";

    const correlationInput = {
      accuracyDeclineFactorId,
      externalDataSourceId,
      syncStatus: "SYNC_FAILED" as const,
      syncFailureReason,
      syncFailureTimestamp,
      dataSourceName,
      correlationThreshold: 0.65,
      analysisStartDate: new Date("2024-01-15T00:00:00Z"),
      analysisEndDate: new Date("2024-01-21T23:59:59Z"),
    };

    try {
      correlateExternalFactorsWithAccuracyDecline(correlationInput);
      fail("Expected error to be thrown");
    } catch (error: any) {
      expect(error.errorLog).toBeDefined();
      expect(error.errorLog).toContain(dataSourceName);
      expect(error.errorLog).toContain(syncFailureTimestamp.toISOString());
    }
  });

  test("should prevent processing and return halted state when sync fails", () => {
    const accuracyDeclineFactorId = "factor_005";
    const externalDataSourceId = "eds_weather_002";
    const syncFailureReason = "Service temporarily unavailable";
    const syncFailureTimestamp = new Date("2024-01-19T13:00:00Z");

    const correlationInput = {
      accuracyDeclineFactorId,
      externalDataSourceId,
      syncStatus: "SYNC_FAILED" as const,
      syncFailureReason,
      syncFailureTimestamp,
      dataSourceName: "WeatherDataService",
      correlationThreshold: 0.65,
      analysisStartDate: new Date("2024-01-12T00:00:00Z"),
      analysisEndDate: new Date("2024-01-18T23:59:59Z"),
    };

    try {
      correlateExternalFactorsWithAccuracyDecline(correlationInput);
      fail("Expected error to be thrown");
    } catch (error: any) {
      expect(error.processingStatus).toBe("HALTED");
      expect(error.requiresAdminNotification).toBe(true);
    }
  });
});