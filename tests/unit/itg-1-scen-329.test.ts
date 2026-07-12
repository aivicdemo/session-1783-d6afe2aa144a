import { generateMealPlanOnSchedule } from "../../src/logic/it-1-1-1";

describe("献立生成要求処理 - スケジュール発火時の献立自動生成", () => {
  // SCEN-329
  test("ログイン済みユーザーのスケジュール発火時に献立生成処理が正常に開始される", async () => {
    // ===== Setup =====
    const userId = "user_test_001";
    const familyId = "family_test_001";
    const scheduleExecutionTime = new Date("2024-02-15T19:00:00Z");
    const currentTime = new Date("2024-02-15T18:55:00Z");

    // Mock user data
    const userData = {
      userId,
      userName: "専業主夫太郎",
      isLoggedIn: true,
      registeredAt: new Date("2024-01-01T00:00:00Z"),
    };

    // Mock family members with restrictions
    const familyMembers = [
      {
        memberId: "member_001",
        familyId,
        name: "子供A",
        age: 8,
        allergies: ["卵", "エビ"],
        dietaryRestrictions: ["辛い食べ物"],
      },
      {
        memberId: "member_002",
        familyId,
        name: "子供B",
        age: 5,
        allergies: ["ピーナッツ"],
        dietaryRestrictions: [],
      },
    ];

    // Mock schedule settings
    const scheduleSettings = {
      userId,
      isEnabled: true,
      executionTime: scheduleExecutionTime,
      frequency: "weekly",
      dayOfWeek: "sunday",
      createdAt: new Date("2024-02-01T10:00:00Z"),
    };

    // Mock generated meal plan
    const generatedMealPlan = {
      mealPlanId: "plan_2024_02_15",
      userId,
      familyId,
      generatedAt: scheduleExecutionTime,
      meals: [
        {
          mealId: "meal_001",
          dishName: "野菜炒め",
          ingredients: ["キャベツ", "ニンジン", "豚肉"],
          cookingTimeMinutes: 20,
          nutritionInfo: {
            calories: 350,
            protein: 15,
            carbs: 45,
            fat: 12,
          },
          allergyFree: true,
          meetsRestrictions: true,
        },
        {
          mealId: "meal_002",
          dishName: "鶏肉のスープ",
          ingredients: ["鶏肉", "大根", "人参"],
          cookingTimeMinutes: 30,
          nutritionInfo: {
            calories: 280,
            protein: 18,
            carbs: 20,
            fat: 10,
          },
          allergyFree: true,
          meetsRestrictions: true,
        },
      ],
      totalWeeklyNutrition: {
        averageCalories: 2100,
        averageProtein: 90,
        averageCarbs: 280,
        averageFat: 70,
      },
      satisfactionPredictionScore: 82,
      budgetCompliance: true,
      estimatedFoodCost: 4500,
    };

    // Mock database save result
    const databaseSaveResult = {
      success: true,
      mealPlanId: generatedMealPlan.mealPlanId,
      recordsInserted: 2,
      timestamp: scheduleExecutionTime,
    };

    // Mock UI display result
    const uiDisplayResult = {
      isDisplayed: true,
      mealPlanId: generatedMealPlan.mealPlanId,
      screenName: "献立表示画面",
      displayedAt: new Date("2024-02-15T19:00:05Z"),
    };

    // ===== Mock API calls =====
    fetchMock.resetMocks();

    // Mock: User authentication check
    fetchMock.mockResponseOnce(JSON.stringify({ isLoggedIn: true, userId }), {
      status: 200,
    });

    // Mock: Fetch schedule settings
    fetchMock.mockResponseOnce(JSON.stringify(scheduleSettings), {
      status: 200,
    });

    // Mock: Fetch family members
    fetchMock.mockResponseOnce(JSON.stringify(familyMembers), {
      status: 200,
    });

    // Mock: Generate meal plan
    fetchMock.mockResponseOnce(JSON.stringify(generatedMealPlan), {
      status: 200,
    });

    // Mock: Save to database
    fetchMock.mockResponseOnce(JSON.stringify(databaseSaveResult), {
      status: 201,
    });

    // Mock: UI display confirmation
    fetchMock.mockResponseOnce(JSON.stringify(uiDisplayResult), {
      status: 200,
    });

    // ===== Execute =====
    const result = await generateMealPlanOnSchedule({
      userId,
      scheduleExecutionTime,
      currentTime,
    });

    // ===== Assertions =====

    // 1. スケジュール発火時刻に献立生成処理が開始されたことを確認
    expect(result.processStarted).toBe(true);
    expect(result.processStartedAt).toEqual(scheduleExecutionTime);

    // 2. 献立生成処理が正常に完了したことを確認
    expect(result.mealPlanGenerated).toBe(true);
    expect(result.generatedMealPlanId).toBe("plan_2024_02_15");

    // 3. 家族の制約条件が正しく読み込まれたことを確認
    expect(result.familyConstraintsLoaded).toBe(true);
    expect(result.familyMembersCount).toBe(2);
    expect(result.totalRestrictionsApplied).toBe(3); // 2 allergies + 1 dietary restriction for child A, 1 allergy for child B

    // 4. 献立データがデータベースに正常に保存されたことを確認
    expect(result.databaseSaveSuccess).toBe(true);
    expect(result.recordsInserted).toBe(2); // 2 meals inserted
    expect(result.mealPlanIdSaved).toBe("plan_2024_02_15");

    // 5. UI画面に献立が表示されていることを確認
    expect(result.uiDisplayed).toBe(true);
    expect(result.uiDisplayedMealPlanId).toBe("plan_2024_02_15");

    // 6. エラーログが出力されていないことを確認
    expect(result.errorLogsPresent).toBe(false);
    expect(result.errorMessages.length).toBe(0);

    // 7. 献立が家族の制約条件（アレルギー・食事制限）を満たしていることを確認
    expect(result.mealsAllergyCompliant).toBe(true);
    expect(result.mealsDietaryRestrictionCompliant).toBe(true);

    // 8. 生成された献立の基本情報を確認
    expect(result.generatedMealsCount).toBe(2);
    expect(result.averageWeeklyCalories).toBe(2100);
    expect(result.estimatedFoodCost).toBe(4500);

    // 9. 予測満足度スコアが適正範囲内であることを確認
    expect(result.satisfactionPredictionScore).toBe(82);
    expect(result.satisfactionPredictionScore).toBeGreaterThanOrEqual(0);
    expect(result.satisfactionPredictionScore).toBeLessThanOrEqual(100);

    // 10. 予算遵守判定を確認
    expect(result.budgetCompliance).toBe(true);

    // 11. API呼び出し回数が正しいことを確認（6回のモック呼び出し）
    expect(fetchMock.mock.calls.length).toBe(6);

    // 12. 最終的なプロセス完了ステータスを確認
    expect(result.processCompleted).toBe(true);
    expect(result.processCompletedAt).toEqual(
      new Date("2024-02-15T19:00:05Z")
    );
  });
});