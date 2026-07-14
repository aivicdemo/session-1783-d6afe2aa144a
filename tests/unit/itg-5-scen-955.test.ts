import { describe, test, expect } from "@jest/globals";
import { aggregateFailurePatterns } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能", () => {
  // SCEN-955: [edge] 失敗パターン集計機能 - 同一理由が集計期間内に 1 件のみの場合、最小集計単位として正しく記録する
  test("SCEN-955: 同一理由が1件のみの場合、最小集計単位として正しく記録される", () => {
    const aggregationPeriodStart = new Date("2024-01-01T00:00:00Z");
    const aggregationPeriodEnd = new Date("2024-01-31T23:59:59Z");
    const registrationTimestamp = new Date("2024-01-15T11:30:00Z");

    const failureReasonRecords = [
      {
        reason_id: "fr_001",
        reason_text: "栄養バランスが不適切",
        category: "nutrition_imbalance",
        registered_at: registrationTimestamp,
      },
    ];

    const result = aggregateFailurePatterns({
      failureRecords: failureReasonRecords,
      periodStart: aggregationPeriodStart,
      periodEnd: aggregationPeriodEnd,
    });

    expect(result.patterns).toHaveLength(1);
    expect(result.patterns[0]).toEqual({
      category: "nutrition_imbalance",
      aggregated_count: 1,
      is_minimum_unit: true,
      earliest_occurrence: registrationTimestamp,
      latest_occurrence: registrationTimestamp,
      period_start: aggregationPeriodStart,
      period_end: aggregationPeriodEnd,
    });
    expect(result.patterns[0].aggregated_count).toBe(1);
    expect(result.patterns[0].is_minimum_unit).toBe(true);
    expect(result.patterns[0].earliest_occurrence.getTime()).toBe(
      registrationTimestamp.getTime()
    );
  });
});