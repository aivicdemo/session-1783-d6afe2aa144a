import { validateFoodRestrictionAgainstHistory } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能", () => {
  // SCEN-400
  test("新規食事制限条件が過去献立と矛盾する場合、抵触リスク警告を表示して送信前確認を促す", () => {
    // 過去献立履歴データ
    const pastMealHistory = [
      {
        mealId: "meal_001",
        mealDate: "2024-01-08",
        dishes: [
          { dishId: "dish_101", dishName: "鶏のから揚げ", ingredients: ["鶏肉", "醤油", "塩"] },
          { dishId: "dish_102", dishName: "大根サラダ", ingredients: ["大根", "オリーブ油"] },
        ],
      },
      {
        mealId: "meal_002",
        mealDate: "2024-01-09",
        dishes: [
          { dishId: "dish_201", dishName: "牛丼", ingredients: ["牛肉", "米", "玉ねぎ"] },
          { dishId: "dish_202", dishName: "味噌汁", ingredients: ["味噌", "豆腐", "わかめ"] },
        ],
      },
      {
        mealId: "meal_003",
        mealDate: "2024-01-10",
        dishes: [
          { dishId: "dish_301", dishName: "豚ロース焼き", ingredients: ["豚肉", "塩", "こしょう"] },
        ],
      },
    ];

    // 新規食事制限条件：過去献立と矛盾する条件
    const newRestriction = {
      restrictionId: "rest_new_001",
      restrictionType: "ingredient_ban",
      restrictedItems: ["鶏肉", "牛肉", "豚肉"],
      description: "全肉類を禁止する",
      effectiveDate: "2024-01-15",
    };

    // バリデーション実行
    const result = validateFoodRestrictionAgainstHistory({
      newRestriction: newRestriction,
      pastMealHistory: pastMealHistory,
      userId: "user_001",
      familyMemberId: "family_001",
    });

    // 期待される結果：矛盾を検出し警告を返す
    expect(result.isConflict).toBe(true);
    expect(result.conflictDetected).toBe(true);
    expect(result.riskLevel).toBe("high");
    expect(result.conflictCount).toBe(3); // meal_001, meal_002, meal_003 が抵触
    expect(result.affectedMealCount).toBe(3);
    expect(result.affectedMeals).toEqual([
      { mealId: "meal_001", mealDate: "2024-01-08", conflictReasons: ["鶏肉"] },
      { mealId: "meal_002", mealDate: "2024-01-09", conflictReasons: ["牛肉"] },
      { mealId: "meal_003", mealDate: "2024-01-10", conflictReasons: ["豚肉"] },
    ]);

    // 警告メッセージの構造と内容
    expect(result.warningMessage).toBeDefined();
    expect(result.warningMessage).toContain("抵触");
    expect(result.warningMessage).toMatch(/3件の献立/);

    // リスクスコアの計算：矛盾数 / 過去献立総数 × 100
    const riskScore = (result.conflictCount / pastMealHistory.length) * 100;
    expect(result.riskScore).toBe(100);

    // 送信前確認ダイアログ表示フラグ
    expect(result.showConfirmationDialog).toBe(true);
    expect(result.dialogTitle).toBe("矛盾検出：送信前確認");
    expect(result.confirmationRequired).toBe(true);

    // 詳細情報の検証
    expect(result.conflictDetails).toBeDefined();
    expect(result.conflictDetails.length).toBe(3);
    expect(result.conflictDetails[0]).toEqual(
      expect.objectContaining({
        mealId: "meal_001",
        conflictingIngredients: ["鶏肉"],
      })
    );

    // ユーザーアクション選択肢
    expect(result.userActionOptions).toContain("cancel");
    expect(result.userActionOptions).toContain("modify");
    expect(result.userActionOptions).toContain("override");
  });
});