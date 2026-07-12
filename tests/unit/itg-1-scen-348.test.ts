import { validateMenuComplianceScore } from '../../src/logic/it-1-br-1783670064270-1-1-1';

describe('献立提案後の家族成員による食事評価入力機能', () => {
  // SCEN-348: [edge] 複数制約条件の充足度判定 - すべての制約条件を違反する献立案はスコア0と評価される
  test('すべての制約条件に違反する献立案は総合スコアが0と評価される', () => {
    const constraints = {
      allergyExclusions: ['卵', 'えび', 'くるみ'],
      nutritionTargets: {
        proteinMin: 30,
        fiberMin: 15,
        sodiumMax: 2000,
      },
      cookingTimeMaxMinutes: 30,
      ingredientCostMaxYen: 800,
    };

    const menuProposal = {
      dishName: 'えび卵グラタン',
      ingredientList: ['えび', '卵', 'くるみ', 'バター', 'チーズ'],
      estimatedCookingTimeMinutes: 120,
      estimatedCostYen: 2500,
      nutritionFacts: {
        protein: 8,
        fiber: 2,
        sodium: 3500,
      },
    };

    const result = validateMenuComplianceScore(constraints, menuProposal);

    expect(result.totalComplianceScore).toBe(0);
    expect(result.allergyViolation).toBe(true);
    expect(result.nutritionViolation).toBe(true);
    expect(result.cookingTimeViolation).toBe(true);
    expect(result.costViolation).toBe(true);
    expect(result.isCompliant).toBe(false);
  });
});