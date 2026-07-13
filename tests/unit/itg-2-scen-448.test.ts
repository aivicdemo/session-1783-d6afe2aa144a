import { describe, test, expect } from '@jest/globals';
import { calculateNutritionDashboardData } from '../../src/logic/it-1-br-2-1-1-1';

describe('Nutrition Dashboard - Empty Data Initialization', () => {
  // SCEN-448
  test('should display default values and initialization message when meal record data is empty', () => {
    const emptyMealRecords: any[] = [];
    const nutritionStandards = {
      calories: { target: 2000, unit: 'kcal' },
      protein: { target: 50, unit: 'g' },
      fat: { target: 65, unit: 'g' },
      carbohydrates: { target: 300, unit: 'g' },
      fiber: { target: 20, unit: 'g' },
      calcium: { target: 800, unit: 'mg' },
      iron: { target: 8, unit: 'mg' },
      sodium: { target: 2300, unit: 'mg' },
    };

    const result = calculateNutritionDashboardData(emptyMealRecords, nutritionStandards);

    expect(result).toEqual({
      status: 'initialized',
      message: 'データがまだ登録されていません',
      nutritionItems: [
        {
          nutrientName: 'calories',
          actualValue: 0,
          targetValue: 2000,
          unit: 'kcal',
          achievementRate: 0,
          displayValue: 'N/A',
        },
        {
          nutrientName: 'protein',
          actualValue: 0,
          targetValue: 50,
          unit: 'g',
          achievementRate: 0,
          displayValue: 'N/A',
        },
        {
          nutrientName: 'fat',
          actualValue: 0,
          targetValue: 65,
          unit: 'g',
          achievementRate: 0,
          displayValue: 'N/A',
        },
        {
          nutrientName: 'carbohydrates',
          actualValue: 0,
          targetValue: 300,
          unit: 'g',
          achievementRate: 0,
          displayValue: 'N/A',
        },
        {
          nutrientName: 'fiber',
          actualValue: 0,
          targetValue: 20,
          unit: 'g',
          achievementRate: 0,
          displayValue: 'N/A',
        },
        {
          nutrientName: 'calcium',
          actualValue: 0,
          targetValue: 800,
          unit: 'mg',
          achievementRate: 0,
          displayValue: 'N/A',
        },
        {
          nutrientName: 'iron',
          actualValue: 0,
          targetValue: 8,
          unit: 'mg',
          achievementRate: 0,
          displayValue: 'N/A',
        },
        {
          nutrientName: 'sodium',
          actualValue: 0,
          targetValue: 2300,
          unit: 'mg',
          achievementRate: 0,
          displayValue: 'N/A',
        },
      ],
      chartData: {
        isEmpty: true,
        labels: [],
        values: [],
      },
      widgets: {
        totalCaloriesWidget: {
          value: 0,
          unit: 'kcal',
          status: 'empty',
        },
        achievementRateWidget: {
          value: 0,
          unit: '%',
          status: 'empty',
        },
        improvementGapWidget: {
          items: [],
          status: 'empty',
        },
      },
      hasError: false,
      consoleErrors: [],
      consoleWarnings: [],
      isRenderingSuccessful: true,
    });

    expect(result.status).toBe('initialized');
    expect(result.message).toBe('データがまだ登録されていません');
    expect(result.hasError).toBe(false);
    expect(result.isRenderingSuccessful).toBe(true);
    expect(result.consoleErrors.length).toBe(0);
    expect(result.consoleWarnings.length).toBe(0);
    expect(result.chartData.isEmpty).toBe(true);
    expect(result.widgets.totalCaloriesWidget.status).toBe('empty');
    expect(result.widgets.achievementRateWidget.status).toBe('empty');
    expect(result.widgets.improvementGapWidget.status).toBe('empty');

    result.nutritionItems.forEach((item) => {
      expect(item.actualValue).toBe(0);
      expect(item.achievementRate).toBe(0);
      expect(item.displayValue).toBe('N/A');
    });
  });
});