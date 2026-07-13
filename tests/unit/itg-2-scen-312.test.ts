import { describe, test, expect } from "@jest/globals";
import {
  loadConstraintsFromRegistry,
} from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザー食事記録と栄養摂取量の推移データ集計ダッシュボード", () => {
  // SCEN-312: [normal] 献立生成要求受付・制約条件読み込み機能 - 手動ボタン押下時に登録済みの全制約条件（栄養・アレルギー・予算・調理時間）が正常に読み込まれる
  test("should load all registered constraints (nutrition, allergy, budget, cooking time) when manual button is clicked", () => {
    const user_id = "usr_001";
    const family_member_id = "fam_001";

    const input_params = {
      user_id,
      family_member_id,
      trigger_type: "manual" as const,
    };

    const expected_nutrition_constraints = {
      calories_min: 1800,
      calories_max: 2200,
      protein_g: 50,
      fat_g: 65,
      carbohydrate_g: 270,
    };

    const expected_allergy_constraints = [
      { allergen_name: "peanut", allergen_id: "alg_001" },
      { allergen_name: "shellfish", allergen_id: "alg_002" },
      { allergen_name: "egg", allergen_id: "alg_003" },
    ];

    const expected_budget_constraints = {
      max_price_per_meal: 800,
      max_price_per_day: 2500,
    };

    const expected_cooking_time_constraints = {
      max_cooking_time_minutes: 45,
    };

    const result = loadConstraintsFromRegistry(input_params);

    expect(result).toEqual(
      expect.objectContaining({
        user_id,
        family_member_id,
        load_status: "success",
        nutrition_constraints: expected_nutrition_constraints,
        allergy_constraints: expected_allergy_constraints,
        budget_constraints: expected_budget_constraints,
        cooking_time_constraints: expected_cooking_time_constraints,
        loaded_at: expect.any(String),
      })
    );

    expect(result.nutrition_constraints.calories_min).toBe(1800);
    expect(result.nutrition_constraints.calories_max).toBe(2200);
    expect(result.nutrition_constraints.protein_g).toBe(50);
    expect(result.nutrition_constraints.fat_g).toBe(65);
    expect(result.nutrition_constraints.carbohydrate_g).toBe(270);

    expect(result.allergy_constraints).toHaveLength(3);
    expect(result.allergy_constraints[0].allergen_name).toBe("peanut");
    expect(result.allergy_constraints[1].allergen_name).toBe("shellfish");
    expect(result.allergy_constraints[2].allergen_name).toBe("egg");

    expect(result.budget_constraints.max_price_per_meal).toBe(800);
    expect(result.budget_constraints.max_price_per_day).toBe(2500);

    expect(result.cooking_time_constraints.max_cooking_time_minutes).toBe(45);

    expect(result.load_status).toBe("success");
    expect(result.notification_message).toMatch(/制約条件/);
  });
});