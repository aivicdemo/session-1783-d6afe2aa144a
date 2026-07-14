import { aggregateWeeklyMetrics } from '../../src/logic/it-7-2-1';

describe('Weekly Algorithm Improvement Metrics Aggregation', () => {
  // SCEN-682
  test('should classify nutrition items with zero divergence as priority none', () => {
    // Setup: nutrition items with zero divergence
    const metricsInput = {
      weekStartDate: new Date('2024-01-15T00:00:00Z'),
      weekEndDate: new Date('2024-01-21T23:59:59Z'),
      nutritionItems: [
        {
          itemName: 'protein',
          targetValue: 50,
          actualValue: 50,
          divergence: 0,
          unit: 'g'
        },
        {
          itemName: 'fat',
          targetValue: 65,
          actualValue: 65,
          divergence: 0,
          unit: 'g'
        },
        {
          itemName: 'carbohydrate',
          targetValue: 325,
          actualValue: 325,
          divergence: 0,
          unit: 'g'
        },
        {
          itemName: 'fiber',
          targetValue: 25,
          actualValue: 25,
          divergence: 0,
          unit: 'g'
        },
        {
          itemName: 'sodium',
          targetValue: 2300,
          actualValue: 2300,
          divergence: 0,
          unit: 'mg'
        }
      ],
      mealGenerationSuccessRate: 92.5,
      cookingTimeShorteningDegree: 18.3,
      userSatisfactionScore: 8.7
    };

    // Execute
    const result = aggregateWeeklyMetrics(metricsInput);

    // Assert: verify result structure
    expect(result).toHaveProperty('weekStartDate');
    expect(result).toHaveProperty('weekEndDate');
    expect(result).toHaveProperty('nutritionDivergenceClassification');
    expect(result).toHaveProperty('aggregatedMetrics');

    // Assert: verify dates match input
    expect(result.weekStartDate).toEqual(new Date('2024-01-15T00:00:00Z'));
    expect(result.weekEndDate).toEqual(new Date('2024-01-21T23:59:59Z'));

    // Assert: verify aggregated metrics
    expect(result.aggregatedMetrics.mealGenerationSuccessRate).toBe(92.5);
    expect(result.aggregatedMetrics.cookingTimeShorteningDegree).toBe(18.3);
    expect(result.aggregatedMetrics.userSatisfactionScore).toBe(8.7);

    // Assert: verify nutrition divergence classification for each item
    const classificationMap = result.nutritionDivergenceClassification;

    // Protein: divergence = 0
    const proteinClassification = classificationMap.find(
      (item: any) => item.itemName === 'protein'
    );
    expect(proteinClassification).toBeDefined();
    expect(proteinClassification.divergence).toBe(0);
    expect(
      proteinClassification.priority === null ||
        proteinClassification.priority === undefined ||
        proteinClassification.priority === 'none'
    ).toBe(true);

    // Fat: divergence = 0
    const fatClassification = classificationMap.find(
      (item: any) => item.itemName === 'fat'
    );
    expect(fatClassification).toBeDefined();
    expect(fatClassification.divergence).toBe(0);
    expect(
      fatClassification.priority === null ||
        fatClassification.priority === undefined ||
        fatClassification.priority === 'none'
    ).toBe(true);

    // Carbohydrate: divergence = 0
    const carbohydrateClassification = classificationMap.find(
      (item: any) => item.itemName === 'carbohydrate'
    );
    expect(carbohydrateClassification).toBeDefined();
    expect(carbohydrateClassification.divergence).toBe(0);
    expect(
      carbohydrateClassification.priority === null ||
        carbohydrateClassification.priority === undefined ||
        carbohydrateClassification.priority === 'none'
    ).toBe(true);

    // Fiber: divergence = 0
    const fiberClassification = classificationMap.find(
      (item: any) => item.itemName === 'fiber'
    );
    expect(fiberClassification).toBeDefined();
    expect(fiberClassification.divergence).toBe(0);
    expect(
      fiberClassification.priority === null ||
        fiberClassification.priority === undefined ||
        fiberClassification.priority === 'none'
    ).toBe(true);

    // Sodium: divergence = 0
    const sodiumClassification = classificationMap.find(
      (item: any) => item.itemName === 'sodium'
    );
    expect(sodiumClassification).toBeDefined();
    expect(sodiumClassification.divergence).toBe(0);
    expect(
      sodiumClassification.priority === null ||
        sodiumClassification.priority === undefined ||
        sodiumClassification.priority === 'none'
    ).toBe(true);

    // Assert: verify that all items have zero divergence classified as no priority
    const allZeroDivergenceItems = classificationMap.filter(
      (item: any) => item.divergence === 0
    );
    expect(allZeroDivergenceItems.length).toBe(5);
    allZeroDivergenceItems.forEach((item: any) => {
      expect(
        item.priority === null ||
          item.priority === undefined ||
          item.priority === 'none'
      ).toBe(true);
    });

    // Assert: verify validation log exists
    expect(result).toHaveProperty('validationLog');
    expect(Array.isArray(result.validationLog)).toBe(true);
    expect(result.validationLog.length).toBeGreaterThan(0);
  });
});