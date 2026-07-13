import { validateAndProcessSeasonalTrendApproval } from "../../src/logic/it-1-br-2-1-1-1";

describe("季節変動・曜日別購買傾向承認判定機能 - エラーハンドリング", () => {
  // SCEN-559
  test("承認済み購買傾向データが空または undefined の場合、適切なエラーが発生し処理が中断される", () => {
    // ケース 1: 承認済み購買傾向データが空配列の場合
    const emptyApprovedTrends = [];
    expect(() =>
      validateAndProcessSeasonalTrendApproval({
        approved_trends: emptyApprovedTrends,
        approval_timestamp: "2024-11-15T10:30:00Z",
        approved_by_user_id: "USER-001",
      })
    ).toThrow(/承認済み購買傾向/);

    // ケース 2: 承認済み購買傾向データが null の場合
    const nullApprovedTrends = null;
    expect(() =>
      validateAndProcessSeasonalTrendApproval({
        approved_trends: nullApprovedTrends as any,
        approval_timestamp: "2024-11-15T10:30:00Z",
        approved_by_user_id: "USER-001",
      })
    ).toThrow(/承認済み購買傾向/);

    // ケース 3: 承認済み購買傾向データが undefined の場合
    const undefinedApprovedTrends = undefined;
    expect(() =>
      validateAndProcessSeasonalTrendApproval({
        approved_trends: undefinedApprovedTrends as any,
        approval_timestamp: "2024-11-15T10:30:00Z",
        approved_by_user_id: "USER-001",
      })
    ).toThrow(/承認済み購買傾向/);

    // ケース 4: 正常なデータの場合、処理が成功する
    const validApprovedTrends = [
      {
        trend_id: "TREND-001",
        season: "winter",
        weekday: "monday",
        purchase_volume: 1200,
        approval_status: "approved",
      },
      {
        trend_id: "TREND-002",
        season: "summer",
        weekday: "friday",
        purchase_volume: 850,
        approval_status: "approved",
      },
    ];

    const result = validateAndProcessSeasonalTrendApproval({
      approved_trends: validApprovedTrends,
      approval_timestamp: "2024-11-15T10:30:00Z",
      approved_by_user_id: "USER-001",
    });

    expect(result).toBeDefined();
    expect(result.validation_status).toBe("valid");
    expect(result.processed_trend_count).toBe(2);
    expect(result.approval_confirmation).toBe(true);
    expect(result.approval_timestamp).toBe("2024-11-15T10:30:00Z");
    expect(result.approved_by_user_id).toBe("USER-001");
    expect(result.error_occurred).toBe(false);
    expect(result.error_message).toBeNull();

    // ケース 5: エラー発生時のシステム安全性確認
    const invalidInput = {
      approved_trends: [],
      approval_timestamp: "2024-11-15T10:30:00Z",
      approved_by_user_id: "USER-001",
    };

    try {
      validateAndProcessSeasonalTrendApproval(invalidInput);
      fail("エラーが発生すべき");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toMatch(/承認済み購買傾向/);
    }
  });
});