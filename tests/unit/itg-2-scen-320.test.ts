import { detectConflictingMeals } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能", () => {
  // SCEN-320
  test("新規の食事制限条件が入力された際、過去の献立履歴から制限抵触献立がすべて自動検出される", () => {
    // Precondition: 栄養管理・分析ダッシュボードシステムにログインし、過去の献立履歴が蓄積されている状態
    // Trigger: 共働き配偶者が新しい食事制限条件（例：ナッツアレルギー）を入力・保存したとき
    // Outcome: 過去献立との抵触パターンを自動検出し、制限に違反する献立を一覧表示

    const newDietaryRestriction = {
      restrictionId: "rest_001",
      restrictionName: "ナッツアレルギー",
      allergenList: ["ピーナッツ", "アーモンド", "カシューナッツ"],
      createdAt: new Date("2024-01-15T11:00:00Z"),
    };

    const pastMealHistory = [
      {
        mealId: "meal_001",
        mealName: "ピーナッツバターサンドイッチ",
        ingredients: ["ピーナッツバター", "パン", "ジャム"],
        createdAt: new Date("2024-01-10T18:30:00Z"),
      },
      {
        mealId: "meal_002",
        mealName: "アーモンド入りサラダ",
        ingredients: ["レタス", "トマト", "アーモンド", "ドレッシング"],
        createdAt: new Date("2024-01-08T12:00:00Z"),
      },
      {
        mealId: "meal_003",
        mealName: "チキンカレー",
        ingredients: ["鶏肉", "玉ねぎ", "カレー粉", "ご飯"],
        createdAt: new Date("2024-01-12T19:00:00Z"),
      },
      {
        mealId: "meal_004",
        mealName: "カシューナッツ炒め",
        ingredients: ["キャベツ", "カシューナッツ", "醤油"],
        createdAt: new Date("2024-01-05T19:00:00Z"),
      },
      {
        mealId: "meal_005",
        mealName: "野菜スープ",
        ingredients: ["ニンジン", "セロリ", "玉ねぎ", "水"],
        createdAt: new Date("2024-01-03T18:00:00Z"),
      },
    ];

    const result = detectConflictingMeals(
      newDietaryRestriction,
      pastMealHistory
    );

    // 期待値計算: 過去5件の献立のうち、ナッツアレルギーに抵触する献立は3件
    // meal_001: ピーナッツバター含有 → 抵触
    // meal_002: アーモンド含有 → 抵触
    // meal_003: ナッツ非含有 → 抵触なし
    // meal_004: カシューナッツ含有 → 抵触
    // meal_005: ナッツ非含有 → 抵触なし
    // 期待される検出件数: 3

    expect(result.conflictingMealCount).toBe(3);
    expect(result.conflictingMeals).toHaveLength(3);

    // 各抵触献立が正しく検出されたか確認
    const conflictingMealIds = result.conflictingMeals.map(
      (meal) => meal.mealId
    );
    expect(conflictingMealIds).toContain("meal_001");
    expect(conflictingMealIds).toContain("meal_002");
    expect(conflictingMealIds).toContain("meal_004");

    // 抵触献立ごとに制限条件との紐付けが正しく表示されているか確認
    const meal001Conflict = result.conflictingMeals.find(
      (meal) => meal.mealId === "meal_001"
    );
    expect(meal001Conflict).toBeDefined();
    expect(meal001Conflict?.conflictingIngredients).toContain("ピーナッツバター");
    expect(meal001Conflict?.restrictionName).toBe("ナッツアレルギー");
    expect(meal001Conflict?.riskLevel).toBe("高");

    const meal002Conflict = result.conflictingMeals.find(
      (meal) => meal.mealId === "meal_002"
    );
    expect(meal002Conflict).toBeDefined();
    expect(meal002Conflict?.conflictingIngredients).toContain("アーモンド");
    expect(meal002Conflict?.restrictionName).toBe("ナッツアレルギー");

    const meal004Conflict = result.conflictingMeals.find(
      (meal) => meal.mealId === "meal_004"
    );
    expect(meal004Conflict).toBeDefined();
    expect(meal004Conflict?.conflictingIngredients).toContain("カシューナッツ");
    expect(meal004Conflict?.restrictionName).toBe("ナッツアレルギー");

    // 抵触献立が過去の献立履歴に実在することを確認
    result.conflictingMeals.forEach((conflictingMeal) => {
      const originalMeal = pastMealHistory.find(
        (meal) => meal.mealId === conflictingMeal.mealId
      );
      expect(originalMeal).toBeDefined();
    });

    // 重要度スコア（1-10）とリスク度（低・中・高）が付与されていることを確認
    result.conflictingMeals.forEach((conflictingMeal) => {
      expect(conflictingMeal.importanceScore).toBeGreaterThanOrEqual(1);
      expect(conflictingMeal.importanceScore).toBeLessThanOrEqual(10);
      expect(["低", "中", "高"]).toContain(conflictingMeal.riskLevel);
    });

    // 検出完了フラグが true であることを確認
    expect(result.detectionComplete).toBe(true);

    // 検出タイムスタンプが現在時刻に近いことを確認（1分以内）
    const detectedAt = new Date(result.detectedAt);
    const now = new Date();
    const timeDiffMinutes =
      (now.getTime() - detectedAt.getTime()) / (1000 * 60);
    expect(Math.abs(timeDiffMinutes)).toBeLessThanOrEqual(1);
  });
});