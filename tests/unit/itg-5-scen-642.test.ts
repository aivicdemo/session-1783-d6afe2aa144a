import { generateMealPlanWithoutUserFeedback } from '../../src/logic/it-7-2-1';

describe('Initial Stage Meal Plan Generation - Zero Evaluation Data', () => {
  // SCEN-642
  test('should generate meal plan successfully when no user feedback data exists', async () => {
    const familyConstraints = {
      familyMemberId: 'fam_001',
      ageGroupDistribution: [
        { ageGroup: '30-40', count: 2 },
        { ageGroup: '6-12', count: 2 }
      ],
      allergyRestrictions: [
        {
          memberId: 'mem_001',
          allergen: 'peanut',
          severity: 'high'
        }
      ],
      mealTimeRestrictions: [
        {
          memberId: 'mem_003',
          maxCookingTimeMinutes: 30
        }
      ],
      budgetLimitYen: 3000
    };

    const nutritionStandards = {
      caloriesMin: 2000,
      caloriesMax: 2500,
      proteinGrams: 60,
      fiberGrams: 20,
      sodiumMgMax: 2400
    };

    const existingFeedbackDataCount = 0;
    const requestTimestamp = new Date('2024-01-15T09:00:00Z');
    const timeoutMs = 5000;

    const result = await generateMealPlanWithoutUserFeedback(
      {
        familyConstraints,
        nutritionStandards,
        existingFeedbackDataCount,
        requestTimestamp,
        timeoutMs
      }
    );

    expect(result).toBeDefined();
    expect(result.mealPlanId).toMatch(/^mp_\d{10}$/);
    expect(result.status).toBe('success');
    expect(result.hasError).toBe(false);
    expect(result.errorMessages).toEqual([]);
    expect(result.generatedAt).toEqual(new Date('2024-01-15T09:00:00Z'));
    
    expect(result.mealPlan).toBeDefined();
    expect(result.mealPlan.meals).toBeInstanceOf(Array);
    expect(result.mealPlan.meals.length).toBeGreaterThan(0);
    
    expect(result.mealPlan.meals[0]).toHaveProperty('mealId');
    expect(result.mealPlan.meals[0]).toHaveProperty('dishName');
    expect(result.mealPlan.meals[0]).toHaveProperty('estimatedCalories');
    expect(result.mealPlan.meals[0]).toHaveProperty('ingredients');
    expect(result.mealPlan.meals[0]).toHaveProperty('estimatedCookingTimeMinutes');
    expect(result.mealPlan.meals[0]).toHaveProperty('estimatedCostYen');

    const dish = result.mealPlan.meals[0];
    expect(dish.estimatedCalories).toBeGreaterThanOrEqual(nutritionStandards.caloriesMin);
    expect(dish.estimatedCalories).toBeLessThanOrEqual(nutritionStandards.caloriesMax);
    expect(dish.estimatedCookingTimeMinutes).toBeLessThanOrEqual(30);
    expect(result.mealPlan.totalEstimatedCostYen).toBeLessThanOrEqual(familyConstraints.budgetLimitYen);

    const allergenNames = dish.ingredients.map((ing: any) => ing.allergen).filter((a: string | null) => a !== null);
    expect(allergenNames).not.toContain('peanut');

    expect(result.processingTimeMs).toBeLessThanOrEqual(timeoutMs);
    expect(result.processingTimeMs).toBeGreaterThan(0);

    expect(result.metadata).toBeDefined();
    expect(result.metadata.feedbackDataUsed).toBe(false);
    expect(result.metadata.fallbackToBasicNutrition).toBe(true);
    expect(result.metadata.segmentationApplied).toBe(false);
  });
});