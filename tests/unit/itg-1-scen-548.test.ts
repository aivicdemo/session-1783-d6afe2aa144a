import { generateMealPlanWithFeedback } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  test("SCEN-548: SLA超過時の代替処理と遅延通知機能 - 経過時間がSLA閾値と同一の場合、代替処理が実行されない", async () => {
    // ========== Precondition ==========
    const slaThresholdSeconds = 60;
    const startTime = new Date("2024-01-15T10:00:00Z");
    const currentTimeAtExactThreshold = new Date("2024-01-15T10:01:00Z");
    const elapsedSeconds = (currentTimeAtExactThreshold.getTime() - startTime.getTime()) / 1000;

    const familyMembersData = [
      {
        memberId: "member_001",
        age: 8,
        allergies: ["egg"],
        dietaryRestrictions: ["vegetarian"]
      },
      {
        memberId: "member_002",
        age: 35,
        allergies: [],
        dietaryRestrictions: []
      }
    ];

    const mealEvaluationHistory = [
      {
        mealId: "meal_101",
        memberId: "member_001",
        satisfactionScore: 4,
        completionRate: 0.9,
        userRequest: "more vegetables"
      },
      {
        mealId: "meal_102",
        memberId: "member_002",
        satisfactionScore: 5,
        completionRate: 1.0,
        userRequest: "same as last week"
      }
    ];

    const budgetUpperLimit = 5000;
    const cookingTimeLimit = 45;
    const refrigeratorInventory = [
      {
        itemName: "broccoli",
        quantity: 2,
        expiryDate: "2024-01-20"
      },
      {
        itemName: "chicken_breast",
        quantity: 1.5,
        expiryDate: "2024-01-18"
      }
    ];

    const inputData = {
      userId: "user_12345",
      familyMembers: familyMembersData,
      evaluationHistory: mealEvaluationHistory,
      budgetLimit: budgetUpperLimit,
      maxCookingTime: cookingTimeLimit,
      inventory: refrigeratorInventory,
      executionStartTime: startTime.toISOString(),
      currentTime: currentTimeAtExactThreshold.toISOString(),
      slaThresholdSeconds: slaThresholdSeconds
    };

    // ========== Trigger & Execution ==========
    const result = await generateMealPlanWithFeedback(inputData);

    // ========== Assertion ==========
    // 1. 経過時間がSLA閾値と正確に同一（60秒）
    expect(elapsedSeconds).toBe(60);

    // 2. 代替処理が実行されていないことを確認
    //    → 代替処理フラグが false、遅延通知が送信されていない
    expect(result.fallbackProcessExecuted).toBe(false);
    expect(result.delayNotificationSent).toBe(false);

    // 3. 通常の献立生成結果が返却されることを確認
    expect(result.mealPlanGenerated).toBe(true);
    expect(result.generatedMealPlan).toBeDefined();
    expect(typeof result.generatedMealPlan).toBe("object");

    // 4. 生成された献立が家族の制約条件を満たしていることを確認
    expect(result.generatedMealPlan.nutritionScore).toBeGreaterThanOrEqual(0);
    expect(result.generatedMealPlan.nutritionScore).toBeLessThanOrEqual(100);

    // 5. 評価データが献立生成ロジックに反映されていることを確認
    expect(result.feedbackReflected).toBe(true);
    expect(result.highRatedDishesIncluded).toContain("vegetables");

    // 6. 食事制限（卵・菜食）が献立に反映されていることを確認
    expect(result.allergyCompliance).toBe(true);
    expect(result.dietaryRestrictionCompliance).toBe(true);

    // 7. 冷蔵庫在庫が献立に反映されていることを確認
    expect(result.inventoryUtilized).toBe(true);
    expect(result.generatedMealPlan.usedInventoryItems).toContain("broccoli");
    expect(result.generatedMealPlan.usedInventoryItems).toContain("chicken_breast");

    // 8. 予算上限以内に収まっていることを確認
    expect(result.generatedMealPlan.estimatedCost).toBeLessThanOrEqual(budgetUpperLimit);

    // 9. 調理時間制限以内に収まっていることを確認
    expect(result.generatedMealPlan.estimatedCookingTimeMinutes).toBeLessThanOrEqual(cookingTimeLimit);

    // 10. 処理が正常に完了したことを確認（エラーなし）
    expect(result.success).toBe(true);
    expect(result.errorOccurred).toBe(false);

    // 11. 処理ステータスが「完了」であることを確認
    expect(result.processingStatus).toBe("completed");

    // 12. レスポンスに処理実行情報が含まれていることを確認
    expect(result.executionDetails).toBeDefined();
    expect(result.executionDetails.actualElapsedSeconds).toBe(60);
    expect(result.executionDetails.withinSlaThreshold).toBe(true);
  });
});