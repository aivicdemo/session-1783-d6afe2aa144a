import { decideMealPolicy } from "../../src/logic/it-1-br-3-2-1";

describe("購入実績の記録と月次食費削減効果の自動集計・分析機能", () => {
  // SCEN-407: [edge] 献立方針決定ロジック - 食費超過額と栄養不足度が相反する優先度を示す場合、正しく判定・推奨が行われる
  test("食費超過と栄養不足が相反する場合、優先度ルールに従い判定根拠を明確に記録し推奨献立を提示する", () => {
    // 手順: 食費超過額が大きい状態（予算比150%）を設定
    const monthly_budget = 50000; // 月次食費予算: 50,000円
    const actual_expense = 75000; // 実績食費: 75,000円（150%）
    const expense_excess_rate = (actual_expense / monthly_budget) * 100; // 150%

    // 同時に栄養不足度が高い状態（必要栄養素の60%程度）を設定
    const required_protein_g = 300; // 家族必要たんぱく質: 300g/月
    const actual_protein_g = 180; // 実績たんぱく質: 180g/月（60%）
    const protein_fulfillment_rate = (actual_protein_g / required_protein_g) * 100; // 60%

    const required_vitamin_c_mg = 700; // 家族必要ビタミンC: 700mg/月
    const actual_vitamin_c_mg = 350; // 実績ビタミンC: 350mg/月（50%）
    const vitamin_c_fulfillment_rate = (actual_vitamin_c_mg / required_vitamin_c_mg) * 100; // 50%

    // 献立方針決定ロジックに両方のパラメータを入力
    const mealPolicyInput = {
      user_id: "user_001",
      month: "2024-01",
      budget_amount: monthly_budget,
      actual_expense_amount: actual_expense,
      expense_excess_rate: expense_excess_rate,
      required_nutrients: {
        protein_g: required_protein_g,
        vitamin_c_mg: required_vitamin_c_mg,
      },
      actual_nutrients: {
        protein_g: actual_protein_g,
        vitamin_c_mg: actual_vitamin_c_mg,
      },
      nutritional_fulfillment_rates: {
        protein_rate: protein_fulfillment_rate,
        vitamin_c_rate: vitamin_c_fulfillment_rate,
      },
      priority_rule: "nutrition_first", // 優先度ルール: 栄養不足を優先
    };

    // 優先度判定アルゴリズムが実行される → 推奨献立が返却される
    const result = decideMealPolicy(mealPolicyInput);

    // 推奨献立の食費と栄養バランスを検証する
    expect(result).toBeDefined();
    expect(result.user_id).toBe("user_001");
    expect(result.month).toBe("2024-01");

    // 判定ログまたは判定根拠を確認する
    expect(result.policy_decision).toBeDefined();
    expect(result.policy_decision.priority_applied).toBe("nutrition_first");

    // 食費超過状態を検証: 150%
    expect(result.analysis.expense_excess_rate).toBe(150);
    expect(result.analysis.expense_excess_amount).toBe(25000); // 75,000 - 50,000

    // 栄養不足度を検証: たんぱく質60%, ビタミンC 50%
    expect(result.analysis.nutritional_fulfillment_rates.protein_rate).toBe(60);
    expect(result.analysis.nutritional_fulfillment_rates.vitamin_c_rate).toBe(50);

    // 優先度ルール適用時の推奨方針を検証
    // 栄養不足優先ルールの場合、推奨献立は栄養不足項目を改善する方向
    expect(result.recommended_meal_policy.focus_items).toContain("protein");
    expect(result.recommended_meal_policy.focus_items).toContain("vitamin_c");

    // 優先度に基づいた推奨献立の確認
    expect(result.recommended_meal_policy.target_budget_rate).toBeLessThanOrEqual(100);
    expect(result.recommended_meal_policy.target_expense_amount).toBeLessThanOrEqual(
      monthly_budget
    );

    // 判定根拠が明確に記録されていることを確認
    expect(result.decision_rationale).toBeDefined();
    expect(result.decision_rationale).toContain("nutrition_first");
    expect(result.decision_rationale).toContain("protein_shortage");
    expect(result.decision_rationale).toContain("vitamin_c_shortage");

    // 矛盾なく統一された判定結果であることを確認
    expect(result.policy_decision.is_consistent).toBe(true);

    // 推奨献立の栄養向上目標を検証
    // 栄養不足優先の場合、栄養改善が最優先
    expect(result.recommended_meal_policy.nutritional_targets.protein_target_g).toBeGreaterThan(
      actual_protein_g
    );
    expect(result.recommended_meal_policy.nutritional_targets.vitamin_c_target_mg).toBeGreaterThan(
      actual_vitamin_c_mg
    );

    // 食費削減目標も定義されていることを確認（両立可能な範囲で）
    expect(result.recommended_meal_policy.cost_reduction_strategy).toBeDefined();
    expect(result.recommended_meal_policy.cost_reduction_strategy.target_excess_rate).toBeLessThan(
      expense_excess_rate
    );
  });
});