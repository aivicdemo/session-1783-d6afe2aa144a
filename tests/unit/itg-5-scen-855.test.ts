import { aggregateWeeklyMetrics } from "../../src/logic/it-7-2-1";

describe("週次定量指標集計機能", () => {
  // SCEN-855
  test("利用ログが空の場合に集計失敗エラーが返却される", () => {
    const emptyUsageLogs: Array<{
      userId: string;
      timestamp: string;
      action: string;
      mealPlanId: string;
      result: "success" | "failure";
    }> = [];

    expect(() => {
      aggregateWeeklyMetrics({
        usageLogs: emptyUsageLogs,
        weekStartDate: "2024-01-15T00:00:00Z",
        weekEndDate: "2024-01-21T23:59:59Z",
      });
    }).toThrow(/利用ログ/);
  });
});