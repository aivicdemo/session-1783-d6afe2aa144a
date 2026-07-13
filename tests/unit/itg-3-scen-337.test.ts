import { validateMenuConstraintsBefore } from "../../src/logic/it-1-br-3-2-1";

describe("献立確定前の全制約検証機能", () => {
  test("SCEN-337: 予算制約が0円に設定されている場合に全ての献立案が確定不可と判定される", () => {
    const budget_constraint = 0;
    const menu_candidates = [
      {
        menu_id: "menu_001",
        name: "献立案A",
        ingredients: [
          { ingredient_id: "ing_001", name: "米", quantity: 500, unit: "g" },
          { ingredient_id: "ing_002", name: "鶏肉", quantity: 200, unit: "g" },
        ],
        estimated_cost: 800,
        estimated_cooking_time_minutes: 30,
        nutrition: {
          calories: 600,
          protein_g: 25,
          carbs_g: 80,
          fat_g: 15,
        },
      },
      {
        menu_id: "menu_002",
        name: "献立案B",
        ingredients: [
          { ingredient_id: "ing_003", name: "麺", quantity: 300, unit: "g" },
          { ingredient_id: "ing_004", name: "豚肉", quantity: 150, unit: "g" },
        ],
        estimated_cost: 650,
        estimated_cooking_time_minutes: 25,
        nutrition: {
          calories: 550,
          protein_g: 22,
          carbs_g: 75,
          fat_g: 12,
        },
      },
      {
        menu_id: "menu_003",
        name: "献立案C",
        ingredients: [
          { ingredient_id: "ing_005", name: "野菜", quantity: 400, unit: "g" },
          { ingredient_id: "ing_006", name: "魚", quantity: 180, unit: "g" },
        ],
        estimated_cost: 720,
        estimated_cooking_time_minutes: 28,
        nutrition: {
          calories: 580,
          protein_g: 28,
          carbs_g: 65,
          fat_g: 10,
        },
      },
    ];

    const constraints = {
      budget_constraint_yen: budget_constraint,
      max_cooking_time_minutes: 40,
      nutrition_targets: {
        min_calories: 500,
        max_calories: 700,
        min_protein_g: 20,
        min_carbs_g: 60,
      },
      family_allergies: ["shrimp", "nuts"],
      family_dietary_restrictions: [],
    };

    const validation_results = menu_candidates.map((candidate) =>
      validateMenuConstraintsBefore({
        menu_id: candidate.menu_id,
        menu_name: candidate.name,
        estimated_cost_yen: candidate.estimated_cost,
        estimated_cooking_time_minutes: candidate.estimated_cooking_time_minutes,
        nutrition_actual: candidate.nutrition,
        budget_constraint_yen: constraints.budget_constraint_yen,
        max_cooking_time_minutes: constraints.max_cooking_time_minutes,
        nutrition_targets: constraints.nutrition_targets,
        family_allergies: constraints.family_allergies,
        family_dietary_restrictions: constraints.family_dietary_restrictions,
      })
    );

    validation_results.forEach((result, index) => {
      expect(result.can_confirm).toBe(false);
      expect(result.confirmation_status).toBe("不可");
      expect(result.constraint_violations).toContain("予算制約");
      expect(result.error_message).toMatch(
        /予算制約が0円に設定されています。有効な予算額を設定してください/
      );
      expect(result.is_confirm_button_disabled).toBe(true);
    });

    expect(validation_results).toHaveLength(3);
    expect(validation_results[0].menu_id).toBe("menu_001");
    expect(validation_results[1].menu_id).toBe("menu_002");
    expect(validation_results[2].menu_id).toBe("menu_003");

    const all_confirm_disabled = validation_results.every(
      (r) => r.is_confirm_button_disabled === true
    );
    expect(all_confirm_disabled).toBe(true);
  });
});