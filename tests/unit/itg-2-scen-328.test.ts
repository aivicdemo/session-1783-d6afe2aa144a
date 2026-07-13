import { calculateMenuConstraintSatisfactionScore } from "../../src/logic/it-1-br-2-1-1-1";

describe("献立案の制約条件充足度スコア計算機能", () => {
  // SCEN-328
  test("制約条件が定義されていない場合、エラーが返される", () => {
    const menu_id = "menu_20240115_001";
    const family_member_id = "member_12345";
    const menu_data = {
      menu_id: menu_id,
      family_member_id: family_member_id,
      dishes: [
        {
          dish_id: "dish_001",
          dish_name: "鮭の塩焼き",
          cooking_time_minutes: 25,
          calories: 280,
          protein_g: 28,
          carbs_g: 2,
          fat_g: 18,
          sodium_mg: 480,
          fiber_g: 0,
        },
        {
          dish_id: "dish_002",
          dish_name: "ほうれん草のおひたし",
          cooking_time_minutes: 12,
          calories: 42,
          protein_g: 4,
          carbs_g: 6,
          fat_g: 0,
          sodium_mg: 120,
          fiber_g: 2,
        },
      ],
      total_cooking_time_minutes: 37,
      estimated_total_calories: 322,
      estimated_total_protein_g: 32,
      estimated_total_carbs_g: 8,
      estimated_total_fat_g: 18,
      estimated_total_sodium_mg: 600,
      estimated_total_fiber_g: 2,
    };

    const constraints_data = {
      nutrition_constraints: [],
      allergy_constraints: [],
      budget_constraints: [],
      cooking_time_constraints: [],
      inventory_constraints: [],
    };

    expect(() =>
      calculateMenuConstraintSatisfactionScore(menu_data, constraints_data)
    ).toThrow(/制約条件/);
  });
});