import { integrateExternalDataWithDefaults } from "../../src/logic/it-1-br-6-2-1-1";

describe("外部要因データ自動取得・統合機能", () => {
  // SCEN-461
  test("外部データソース連携の同期状態がNULLまたは未定義の場合にデフォルト値が適用される", () => {
    // ========== 1. NULL 同期状態のテスト ==========
    const external_data_source_null = {
      source_id: "weather_001",
      source_name: "Weather API",
      sync_status: null,
      last_sync_at: "2024-01-15T10:00:00Z",
      data_quality_score: 85,
    };

    const result_null = integrateExternalDataWithDefaults(external_data_source_null);

    // デフォルト値が適用されること
    expect(result_null).toEqual({
      source_id: "weather_001",
      source_name: "Weather API",
      sync_status: "DEFAULT",
      last_sync_at: "2024-01-15T10:00:00Z",
      data_quality_score: 85,
      default_values_applied: true,
      error_log: expect.any(String),
    });

    // エラーログが記録されること
    expect(result_null.error_log).toMatch(/同期状態/);
    expect(result_null.error_log).toMatch(/NULL/);

    // ========== 2. undefined 同期状態のテスト ==========
    const external_data_source_undefined = {
      source_id: "event_001",
      source_name: "Event API",
      sync_status: undefined,
      last_sync_at: "2024-01-15T11:00:00Z",
      data_quality_score: 90,
    };

    const result_undefined = integrateExternalDataWithDefaults(
      external_data_source_undefined
    );

    // デフォルト値が適用されること
    expect(result_undefined).toEqual({
      source_id: "event_001",
      source_name: "Event API",
      sync_status: "DEFAULT",
      last_sync_at: "2024-01-15T11:00:00Z",
      data_quality_score: 90,
      default_values_applied: true,
      error_log: expect.any(String),
    });

    // エラーログが記録されること
    expect(result_undefined.error_log).toMatch(/同期状態/);
    expect(result_undefined.error_log).toMatch(/未定義/);

    // ========== 3. 正常な同期状態のテスト（対比） ==========
    const external_data_source_normal = {
      source_id: "competitor_001",
      source_name: "Competitor API",
      sync_status: "SYNCED",
      last_sync_at: "2024-01-15T12:00:00Z",
      data_quality_score: 88,
    };

    const result_normal = integrateExternalDataWithDefaults(
      external_data_source_normal
    );

    // デフォルト値が適用されないこと
    expect(result_normal).toEqual({
      source_id: "competitor_001",
      source_name: "Competitor API",
      sync_status: "SYNCED",
      last_sync_at: "2024-01-15T12:00:00Z",
      data_quality_score: 88,
      default_values_applied: false,
      error_log: "",
    });

    // エラーログが記録されないこと
    expect(result_normal.error_log).toBe("");
  });
});