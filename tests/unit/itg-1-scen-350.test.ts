import { validateMealConfirmation } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-350: [normal] 献立確定検証機能 - 全制約条件（栄養・アレルギー・予算・調理時間・在庫）を満たす献立が確定される
  test('should validate and confirm meal plan meeting all constraints', () => {
    const mealPlan = {
      mealId: 'meal-001',
      recipies: [
        {
          recipeId: 'recipe-001',
          name: 'grilled_chicken_with_cabbage',
          calories: 650,
          protein: 35,
          fat: 20,
          cookingTimeMinutes: 20,
          costJpy: 450,
          allergens: [],
          ingredients: [
            { name: 'chicken_breast', quantity: 150, unit: 'g' },
            { name: 'cabbage', quantity: 200, unit: 'g' },
            { name: 'salt', quantity: 5, unit: 'g' },
            { name: 'oil', quantity: 10, unit: 'ml' }
          ]
        },
        {
          recipeId: 'recipe-002',
          name: 'rice_with_seasoning',
          calories: 300,
          protein: 6,
          fat: 2,
          cookingTimeMinutes: 10,
          costJpy: 150,
          allergens: [],
          ingredients: [
            { name: 'rice', quantity: 150, unit: 'g' },
            { name: 'salt', quantity: 2, unit: 'g' }
          ]
        }
      ]
    };

    const constraints = {
      nutrition: {
        calorieTarget: 2000,
        calorieRangeJpy: { min: 1800, max: 2200 },
        proteinMinG: 80,
        fatMaxG: 60
      },
      allergies: {
        excludedAllergens: ['egg', 'dairy', 'peanut']
      },
      budget: {
        maxCostPerMealJpy: 800
      },
      cookingTime: {
        maxMinutes: 30
      },
      inventory: {
        availableIngredients: [
          'chicken_breast',
          'cabbage',
          'rice',
          'salt',
          'oil'
        ]
      }
    };

    const result = validateMealConfirmation(mealPlan, constraints);

    expect(result.isValid).toBe(true);
    expect(result.confirmationTimestamp).toBeDefined();
    expect(result.confirmationMessage).toBe('献立が確定されました');
    
    expect(result.constraintValidation.nutrition.totalCalories).toBe(950);
    expect(result.constraintValidation.nutrition.totalProteinG).toBe(41);
    expect(result.constraintValidation.nutrition.totalFatG).toBe(22);
    expect(result.constraintValidation.nutrition.caloriesSatisfied).toBe(true);
    expect(result.constraintValidation.nutrition.proteinSatisfied).toBe(false);
    expect(result.constraintValidation.nutrition.fatSatisfied).toBe(true);
    
    expect(result.constraintValidation.allergies.containsExcludedAllergens).toBe(false);
    expect(result.constraintValidation.allergies.allergensSatisfied).toBe(true);
    
    expect(result.constraintValidation.budget.totalCostJpy).toBe(600);
    expect(result.constraintValidation.budget.budgetSatisfied).toBe(true);
    
    expect(result.constraintValidation.cookingTime.totalMinutes).toBe(30);
    expect(result.constraintValidation.cookingTime.cookingTimeSatisfied).toBe(true);
    
    expect(result.constraintValidation.inventory.allIngredientsAvailable).toBe(true);
    expect(result.constraintValidation.inventory.inventorySatisfied).toBe(true);
    
    expect(result.confirmedMealData).toEqual({
      mealId: 'meal-001',
      confirmationDate: result.confirmationTimestamp,
      constraintsSummary: {
        nutrition: {
          caloriesSatisfied: true,
          proteinSatisfied: false,
          fatSatisfied: true
        },
        allergies: {
          allergensSatisfied: true
        },
        budget: {
          budgetSatisfied: true
        },
        cookingTime: {
          cookingTimeSatisfied: true
        },
        inventory: {
          inventorySatisfied: true
        }
      }
    });
  });

  test('should reject meal plan when allergies constraint is violated', () => {
    const mealPlanWithAllergen = {
      mealId: 'meal-002',
      recipies: [
        {
          recipeId: 'recipe-003',
          name: 'egg_fried_rice',
          calories: 500,
          protein: 15,
          fat: 18,
          cookingTimeMinutes: 15,
          costJpy: 400,
          allergens: ['egg'],
          ingredients: [
            { name: 'rice', quantity: 150, unit: 'g' },
            { name: 'egg', quantity: 2, unit: 'count' }
          ]
        }
      ]
    };

    const constraints = {
      nutrition: {
        calorieTarget: 2000,
        calorieRangeJpy: { min: 1800, max: 2200 },
        proteinMinG: 80,
        fatMaxG: 60
      },
      allergies: {
        excludedAllergens: ['egg', 'dairy', 'peanut']
      },
      budget: {
        maxCostPerMealJpy: 800
      },
      cookingTime: {
        maxMinutes: 30
      },
      inventory: {
        availableIngredients: ['rice', 'egg']
      }
    };

    const result = validateMealConfirmation(mealPlanWithAllergen, constraints);

    expect(result.isValid).toBe(false);
    expect(result.constraintValidation.allergies.containsExcludedAllergens).toBe(true);
    expect(result.constraintValidation.allergies.allergensSatisfied).toBe(false);
    expect(result.confirmationMessage).toMatch(/アレルギー/);
  });

  test('should reject meal plan when budget constraint is violated', () => {
    const expensiveMealPlan = {
      mealId: 'meal-003',
      recipies: [
        {
          recipeId: 'recipe-004',
          name: 'expensive_dish',
          calories: 600,
          protein: 40,
          fat: 25,
          cookingTimeMinutes: 25,
          costJpy: 900,
          allergens: [],
          ingredients: [
            { name: 'premium_beef', quantity: 200, unit: 'g' }
          ]
        }
      ]
    };

    const constraints = {
      nutrition: {
        calorieTarget: 2000,
        calorieRangeJpy: { min: 1800, max: 2200 },
        proteinMinG: 80,
        fatMaxG: 60
      },
      allergies: {
        excludedAllergens: ['egg', 'dairy', 'peanut']
      },
      budget: {
        maxCostPerMealJpy: 800
      },
      cookingTime: {
        maxMinutes: 30
      },
      inventory: {
        availableIngredients: ['premium_beef']
      }
    };

    const result = validateMealConfirmation(expensiveMealPlan, constraints);

    expect(result.isValid).toBe(false);
    expect(result.constraintValidation.budget.totalCostJpy).toBe(900);
    expect(result.constraintValidation.budget.budgetSatisfied).toBe(false);
    expect(result.confirmationMessage).toMatch(/予算/);
  });

  test('should reject meal plan when cooking time constraint is violated', () => {
    const timeLongMealPlan = {
      mealId: 'meal-004',
      recipies: [
        {
          recipeId: 'recipe-005',
          name: 'slow_roasted_dish',
          calories: 600,
          protein: 40,
          fat: 20,
          cookingTimeMinutes: 45,
          costJpy: 500,
          allergens: [],
          ingredients: [
            { name: 'meat', quantity: 300, unit: 'g' }
          ]
        }
      ]
    };

    const constraints = {
      nutrition: {
        calorieTarget: 2000,
        calorieRangeJpy: { min: 1800, max: 2200 },
        proteinMinG: 80,
        fatMaxG: 60
      },
      allergies: {
        excludedAllergens: ['egg', 'dairy', 'peanut']
      },
      budget: {
        maxCostPerMealJpy: 800
      },
      cookingTime: {
        maxMinutes: 30
      },
      inventory: {
        availableIngredients: ['meat']
      }
    };

    const result = validateMealConfirmation(timeLongMealPlan, constraints);

    expect(result.isValid).toBe(false);
    expect(result.constraintValidation.cookingTime.totalMinutes).toBe(45);
    expect(result.constraintValidation.cookingTime.cookingTimeSatisfied).toBe(false);
    expect(result.confirmationMessage).toMatch(/調理時間/);
  });

  test('should reject meal plan when inventory constraint is violated', () => {
    const unavailableIngredientPlan = {
      mealId: 'meal-005',
      recipies: [
        {
          recipeId: 'recipe-006',
          name: 'salmon_dish',
          calories: 550,
          protein: 45,
          fat: 28,
          cookingTimeMinutes: 20,
          costJpy: 700,
          allergens: [],
          ingredients: [
            { name: 'salmon', quantity: 200, unit: 'g' },
            { name: 'lemon', quantity: 100, unit: 'g' }
          ]
        }
      ]
    };

    const constraints = {
      nutrition: {
        calorieTarget: 2000,
        calorieRangeJpy: { min: 1800, max: 2200 },
        proteinMinG: 80,
        fatMaxG: 60
      },
      allergies: {
        excludedAllergens: ['egg', 'dairy', 'peanut']
      },
      budget: {
        maxCostPerMealJpy: 800
      },
      cookingTime: {
        maxMinutes: 30
      },
      inventory: {
        availableIngredients: ['chicken_breast', 'cabbage', 'rice']
      }
    };

    const result = validateMealConfirmation(unavailableIngredientPlan, constraints);

    expect(result.isValid).toBe(false);
    expect(result.constraintValidation.inventory.allIngredientsAvailable).toBe(false);
    expect(result.constraintValidation.inventory.inventorySatisfied).toBe(false);
    expect(result.confirmationMessage).toMatch(/在庫/);
  });

  test('should reject meal plan when multiple constraints are violated', () => {
    const multiConstraintViolationPlan = {
      mealId: 'meal-006',
      recipies: [
        {
          recipeId: 'recipe-007',
          name: 'complex_dish',
          calories: 500,
          protein: 20,
          fat: 18,
          cookingTimeMinutes: 50,
          costJpy: 950,
          allergens: ['dairy'],
          ingredients: [
            { name: 'expensive_ingredient', quantity: 100, unit: 'g' },
            { name: 'cheese', quantity: 50, unit: 'g' }
          ]
        }
      ]
    };

    const constraints = {
      nutrition: {
        calorieTarget: 2000,
        calorieRangeJpy: { min: 1800, max: 2200 },
        proteinMinG: 80,
        fatMaxG: 60
      },
      allergies: {
        excludedAllergens: ['egg', 'dairy', 'peanut']
      },
      budget: {
        maxCostPerMealJpy: 800
      },
      cookingTime: {
        maxMinutes: 30
      },
      inventory: {
        availableIngredients: ['rice', 'chicken']
      }
    };

    const result = validateMealConfirmation(multiConstraintViolationPlan, constraints);

    expect(result.isValid).toBe(false);
    expect(result.constraintValidation.budget.budgetSatisfied).toBe(false);
    expect(result.constraintValidation.cookingTime.cookingTimeSatisfied).toBe(false);
    expect(result.constraintValidation.allergies.allergensSatisfied).toBe(false);
    expect(result.constraintValidation.inventory.inventorySatisfied).toBe(false);
  });
});