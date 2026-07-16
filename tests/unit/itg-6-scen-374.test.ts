import { generateDifferentiationFeatureList } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログからペイン要因を抽出し差別化機能リストを生成', () => {
  // SCEN-374
  test('調理時間制限とペイン発生頻度から具体的な差別化機能が抽出される', () => {
    const painInput = {
      painFactorType: 'cooking_time_restriction',
      weekdayTimeLimit: 60,
      weekendTimeLimit: 120,
      painFrequencyPerWeek: 5,
      affectedUserCount: 1250,
      totalTargetSegment: 2000,
    };

    const result = generateDifferentiationFeatureList(painInput);

    expect(result).toBeDefined();
    expect(result.features).toBeDefined();
    expect(Array.isArray(result.features)).toBe(true);
    expect(result.features.length).toBeGreaterThanOrEqual(3);

    const featureNames = result.features.map((f) => f.featureName);
    expect(featureNames).toContain('quick_recipe_suggestion');
    expect(featureNames).toContain('auto_cooking_preset');
    expect(featureNames).toContain('meal_kit_delivery_integration');

    const quickRecipeFeature = result.features.find(
      (f) => f.featureName === 'quick_recipe_suggestion'
    );
    expect(quickRecipeFeature).toBeDefined();
    expect(quickRecipeFeature.description).toContain('時短');
    expect(quickRecipeFeature.painCoverage).toBeGreaterThanOrEqual(0.3);
    expect(quickRecipeFeature.estimatedImplementationEffort).toBe('medium');
    expect(quickRecipeFeature.expectedUserImpactScore).toBeGreaterThanOrEqual(7);

    const autoCookingFeature = result.features.find(
      (f) => f.featureName === 'auto_cooking_preset'
    );
    expect(autoCookingFeature).toBeDefined();
    expect(autoCookingFeature.description).toContain('手間削減');
    expect(autoCookingFeature.painCoverage).toBeGreaterThanOrEqual(0.25);
    expect(autoCookingFeature.estimatedImplementationEffort).toBe('high');
    expect(autoCookingFeature.expectedUserImpactScore).toBeGreaterThanOrEqual(8);

    const mealKitFeature = result.features.find(
      (f) => f.featureName === 'meal_kit_delivery_integration'
    );
    expect(mealKitFeature).toBeDefined();
    expect(mealKitFeature.description).toContain('食事の質');
    expect(mealKitFeature.painCoverage).toBeGreaterThanOrEqual(0.2);
    expect(mealKitFeature.estimatedImplementationEffort).toBe('medium');
    expect(mealKitFeature.expectedUserImpactScore).toBeGreaterThanOrEqual(7);

    expect(result.generationTimestamp).toBeDefined();
    expect(typeof result.generationTimestamp).toBe('string');

    expect(result.painFrequencyMapping).toBeDefined();
    expect(result.painFrequencyMapping.weeklyFrequency).toBe(5);
    expect(result.painFrequencyMapping.affectedRatio).toBe(0.625);

    expect(result.priorityScore).toBeGreaterThanOrEqual(0.7);
    expect(result.priorityScore).toBeLessThanOrEqual(1.0);

    const prioritizedFeatures = result.features.sort(
      (a, b) => b.expectedUserImpactScore - a.expectedUserImpactScore
    );
    expect(prioritizedFeatures[0].expectedUserImpactScore).toBeGreaterThanOrEqual(
      prioritizedFeatures[1].expectedUserImpactScore
    );
  });
});