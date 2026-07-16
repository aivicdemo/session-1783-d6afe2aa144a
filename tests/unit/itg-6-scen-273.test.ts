import {
  validateAppUsageLogsDataQuality,
} from "../../src/logic/it-1-br-8-2-2-1";

describe("Data Quality Validation for App Usage Logs", () => {
  // SCEN-273: [normal] データ品質検証機能 - 利用ログに含まれる欠損値・異常値が自動検出される
  test("should automatically detect missing values and anomalous values in app usage logs", () => {
    // Arrange: Test data with normal values, missing values, and anomalous values
    const appUsageLogs = [
      {
        log_id: "log_001",
        user_id: "user_101",
        feature_name: "menu_generation",
        session_duration_seconds: 120,
        timestamp: "2024-01-15T10:30:00Z",
        action_type: "click",
        screen_name: "menu_result",
      },
      {
        log_id: "log_002",
        user_id: "user_102",
        feature_name: "nutrition_dashboard",
        session_duration_seconds: 300,
        timestamp: "2024-01-15T11:00:00Z",
        action_type: "view",
        screen_name: "dashboard_home",
      },
      {
        log_id: "log_003",
        user_id: null, // Missing value: null
        feature_name: "budget_management",
        session_duration_seconds: 45,
        timestamp: "2024-01-15T11:15:00Z",
        action_type: "submit",
        screen_name: "budget_input",
      },
      {
        log_id: "log_004",
        user_id: "user_104",
        feature_name: "", // Missing value: empty string
        session_duration_seconds: 60,
        timestamp: "2024-01-15T11:30:00Z",
        action_type: "click",
        screen_name: "feature_list",
      },
      {
        log_id: "log_005",
        user_id: "user_105",
        feature_name: "inventory_check",
        session_duration_seconds: -50, // Anomalous value: negative duration
        timestamp: "2024-01-15T11:45:00Z",
        action_type: "view",
        screen_name: "inventory_page",
      },
      {
        log_id: "log_006",
        user_id: "user_106",
        feature_name: "price_comparison",
        session_duration_seconds: 99999999, // Anomalous value: unrealistic duration
        timestamp: "2024-01-15T12:00:00Z",
        action_type: "search",
        screen_name: "price_result",
      },
      {
        log_id: "log_007",
        user_id: "user_107",
        feature_name: "demand_forecast",
        session_duration_seconds: null, // Missing value: null
        timestamp: "2024-01-15T12:15:00Z",
        action_type: "export",
        screen_name: "forecast_chart",
      },
      {
        log_id: "log_008",
        user_id: "user_108",
        feature_name: "allergy_management",
        session_duration_seconds: 90,
        timestamp: "invalid-date", // Anomalous value: invalid timestamp format
        action_type: "update",
        screen_name: "allergy_form",
      },
      {
        log_id: "log_009",
        user_id: "user_109",
        feature_name: "meal_record",
        session_duration_seconds: 200,
        timestamp: "2024-01-15T12:45:00Z",
        action_type: undefined, // Missing value: undefined
        screen_name: "record_list",
      },
    ];

    // Act: Execute data quality validation
    const validationResult = validateAppUsageLogsDataQuality(appUsageLogs);

    // Assert: Verify detection of missing values
    expect(validationResult.missing_value_errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          log_row_number: 3,
          column_name: "user_id",
          error_type: "missing_value",
          detected_value: null,
          severity: "error",
        }),
        expect.objectContaining({
          log_row_number: 4,
          column_name: "feature_name",
          error_type: "missing_value",
          detected_value: "",
          severity: "error",
        }),
        expect.objectContaining({
          log_row_number: 7,
          column_name: "session_duration_seconds",
          error_type: "missing_value",
          detected_value: null,
          severity: "error",
        }),
        expect.objectContaining({
          log_row_number: 9,
          column_name: "action_type",
          error_type: "missing_value",
          detected_value: undefined,
          severity: "error",
        }),
      ])
    );

    // Assert: Verify detection count of missing values
    expect(validationResult.missing_value_errors.length).toBe(4);

    // Assert: Verify detection of anomalous values
    expect(validationResult.anomalous_value_errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          log_row_number: 5,
          column_name: "session_duration_seconds",
          error_type: "anomalous_value",
          detected_value: -50,
          validation_rule: "session_duration_seconds >= 0",
          severity: "error",
        }),
        expect.objectContaining({
          log_row_number: 6,
          column_name: "session_duration_seconds",
          error_type: "anomalous_value",
          detected_value: 99999999,
          validation_rule: "session_duration_seconds <= 86400",
          severity: "warning",
        }),
        expect.objectContaining({
          log_row_number: 8,
          column_name: "timestamp",
          error_type: "anomalous_value",
          detected_value: "invalid-date",
          validation_rule: "timestamp must be valid ISO 8601 format",
          severity: "error",
        }),
      ])
    );

    // Assert: Verify detection count of anomalous values
    expect(validationResult.anomalous_value_errors.length).toBe(3);

    // Assert: Verify normal values are not incorrectly detected
    const normal_log_row_numbers_detected = validationResult.missing_value_errors
      .map((e: any) => e.log_row_number)
      .concat(
        validationResult.anomalous_value_errors.map((e: any) => e.log_row_number)
      );
    expect(normal_log_row_numbers_detected).not.toContain(1);
    expect(normal_log_row_numbers_detected).not.toContain(2);

    // Assert: Verify validation logs are recorded
    expect(validationResult.validation_log).toBeDefined();
    expect(validationResult.validation_log.length).toBeGreaterThan(0);
    expect(
      validationResult.validation_log.some((log: any) =>
        log.message.includes("missing_value")
      )
    ).toBe(true);
    expect(
      validationResult.validation_log.some((log: any) =>
        log.message.includes("anomalous_value")
      )
    ).toBe(true);

    // Assert: Verify total validation statistics
    expect(validationResult.total_records_validated).toBe(9);
    expect(validationResult.total_errors_detected).toBe(7);
    expect(validationResult.total_normal_records).toBe(2);
    expect(validationResult.quality_score).toBe(
      Math.round(
        ((validationResult.total_normal_records /
          validationResult.total_records_validated) *
          100) *
          100
      ) / 100
    );
    expect(validationResult.quality_score).toBe(22.22);

    // Assert: Verify validation timestamp is recorded
    expect(validationResult.validation_timestamp).toBeDefined();
    expect(typeof validationResult.validation_timestamp).toBe("string");

    // Assert: Verify data quality report structure
    expect(validationResult.report_summary).toEqual(
      expect.objectContaining({
        total_missing_values_detected: 4,
        total_anomalous_values_detected: 3,
        error_severity_distribution: {
          error: 6,
          warning: 1,
        },
        processing_status: "completed",
      })
    );
  });
});