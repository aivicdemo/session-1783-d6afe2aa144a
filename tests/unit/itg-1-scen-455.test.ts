import { generateInitialMealPlan } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-455: [normal] 初期献立生成ロジック - 初回献立生成時に嗜好学習が次週以降に延期される
  test("初回献立生成時に嗜好学習が次週以降に延期される", () => {
    const newUserInput = {
      userId: "user_001",
      familyMembersCount: 4,
      allergyInfo: [
        { memberId: "member_001", allergen: "えび" },
        { memberId: "member_002", allergen: "そば" }
      ],
      dietaryRestrictions: [
        { memberId: "member_003", restriction: "ベジタリアン" }
      ],
      budgetLimit: 5000,
      cookingTimeLimit: 60
    };

    const result = generateInitialMealPlan(newUserInput);

    // 献立生成が成功し、献立リストが返される
    expect(Array.isArray(result.mealPlanList)).toBe(true);
    expect(result.mealPlanList.length).toBeGreaterThan(0);

    // 生成された献立の基本情報
    const firstMealPlan = result.mealPlanList[0];
    expect(firstMealPlan).toHaveProperty("mealPlanId");
    expect(firstMealPlan).toHaveProperty("dishes");
    expect(Array.isArray(firstMealPlan.dishes)).toBe(true);

    // アレルギー条件が反映されている
    firstMealPlan.dishes.forEach((dish: { name: string; ingredients: string[] }) => {
      expect(dish.ingredients).not.toContain("えび");
      expect(dish.ingredients).not.toContain("そば");
    });

    // 嗜好学習が無効化・保留状態である
    expect(result.preferenceLearningSteate).toBe("disabled");

    // 嗜好学習データが空である
    expect(result.preferenceLearningSteate === "disabled").toBe(true);
    expect(result.preferenceData).toEqual([]);

    // 初回生成フラグが立っている
    expect(result.isFirstGeneration).toBe(true);

    // 栄養基準のみに基づいて献立が生成されたことの確認
    // （嗜好データが含まれていない）
    expect(result.generationBasis).toBe("nutrition_and_constraints_only");

    // 次週以降の嗜好学習有効化予定日が設定されている
    const nextWeekDate = new Date("2024-01-22T00:00:00Z");
    expect(new Date(result.preferenceLearnningScheduledDate)).toEqual(nextWeekDate);

    // 生成ログ内に「嗜好学習: 次週以降に延期」の記録がある
    expect(result.generationLog).toContain("preference_learning_deferred");
  });
});