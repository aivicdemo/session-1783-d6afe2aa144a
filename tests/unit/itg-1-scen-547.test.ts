import { generateMealPlanWithinSLA } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-547: [edge] SLA超過時の代替処理と遅延通知機能 - 経過時間がSLA閾値を超過していない場合、代替処理が実行されない
  test("経過時間がSLA閾値未満の場合、代替処理が実行されず通常結果が返却される", () => {
    const sla_threshold_ms = 5000;
    const family_id = "family_001";
    const user_id = "user_001";
    const constraint_conditions = {
      allergy_exclude: ["エビ", "カニ"],
      dietary_restriction: ["ベジタリアン"],
      cooking_time_limit_minutes: 30,
      budget_limit_yen: 3000,
      family_members: [
        { member_id: "member_001", age: 35, allergies: ["エビ"], preferences: ["和食"] },
        { member_id: "member_002", age: 8, allergies: ["牛乳"], preferences: ["カレー"] },
      ],
    };
    const meal_evaluation_data = [
      { dish_id: "dish_001", satisfaction_score: 5, completion_rate: 1.0, request: "もっと辛く" },
      { dish_id: "dish_002", satisfaction_score: 4, completion_rate: 0.8, request: "" },
    ];
    const execution_start_time = Date.now();

    const result = generateMealPlanWithinSLA({
      sla_threshold_ms,
      family_id,
      user_id,
      constraint_conditions,
      meal_evaluation_data,
    });

    const execution_end_time = Date.now();
    const execution_time_ms = execution_end_time - execution_start_time;

    // 実行時間がSLA閾値未満であることを確認
    expect(execution_time_ms).toBeLessThan(sla_threshold_ms);

    // 通常の献立生成結果が返却されていることを確認
    expect(result).toHaveProperty("meal_plans");
    expect(Array.isArray(result.meal_plans)).toBe(true);
    expect(result.meal_plans.length).toBeGreaterThan(0);

    // 代替処理が実行されていないこと（fallback_usedフラグがfalseであること）
    expect(result.fallback_used).toBe(false);

    // 遅延通知が送信されていないこと
    expect(result.delay_notification_sent).toBe(false);

    // ログに代替処理の実行記録がないこと
    expect(result.execution_log).toBeDefined();
    expect(result.execution_log.includes("fallback_executed")).toBe(false);

    // 献立プランが制約条件を満たしていることを確認
    result.meal_plans.forEach((meal_plan: any) => {
      expect(meal_plan.cooking_time_minutes).toBeLessThanOrEqual(constraint_conditions.cooking_time_limit_minutes);
      expect(meal_plan.estimated_cost_yen).toBeLessThanOrEqual(constraint_conditions.budget_limit_yen);
      constraint_conditions.allergy_exclude.forEach((allergen: string) => {
        expect(meal_plan.ingredients.map((ing: any) => ing.name)).not.toContain(allergen);
      });
    });

    // 食事評価データが献立生成ロジックに反映されていることを確認
    expect(result.meal_evaluation_reflection_applied).toBe(true);

    // 実行時間がログに記録されていることを確認
    expect(result.execution_log).toContain(`execution_time_ms=${execution_time_ms}`);
  });
});