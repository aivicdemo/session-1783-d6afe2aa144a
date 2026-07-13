import { detectDietaryRestrictionConflict, recordConflictRejection, generateNextWeekMenu } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証", () => {
  // SCEN-411: [normal] 制限条件抵触検出と献立反映統合機能 - 専業主夫がレビュー却下した抵触パターンは次週献立生成に反映されない
  test("SCEN-411: should exclude rejected dietary conflict patterns from next week menu generation", () => {
    const userId = "user-001";
    const householdId = "household-001";
    const currentWeekMenuId = "menu-2024-w01";
    const familyMemberId = "member-001";

    // Step 1: 栄養管理・分析ダッシュボードシステムにログイン済みの状態で、制限条件抵触検出機能を実行
    const currentMenuDetails = {
      menuId: currentWeekMenuId,
      userId: userId,
      householdId: householdId,
      weekStartDate: "2024-01-15",
      dishes: [
        {
          dishId: "dish-001",
          name: "塩辛い牛肉炒め",
          ingredients: ["beef", "salt", "soy_sauce"],
          sodiumMgPerServing: 1200,
        },
        {
          dishId: "dish-002",
          name: "エビ料理",
          ingredients: ["shrimp", "garlic"],
          allergens: ["crustacean"],
        },
      ],
    };

    const dietaryRestrictions = {
      householdId: householdId,
      familyMemberId: familyMemberId,
      restrictions: [
        {
          restrictionId: "rest-001",
          type: "sodium_limit",
          maxMgPerDay: 2000,
          description: "低塩食",
        },
        {
          restrictionId: "rest-002",
          type: "allergen_avoidance",
          allergens: ["crustacean"],
          description: "甲殻類アレルギー",
        },
      ],
    };

    // Step 2 & 3: システムが検出した抵触パターンを確認
    const detectedConflicts = detectDietaryRestrictionConflict({
      menuDetails: currentMenuDetails,
      restrictions: dietaryRestrictions.restrictions,
    });

    expect(detectedConflicts).toEqual({
      conflictCount: 2,
      conflicts: [
        {
          conflictId: "conflict-001",
          dishId: "dish-001",
          dishName: "塩辛い牛肉炒め",
          conflictType: "sodium_limit",
          restrictionId: "rest-001",
          severity: "high",
          sodiumMgDetected: 1200,
          thresholdMgPerDay: 2000,
          exceedancePercentage: 60,
          description: "塩分過多",
          involvedIngredients: ["salt", "soy_sauce"],
        },
        {
          conflictId: "conflict-002",
          dishId: "dish-002",
          dishName: "エビ料理",
          conflictType: "allergen_avoidance",
          restrictionId: "rest-002",
          severity: "high",
          detectedAllergen: "crustacean",
          description: "甲殻類アレルギー",
          involvedIngredients: ["shrimp"],
        },
      ],
    });

    // Step 4: 検出された抵触パターンについて『却下』ボタンをクリックして却下処理を実行
    const rejectionInput = {
      conflictId: "conflict-001",
      userId: userId,
      householdId: householdId,
      menuId: currentWeekMenuId,
      rejectionReason: "family_preference",
      rejectionReasonText: "実際には塩分が気にならない",
      rejectionTimestamp: "2024-01-15T18:30:00Z",
    };

    // Step 5: 却下した抵触パターンの詳細情報がシステムに記録される
    const rejectionRecord = recordConflictRejection(rejectionInput);

    expect(rejectionRecord).toEqual({
      recordId: expect.any(String),
      conflictId: "conflict-001",
      userId: userId,
      householdId: householdId,
      menuId: currentWeekMenuId,
      conflictType: "sodium_limit",
      dishId: "dish-001",
      dishName: "塩辛い牛肉炒め",
      rejectionReason: "family_preference",
      rejectionReasonText: "実際には塩分が気にならない",
      recordedAt: "2024-01-15T18:30:00Z",
      status: "rejected",
    });

    // Step 6 & 7: 翌週の献立生成機能を実行し、生成された次週献立の詳細内容を確認
    const nextWeekStartDate = "2024-01-22";
    const nextWeekMenuGenerationInput = {
      userId: userId,
      householdId: householdId,
      weekStartDate: nextWeekStartDate,
      dietaryRestrictions: dietaryRestrictions.restrictions,
      rejectedConflictPatterns: [
        {
          conflictId: "conflict-001",
          conflictType: "sodium_limit",
          dishName: "塩辛い牛肉炒め",
          involvedIngredients: ["salt", "soy_sauce"],
        },
      ],
      previousWeekMenuId: currentWeekMenuId,
    };

    const nextWeekMenu = generateNextWeekMenu(nextWeekMenuGenerationInput);

    expect(nextWeekMenu).toEqual({
      menuId: expect.any(String),
      userId: userId,
      householdId: householdId,
      weekStartDate: nextWeekStartDate,
      generatedAt: expect.any(String),
      dishes: expect.arrayContaining([
        expect.objectContaining({
          dishId: expect.any(String),
          name: expect.not.stringContaining("塩辛い牛肉炒め"),
          ingredients: expect.not.arrayContaining(["salt", "soy_sauce"]),
        }),
      ]),
      excludedPatterns: [
        {
          conflictId: "conflict-001",
          conflictType: "sodium_limit",
          reason: "user_rejected_on_2024-01-15",
        },
      ],
    });

    // Step 8: 次週献立に含まれる食材、栄養成分、アレルゲン情報を却下されたパターンと照合
    const generatedDishes = nextWeekMenu.dishes;

    // 却下されたパターン: 塩分過多の献立は除外されること
    const sodiumHighDishes = generatedDishes.filter(
      (dish: any) =>
        dish.sodiumMgPerServing && dish.sodiumMgPerServing > 800
    );
    expect(sodiumHighDishes).toEqual([]);

    // 甲殻類アレルギーに対応した制限（却下されていない）は反映されること
    const crustaceanDishes = generatedDishes.filter((dish: any) =>
      dish.allergens?.includes("crustacean")
    );
    expect(crustaceanDishes).toEqual([]);

    // 次週献立全体が制限条件を満たしていることを確認
    for (const dish of generatedDishes) {
      expect(dish.sodiumMgPerServing).toBeLessThanOrEqual(2000);
      if (dish.allergens) {
        expect(dish.allergens).not.toContain("crustacean");
      }
    }

    // 期待結果の検証: 却下パターンが次週献立生成に反映され、同じ抵触パターンが繰り返されていない
    expect(nextWeekMenu.excludedPatterns).toContainEqual(
      expect.objectContaining({
        conflictId: "conflict-001",
        conflictType: "sodium_limit",
      })
    );
  });
});