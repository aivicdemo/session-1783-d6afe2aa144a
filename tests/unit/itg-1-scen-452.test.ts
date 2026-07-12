import { validateMealEvaluationDeadline } from "../../src/logic/it-1-br-1783670064270-1-1-1";

describe("食事評価入力期限管理機能", () => {
  test("SCEN-452: 入力期限ちょうどのタイミングで評価が送信された場合は有効扱いになる", () => {
    // Arrange: 献立の入力期限を本日23:59:59に設定
    const mealPlanId = "meal-plan-001";
    const evaluationDeadlineUtc = new Date("2024-01-15T23:59:59Z");
    const familyMemberId = "family-member-001";

    // システムの現在時刻を期限ちょうどに設定
    const submissionTimestampUtc = new Date("2024-01-15T23:59:59Z");

    const evaluationInput = {
      mealPlanId,
      familyMemberId,
      satisfactionScore: 4,
      completionRate: 95,
      requestComment: "次は大根を使ったおかずが食べたい",
      submissionTimestamp: submissionTimestampUtc,
      deadline: evaluationDeadlineUtc,
    };

    // Act: 食事評価の期限チェックを実行
    const result = validateMealEvaluationDeadline(evaluationInput);

    // Assert: 期限ちょうどのタイミングでも有効扱いになることを確認
    expect(result.isValid).toBe(true);
    expect(result.mealsEvaluationId).toBeDefined();
    expect(typeof result.mealsEvaluationId).toBe("string");
    expect(result.mealsEvaluationId.length).toBeGreaterThan(0);

    // 保存されたデータが期待値と一致することを確認
    expect(result.savedEvaluation).toEqual({
      mealsEvaluationId: expect.any(String),
      mealPlanId,
      familyMemberId,
      satisfactionScore: 4,
      completionRate: 95,
      requestComment: "次は大根を使ったおかずが食べたい",
      submissionTimestamp: submissionTimestampUtc,
      deadline: evaluationDeadlineUtc,
      isAccepted: true,
      savedAt: expect.any(Date),
    });

    // 期限超過エラーが発生していないことを確認
    expect(result.deadlineExceededError).toBeUndefined();

    // ユーザーが見る画面に反映される状態を確認
    expect(result.displayedInUserInterface).toBe(true);
    expect(result.evaluationStatus).toBe("stored");
  });
});