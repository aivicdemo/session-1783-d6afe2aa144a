import { validateMealPlanConfirmation } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-353: [edge] 献立確定検証機能 - 調理時間が上限ちょうどの献立は確定可能と判定される
  test('調理時間が上限ちょうど60分の献立が確定可能と判定される', () => {
    const mealPlanInput = {
      mealPlanId: 'MP-20240115-001',
      userId: 'USR-20240115-001',
      familyMemberIds: ['FM-001', 'FM-002', 'FM-003'],
      recipes: [
        {
          recipeId: 'RCP-001',
          recipeName: '鶏肉の塩焼き',
          cookingTimeMinutes: 20,
          nutritionData: {
            calories: 350,
            protein: 35,
            carbohydrates: 5,
            fat: 18,
          },
          allergens: [],
          dietaryRestrictions: [],
          ingredients: [
            { ingredientId: 'ING-001', ingredientName: '鶏むね肉', quantity: 300, unit: 'g' },
            { ingredientId: 'ING-002', ingredientName: '塩', quantity: 5, unit: 'g' },
          ],
        },
        {
          recipeId: 'RCP-002',
          recipeName: '野菜炒め',
          cookingTimeMinutes: 15,
          nutritionData: {
            calories: 180,
            protein: 5,
            carbohydrates: 20,
            fat: 8,
          },
          allergens: [],
          dietaryRestrictions: [],
          ingredients: [
            { ingredientId: 'ING-003', ingredientName: 'キャベツ', quantity: 200, unit: 'g' },
            { ingredientId: 'ING-004', ingredientName: 'ニンジン', quantity: 100, unit: 'g' },
          ],
        },
        {
          recipeId: 'RCP-003',
          recipeName: 'ご飯',
          cookingTimeMinutes: 25,
          nutritionData: {
            calories: 280,
            protein: 4,
            carbohydrates: 60,
            fat: 1,
          },
          allergens: [],
          dietaryRestrictions: [],
          ingredients: [
            { ingredientId: 'ING-005', ingredientName: '米', quantity: 200, unit: 'g' },
            { ingredientId: 'ING-006', ingredientName: '水', quantity: 250, unit: 'ml' },
          ],
        },
      ],
      constraints: {
        cookingTimeUpperLimitMinutes: 60,
        budgetUpperLimitJpy: 2000,
        nutritionTargets: {
          caloriesMin: 700,
          caloriesMax: 1000,
          proteinMin: 40,
          proteinMax: 80,
        },
        allergyExclusions: [],
        dietaryRestrictionExclusions: [],
        refrigeratorInventory: [
          { ingredientId: 'ING-001', availableQuantity: 300, unit: 'g' },
          { ingredientId: 'ING-003', availableQuantity: 200, unit: 'g' },
          { ingredientId: 'ING-004', availableQuantity: 100, unit: 'g' },
          { ingredientId: 'ING-005', availableQuantity: 200, unit: 'g' },
          { ingredientId: 'ING-006', availableQuantity: 250, unit: 'ml' },
        ],
      },
      totalCookingTimeMinutes: 60,
      totalNutritionData: {
        calories: 810,
        protein: 44,
        carbohydrates: 85,
        fat: 27,
      },
      estimatedBudgetJpy: 1500,
      userConfirmationTimestamp: new Date('2024-01-15T19:30:00Z'),
    };

    const result = validateMealPlanConfirmation(mealPlanInput);

    expect(result).toEqual({
      isConfirmationAllowed: true,
      constraintValidation: {
        cookingTime: {
          isSatisfied: true,
          actualValue: 60,
          upperLimit: 60,
          satisfactionScore: 100,
        },
        nutrition: {
          isSatisfied: true,
          caloriesSatisfactionScore: 93,
          proteinSatisfactionScore: 95,
          carbohydratesSatisfactionScore: 85,
          fatSatisfactionScore: 87,
          overallNutritionScore: 90,
        },
        budget: {
          isSatisfied: true,
          actualValue: 1500,
          upperLimit: 2000,
          satisfactionScore: 100,
        },
        allergyRestriction: {
          isSatisfied: true,
          conflictingRecipes: [],
        },
        dietaryRestriction: {
          isSatisfied: true,
          conflictingRecipes: [],
        },
        refrigeratorInventory: {
          isSatisfied: true,
          insufficientIngredients: [],
        },
      },
      overallConfirmationScore: 94,
      confirmationStatus: 'APPROVED',
      confirmationTimestamp: new Date('2024-01-15T19:30:00Z'),
      confirmationMessage: '献立は全制約条件を満たしており、確定可能です。',
    });

    expect(result.isConfirmationAllowed).toBe(true);
    expect(result.constraintValidation.cookingTime.isSatisfied).toBe(true);
    expect(result.constraintValidation.cookingTime.satisfactionScore).toBe(100);
    expect(result.overallConfirmationScore).toBe(94);
  });
});