import { determinePriorityCondition } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-505
  test("月次分析ダッシュボード・献立優先条件決定機能 - 食費超過かつ栄養不足の場合、食費重視と栄養重視の判定ロジックが正しく動作する", () => {
    // テストデータ設定: 月間食費が予算上限を超過、栄養摂取量が推奨値未満の状態
    const monthlyData = {
      budget_limit: 50000,
      actual_spending: 58000,
      protein_target: 60,
      protein_actual: 45,
      vitamin_c_target: 100,
      vitamin_c_actual: 65,
      calcium_target: 800,
      calcium_actual: 520,
    };

    // 食費超過率を計算: (58000 - 50000) / 50000 = 0.16 (16%)
    const food_cost_excess_rate = (monthlyData.actual_spending - monthlyData.budget_limit) / monthlyData.budget_limit;
    expect(food_cost_excess_rate).toBe(0.16);

    // 栄養不足率を計算: 複数の栄養素の平均不足率
    // タンパク質: (60 - 45) / 60 = 0.25 (25% 不足)
    // ビタミンC: (100 - 65) / 100 = 0.35 (35% 不足)
    // カルシウム: (800 - 520) / 800 = 0.35 (35% 不足)
    // 平均不足率: (0.25 + 0.35 + 0.35) / 3 = 0.3167 (31.67%)
    const nutrition_deficiency_rate = ((monthlyData.protein_target - monthlyData.protein_actual) / monthlyData.protein_target +
      (monthlyData.vitamin_c_target - monthlyData.vitamin_c_actual) / monthlyData.vitamin_c_target +
      (monthlyData.calcium_target - monthlyData.calcium_actual) / monthlyData.calcium_target) / 3;
    expect(nutrition_deficiency_rate).toBeCloseTo(0.3167, 3);

    // 判定ロジック実行: 食費超過度合い vs 栄養不足度合い を比較
    // ビジネスルール: 食費超過度合い > 栄養不足度合いの場合は『食費重視』、その逆は『栄養重視』
    const priorityCondition = determinePriorityCondition({
      budget_limit: monthlyData.budget_limit,
      actual_spending: monthlyData.actual_spending,
      protein_target: monthlyData.protein_target,
      protein_actual: monthlyData.protein_actual,
      vitamin_c_target: monthlyData.vitamin_c_target,
      vitamin_c_actual: monthlyData.vitamin_c_actual,
      calcium_target: monthlyData.calcium_target,
      calcium_actual: monthlyData.calcium_actual,
    });

    // 比較結果: 食費超過率 16% < 栄養不足率 31.67% なので『栄養重視』が決定される
    expect(priorityCondition.decision).toBe("栄養重視");

    // 決定結果のメタデータを検証
    expect(priorityCondition.food_cost_excess_rate).toBe(0.16);
    expect(priorityCondition.nutrition_deficiency_rate).toBeCloseTo(0.3167, 3);
    expect(priorityCondition.priority_order).toEqual([
      "栄養不足項目の改善",
      "食費超過の抑制",
    ]);

    // 推奨献立のターゲット設定が『栄養重視』に従っていることを確認
    expect(priorityCondition.recommended_menu_config).toEqual({
      nutrition_priority: true,
      cost_optimization_priority: false,
      calorie_range_min: 1900,
      calorie_range_max: 2100,
      nutrient_targets: {
        protein_g: 65,
        calcium_mg: 850,
        vitamin_c_mg: 110,
      },
      estimated_daily_cost_limit: 1800,
    });
  });
});