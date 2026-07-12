import { detectConflictingMeals } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-482: [normal] 複数制限条件の優先度処理と自動決定
  test("複数制限条件の優先度が自動決定され、次週献立生成ロジックへの反映順序が制御される", () => {
    // Precondition: ユーザーが複数の食事制限条件（アレルギー、カロリー制限、食材在庫、予算）を入力済み
    const restrictions = [
      {
        restrictionId: "allergy_001",
        type: "allergy",
        name: "卵アレルギー",
        severity: "high",
        affectedMeals: ["卵焼き", "オムレツ", "卵サンド"],
        userPriority: 1,
      },
      {
        restrictionId: "calorie_001",
        type: "calorie",
        name: "カロリー上限800kcal",
        severity: "medium",
        affectedMeals: ["唐揚げ定食", "ラーメン", "天丼"],
        userPriority: 3,
      },
      {
        restrictionId: "budget_001",
        type: "budget",
        name: "予算上限800円",
        severity: "low",
        affectedMeals: ["和牛ステーキ弁当", "海老天丼"],
        userPriority: 5,
      },
      {
        restrictionId: "inventory_001",
        type: "inventory",
        name: "冷蔵庫在庫不足（鶏肉）",
        severity: "high",
        affectedMeals: ["鶏唐揚げ", "親子丼", "鶏肉煮込み"],
        userPriority: 2,
      },
    ];

    const pastMeals = [
      {
        mealId: "meal_001",
        name: "卵焼き",
        date: "2024-01-08",
        ingredients: ["卵", "醤油"],
        estimatedCost: 150,
        estimatedCalories: 200,
      },
      {
        mealId: "meal_002",
        name: "唐揚げ定食",
        date: "2024-01-09",
        ingredients: ["鶏肉", "小麦粉"],
        estimatedCost: 900,
        estimatedCalories: 1200,
      },
      {
        mealId: "meal_003",
        name: "和牛ステーキ弁当",
        date: "2024-01-10",
        ingredients: ["和牛", "人参"],
        estimatedCost: 2000,
        estimatedCalories: 800,
      },
      {
        mealId: "meal_004",
        name: "鶏唐揚げ",
        date: "2024-01-11",
        ingredients: ["鶏肉", "小麦粉"],
        estimatedCost: 600,
        estimatedCalories: 950,
      },
      {
        mealId: "meal_005",
        name: "親子丼",
        date: "2024-01-12",
        ingredients: ["卵", "鶏肉"],
        estimatedCost: 450,
        estimatedCalories: 650,
      },
    ];

    // Trigger: 優先度自動決定機能を有効にして献立生成を実行
    const result = detectConflictingMeals({
      restrictions,
      pastMeals,
      enableAutoPrioritization: true,
    });

    // Outcome: 複数の制限条件が設定された場合、システムが優先度を適切に自動決定
    // 期待値：安全性重視の制限条件（アレルギー、在庫不足）が上位にランク付けされる
    expect(result).toEqual({
      conflictingMeals: expect.arrayContaining([
        expect.objectContaining({
          mealId: "meal_001",
          mealName: "卵焼き",
          conflictingRestrictions: ["allergy_001"],
          conflictCount: 1,
          priorityRank: 1,
          shouldExclude: true,
        }),
        expect.objectContaining({
          mealId: "meal_005",
          mealName: "親子丼",
          conflictingRestrictions: ["allergy_001", "inventory_001"],
          conflictCount: 2,
          priorityRank: 1,
          shouldExclude: true,
        }),
        expect.objectContaining({
          mealId: "meal_004",
          mealName: "鶏唐揚げ",
          conflictingRestrictions: ["inventory_001"],
          conflictCount: 1,
          priorityRank: 2,
          shouldExclude: true,
        }),
        expect.objectContaining({
          mealId: "meal_002",
          mealName: "唐揚げ定食",
          conflictingRestrictions: ["calorie_001"],
          conflictCount: 1,
          priorityRank: 3,
          shouldExclude: true,
        }),
        expect.objectContaining({
          mealId: "meal_003",
          mealName: "和牛ステーキ弁当",
          conflictingRestrictions: ["budget_001"],
          conflictCount: 1,
          priorityRank: 4,
          shouldExclude: true,
        }),
      ]),
      automaticPriorityOrder: [
        { restrictionId: "allergy_001", autoPriority: 1, severity: "high" },
        { restrictionId: "inventory_001", autoPriority: 2, severity: "high" },
        { restrictionId: "calorie_001", autoPriority: 3, severity: "medium" },
        { restrictionId: "budget_001", autoPriority: 4, severity: "low" },
      ],
      nextWeekMealGenerationSequence: [
        "allergy_001",
        "inventory_001",
        "calorie_001",
        "budget_001",
      ],
      totalConflictingMeals: 5,
      conflictingMealPercentage: 100,
    });

    // 自動決定された優先度に基づいて生成された献立内容を確認
    // 優先度順序：アレルギー（最高安全性）→ 在庫不足 → カロリー制限 → 予算制限
    expect(result.nextWeekMealGenerationSequence).toEqual([
      "allergy_001",
      "inventory_001",
      "calorie_001",
      "budget_001",
    ]);

    // 優先度順序が期待値と一致
    expect(result.automaticPriorityOrder[0].restrictionId).toBe("allergy_001");
    expect(result.automaticPriorityOrder[0].autoPriority).toBe(1);
    expect(result.automaticPriorityOrder[1].restrictionId).toBe(
      "inventory_001"
    );
    expect(result.automaticPriorityOrder[1].autoPriority).toBe(2);
    expect(result.automaticPriorityOrder[2].restrictionId).toBe("calorie_001");
    expect(result.automaticPriorityOrder[2].autoPriority).toBe(3);
    expect(result.automaticPriorityOrder[3].restrictionId).toBe("budget_001");
    expect(result.automaticPriorityOrder[3].autoPriority).toBe(4);

    // 複数の制限条件に抵触する献立は最上位優先度で除外
    const multipleConflictMeal = result.conflictingMeals.find(
      (m) => m.mealId === "meal_005"
    );
    expect(multipleConflictMeal?.conflictCount).toBe(2);
    expect(multipleConflictMeal?.priorityRank).toBe(1);
    expect(multipleConflictMeal?.shouldExclude).toBe(true);

    // 抵触する献立の総数と割合
    expect(result.totalConflictingMeals).toBe(5);
    expect(result.conflictingMealPercentage).toBe(100);
  });
});