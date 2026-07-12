import { generateInitialMenuWithNutritionAndAttributes } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-454
  test('初期献立生成ロジック - 評価データ30件未満の場合に栄養基準と基本属性のみで献立が生成される', () => {
    // テスト用のモック評価データを29件作成
    const mockEvaluationData = Array.from({ length: 29 }, (_, index) => ({
      evaluationId: `eval_${index + 1}`,
      recipeId: `recipe_${(index % 5) + 1}`,
      satisfactionScore: 4 + (index % 2),
      completionRate: 0.8 + (index % 3) * 0.05,
      timestamp: new Date('2024-01-01T10:00:00Z').getTime() + index * 86400000,
    }));

    // 栄養基準値と基本属性情報を設定
    const nutritionStandards = {
      calories: { min: 1800, max: 2200, unit: 'kcal' },
      protein: { min: 50, max: 70, unit: 'g' },
      carbohydrates: { min: 200, max: 300, unit: 'g' },
      fat: { min: 50, max: 70, unit: 'g' },
      fiber: { min: 20, max: 30, unit: 'g' },
    };

    const familyAttributes = {
      familyMemberId: 'family_001',
      ageGroup: '30-40',
      allergies: ['shrimp', 'egg'],
      dietaryRestrictions: ['halal'],
      cookingTimeLimit: 60,
    };

    // 初期献立生成ロジックを実行
    const generatedMenu = generateInitialMenuWithNutritionAndAttributes(
      mockEvaluationData,
      nutritionStandards,
      familyAttributes
    );

    // 生成される献立のレシピ選択根拠ログを確認
    expect(generatedMenu.selectionReasoning).toBeDefined();
    expect(generatedMenu.selectionReasoning).toContain('nutrition');
    expect(generatedMenu.selectionReasoning).toContain('attributes');
    expect(generatedMenu.selectionReasoning).not.toContain('user_preference');

    // 生成献立に含まれるレシピ数を確認
    expect(generatedMenu.recipes).toBeDefined();
    expect(Array.isArray(generatedMenu.recipes)).toBe(true);
    expect(generatedMenu.recipes.length).toBeGreaterThan(0);
    expect(generatedMenu.recipes.length).toBeLessThanOrEqual(7);

    // 各レシピが栄養基準値の範囲内にあるか検証
    generatedMenu.recipes.forEach((recipe) => {
      expect(recipe.nutritionInfo).toBeDefined();
      expect(recipe.nutritionInfo.calories).toBeGreaterThanOrEqual(
        nutritionStandards.calories.min
      );
      expect(recipe.nutritionInfo.calories).toBeLessThanOrEqual(
        nutritionStandards.calories.max
      );
      expect(recipe.nutritionInfo.protein).toBeGreaterThanOrEqual(
        nutritionStandards.protein.min * 0.7
      );
      expect(recipe.nutritionInfo.protein).toBeLessThanOrEqual(
        nutritionStandards.protein.max * 1.3
      );
    });

    // 各レシピが基本属性情報に適合しているか検証
    generatedMenu.recipes.forEach((recipe) => {
      expect(recipe.allergies).toBeDefined();
      familyAttributes.allergies.forEach((allergen) => {
        expect(recipe.allergies).not.toContain(allergen);
      });

      expect(recipe.dietaryRestrictions).toBeDefined();
      familyAttributes.dietaryRestrictions.forEach((restriction) => {
        expect(recipe.dietaryRestrictions).toContain(restriction);
      });

      expect(recipe.cookingTimeMinutes).toBeLessThanOrEqual(
        familyAttributes.cookingTimeLimit
      );
    });

    // 評価データに基づくレシピのランキングスコアが使用されていないことを確認
    generatedMenu.recipes.forEach((recipe) => {
      expect(recipe.selectionMethod).toBe('nutrition_and_attributes');
      expect(recipe.userPreferenceScore).toBeUndefined();
      expect(recipe.evaluationBasedRanking).toBeUndefined();
    });

    // 栄養バランスと利用者属性要件を満たす献立が正常に生成されたことを確認
    expect(generatedMenu.isValid).toBe(true);
    expect(generatedMenu.validationErrors).toEqual([]);
    expect(generatedMenu.generatedAt).toBeDefined();
    expect(typeof generatedMenu.generatedAt).toBe('string');
  });
});