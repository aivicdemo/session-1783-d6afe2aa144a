import { adjustMenuPriorityConditions } from '../../src/logic/it-1-br-2-1-1-1';

describe('月次食費超過要因の分解と次月献立優先条件の自動調整', () => {
  // SCEN-349
  test('食費実績が予算内の場合、献立優先条件は変更されない', () => {
    const currentMonthBudget = 50000;
    const currentMonthActual = 48000;
    const currentMonthPriorityConditions = {
      priorityLevel: 2,
      ingredientCategories: ['meat', 'vegetable', 'grain'],
      nutritionBalanceWeight: {
        protein: 0.3,
        carbohydrate: 0.5,
        fat: 0.2,
      },
      cookingTimeLimit: 40,
      costPerMeal: 1200,
    };

    const result = adjustMenuPriorityConditions({
      monthlyBudget: currentMonthBudget,
      monthlyActual: currentMonthActual,
      currentPriorityConditions: currentMonthPriorityConditions,
    });

    expect(result.isAdjusted).toBe(false);
    expect(result.nextMonthPriorityConditions).toEqual(currentMonthPriorityConditions);
    expect(result.adjustmentReason).toBe('');
  });
});