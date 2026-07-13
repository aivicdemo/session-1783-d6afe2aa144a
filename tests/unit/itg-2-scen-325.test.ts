import { calculateMenuConstraintScores } from '../../src/logic/it-1-br-2-1-1-1';

describe('献立案の制約条件充足度スコア計算機能', () => {
  // SCEN-325
  test('栄養制約のみ未充足の場合、栄養スコア0、他制約スコア100で総合スコアが正確に計算される', () => {
    const input = {
      nutritionScore: 0,
      allergyScore: 100,
      ingredientAvailabilityScore: 100,
      cookingDifficultyScore: 100,
      costScore: 100,
    };

    const result = calculateMenuConstraintScores(input);

    expect(result.nutritionScore).toBe(0);
    expect(result.allergyScore).toBe(100);
    expect(result.ingredientAvailabilityScore).toBe(100);
    expect(result.cookingDifficultyScore).toBe(100);
    expect(result.costScore).toBe(100);
    expect(result.overallScore).toBe(80);
  });
});