import { recalculatePriorityMatrix } from '../../src/logic/it-2';

describe('家族成員の食事評価データの蓄積・管理機能', () => {
  // SCEN-680: [error] 優先度マトリクス再計算機能 - 優先度マトリクスの入力データが不完全な場合にエラーが返される
  test('should throw error when priority matrix recalculation input is incomplete', () => {
    const incompleteInput = {
      mealId: 'meal-001',
      familyMembers: [
        {
          memberId: 'member-001',
          age: 35,
          satisfactionScore: 4,
          completionRate: 90,
          requestText: 'もっと野菜が欲しい'
        }
      ],
      nutritionItems: [],
      budgetConstraint: 5000,
      cookingTimeMinutes: 45,
      mealEvaluationRecords: [
        {
          evaluationId: 'eval-001',
          memberId: 'member-001',
          mealId: 'meal-001',
          satisfactionScore: 4,
          completionRate: 90,
          createdAt: '2024-01-15T18:30:00Z'
        }
      ],
      ingredientWeights: {}
    };

    expect(() =>
      recalculatePriorityMatrix(incompleteInput)
    ).toThrow(/栄養素/);
  });

  test('should throw error when ingredient weights are missing', () => {
    const missingWeightsInput = {
      mealId: 'meal-002',
      familyMembers: [
        {
          memberId: 'member-002',
          age: 28,
          satisfactionScore: 5,
          completionRate: 100,
          requestText: 'おいしかった'
        }
      ],
      nutritionItems: [
        { itemId: 'nut-001', name: 'タンパク質', unit: 'g', targetValue: 60 },
        { itemId: 'nut-002', name: 'カルシウム', unit: 'mg', targetValue: 800 }
      ],
      budgetConstraint: 6000,
      cookingTimeMinutes: 50,
      mealEvaluationRecords: [
        {
          evaluationId: 'eval-002',
          memberId: 'member-002',
          mealId: 'meal-002',
          satisfactionScore: 5,
          completionRate: 100,
          createdAt: '2024-01-16T19:00:00Z'
        }
      ],
      ingredientWeights: {}
    };

    expect(() =>
      recalculatePriorityMatrix(missingWeightsInput)
    ).toThrow(/重み付け/);
  });

  test('should throw error when family members list is empty', () => {
    const emptyMembersInput = {
      mealId: 'meal-003',
      familyMembers: [],
      nutritionItems: [
        { itemId: 'nut-003', name: 'ビタミンA', unit: 'μg', targetValue: 700 }
      ],
      budgetConstraint: 5500,
      cookingTimeMinutes: 40,
      mealEvaluationRecords: [],
      ingredientWeights: {
        'ingredient-001': 0.3,
        'ingredient-002': 0.4,
        'ingredient-003': 0.3
      }
    };

    expect(() =>
      recalculatePriorityMatrix(emptyMembersInput)
    ).toThrow(/家族成員/);
  });

  test('should throw error when meal evaluation records are missing', () => {
    const missingEvaluationInput = {
      mealId: 'meal-004',
      familyMembers: [
        {
          memberId: 'member-003',
          age: 42,
          satisfactionScore: 3,
          completionRate: 75,
          requestText: '塩辛かった'
        }
      ],
      nutritionItems: [
        { itemId: 'nut-004', name: '食塩相当量', unit: 'g', targetValue: 8 }
      ],
      budgetConstraint: 5800,
      cookingTimeMinutes: 45,
      mealEvaluationRecords: undefined,
      ingredientWeights: {
        'ingredient-004': 0.5,
        'ingredient-005': 0.5
      }
    };

    expect(() =>
      recalculatePriorityMatrix(missingEvaluationInput as any)
    ).toThrow(/評価/);
  });

  test('should throw error when nutrition items are missing', () => {
    const missingNutritionInput = {
      mealId: 'meal-005',
      familyMembers: [
        {
          memberId: 'member-004',
          age: 55,
          satisfactionScore: 4,
          completionRate: 85,
          requestText: '良かった'
        }
      ],
      nutritionItems: undefined,
      budgetConstraint: 6500,
      cookingTimeMinutes: 60,
      mealEvaluationRecords: [
        {
          evaluationId: 'eval-005',
          memberId: 'member-004',
          mealId: 'meal-005',
          satisfactionScore: 4,
          completionRate: 85,
          createdAt: '2024-01-17T18:00:00Z'
        }
      ],
      ingredientWeights: {
        'ingredient-006': 1.0
      }
    };

    expect(() =>
      recalculatePriorityMatrix(missingNutritionInput as any)
    ).toThrow(/栄養素/);
  });

  test('should throw error when budget constraint is missing', () => {
    const missingBudgetInput = {
      mealId: 'meal-006',
      familyMembers: [
        {
          memberId: 'member-005',
          age: 8,
          satisfactionScore: 5,
          completionRate: 100,
          requestText: 'チキンナゲットが好き'
        }
      ],
      nutritionItems: [
        { itemId: 'nut-005', name: '脂質', unit: 'g', targetValue: 50 }
      ],
      budgetConstraint: null,
      cookingTimeMinutes: 30,
      mealEvaluationRecords: [
        {
          evaluationId: 'eval-006',
          memberId: 'member-005',
          mealId: 'meal-006',
          satisfactionScore: 5,
          completionRate: 100,
          createdAt: '2024-01-18T17:30:00Z'
        }
      ],
      ingredientWeights: {
        'ingredient-007': 1.0
      }
    };

    expect(() =>
      recalculatePriorityMatrix(missingBudgetInput as any)
    ).toThrow(/予算/);
  });

  test('should return priority matrix when all required inputs are complete', () => {
    const completeInput = {
      mealId: 'meal-007',
      familyMembers: [
        {
          memberId: 'member-006',
          age: 38,
          satisfactionScore: 4,
          completionRate: 92,
          requestText: '次も食べたい'
        },
        {
          memberId: 'member-007',
          age: 35,
          satisfactionScore: 4,
          completionRate: 88,
          requestText: '良かった'
        }
      ],
      nutritionItems: [
        { itemId: 'nut-006', name: 'タンパク質', unit: 'g', targetValue: 60 },
        { itemId: 'nut-007', name: 'カルシウム', unit: 'mg', targetValue: 800 },
        { itemId: 'nut-008', name: 'ビタミンC', unit: 'mg', targetValue: 100 }
      ],
      budgetConstraint: 5000,
      cookingTimeMinutes: 45,
      mealEvaluationRecords: [
        {
          evaluationId: 'eval-007',
          memberId: 'member-006',
          mealId: 'meal-007',
          satisfactionScore: 4,
          completionRate: 92,
          createdAt: '2024-01-19T18:30:00Z'
        },
        {
          evaluationId: 'eval-008',
          memberId: 'member-007',
          mealId: 'meal-007',
          satisfactionScore: 4,
          completionRate: 88,
          createdAt: '2024-01-19T18:30:00Z'
        }
      ],
      ingredientWeights: {
        'ingredient-008': 0.3,
        'ingredient-009': 0.4,
        'ingredient-010': 0.3
      }
    };

    const result = recalculatePriorityMatrix(completeInput);

    expect(result).toBeDefined();
    expect(result.mealId).toBe('meal-007');
    expect(result.priorityScore).toBeGreaterThanOrEqual(0);
    expect(result.priorityScore).toBeLessThanOrEqual(100);
    expect(result.satisfactionScore).toBe(90);
    expect(result.budgetFulfillmentScore).toBeGreaterThanOrEqual(0);
    expect(result.cookingTimeFulfillmentScore).toBeGreaterThanOrEqual(0);
    expect(result.nutritionBalanceScore).toBeGreaterThanOrEqual(0);
  });
});