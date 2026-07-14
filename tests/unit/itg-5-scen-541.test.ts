import { evaluateConstraintSatisfaction } from '../../src/logic/it-7-2-1';

describe('献立生成の成功率・調理時間短縮度・ユーザー満足度スコアなどの行動指標を週次で自動集計し、アルゴリズム改善前後の効果差を定量比較するダッシュボード機能', () => {
  // SCEN-541: [edge] 制約条件充足度評価機能 - 栄養・予算・調理時間の全制約を満たす場合に総合スコア100を返す
  test('栄養・予算・調理時間の全制約条件が100%充足されている場合、制約条件充足度評価機能は総合スコア100を返す', () => {
    const nutritionConstraint = {
      targetCalories: 2000,
      targetProtein: 50,
      actualCalories: 2000,
      actualProtein: 50,
    };

    const budgetConstraint = {
      targetBudget: 500,
      actualCost: 500,
    };

    const cookingTimeConstraint = {
      targetMinutes: 30,
      actualMinutes: 30,
    };

    const result = evaluateConstraintSatisfaction({
      nutrition: nutritionConstraint,
      budget: budgetConstraint,
      cookingTime: cookingTimeConstraint,
    });

    expect(result).toEqual({
      nutritionScore: 100,
      budgetScore: 100,
      cookingTimeScore: 100,
      totalScore: 100,
    });
  });
});