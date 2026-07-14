import { generateMenuPlan } from "../../src/logic/it-7-2-1";

describe("献立生成要求処理 - 食事制限・アレルギー情報が空配列の場合", () => {
  // SCEN-531
  test("食事制限とアレルギー情報が空配列でも献立生成要求を正常に受け付ける", async () => {
    const fetchMock = require("jest-fetch-mock");
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    const requestPayload = {
      user_id: "user_12345",
      meal_type: "dinner",
      num_people: 4,
      family_member_ids: ["fam_001", "fam_002", "fam_003", "fam_004"],
      dietary_restrictions: [],
      allergy_info: [],
      budget_limit: 3000,
      cooking_time_limit_minutes: 45,
      preferred_cuisines: ["Japanese", "Italian"],
      exclude_ingredients: []
    };

    const mockMenuData = {
      plan_id: "plan_20240115_001",
      generated_at: "2024-01-15T11:00:00Z",
      status: "success",
      menus: [
        {
          menu_name: "Grilled Salmon with Steamed Vegetables",
          nutrition_info: {
            calories: 420,
            protein_g: 35,
            carbs_g: 28,
            fat_g: 15
          },
          cooking_time_minutes: 30,
          estimated_cost: 1200,
          ingredients: [
            { name: "salmon", amount: 300, unit: "g" },
            { name: "broccoli", amount: 200, unit: "g" },
            { name: "carrot", amount: 100, unit: "g" }
          ]
        },
        {
          menu_name: "Caesar Salad",
          nutrition_info: {
            calories: 180,
            protein_g: 12,
            carbs_g: 15,
            fat_g: 8
          },
          cooking_time_minutes: 10,
          estimated_cost: 450,
          ingredients: [
            { name: "romaine lettuce", amount: 200, unit: "g" },
            { name: "parmesan", amount: 50, unit: "g" }
          ]
        }
      ],
      total_cooking_time_minutes: 40,
      total_estimated_cost: 1650,
      satisfaction_score: null,
      error_message: null
    };

    fetchMock.mockResponseOnce(JSON.stringify(mockMenuData), { status: 200 });

    const result = await generateMenuPlan(requestPayload);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.status_code).toBe(200);
    expect(result.data).toEqual(mockMenuData);
    expect(result.data.plan_id).toBe("plan_20240115_001");
    expect(result.data.status).toBe("success");
    expect(result.data.menus).toHaveLength(2);
    expect(result.data.menus[0].menu_name).toBe("Grilled Salmon with Steamed Vegetables");
    expect(result.data.menus[0].nutrition_info.calories).toBe(420);
    expect(result.data.menus[0].cooking_time_minutes).toBe(30);
    expect(result.data.menus[0].estimated_cost).toBe(1200);
    expect(result.data.menus[1].menu_name).toBe("Caesar Salad");
    expect(result.data.menus[1].nutrition_info.calories).toBe(180);
    expect(result.data.total_cooking_time_minutes).toBe(40);
    expect(result.data.total_estimated_cost).toBe(1650);
    expect(result.data.error_message).toBeNull();
    expect(result.data.generated_at).toBe("2024-01-15T11:00:00Z");
  });
});