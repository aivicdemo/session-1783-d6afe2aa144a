import { validateMenuConfirmation } from '../../src/logic/it-1-br-2-1-1-1';

describe('献立確定時の全制約条件検証・確定可否判定機能', () => {
  // SCEN-330
  test('在庫不足により1つの制約条件が未充足の場合、確定不可の判定と理由が返される', () => {
    const menu_id = 'menu_001';
    const family_id = 'family_001';
    const ingredients = [
      {
        ingredient_id: 'ing_001',
        ingredient_name: '鶏肉',
        required_quantity: 500,
        required_unit: 'g',
        current_stock: 300,
        stock_unit: 'g',
      },
      {
        ingredient_id: 'ing_002',
        ingredient_name: '玉ねぎ',
        required_quantity: 200,
        required_unit: 'g',
        current_stock: 300,
        stock_unit: 'g',
      },
    ];
    const nutrition_constraints = {
      protein_target: 60,
      protein_actual: 65,
      carbs_target: 200,
      carbs_actual: 210,
      fat_target: 50,
      fat_actual: 48,
    };
    const allergen_constraints = {
      restricted_allergens: ['egg'],
      menu_allergens: ['milk'],
      is_satisfied: true,
    };
    const cost_constraints = {
      budget_limit: 1500,
      estimated_cost: 1200,
      is_satisfied: true,
    };
    const cooking_time_constraints = {
      max_cooking_time: 60,
      estimated_cooking_time: 45,
      is_satisfied: true,
    };

    const result = validateMenuConfirmation({
      menu_id,
      family_id,
      ingredients,
      nutrition_constraints,
      allergen_constraints,
      cost_constraints,
      cooking_time_constraints,
    });

    expect(result.can_confirm).toBe(false);
    expect(result.reasons).toContain('在庫不足：鶏肉の在庫数が不足しています（必要量：500g、現在の在庫：300g）');
    expect(result.reasons.length).toBe(1);
    expect(result.constraint_fulfillment).toEqual({
      nutrition: true,
      allergen: true,
      cost: true,
      cooking_time: true,
      inventory: false,
    });
  });
});