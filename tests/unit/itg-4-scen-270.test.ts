import { integrateExternalDataSources } from "../../src/logic/it-1-br-6-3-1";

describe("外部データソース（気象API、イベント情報、競合店舗施策データ）との自動連携と統合", () => {
  // SCEN-270: [error] 外部データソース自動連携・統合 - 必須の外部データソースが利用不可の場合、連携エラーを記録し処理を中止する
  test("SCEN-270: 必須の外部データソースが利用不可の場合、エラーログを記録し処理を中止する", async () => {
    const fetchMock = require("jest-fetch-mock");
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    const requiredDataSourcesInput = {
      weather_api_url: "https://weather-api.example.com/forecast",
      market_database_url: "https://market-db.example.com/prices",
      competitor_api_url: "https://competitor-data.example.com/strategies",
      request_timeout_ms: 5000,
      execution_timestamp: new Date("2024-02-15T14:30:00Z"),
      user_id: "user_20240215_001",
    };

    // 必須の外部データソースを利用不可状態に設定（タイムアウト）
    fetchMock.mockRejectOnce(
      new Error("Connection timeout: weather-api.example.com")
    );

    const result = await integrateExternalDataSources(
      requiredDataSourcesInput
    );

    // エラーログの記録を確認
    expect(result.integration_status).toBe("FAILED");
    expect(result.error_code).toBe("DATASOURCE_CONNECTION_ERROR");
    expect(result.error_message).toMatch(/weather-api/);
    expect(result.error_message).toMatch(/Connection timeout/);

    // エラーログにタイムスタンプ、データソース名、エラー内容が含まれることを確認
    expect(result.error_log).toBeDefined();
    expect(result.error_log.timestamp).toBe("2024-02-15T14:30:00Z");
    expect(result.error_log.datasource_name).toBe("weather_api");
    expect(result.error_log.error_details).toMatch(/Connection timeout/);

    // 依存するダウンストリーム処理が中止されていることを確認
    expect(result.downstream_processing_status).toBe("STOPPED");
    expect(result.inventory_calculation_executed).toBe(false);
    expect(result.demand_forecast_executed).toBe(false);

    // ユーザー通知が生成されていることを確認
    expect(result.user_notification).toBeDefined();
    expect(result.user_notification.notification_type).toBe("ERROR");
    expect(result.user_notification.message).toMatch(/データソース連携エラー/);
    expect(result.user_notification.user_id).toBe("user_20240215_001");
    expect(result.user_notification.severity).toBe("HIGH");

    // システムが安全な状態に遷移していることを確認
    expect(result.system_state).toBe("SAFE");
    expect(result.rollback_executed).toBe(true);

    fetchMock.disableMocks();
  });
});