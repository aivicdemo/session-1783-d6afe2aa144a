import { evaluateMenuConstraintFulfillment } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase record aggregation and monthly food expense reduction effect analysis', () => {
  // SCEN-330: [edge] 複数制約条件の充足度評価機能 - 全制約条件が一切満たされない献立案の総合評価スコアが0以下の値が計算されないようにクランプされる
  test('should clamp overall satisfaction score to minimum 0 when all constraints are violated', () => {
    // Precondition: Multiple constraints are defined (budget limit, nutrition standard, allergen exclusion)
    // All constraints are intentionally violated by the menu proposal
    const menu_proposal = {
      menu_id: 'menu-001',
      menu_name: 'Violating Menu',
      total_cost: 5000, // Exceeds budget limit of 2000
      nutrition_values: {
        protein_g: 10, // Below minimum 50g
        fat_g: 5, // Below minimum 20g
        carbs_g: 30, // Below minimum 150g
        calcium_mg: 100, // Below minimum 800mg
        iron_mg: 1, // Below minimum 8mg
      },
      allergens: ['peanut', 'shellfish', 'egg'], // Contains restricted allergens
      cooking_time_minutes: 180, // Exceeds time limit of 60 minutes
    };

    const constraints = {
      budget_limit_yen: 2000,
      nutrition_requirements: {
        protein_min_g: 50,
        fat_min_g: 20,
        carbs_min_g: 150,
        calcium_min_mg: 800,
        iron_min_mg: 8,
      },
      allergen_exclusions: ['peanut', 'shellfish', 'egg', 'dairy'],
      cooking_time_limit_minutes: 60,
    };

    // Execute: Call the multiple constraint fulfillment evaluation function
    const evaluation_result = evaluateMenuConstraintFulfillment(menu_proposal, constraints);

    // Verify: The calculated overall score is not a negative value (0 or above)
    expect(evaluation_result.overall_satisfaction_score).toBeGreaterThanOrEqual(0);

    // Verify: The score is clamped to the minimum lower bound (0)
    expect(evaluation_result.overall_satisfaction_score).toBe(0);

    // Verify: Individual constraint fulfillment scores are also non-negative
    expect(evaluation_result.budget_fulfillment_score).toBeGreaterThanOrEqual(0);
    expect(evaluation_result.nutrition_fulfillment_score).toBeGreaterThanOrEqual(0);
    expect(evaluation_result.allergen_fulfillment_score).toBeGreaterThanOrEqual(0);
    expect(evaluation_result.cooking_time_fulfillment_score).toBeGreaterThanOrEqual(0);

    // Verify: All individual scores are 0 (complete violation)
    expect(evaluation_result.budget_fulfillment_score).toBe(0);
    expect(evaluation_result.nutrition_fulfillment_score).toBe(0);
    expect(evaluation_result.allergen_fulfillment_score).toBe(0);
    expect(evaluation_result.cooking_time_fulfillment_score).toBe(0);

    // Verify: Result structure contains valid non-negative numeric values
    expect(typeof evaluation_result.overall_satisfaction_score).toBe('number');
    expect(Number.isFinite(evaluation_result.overall_satisfaction_score)).toBe(true);
  });
});