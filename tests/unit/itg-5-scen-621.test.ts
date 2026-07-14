import {
  manageFoodEvaluationRetention,
} from "../../src/logic/it-7-2-1";

describe("食事評価データの保持期間管理・自動削除機能", () => {
  // SCEN-621
  test("保持期間が0日に設定された場合、記録直後にデータが削除される", async () => {
    const retentionDays = 0;
    const createdAt = new Date("2024-01-15T10:00:00Z");
    const recordId = "eval-001";
    const userId = "user-123";
    const mealId = "meal-456";

    const foodEvaluationRecord = {
      id: recordId,
      userId,
      mealId,
      satisfaction: 4,
      completionRate: 95,
      feedback: "Good",
      createdAt,
    };

    const result = await manageFoodEvaluationRetention({
      record: foodEvaluationRecord,
      retentionDays,
      currentTime: new Date("2024-01-15T10:00:01Z"),
    });

    expect(result.isDeleted).toBe(true);
    expect(result.deletedRecordId).toBe(recordId);
    expect(result.auditLogEntry).toMatchObject({
      recordId,
      userId,
      action: "DELETE",
      reason: "retention_period_expired",
      timestamp: expect.any(String),
    });
    expect(result.deletionStatus).toBe("completed");
  });
});