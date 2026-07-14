import { validateMenuConstraints } from '../../src/logic/it-7-2-1';

describe('献立確定・制約条件検証機能', () => {
  // SCEN-548
  test('全制約条件（栄養・アレルギー・予算・調理時間・在庫）を満たす献立案が確定可能と判定される', () => {
    const menu_proposal = {
      menu_id: 'menu_20240115_001',
      dishes: [
        {
          dish_id: 'dish_001',
          dish_name: '鶏胸肉のグリル',
          calories: 300,
          protein_g: 35,
          fat_g: 8,
          allergens: [],
          cost_yen: 250,
          cooking_time_min: 15,
          ingredients: [
            { ingredient_id: 'ing_001', ingredient_name: '鶏胸肉', quantity: 200, unit: 'g', stock_available: 500 }
          ]
        },
        {
          dish_id: 'dish_002',
          dish_name: '野菜サラダ',
          calories: 100,
          protein_g: 5,
          fat_g: 3,
          allergens: [],
          cost_yen: 150,
          cooking_time_min: 5,
          ingredients: [
            { ingredient_id: 'ing_002', ingredient_name: 'レタス', quantity: 100, unit: 'g', stock_available: 1000 },
            { ingredient_id: 'ing_003', ingredient_name: 'トマト', quantity: 100, unit: 'g', stock_available: 800 }
          ]
        },
        {
          dish_id: 'dish_003',
          dish_name: 'ご飯',
          calories: 300,
          protein_g: 6,
          fat_g: 1,
          allergens: [],
          cost_yen: 80,
          cooking_time_min: 10,
          ingredients: [
            { ingredient_id: 'ing_004', ingredient_name: 'お米', quantity: 150, unit: 'g', stock_available: 5000 }
          ]
        }
      ]
    };

    const constraints = {
      nutrition: {
        calorie_min: 1800,
        calorie_max: 2200,
        protein_g_min: 50,
        fat_g_max: 60
      },
      allergens_prohibited: ['egg', 'milk', 'shrimp', 'crab'],
      budget_max_yen: 500,
      cooking_time_max_min: 30,
      user_id: 'user_001',
      family_member_id: 'family_001'
    };

    const result = validateMenuConstraints(menu_proposal, constraints);

    expect(result.is_valid).toBe(true);
    expect(result.overall_status).toBe('確定可能');

    expect(result.nutrition_check).toEqual({
      is_valid: true,
      total_calories: 700,
      total_protein_g: 46,
      total_fat_g: 12,
      calorie_fulfillment_pct: Math.round((700 / 2000) * 100),
      protein_fulfillment_pct: Math.round((46 / 50) * 100),
      fat_fulfillment_pct: Math.round((12 / 60) * 100)
    });

    expect(result.allergen_check).toEqual({
      is_valid: true,
      detected_allergens: [],
      prohibited_allergens: ['egg', 'milk', 'shrimp', 'crab'],
      conflict_count: 0
    });

    expect(result.budget_check).toEqual({
      is_valid: true,
      total_cost_yen: 480,
      budget_limit_yen: 500,
      remaining_budget_yen: 20,
      budget_fulfillment_pct: Math.round((480 / 500) * 100)
    });

    expect(result.cooking_time_check).toEqual({
      is_valid: true,
      total_time_min: 30,
      time_limit_min: 30,
      remaining_time_min: 0,
      time_fulfillment_pct: 100
    });

    expect(result.inventory_check).toEqual({
      is_valid: true,
      checked_ingredients: [
        { ingredient_id: 'ing_001', ingredient_name: '鶏胸肉', required_quantity: 200, available_stock: 500, is_sufficient: true },
        { ingredient_id: 'ing_002', ingredient_name: 'レタス', required_quantity: 100, available_stock: 1000, is_sufficient: true },
        { ingredient_id: 'ing_003', ingredient_name: 'トマト', required_quantity: 100, available_stock: 800, is_sufficient: true },
        { ingredient_id: 'ing_004', ingredient_name: 'お米', required_quantity: 150, available_stock: 5000, is_sufficient: true }
      ],
      insufficient_items: [],
      total_items_checked: 4
    });

    expect(result.validation_timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    expect(result.constraint_satisfaction_score).toBe(100);
  });
});