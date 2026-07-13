import { prioritizeRecipesBasedOnEvaluation } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザー食事記録と栄養摂取量の推移データの自動集計と達成度可視化", () => {
  // SCEN-342: 評価データ蓄積に基づく高評価料理の優先度付けと献立反映 - 評価データが閾値未満の場合、前週の優先度設定が維持される
  test("should maintain previous week priority when evaluation scores fall below threshold", () => {
    // Precondition: 栄養管理・分析ダッシュボードシステムにログイン済み
    // 前週の献立と料理の優先度設定を確認・記録
    const previousWeekPriorities = [
      { recipeId: "recipe_001", dishName: "鶏のトマト煮込み", priority: 1, evaluationThreshold: 3.0 },
      { recipeId: "recipe_002", dishName: "野菜サラダ", priority: 2, evaluationThreshold: 3.0 },
      { recipeId: "recipe_003", dishName: "白身魚のムニエル", priority: 3, evaluationThreshold: 3.0 },
    ];

    // 当週の料理評価データ: すべて閾値未満（2.9以下）に設定
    const currentWeekEvaluations = [
      { recipeId: "recipe_001", dishName: "鶏のトマト煮込み", averageScore: 2.8, sampleCount: 1 },
      { recipeId: "recipe_002", dishName: "野菜サラダ", averageScore: 2.5, sampleCount: 1 },
      { recipeId: "recipe_003", dishName: "白身魚のムニエル", averageScore: 2.9, sampleCount: 1 },
    ];

    // Trigger: 優先度付けと献立反映の処理を実行
    const result = prioritizeRecipesBasedOnEvaluation({
      previousWeekPriorities: previousWeekPriorities,
      currentWeekEvaluations: currentWeekEvaluations,
      evaluationThreshold: 3.0,
      executionTimestamp: "2024-01-15T09:00:00Z",
    });

    // Outcome: 評価データが閾値未満の場合、前週の優先度設定が維持される
    expect(result.priorityMaintained).toBe(true);
    expect(result.currentWeekPriorities).toHaveLength(3);
    expect(result.currentWeekPriorities[0]).toEqual({
      recipeId: "recipe_001",
      dishName: "鶏のトマト煮込み",
      priority: 1,
    });
    expect(result.currentWeekPriorities[1]).toEqual({
      recipeId: "recipe_002",
      dishName: "野菜サラダ",
      priority: 2,
    });
    expect(result.currentWeekPriorities[2]).toEqual({
      recipeId: "recipe_003",
      dishName: "白身魚のムニエル",
      priority: 3,
    });

    // 新たな優先度の変更が発生せず、前週の設定が保持される
    expect(result.prioritiesChanged).toBe(false);
    expect(result.changeReason).toBe("evaluation_below_threshold");
    expect(result.maintainedFrom).toBe("2024-01-15T09:00:00Z");

    // 当週の献立に同じ優先度順序が反映されることを検証
    expect(result.reflectedMenuItems).toEqual([
      { recipeId: "recipe_001", priority: 1, displayOrder: 1 },
      { recipeId: "recipe_002", priority: 2, displayOrder: 2 },
      { recipeId: "recipe_003", priority: 3, displayOrder: 3 },
    ]);
  });
});