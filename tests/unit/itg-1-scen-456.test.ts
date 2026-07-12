import { generateMenuWithMinimalFeedback } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-456: [edge] 初期献立生成ロジック - 評価データが29件の場合は基本属性ベースで献立が生成される
  test('評価データが29件のとき、基本属性ベースで献立が生成される', () => {
    const familyBasicAttributes = {
      ageGroup: '30s',
      gender: 'male',
      calorieTarget: 2000,
      proteinTargetGrams: 60,
      carbohydrateTargetGrams: 250,
      fatTargetGrams: 65,
    };

    const feedbackData = Array.from({ length: 29 }, (_, index) => ({
      feedbackId: `feedback_${index + 1}`,
      mealId: `meal_${index + 1}`,
      satisfactionScore: 3 + (index % 3),
      completionRate: 0.7 + (index % 3) * 0.1,
      requestText: index % 2 === 0 ? 'もっと塩辛い味付けで' : '野菜をたっぷり',
      recordedAt: new Date(`2024-01-${(index % 28) + 1}T18:00:00Z`),
    }));

    const generatedMenu = generateMenuWithMinimalFeedback({
      familyBasicAttributes,
      feedbackRecords: feedbackData,
      availableIngredients: ['鶏肉', '玉ねぎ', '人参', '米', 'トマト'],
      budgetLimitPerMeal: 500,
      cookingTimeMinutesMax: 30,
    });

    expect(generatedMenu).toBeDefined();
    expect(generatedMenu.menuId).toBeDefined();
    expect(typeof generatedMenu.menuId).toBe('string');
    expect(generatedMenu.generationMethod).toBe('BASIC_ATTRIBUTES_ONLY');
    expect(generatedMenu.usesDetailedPreferences).toBe(false);
    expect(generatedMenu.meals).toHaveLength(7);
    expect(Array.isArray(generatedMenu.meals)).toBe(true);

    const firstMeal = generatedMenu.meals[0];
    expect(firstMeal.mealName).toBeDefined();
    expect(typeof firstMeal.mealName).toBe('string');
    expect(firstMeal.estimatedCalories).toBe(2000 / 7);
    expect(firstMeal.estimatedProteinGrams).toBeCloseTo(60 / 7, 1);
    expect(firstMeal.ingredientList).toBeDefined();
    expect(Array.isArray(firstMeal.ingredientList)).toBe(true);
    expect(firstMeal.ingredientList.length).toBeGreaterThan(0);
    expect(firstMeal.estimatedCookingTimeMinutes).toBeLessThanOrEqual(30);
    expect(firstMeal.estimatedCostYen).toBeLessThanOrEqual(500);

    expect(generatedMenu.totalWeeklyCalories).toBe(2000 * 7);
    expect(generatedMenu.totalWeeklyProteinGrams).toBe(60 * 7);
    expect(generatedMenu.totalWeeklyBudgetYen).toBeLessThanOrEqual(500 * 7);
  });
});