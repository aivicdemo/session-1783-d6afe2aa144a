import { determineFoodEvaluationExpiredRecords } from "../../src/logic/it-2";

describe("家族成員の食事評価データの蓄積・管理機能", () => {
  // SCEN-440: [edge] 食事評価データ保持期間管理機能 - 保持期間の終了日が本日と正確に一致するデータを期限切れとして正確に特定できる
  test("保持期間終了日が本日と一致するデータと過去のデータを期限切れとして特定し、未来のデータは除外する", () => {
    const today = new Date("2024-01-15");

    const foodEvaluationRecords = [
      {
        evaluation_id: "eval_001",
        user_id: "user_001",
        family_member_id: "member_001",
        menu_id: "menu_001",
        satisfaction_score: 4,
        completion_rate: 95,
        request_text: "塩辛めにしてほしい",
        evaluation_date: new Date("2024-01-12"),
        retention_end_date: new Date("2024-01-14"),
      },
      {
        evaluation_id: "eval_002",
        user_id: "user_001",
        family_member_id: "member_001",
        menu_id: "menu_002",
        satisfaction_score: 5,
        completion_rate: 100,
        request_text: "来週もこの料理でお願い",
        evaluation_date: new Date("2024-01-13"),
        retention_end_date: new Date("2024-01-15"),
      },
      {
        evaluation_id: "eval_003",
        user_id: "user_001",
        family_member_id: "member_002",
        menu_id: "menu_003",
        satisfaction_score: 3,
        completion_rate: 70,
        request_text: "野菜をもっと多くしてほしい",
        evaluation_date: new Date("2024-01-14"),
        retention_end_date: new Date("2024-01-16"),
      },
    ];

    const expiredRecords = determineFoodEvaluationExpiredRecords(
      foodEvaluationRecords,
      today
    );

    expect(expiredRecords).toHaveLength(2);
    expect(expiredRecords).toEqual([
      expect.objectContaining({
        evaluation_id: "eval_001",
        retention_end_date: new Date("2024-01-14"),
      }),
      expect.objectContaining({
        evaluation_id: "eval_002",
        retention_end_date: new Date("2024-01-15"),
      }),
    ]);

    const activeRecordIds = expiredRecords.map((r) => r.evaluation_id);
    expect(activeRecordIds).not.toContain("eval_003");
  });
});