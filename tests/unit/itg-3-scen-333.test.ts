import { validateMenuConfirmationWithAllConstraints } from '../../src/logic/it-1-br-6-2-1-1';

describe('食材流通業者・スーパーの在庫・価格データ連携インターフェース', () => {
  // SCEN-333: [error] 献立確定前の全制約検証機能 - 献立案が在庫不足により確定できない場合に確定不可と判定されエラーメッセージが返される
  test('SCEN-333: 献立確定前の在庫不足制約検証エラーケース', () => {
    const menu_id = 'menu_20240115_001';
    const family_member_count = 3;
    const required_ingredients = [
      {
        ingredient_id: 'ing_tomato_001',
        ingredient_name: 'トマト',
        required_quantity: 5,
        required_unit: '個',
      },
      {
        ingredient_id: 'ing_onion_001',
        ingredient_name: '玉ねぎ',
        required_quantity: 3,
        required_unit: '個',
      },
      {
        ingredient_id: 'ing_chicken_001',
        ingredient_name: '鶏むね肉',
        required_quantity: 800,
        required_unit: 'g',
      },
    ];

    const current_inventory = [
      {
        ingredient_id: 'ing_tomato_001',
        ingredient_name: 'トマト',
        current_quantity: 2,
        current_unit: '個',
      },
      {
        ingredient_id: 'ing_onion_001',
        ingredient_name: '玉ねぎ',
        current_quantity: 3,
        current_unit: '個',
      },
      {
        ingredient_id: 'ing_chicken_001',
        ingredient_name: '鶏むね肉',
        current_quantity: 500,
        current_unit: 'g',
      },
    ];

    const nutrition_constraints = {
      calorie_min: 2000,
      calorie_max: 2500,
      protein_min: 60,
      protein_max: 100,
      fat_min: 50,
      fat_max: 80,
      carbs_min: 250,
      carbs_max: 350,
    };

    const allergy_constraints = ['milk', 'peanuts'];
    const dietary_restrictions = ['vegetarian_limited'];
    const cooking_time_limit_minutes = 60;
    const budget_limit_yen = 3000;

    const result = validateMenuConfirmationWithAllConstraints({
      menu_id,
      family_member_count,
      required_ingredients,
      current_inventory,
      nutrition_constraints,
      allergy_constraints,
      dietary_restrictions,
      cooking_time_limit_minutes,
      budget_limit_yen,
    });

    expect(result.is_valid).toBe(false);
    expect(result.validation_status).toBe('FAILED_INVENTORY_CONSTRAINT');
    expect(result.error_message).toMatch(/在庫不足/);
    expect(result.error_message).toMatch(/トマト/);
    expect(result.error_message).toMatch(/鶏むね肉/);
    expect(result.insufficient_ingredients).toHaveLength(2);

    const insufficient_tomato = result.insufficient_ingredients.find(
      (item) => item.ingredient_id === 'ing_tomato_001'
    );
    expect(insufficient_tomato).toBeDefined();
    expect(insufficient_tomato?.ingredient_name).toBe('トマト');
    expect(insufficient_tomato?.required_quantity).toBe(5);
    expect(insufficient_tomato?.current_quantity).toBe(2);
    expect(insufficient_tomato?.shortage_quantity).toBe(3);

    const insufficient_chicken = result.insufficient_ingredients.find(
      (item) => item.ingredient_id === 'ing_chicken_001'
    );
    expect(insufficient_chicken).toBeDefined();
    expect(insufficient_chicken?.ingredient_name).toBe('鶏むね肉');
    expect(insufficient_chicken?.required_quantity).toBe(800);
    expect(insufficient_chicken?.current_quantity).toBe(500);
    expect(insufficient_chicken?.shortage_quantity).toBe(300);

    expect(result.menu_confirmed).toBe(false);
    expect(result.constraint_satisfaction_scores).toBeDefined();
    expect(result.constraint_satisfaction_scores.inventory).toBe(0);
    expect(result.constraint_satisfaction_scores.nutrition).toBeGreaterThanOrEqual(0);
    expect(result.constraint_satisfaction_scores.nutrition).toBeLessThanOrEqual(100);
    expect(result.constraint_satisfaction_scores.allergy).toBeGreaterThanOrEqual(0);
    expect(result.constraint_satisfaction_scores.allergy).toBeLessThanOrEqual(100);
    expect(result.constraint_satisfaction_scores.cooking_time).toBeGreaterThanOrEqual(0);
    expect(result.constraint_satisfaction_scores.cooking_time).toBeLessThanOrEqual(100);
    expect(result.constraint_satisfaction_scores.budget).toBeGreaterThanOrEqual(0);
    expect(result.constraint_satisfaction_scores.budget).toBeLessThanOrEqual(100);

    expect(result.validation_timestamp).toBeDefined();
    expect(typeof result.validation_timestamp).toBe('string');
  });
});