import { manageEvaluationDataRetention } from "../../src/logic/it-2";

describe("食事評価データの保持期間管理機能", () => {
  test("SCEN-438: 保持期間ポリシーを定義し、期限切れデータを自動削除", () => {
    // Arrange: 90日保持期間ポリシーを設定
    const retentionDays = 90;
    const policyId = "policy_001";
    const policySettings = {
      policyId,
      retentionDays,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };

    // テスト用データ: 120日前に作成された食事評価データ3件（削除対象）
    const oldEvaluationData = [
      {
        evaluationId: "eval_old_001",
        familyMemberId: "member_001",
        mealId: "meal_001",
        satisfactionScore: 4,
        completionRate: 100,
        request: "美味しかった",
        createdAt: new Date("2023-09-03T10:00:00Z"), // 120日前
        dataStatus: "active",
      },
      {
        evaluationId: "eval_old_002",
        familyMemberId: "member_002",
        mealId: "meal_002",
        satisfactionScore: 3,
        completionRate: 80,
        request: "塩辛い",
        createdAt: new Date("2023-09-03T11:00:00Z"), // 120日前
        dataStatus: "active",
      },
      {
        evaluationId: "eval_old_003",
        familyMemberId: "member_003",
        mealId: "meal_003",
        satisfactionScore: 5,
        completionRate: 100,
        request: "またこれが食べたい",
        createdAt: new Date("2023-09-03T12:00:00Z"), // 120日前
        dataStatus: "active",
      },
    ];

    // テスト用データ: 30日前に作成された食事評価データ2件（保持対象）
    const recentEvaluationData = [
      {
        evaluationId: "eval_recent_001",
        familyMemberId: "member_001",
        mealId: "meal_004",
        satisfactionScore: 4,
        completionRate: 95,
        request: "好み通り",
        createdAt: new Date("2023-12-02T10:00:00Z"), // 30日前
        dataStatus: "active",
      },
      {
        evaluationId: "eval_recent_002",
        familyMemberId: "member_002",
        mealId: "meal_005",
        satisfactionScore: 3,
        completionRate: 70,
        request: "辛さ調整希望",
        createdAt: new Date("2023-12-02T11:00:00Z"), // 30日前
        dataStatus: "active",
      },
    ];

    const allEvaluationData = [
      ...oldEvaluationData,
      ...recentEvaluationData,
    ];

    const executionTimestamp = new Date("2024-01-02T09:00:00Z"); // ポリシー設定から1日後

    // Act: 自動削除処理を実行
    const result = manageEvaluationDataRetention({
      policySettings,
      evaluationData: allEvaluationData,
      executionTimestamp,
    });

    // Assert: 削除対象期間のデータ（120日前）が削除されたことを確認
    expect(result.deletedCount).toBe(3);
    expect(result.retainedCount).toBe(2);

    // 削除されたデータのIDリストが正しいことを確認
    const deletedEvaluationIds = result.deletedEvaluationIds;
    expect(deletedEvaluationIds).toEqual([
      "eval_old_001",
      "eval_old_002",
      "eval_old_003",
    ]);

    // 保持されたデータのIDリストが正しいことを確認
    const retainedEvaluationIds = result.retainedEvaluationIds;
    expect(retainedEvaluationIds).toEqual([
      "eval_recent_001",
      "eval_recent_002",
    ]);

    // 削除処理の実行ログが適切に記録されていることを確認
    expect(result.executionLog).toEqual({
      policyId: "policy_001",
      executionTimestamp: new Date("2024-01-02T09:00:00Z"),
      deletedCount: 3,
      retainedCount: 2,
      retentionDays: 90,
      status: "completed",
    });

    // 削除実行ログのタイムスタンプが正確であることを確認
    expect(result.executionLog.executionTimestamp).toEqual(
      new Date("2024-01-02T09:00:00Z")
    );

    // 削除実行ログのステータスが「completed」であることを確認
    expect(result.executionLog.status).toBe("completed");

    // 削除件数と保持件数の合計が元データ件数と一致することを確認
    expect(result.deletedCount + result.retainedCount).toBe(5);

    // ポリシーIDが正しく記録されていることを確認
    expect(result.executionLog.policyId).toBe("policy_001");
  });
});