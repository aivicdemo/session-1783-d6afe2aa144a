import { validateMealPlanConstraints } from '../../src/logic/it-1-br-3-2-1';

describe('献立確定前の全制約検証機能', () => {
  // SCEN-332
  test('献立案が栄養・アレルギー・予算・調理時間・在庫の全制約条件を充足している場合に確定可能と判定される', () => {
    const mealPlan = {
      id: 'meal_001',
      user_id: 'user_123',
      meals: [
        {
          dish_id: 'dish_001',
          dish_name: '鶏のグリル焼き',
          cooking_time_minutes: 20,
          cost_yen: 800,
          allergens: ['鶏肉'],
          ingredients: [
            { ingredient_id: 'ing_001', name: '鶏むね肉', required_amount: 200, unit: 'g' },
            { ingredient_id: 'ing_002', name: 'オリーブオイル', required_amount: 10, unit: 'ml' },
            { ingredient_id: 'ing_003', name: '塩', required_amount: 2, unit: 'g' },
          ],
          nutrients: {
            protein_g: 35,
            fat_g: 8,
            carbohydrate_g: 2,
            vitamin_a_mcg: 50,
            vitamin_c_mg: 5,
            calcium_mg: 15,
            iron_mg: 1.2,
          },
        },
        {
          dish_id: 'dish_002',
          dish_name: 'ほうれん草のおひたし',
          cooking_time_minutes: 15,
          cost_yen: 300,
          allergens: [],
          ingredients: [
            { ingredient_id: 'ing_004', name: 'ほうれん草', required_amount: 150, unit: 'g' },
            { ingredient_id: 'ing_005', name: '醤油', required_amount: 15, unit: 'ml' },
          ],
          nutrients: {
            protein_g: 3,
            fat_g: 0.5,
            carbohydrate_g: 4,
            vitamin_a_mcg: 420,
            vitamin_c_mg: 20,
            calcium_mg: 90,
            iron_mg: 3.2,
          },
        },
        {
          dish_id: 'dish_003',
          dish_name: '豚汁',
          cooking_time_minutes: 25,
          cost_yen: 250,
          allergens: ['豚肉'],
          ingredients: [
            { ingredient_id: 'ing_006', name: '豚肉', required_amount: 100, unit: 'g' },
            { ingredient_id: 'ing_007', name: '大根', required_amount: 100, unit: 'g' },
            { ingredient_id: 'ing_008', name: '味噌', required_amount: 20, unit: 'g' },
          ],
          nutrients: {
            protein_g: 12,
            fat_g: 6,
            carbohydrate_g: 8,
            vitamin_a_mcg: 80,
            vitamin_c_mg: 15,
            calcium_mg: 50,
            iron_mg: 0.8,
          },
        },
      ],
      family_members: [
        {
          member_id: 'member_001',
          name: '夫',
          age: 42,
          gender: 'M',
          registered_allergens: ['卵', 'エビ'],
          food_restrictions: [],
        },
        {
          member_id: 'member_002',
          name: '妻',
          age: 40,
          gender: 'F',
          registered_allergens: [],
          food_restrictions: ['グルテンフリー'],
        },
      ],
      inventory: [
        { ingredient_id: 'ing_001', available_amount: 500, unit: 'g' },
        { ingredient_id: 'ing_002', available_amount: 500, unit: 'ml' },
        { ingredient_id: 'ing_003', available_amount: 1000, unit: 'g' },
        { ingredient_id: 'ing_004', available_amount: 300, unit: 'g' },
        { ingredient_id: 'ing_005', available_amount: 500, unit: 'ml' },
        { ingredient_id: 'ing_006', available_amount: 300, unit: 'g' },
        { ingredient_id: 'ing_007', available_amount: 500, unit: 'g' },
        { ingredient_id: 'ing_008', available_amount: 200, unit: 'g' },
      ],
      budget_limit_yen: 2000,
      total_cooking_time_limit_minutes: 90,
      nutrition_targets: {
        protein_g_min: 40,
        protein_g_max: 80,
        fat_g_min: 10,
        fat_g_max: 40,
        carbohydrate_g_min: 10,
        carbohydrate_g_max: 100,
        vitamin_a_mcg_min: 500,
        vitamin_c_mg_min: 50,
        calcium_mg_min: 100,
        iron_mg_min: 5,
      },
    };

    const result = validateMealPlanConstraints(mealPlan);

    expect(result).toEqual({
      is_valid: true,
      constraints_satisfied: {
        nutrition: true,
        allergen: true,
        budget: true,
        cooking_time: true,
        inventory: true,
      },
      constraint_details: {
        nutrition: {
          is_satisfied: true,
          protein_g: {
            total: 50,
            min_target: 40,
            max_target: 80,
            satisfied: true,
          },
          fat_g: {
            total: 14.5,
            min_target: 10,
            max_target: 40,
            satisfied: true,
          },
          carbohydrate_g: {
            total: 14,
            min_target: 10,
            max_target: 100,
            satisfied: true,
          },
          vitamin_a_mcg: {
            total: 550,
            min_target: 500,
            satisfied: true,
          },
          vitamin_c_mg: {
            total: 40,
            min_target: 50,
            satisfied: false,
          },
          calcium_mg: {
            total: 155,
            min_target: 100,
            satisfied: true,
          },
          iron_mg: {
            total: 5.2,
            min_target: 5,
            satisfied: true,
          },
        },
        allergen: {
          is_satisfied: true,
          detected_allergens: ['鶏肉', '豚肉'],
          family_registered_allergens: {
            member_001: ['卵', 'エビ'],
            member_002: [],
          },
          conflicting_allergens: [],
        },
        budget: {
          is_satisfied: true,
          total_cost_yen: 1350,
          budget_limit_yen: 2000,
          remaining_budget_yen: 650,
          cost_ratio: 0.675,
        },
        cooking_time: {
          is_satisfied: true,
          total_cooking_time_minutes: 60,
          time_limit_minutes: 90,
          remaining_time_minutes: 30,
          time_ratio: 0.667,
        },
        inventory: {
          is_satisfied: true,
          ingredient_status: [
            {
              ingredient_id: 'ing_001',
              required_amount: 200,
              available_amount: 500,
              unit: 'g',
              satisfied: true,
            },
            {
              ingredient_id: 'ing_002',
              required_amount: 10,
              available_amount: 500,
              unit: 'ml',
              satisfied: true,
            },
            {
              ingredient_id: 'ing_003',
              required_amount: 2,
              available_amount: 1000,
              unit: 'g',
              satisfied: true,
            },
            {
              ingredient_id: 'ing_004',
              required_amount: 150,
              available_amount: 300,
              unit: 'g',
              satisfied: true,
            },
            {
              ingredient_id: 'ing_005',
              required_amount: 15,
              available_amount: 500,
              unit: 'ml',
              satisfied: true,
            },
            {
              ingredient_id: 'ing_006',
              required_amount: 100,
              available_amount: 300,
              unit: 'g',
              satisfied: true,
            },
            {
              ingredient_id: 'ing_007',
              required_amount: 100,
              available_amount: 500,
              unit: 'g',
              satisfied: true,
            },
            {
              ingredient_id: 'ing_008',
              required_amount: 20,
              available_amount: 200,
              unit: 'g',
              satisfied: true,
            },
          ],
          unsatisfied_ingredients: [],
        },
      },
      overall_satisfaction_score: 0.833,
      can_confirm: true,
      confirmation_message:
        '全制約条件を充足しています。献立を確定できます。',
    });

    // 栄養制約の詳細検証
    expect(result.constraint_details.nutrition.protein_g.total).toBe(50);
    expect(result.constraint_details.nutrition.fat_g.total).toBe(14.5);
    expect(result.constraint_details.nutrition.carbohydrate_g.total).toBe(14);
    expect(result.constraint_details.nutrition.vitamin_a_mcg.total).toBe(550);
    expect(result.constraint_details.nutrition.calcium_mg.total).toBe(155);
    expect(result.constraint_details.nutrition.iron_mg.total).toBe(5.2);

    // アレルギー制約の詳細検証
    expect(result.constraint_details.allergen.conflicting_allergens.length).toBe(0);
    expect(result.constraint_details.allergen.is_satisfied).toBe(true);

    // 予算制約の詳細検証
    expect(result.constraint_details.budget.total_cost_yen).toBe(1350);
    expect(result.constraint_details.budget.remaining_budget_yen).toBe(650);
    expect(result.constraint_details.budget.cost_ratio).toBeCloseTo(0.675, 3);

    // 調理時間制約の詳細検証
    expect(result.constraint_details.cooking_time.total_cooking_time_minutes).toBe(60);
    expect(result.constraint_details.cooking_time.remaining_time_minutes).toBe(30);
    expect(result.constraint_details.cooking_time.time_ratio).toBeCloseTo(0.667, 3);

    // 在庫制約の詳細検証
    expect(result.constraint_details.inventory.unsatisfied_ingredients.length).toBe(0);
    expect(result.constraint_details.inventory.ingredient_status.every((s) => s.satisfied)).toBe(
      true
    );

    // 全体判定
    expect(result.constraints_satisfied.nutrition).toBe(true);
    expect(result.constraints_satisfied.allergen).toBe(true);
    expect(result.constraints_satisfied.budget).toBe(true);
    expect(result.constraints_satisfied.cooking_time).toBe(true);
    expect(result.constraints_satisfied.inventory).toBe(true);
    expect(result.is_valid).toBe(true);
    expect(result.can_confirm).toBe(true);
  });
});