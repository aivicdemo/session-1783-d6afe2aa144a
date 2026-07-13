import { calculateMealConstraintComplianceScore } from '../../src/logic/it-1-br-2-1-1-1';

describe('献立案の制約条件充足度スコア計算機能', () => {
  test('SCEN-327: 全制約条件を満たさない場合、総合スコアが0になる', () => {
    // 複数の制約条件を定義
    const constraints = {
      nutrition: {
        minCalories: 2000,
        maxCalories: 2500,
        minProtein: 60,
        minFiber: 20,
      },
      allergen: {
        excludeIngredients: ['egg', 'milk', 'peanut'],
      },
      cookingTime: {
        maxMinutes: 60,
      },
      budget: {
        maxAmount: 1500,
      },
    };

    // すべての制約条件に違反する献立案データを作成
    const mealPlan = {
      totalCalories: 1200, // minCalories (2000) に不足
      protein: 30, // minProtein (60) に不足
      fiber: 5, // minFiber (20) に不足
      ingredients: ['egg', 'milk', 'peanut', 'chicken'], // すべてのアレルゲンを含む
      cookingTimeMinutes: 120, // maxMinutes (60) を超過
      estimatedCost: 2000, // maxAmount (1500) を超過
    };

    // スコア計算機能に入力
    const result = calculateMealConstraintComplianceScore(
      mealPlan,
      constraints
    );

    // 総合スコアが0であることをアサーション
    expect(result.totalScore).toBe(0);

    // 各個別の制約充足度スコアがすべて0であることを検証
    expect(result.nutritionScore).toBe(0);
    expect(result.allergenScore).toBe(0);
    expect(result.cookingTimeScore).toBe(0);
    expect(result.budgetScore).toBe(0);

    // 各スコアが0から100の範囲内であることを確認
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
    expect(result.nutritionScore).toBeGreaterThanOrEqual(0);
    expect(result.nutritionScore).toBeLessThanOrEqual(100);
    expect(result.allergenScore).toBeGreaterThanOrEqual(0);
    expect(result.allergenScore).toBeLessThanOrEqual(100);
    expect(result.cookingTimeScore).toBeGreaterThanOrEqual(0);
    expect(result.cookingTimeScore).toBeLessThanOrEqual(100);
    expect(result.budgetScore).toBeGreaterThanOrEqual(0);
    expect(result.budgetScore).toBeLessThanOrEqual(100);
  });
});