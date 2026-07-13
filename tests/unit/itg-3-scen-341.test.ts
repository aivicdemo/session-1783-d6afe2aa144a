import { getRankedMealCandidates } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase Records and Monthly Food Cost Reduction Analysis', () => {
  // SCEN-341: [edge] 複数制約条件下での献立候補ランキング機能 - 予算上限がゼロまたは負数の場合、適切にハンドリングされるか検証される
  test('should return 400 status and clear error message when budget_limit is zero or negative', async () => {
    const base_constraints = {
      nutrition_requirements: [
        { nutrient_id: 'PROTEIN', min_value: 50, max_value: 100, unit: 'g' },
        { nutrient_id: 'CARB', min_value: 250, max_value: 350, unit: 'g' },
      ],
      available_ingredients: [
        { ingredient_id: 'ING001', name: 'chicken_breast', available_quantity: 500 },
        { ingredient_id: 'ING002', name: 'rice', available_quantity: 1000 },
      ],
      preparation_time_limit_minutes: 60,
    };

    // Test case 1: budget_limit = 0
    const result_zero = await getRankedMealCandidates({
      user_id: 'USR123',
      budget_limit_jpy: 0,
      constraints: base_constraints,
    });

    expect(result_zero.status_code).toBe(400);
    expect(result_zero.error_message).toMatch(/予算/);
    expect(result_zero.error_message).toMatch(/正の数値/);
    expect(result_zero.ranked_candidates).toEqual([]);

    // Test case 2: budget_limit = -100
    const result_negative = await getRankedMealCandidates({
      user_id: 'USR123',
      budget_limit_jpy: -100,
      constraints: base_constraints,
    });

    expect(result_negative.status_code).toBe(400);
    expect(result_negative.error_message).toMatch(/予算/);
    expect(result_negative.error_message).toMatch(/正の数値/);
    expect(result_negative.ranked_candidates).toEqual([]);

    // Verify consistent error handling between both cases
    expect(result_zero.status_code).toBe(result_negative.status_code);
    expect(result_zero.error_message).toBe(result_negative.error_message);
  });
});