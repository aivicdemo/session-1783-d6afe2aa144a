import { calculateNutrientDeviation } from '../../src/logic/it-1-br-2-1-1-1';

describe('Nutrition intake progress dashboard - Nutrient deviation quantification', () => {
  // SCEN-488: [edge] 乖離度定量化 - 実績値が目標値をわずかに超過した場合の乖離度を計算する
  test('should calculate deviation degree accurately when actual value slightly exceeds target value', () => {
    const targetCalorie = 2000;
    const actualCalorie = 2050;
    const expectedCalorieDeviation = 2.5;

    const targetProtein = 50;
    const actualProtein = 50.5;
    const expectedProteinDeviation = 1.0;

    const result = calculateNutrientDeviation([
      {
        nutrientName: 'カロリー',
        targetValue: targetCalorie,
        actualValue: actualCalorie,
      },
      {
        nutrientName: 'タンパク質',
        targetValue: targetProtein,
        actualValue: actualProtein,
      },
    ]);

    expect(result).toEqual({
      nutrients: [
        {
          nutrientName: 'カロリー',
          targetValue: targetCalorie,
          actualValue: actualCalorie,
          deviationDegree: expectedCalorieDeviation,
          deviationStatus: 'exceeded',
        },
        {
          nutrientName: 'タンパク質',
          targetValue: targetProtein,
          actualValue: actualProtein,
          deviationDegree: expectedProteinDeviation,
          deviationStatus: 'exceeded',
        },
      ],
      totalDeviationCount: 2,
    });

    expect(result.nutrients[0].deviationDegree).toBe(2.5);
    expect(result.nutrients[0].deviationStatus).toBe('exceeded');
    expect(result.nutrients[1].deviationDegree).toBe(1.0);
    expect(result.nutrients[1].deviationStatus).toBe('exceeded');
  });
});