import { reflectMealEvaluationToMenuGeneration } from "../../src/logic/it-3";

describe("食事評価データの献立生成ロジック反映", () => {
  test("SCEN-361: 蓄積された食事評価データから高評価料理とリクエストが優先度付けされ、次週献立生成ロジックに反映される", () => {
    // ユーザーアカウント情報
    const userId = "user-001";
    const familyId = "family-001";

    // 過去1週間分の食事評価データ（高評価料理3品、低評価料理2品）
    const mealEvaluationData = [
      {
        dishId: "dish-001",
        dishName: "チキンステーク",
        satisfactionScore: 5,
        completionRate: 100,
        comment: "家族全員が大好き。また作ってほしい",
        evaluatedAt: new Date("2024-01-08T19:00:00Z"),
      },
      {
        dishId: "dish-002",
        dishName: "野菜サラダ",
        satisfactionScore: 5,
        completionRate: 95,
        comment: "栄養満点で美味しい",
        evaluatedAt: new Date("2024-01-09T19:00:00Z"),
      },
      {
        dishId: "dish-003",
        dishName: "味噌汁",
        satisfactionScore: 5,
        completionRate: 100,
        comment: "毎日飲みたい",
        evaluatedAt: new Date("2024-01-10T19:00:00Z"),
      },
      {
        dishId: "dish-004",
        dishName: "レバー料理",
        satisfactionScore: 2,
        completionRate: 30,
        comment: "臭みが強くて食べられない",
        evaluatedAt: new Date("2024-01-11T19:00:00Z"),
      },
      {
        dishId: "dish-005",
        dishName: "納豆スパゲッティ",
        satisfactionScore: 1,
        completionRate: 10,
        comment: "家族が納豆が嫌いなので不適切だった",
        evaluatedAt: new Date("2024-01-12T19:00:00Z"),
      },
    ];

    // ユーザーリクエスト（アレルギー、食材制限）
    const userPreferences = {
      allergies: ["peanut", "shellfish"],
      dislikedIngredients: ["natto", "liver"],
      preferredDishes: ["chicken", "vegetables"],
      requestComment: "子どもが納豆が嫌いなので避けてください",
    };

    // 栄養基準値
    const nutritionTargets = {
      protein: 60,
      carbohydrate: 300,
      fat: 60,
      fiber: 20,
      calcium: 600,
    };

    // 関数を実行
    const result = reflectMealEvaluationToMenuGeneration({
      userId,
      familyId,
      mealEvaluationData,
      userPreferences,
      nutritionTargets,
    });

    // 検証1: 生成された献立が存在し、配列構造を持つ
    expect(Array.isArray(result.generatedMenu)).toBe(true);
    expect(result.generatedMenu.length).toBeGreaterThan(0);

    // 検証2: 高評価料理が献立に含まれているか確認（優先度スコア）
    const includedDishIds = result.generatedMenu.map(
      (item: any) => item.dishId
    );
    expect(includedDishIds).toContain("dish-001");
    expect(includedDishIds).toContain("dish-002");
    expect(includedDishIds).toContain("dish-003");

    // 検証3: 低評価料理が献立から除外されていることを確認
    expect(includedDishIds).not.toContain("dish-004");
    expect(includedDishIds).not.toContain("dish-005");

    // 検証4: 高評価料理の優先度スコアが高いことを確認
    const dish001Item = result.generatedMenu.find(
      (item: any) => item.dishId === "dish-001"
    );
    const dish002Item = result.generatedMenu.find(
      (item: any) => item.dishId === "dish-002"
    );
    expect(dish001Item?.priorityScore).toBe(95);
    expect(dish002Item?.priorityScore).toBe(95);

    // 検証5: ユーザーリクエスト（アレルギー、嫌いな食材）が反映されているか
    const reflectedAllergies = result.appliedConstraints.allergies;
    expect(reflectedAllergies).toContain("peanut");
    expect(reflectedAllergies).toContain("shellfish");

    const reflectedDisliked = result.appliedConstraints.dislikedIngredients;
    expect(reflectedDisliked).toContain("natto");
    expect(reflectedDisliked).toContain("liver");

    // 検証6: 生成献立に含まれている料理のいずれもが、アレルギー食材を含まないこと
    result.generatedMenu.forEach((menuItem: any) => {
      menuItem.ingredients.forEach((ingredient: any) => {
        expect(reflectedAllergies).not.toContain(ingredient.allergenTag);
      });
    });

    // 検証7: 栄養バランスが適切であることを確認
    const totalNutrition = result.generatedMenu.reduce(
      (acc: any, item: any) => ({
        protein: acc.protein + (item.nutritionInfo?.protein || 0),
        carbohydrate:
          acc.carbohydrate + (item.nutritionInfo?.carbohydrate || 0),
        fat: acc.fat + (item.nutritionInfo?.fat || 0),
        fiber: acc.fiber + (item.nutritionInfo?.fiber || 0),
        calcium: acc.calcium + (item.nutritionInfo?.calcium || 0),
      }),
      { protein: 0, carbohydrate: 0, fat: 0, fiber: 0, calcium: 0 }
    );

    // 栄養値が基準値の80%以上100%以下であることを確認
    expect(totalNutrition.protein).toBeGreaterThanOrEqual(
      nutritionTargets.protein * 0.8
    );
    expect(totalNutrition.protein).toBeLessThanOrEqual(
      nutritionTargets.protein * 1.2
    );
    expect(totalNutrition.carbohydrate).toBeGreaterThanOrEqual(
      nutritionTargets.carbohydrate * 0.8
    );
    expect(totalNutrition.carbohydrate).toBeLessThanOrEqual(
      nutritionTargets.carbohydrate * 1.2
    );
    expect(totalNutrition.calcium).toBeGreaterThanOrEqual(
      nutritionTargets.calcium * 0.8
    );

    // 検証8: 食事評価の学習が適切に実行されていることを確認
    expect(result.learningStatus).toBe("completed");
    expect(result.evaluatedDishesProcessed).toBe(5);
    expect(result.highRatedDishesExtracted).toBe(3);
    expect(result.lowRatedDishesExcluded).toBe(2);

    // 検証9: 優先度マトリクスが正しく計算されていることを確認
    expect(result.priorityMatrix).toBeDefined();
    expect(result.priorityMatrix.highPriority.length).toBe(3);
    expect(result.priorityMatrix.lowPriority.length).toBe(2);

    // 検証10: リクエストコメントがシステムに記録されているか
    expect(result.appliedConstraints.userComment).toBe(
      "子どもが納豆が嫌いなので避けてください"
    );

    // 検証11: 次週献立生成タイムスタンプが正しく記録されているか
    expect(result.generatedMenuDate).toBeDefined();
    const generatedDate = new Date(result.generatedMenuDate);
    expect(generatedDate.getTime()).toBeGreaterThan(
      new Date("2024-01-12T00:00:00Z").getTime()
    );

    // 検証12: 献立生成成功率が閾値以上であることを確認
    expect(result.menuGenerationSuccessRate).toBeGreaterThanOrEqual(80);

    // 検証13: エラーが発生していないことを確認
    expect(result.errors).toEqual([]);
  });

  test("SCEN-361: エラーハンドリング - 不正な食事評価データで処理が失敗することを確認", () => {
    const userId = "user-001";
    const familyId = "family-001";

    // 不正な食事評価データ（スコアが範囲外）
    const invalidMealEvaluationData = [
      {
        dishId: "dish-001",
        dishName: "テスト料理",
        satisfactionScore: 6, // 範囲は1～5のはず
        completionRate: 100,
        comment: "テスト",
        evaluatedAt: new Date("2024-01-08T19:00:00Z"),
      },
    ];

    const userPreferences = {
      allergies: [],
      dislikedIngredients: [],
      preferredDishes: [],
      requestComment: "",
    };

    const nutritionTargets = {
      protein: 60,
      carbohydrate: 300,
      fat: 60,
      fiber: 20,
      calcium: 600,
    };

    // エラーが発生することを確認
    expect(() =>
      reflectMealEvaluationToMenuGeneration({
        userId,
        familyId,
        mealEvaluationData: invalidMealEvaluationData,
        userPreferences,
        nutritionTargets,
      })
    ).toThrow(/スコア/);
  });

  test("SCEN-361: エラーハンドリング - 必須フィールドが不足した場合", () => {
    const userId = "user-001";
    const familyId = "family-001";

    const mealEvaluationData = [
      {
        dishId: "dish-001",
        dishName: "テスト料理",
        satisfactionScore: 5,
        completionRate: 100,
        // commentが不足
        evaluatedAt: new Date("2024-01-08T19:00:00Z"),
      },
    ];

    const userPreferences = {
      allergies: [],
      dislikedIngredients: [],
      preferredDishes: [],
      requestComment: "",
    };

    const nutritionTargets = {
      protein: 60,
      carbohydrate: 300,
      fat: 60,
      fiber: 20,
      calcium: 600,
    };

    expect(() =>
      reflectMealEvaluationToMenuGeneration({
        userId,
        familyId,
        mealEvaluationData: mealEvaluationData as any,
        userPreferences,
        nutritionTargets,
      })
    ).toThrow(/必須項目/);
  });
});