import { approveSasonalTrendWithValidation } from "../../src/logic/it-2-br-6-3-2";

describe("seasonal trend purchase pattern approval validation", () => {
  // SCEN-240
  test("should throw error when trend data is empty", () => {
    const empty_trend_data = [];
    const user_id = "user_001";
    const approval_timestamp = new Date("2024-01-15T09:00:00Z");

    expect(() =>
      approveSasonalTrendWithValidation(
        empty_trend_data,
        user_id,
        approval_timestamp
      )
    ).toThrow(/傾向データ/);
  });

  test("should successfully approve seasonal trend with valid data", () => {
    const valid_trend_data = [
      {
        season: "winter",
        category: "hot_beverages",
        purchase_frequency: 45,
        avg_spending: 2500,
        confidence_score: 0.92,
      },
      {
        season: "summer",
        category: "cold_beverages",
        purchase_frequency: 38,
        avg_spending: 1800,
        confidence_score: 0.88,
      },
    ];
    const user_id = "user_001";
    const approval_timestamp = new Date("2024-01-15T09:00:00Z");

    const result = approveSasonalTrendWithValidation(
      valid_trend_data,
      user_id,
      approval_timestamp
    );

    expect(result).toEqual({
      approval_status: "approved",
      user_id: "user_001",
      approved_trends_count: 2,
      approval_timestamp: "2024-01-15T09:00:00Z",
      reflection_plan: "next_cycle_implementation",
    });
  });

  test("should throw error when confidence score is below threshold", () => {
    const low_confidence_trend_data = [
      {
        season: "spring",
        category: "vegetables",
        purchase_frequency: 28,
        avg_spending: 3200,
        confidence_score: 0.62,
      },
    ];
    const user_id = "user_002";
    const approval_timestamp = new Date("2024-01-15T09:00:00Z");

    expect(() =>
      approveSasonalTrendWithValidation(
        low_confidence_trend_data,
        user_id,
        approval_timestamp
      )
    ).toThrow(/信頼度/);
  });

  test("should reject approval when user_id is empty", () => {
    const valid_trend_data = [
      {
        season: "autumn",
        category: "fruits",
        purchase_frequency: 32,
        avg_spending: 2800,
        confidence_score: 0.89,
      },
    ];
    const empty_user_id = "";
    const approval_timestamp = new Date("2024-01-15T09:00:00Z");

    expect(() =>
      approveSasonalTrendWithValidation(
        valid_trend_data,
        empty_user_id,
        approval_timestamp
      )
    ).toThrow(/ユーザーID/);
  });

  test("should handle null trend data parameter", () => {
    const null_trend_data = null as any;
    const user_id = "user_003";
    const approval_timestamp = new Date("2024-01-15T09:00:00Z");

    expect(() =>
      approveSasonalTrendWithValidation(
        null_trend_data,
        user_id,
        approval_timestamp
      )
    ).toThrow(/傾向データ/);
  });

  test("should partially approve when some trends meet criteria", () => {
    const mixed_confidence_data = [
      {
        season: "winter",
        category: "dairy",
        purchase_frequency: 50,
        avg_spending: 4200,
        confidence_score: 0.91,
      },
      {
        season: "summer",
        category: "ice_cream",
        purchase_frequency: 42,
        avg_spending: 2100,
        confidence_score: 0.65,
      },
    ];
    const user_id = "user_004";
    const approval_timestamp = new Date("2024-02-01T10:30:00Z");

    const result = approveSasonalTrendWithValidation(
      mixed_confidence_data,
      user_id,
      approval_timestamp
    );

    expect(result).toEqual({
      approval_status: "partial_approved",
      user_id: "user_004",
      approved_trends_count: 1,
      approval_timestamp: "2024-02-01T10:30:00Z",
      reflection_plan: "review_and_retry",
    });
  });
});