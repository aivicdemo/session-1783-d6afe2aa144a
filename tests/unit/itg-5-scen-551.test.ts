import { validateMenuConfirmation } from '../../src/logic/it-7-2-1';

describe('献立確定・制約条件検証機能', () => {
  // SCEN-551: [edge] 献立確定・制約条件検証機能 - 予算上限と同額の献立案が確定可能と判定される
  test('予算上限と同額の献立案が確定可能と判定される', () => {
    const budget_limit = 10000;
    const menu_total_cost = 10000;
    const cooking_time_minutes = 45;
    const nutrition_completeness_rate = 95;
    const family_allergen_violations = 0;
    const dietary_restriction_violations = 0;
    const inventory_available_count = 3;

    const confirmation_request = {
      menu_id: 'menu_001',
      user_id: 'user_123',
      family_members: ['member_1', 'member_2', 'member_3'],
      budget_limit: budget_limit,
      menu_total_cost: menu_total_cost,
      cooking_time_target_minutes: 60,
      cooking_time_actual_minutes: cooking_time_minutes,
      nutrition_target_completeness_rate: 90,
      nutrition_actual_completeness_rate: nutrition_completeness_rate,
      family_allergen_violations: family_allergen_violations,
      dietary_restriction_violations: dietary_restriction_violations,
      inventory_available_count: inventory_available_count,
      inventory_required_count: 3,
      confirmation_timestamp: new Date('2024-01-15T14:30:00Z'),
    };

    const result = validateMenuConfirmation(confirmation_request);

    expect(result.isConfirmable).toBe(true);
    expect(result.budgetValidation).toMatch(/valid|within_budget/);
    expect(result.constraints_satisfied).toBe(true);
    expect(result.nutrition_validation).toBe('valid');
    expect(result.allergen_validation).toBe('valid');
    expect(result.dietary_restriction_validation).toBe('valid');
    expect(result.inventory_validation).toBe('valid');
    expect(result.cooking_time_validation).toBe('valid');
    expect(result.budget_remaining).toBe(0);
    expect(result.total_violations).toBe(0);
  });
});