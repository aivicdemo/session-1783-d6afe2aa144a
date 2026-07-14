import { evaluateConstraintFulfillment } from '../../src/logic/it-7-2-1';

describe('制約条件充足度評価機能', () => {
  test('SCEN-543: 献立案が制約条件を満たさない場合にエラーを返す', () => {
    const mealPlanProposal = {
      id: 'meal-001',
      calories: 2800,
      proteins: 65,
      carbohydrates: 380,
      fats: 95,
      allergens: ['egg', 'milk'],
      cookingTimeMinutes: 45,
      estimatedCost: 1200,
      ingredients: [
        { name: 'chicken', quantity: 200, unit: 'g' },
        { name: 'egg', quantity: 2, unit: 'pieces' },
        { name: 'milk', quantity: 200, unit: 'ml' }
      ]
    };

    const constraints = {
      maxCalories: 2500,
      maxProteins: 80,
      minCarbohydrates: 250,
      maxFats: 80,
      forbiddenAllergens: ['egg'],
      maxCookingTimeMinutes: 40,
      maxEstimatedCost: 1500,
      requiredIngredientCategories: ['vegetable', 'protein']
    };

    expect(() => {
      evaluateConstraintFulfillment(mealPlanProposal, constraints);
    }).toThrow(/カロリー/);
  });

  test('SCEN-543: アレルゲン制約違反時にエラーを返す', () => {
    const mealPlanProposal = {
      id: 'meal-002',
      calories: 2000,
      proteins: 70,
      carbohydrates: 300,
      fats: 70,
      allergens: ['egg', 'shrimp'],
      cookingTimeMinutes: 30,
      estimatedCost: 1000,
      ingredients: [
        { name: 'shrimp', quantity: 150, unit: 'g' },
        { name: 'rice', quantity: 300, unit: 'g' },
        { name: 'vegetable', quantity: 200, unit: 'g' }
      ]
    };

    const constraints = {
      maxCalories: 2500,
      maxProteins: 80,
      minCarbohydrates: 250,
      maxFats: 80,
      forbiddenAllergens: ['shrimp', 'peanut'],
      maxCookingTimeMinutes: 40,
      maxEstimatedCost: 1500,
      requiredIngredientCategories: ['vegetable', 'protein']
    };

    expect(() => {
      evaluateConstraintFulfillment(mealPlanProposal, constraints);
    }).toThrow(/アレルゲン/);
  });

  test('SCEN-543: 調理時間制約違反時にエラーを返す', () => {
    const mealPlanProposal = {
      id: 'meal-003',
      calories: 2000,
      proteins: 70,
      carbohydrates: 300,
      fats: 70,
      allergens: [],
      cookingTimeMinutes: 50,
      estimatedCost: 1000,
      ingredients: [
        { name: 'beef', quantity: 200, unit: 'g' },
        { name: 'potato', quantity: 300, unit: 'g' }
      ]
    };

    const constraints = {
      maxCalories: 2500,
      maxProteins: 80,
      minCarbohydrates: 250,
      maxFats: 80,
      forbiddenAllergens: [],
      maxCookingTimeMinutes: 40,
      maxEstimatedCost: 1500,
      requiredIngredientCategories: ['vegetable', 'protein']
    };

    expect(() => {
      evaluateConstraintFulfillment(mealPlanProposal, constraints);
    }).toThrow(/調理時間/);
  });

  test('SCEN-543: すべての制約条件を満たす献立案は正常に評価される', () => {
    const mealPlanProposal = {
      id: 'meal-004',
      calories: 2200,
      proteins: 75,
      carbohydrates: 280,
      fats: 75,
      allergens: [],
      cookingTimeMinutes: 35,
      estimatedCost: 1100,
      ingredients: [
        { name: 'chicken', quantity: 180, unit: 'g' },
        { name: 'rice', quantity: 250, unit: 'g' },
        { name: 'broccoli', quantity: 150, unit: 'g' },
        { name: 'carrot', quantity: 100, unit: 'g' }
      ]
    };

    const constraints = {
      maxCalories: 2500,
      maxProteins: 80,
      minCarbohydrates: 250,
      maxFats: 80,
      forbiddenAllergens: ['egg', 'shrimp'],
      maxCookingTimeMinutes: 40,
      maxEstimatedCost: 1500,
      requiredIngredientCategories: ['vegetable', 'protein']
    };

    const result = evaluateConstraintFulfillment(mealPlanProposal, constraints);

    expect(result.isFulfilled).toBe(true);
    expect(result.fulfillmentScores).toEqual({
      caloriesFulfillment: 88,
      proteinsFulfillment: 93.75,
      carbohydratesFulfillment: 112,
      fatsFulfillment: 93.75,
      allergenFulfillment: 100,
      cookingTimeFulfillment: 87.5,
      costFulfillment: 73.33,
      overallScore: 91
    });
    expect(result.violations).toEqual([]);
  });

  test('SCEN-543: 複数の制約条件違反時に最優先の違反エラーを返す', () => {
    const mealPlanProposal = {
      id: 'meal-005',
      calories: 2800,
      proteins: 65,
      carbohydrates: 220,
      fats: 95,
      allergens: ['egg'],
      cookingTimeMinutes: 50,
      estimatedCost: 1600,
      ingredients: [
        { name: 'egg', quantity: 3, unit: 'pieces' },
        { name: 'pork', quantity: 250, unit: 'g' }
      ]
    };

    const constraints = {
      maxCalories: 2500,
      maxProteins: 80,
      minCarbohydrates: 250,
      maxFats: 80,
      forbiddenAllergens: ['egg'],
      maxCookingTimeMinutes: 40,
      maxEstimatedCost: 1500,
      requiredIngredientCategories: ['vegetable', 'protein']
    };

    expect(() => {
      evaluateConstraintFulfillment(mealPlanProposal, constraints);
    }).toThrow(/カロリー/);
  });

  test('SCEN-543: 食材の必須カテゴリ不足時にエラーを返す', () => {
    const mealPlanProposal = {
      id: 'meal-006',
      calories: 2000,
      proteins: 70,
      carbohydrates: 300,
      fats: 70,
      allergens: [],
      cookingTimeMinutes: 30,
      estimatedCost: 1000,
      ingredients: [
        { name: 'rice', quantity: 400, unit: 'g' }
      ]
    };

    const constraints = {
      maxCalories: 2500,
      maxProteins: 80,
      minCarbohydrates: 250,
      maxFats: 80,
      forbiddenAllergens: [],
      maxCookingTimeMinutes: 40,
      maxEstimatedCost: 1500,
      requiredIngredientCategories: ['vegetable', 'protein']
    };

    expect(() => {
      evaluateConstraintFulfillment(mealPlanProposal, constraints);
    }).toThrow(/必須食材/);
  });

  test('SCEN-543: 栄養素最小値下限違反時にエラーを返す', () => {
    const mealPlanProposal = {
      id: 'meal-007',
      calories: 1800,
      proteins: 70,
      carbohydrates: 200,
      fats: 70,
      allergens: [],
      cookingTimeMinutes: 30,
      estimatedCost: 1000,
      ingredients: [
        { name: 'chicken', quantity: 150, unit: 'g' },
        { name: 'salad', quantity: 150, unit: 'g' }
      ]
    };

    const constraints = {
      maxCalories: 2500,
      maxProteins: 80,
      minCarbohydrates: 250,
      maxFats: 80,
      forbiddenAllergens: [],
      maxCookingTimeMinutes: 40,
      maxEstimatedCost: 1500,
      requiredIngredientCategories: ['vegetable', 'protein']
    };

    expect(() => {
      evaluateConstraintFulfillment(mealPlanProposal, constraints);
    }).toThrow(/炭水化物/);
  });
});