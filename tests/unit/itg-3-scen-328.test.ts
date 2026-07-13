import { evaluateMenuConstraints } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase Records and Monthly Food Cost Reduction Effect Analysis', () => {
  // SCEN-328: [normal] 複数制約条件の充足度評価機能 - 献立案が栄養条件は満たすが予算制約を超過している場合に予算スコアが低い値で計算される
  test('should calculate constraint satisfaction scores with nutrition met but budget exceeded', () => {
    const menu_proposal = {
      menu_id: 'MENU-001',
      family_id: 'FAMILY-001',
      nutrition: {
        calories: 2000,
        protein_g: 60,
        fat_g: 65,
        carbohydrate_g: 300,
      },
      total_cost_yen: 6000,
    };

    const constraints = {
      nutrition_target: {
        calories: 2000,
        protein_g: 60,
        fat_g: 65,
        carbohydrate_g: 300,
      },
      budget_limit_yen: 5000,
    };

    const result = evaluateMenuConstraints(menu_proposal, constraints);

    expect(result).toEqual({
      nutrition_score: 100,
      budget_score: 50,
      overall_score: 75,
      constraint_details: {
        nutrition_fulfillment_rate: 1.0,
        budget_fulfillment_rate: 0.833,
        nutrition_status: 'satisfied',
        budget_status: 'exceeded',
      },
    });

    expect(result.nutrition_score).toBeGreaterThanOrEqual(90);
    expect(result.budget_score).toBeLessThanOrEqual(50);
    expect(result.overall_score).toBeLessThan(result.nutrition_score);
  });
});