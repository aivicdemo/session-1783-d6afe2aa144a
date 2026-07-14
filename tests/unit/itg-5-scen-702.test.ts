import { aggregateFailurePatterns } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能", () => {
  // SCEN-702: [edge] 失敗パターン集計 - 集計対象期間にデータが存在しない場合、空の集計結果を返す
  test("集計対象期間にデータが存在しない場合、空の集計結果を返す", () => {
    const startDate = new Date("2024-01-01T00:00:00Z");
    const endDate = new Date("2024-01-31T23:59:59Z");
    const rejectionReasons = [];

    const result = aggregateFailurePatterns({
      startDate,
      endDate,
      rejectionReasons,
    });

    expect(result).toEqual({
      aggregationPeriodStart: "2024-01-01T00:00:00Z",
      aggregationPeriodEnd: "2024-01-31T23:59:59Z",
      totalCount: 0,
      categoryBreakdown: [],
      patterns: [],
    });
    expect(result.totalCount).toBe(0);
    expect(result.patterns).toEqual([]);
    expect(result.categoryBreakdown).toEqual([]);
  });
});