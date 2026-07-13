import { decideMealPlanPriorities } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-405
  test('献立方針決定ロジック - 食費超過、栄養不足、家族の嗜好から献立生成の優先条件セットが正しく決定される', () => {
    // Arrange: テストデータ設定
    const budgetExceeded = true;
    const nutritionDeficiencies = ['タンパク質', 'カルシウム'];
    const familyPreferences = ['和食', '魚料理'];

    const input = {
      budgetExceeded,
      nutritionDeficiencies,
      familyPreferences,
    };

    // Act: 献立方針決定ロジック実行
    const result = decideMealPlanPriorities(input);

    // Assert: 優先度配列の構造検証
    expect(result).toBeDefined();
    expect(result.priorityConditions).toBeDefined();
    expect(Array.isArray(result.priorityConditions)).toBe(true);

    // 優先度配列が3要素であることを検証
    expect(result.priorityConditions.length).toBe(3);

    // 第1要素: 食費超過条件
    expect(result.priorityConditions[0]).toEqual({
      priority: 1,
      type: 'budgetOptimization',
      value: true,
      description: '食費超過により低コスト献立を優先',
    });

    // 第2要素: 栄養不足条件（タンパク質、カルシウム）
    expect(result.priorityConditions[1]).toEqual({
      priority: 2,
      type: 'nutritionDeficiency',
      value: ['タンパク質', 'カルシウム'],
      description: '栄養不足項目を補う食材を優先',
    });

    // 第3要素: 家族の嗜好条件（和食、魚料理）
    expect(result.priorityConditions[2]).toEqual({
      priority: 3,
      type: 'familyPreference',
      value: ['和食', '魚料理'],
      description: '家族の嗜好パターンを反映',
    });

    // Assert: 献立方針セットの検証
    expect(result.mealPlanSet).toBeDefined();
    expect(Array.isArray(result.mealPlanSet)).toBe(true);
    expect(result.mealPlanSet.length).toBeGreaterThan(0);

    // Assert: 食費超過時の献立案が低コスト食材を優先していることを検証
    const budgetOptimizedMeal = result.mealPlanSet.find(
      (meal) => meal.priorityType === 'budgetOptimization'
    );
    expect(budgetOptimizedMeal).toBeDefined();
    expect(budgetOptimizedMeal?.averageCostPerServing).toBeLessThanOrEqual(500);
    expect(budgetOptimizedMeal?.lowCostIngredientsRatio).toBeGreaterThanOrEqual(0.8);

    // Assert: 栄養不足時の献立案が不足栄養素を補う食材を含んでいることを検証
    const nutritionBalancedMeal = result.mealPlanSet.find(
      (meal) => meal.priorityType === 'nutritionDeficiency'
    );
    expect(nutritionBalancedMeal).toBeDefined();
    expect(nutritionBalancedMeal?.targetNutrients).toContain('タンパク質');
    expect(nutritionBalancedMeal?.targetNutrients).toContain('カルシウム');
    expect(nutritionBalancedMeal?.nutrientCoverageRatio).toBeGreaterThanOrEqual(0.85);

    // Assert: 家族嗜好を反映した献立案が選定されていることを検証
    const preferenceBasedMeal = result.mealPlanSet.find(
      (meal) => meal.priorityType === 'familyPreference'
    );
    expect(preferenceBasedMeal).toBeDefined();
    expect(preferenceBasedMeal?.cuisineType).toMatch(/和食|魚料理/);
    expect(preferenceBasedMeal?.familyPreferenceScore).toBeGreaterThanOrEqual(0.8);

    // Assert: 最終的な献立方針セットの整合性
    expect(result.finalMealPlanSet).toBeDefined();
    expect(result.finalMealPlanSet.mealCount).toBe(7);
    expect(result.finalMealPlanSet.estimatedTotalCost).toBeLessThan(5000);
    expect(result.finalMealPlanSet.nutritionComplianceScore).toBeGreaterThanOrEqual(0.75);
    expect(result.finalMealPlanSet.familyPreferenceReflectionScore).toBeGreaterThanOrEqual(0.7);

    // Assert: 優先条件の適用状態を検証
    expect(result.priorityApplicationStatus).toEqual({
      budgetOptimizationApplied: true,
      nutritionDeficiencyAddressed: true,
      familyPreferenceReflected: true,
    });

    // Assert: 決定理由と適用バージョンの検証
    expect(result.decisionRationale).toBeDefined();
    expect(result.decisionRationale).toContain('budget');
    expect(result.decisionRationale).toContain('nutrition');
    expect(result.decisionRationale).toContain('preference');
    expect(result.algorithmVersion).toBe('v1.2.0');
    expect(result.executedAt).toBeDefined();
  });
});