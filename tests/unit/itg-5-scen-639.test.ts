import { generateMenuForInitialStage } from "../../src/logic/it-7-2-1";

describe("初期段階献立生成機能 - 評価データ30件未満時の生成", () => {
  // SCEN-639
  test("評価データが29件の状態で、栄養基準と基本属性のみで献立が生成される", () => {
    const user_id = "user_001";
    const family_member_id = "member_001";
    const age = 35;
    const gender = "M";
    const activity_level = 1.55;
    const target_calories = 2500;
    const target_protein_g = 75;
    const target_fat_g = 83;
    const target_carbs_g = 313;
    const evaluation_data_count = 29;
    const food_restrictions = ["nuts"];
    const allergies = ["peanut"];
    const max_cooking_time_minutes = 60;
    const budget_limit_yen = 3000;

    const input_params = {
      user_id,
      family_member_id,
      basic_attributes: {
        age,
        gender,
        activity_level,
      },
      nutritional_targets: {
        calories: target_calories,
        protein_g: target_protein_g,
        fat_g: target_fat_g,
        carbs_g: target_carbs_g,
      },
      constraints: {
        food_restrictions,
        allergies,
        max_cooking_time_minutes,
        budget_limit_yen,
      },
      evaluation_data_count,
    };

    const result = generateMenuForInitialStage(input_params);

    expect(result).toBeDefined();
    expect(result.menu_id).toBeDefined();
    expect(result.generation_method).toBe("nutritional_baseline_only");
    expect(result.uses_evaluation_data).toBe(false);
    expect(result.uses_preference_learning).toBe(false);
    expect(result.nutritional_compliance).toEqual({
      calories_kcal: target_calories,
      protein_g: target_protein_g,
      fat_g: target_fat_g,
      carbs_g: target_carbs_g,
    });
    expect(result.menu_items).toBeDefined();
    expect(Array.isArray(result.menu_items)).toBe(true);
    expect(result.menu_items.length).toBeGreaterThan(0);
    expect(result.respects_allergies).toBe(true);
    expect(result.respects_food_restrictions).toBe(true);
    expect(result.estimated_cooking_time_minutes).toBeLessThanOrEqual(
      max_cooking_time_minutes
    );
    expect(result.estimated_cost_yen).toBeLessThanOrEqual(budget_limit_yen);
    expect(result.applied_parameters).toEqual({
      age,
      gender,
      activity_level,
      calorie_target: target_calories,
      protein_target_g: target_protein_g,
      fat_target_g: target_fat_g,
      carbs_target_g: target_carbs_g,
    });
    expect(result.applied_parameters_source).toBe("basic_attributes_only");
    expect(result.evaluation_data_applied).toBe(false);
    expect(result.preference_model_applied).toBe(false);
    expect(result.generated_at).toBeDefined();
    expect(typeof result.generated_at).toBe("string");
  });
});