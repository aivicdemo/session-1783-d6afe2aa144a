import { distributeRuleSpec } from "../../src/logic/it-1-1-1";

describe("ルール仕様書の配布と確認追跡機能", () => {
  // SCEN-565
  test("配布対象者が0人の場合、配布処理が適切に処理される", () => {
    const distributionRequest = {
      ruleSpecId: "spec_2024_q1_001",
      ruleSpecTitle: "季節パターン・割引率閾値・販売期間の優先度ルール",
      targetRecipients: [],
      distributionTimestamp: new Date("2024-01-15T09:00:00Z"),
      distributor: "pm_user_001",
    };

    const result = distributeRuleSpec(distributionRequest);

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("NO_RECIPIENTS");
    expect(result.errorMessage).toMatch(/配布対象者/);
    expect(result.distributedCount).toBe(0);
    expect(result.failedCount).toBe(0);
    expect(result.distributionId).toBeUndefined();
    expect(result.status).toBe("ABORTED");
    expect(result.auditLog).toEqual(
      expect.objectContaining({
        timestamp: new Date("2024-01-15T09:00:00Z"),
        action: "DISTRIBUTION_ATTEMPT",
        ruleSpecId: "spec_2024_q1_001",
        recipientCount: 0,
        result: "REJECTED",
        reason: "配布対象者がいません",
      })
    );
    expect(result.distributionHistory).toBe(null);
  });
});