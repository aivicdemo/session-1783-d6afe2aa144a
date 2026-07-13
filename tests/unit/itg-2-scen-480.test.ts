import { calculateNutritionAchievementRate } from '../../src/logic/it-1-br-2-1-1-1';

describe('Nutrition Intake Trend Analysis - Achievement Rate Calculation', () => {
  // SCEN-480: [normal] 栄養摂取量推移分析 - 複数栄養項目の達成率を正確に計算し、百分率で表示する
  test('should calculate and display achievement rate as percentage for multiple nutrition items with one decimal place', () => {
    // Setup: Multiple nutrition items with recommended and actual intake values
    const nutritionData = [
      {
        nutrientId: 'protein',
        nutrientName: 'タンパク質',
        recommendedIntake: 50, // g
        actualIntake: 45, // g
      },
      {
        nutrientId: 'fat',
        nutrientName: '脂質',
        recommendedIntake: 65, // g
        actualIntake: 70, // g (exceeds 100%)
      },
      {
        nutrientId: 'carbohydrate',
        nutrientName: '炭水化物',
        recommendedIntake: 300, // g
        actualIntake: 300, // g (exactly 100%)
      },
      {
        nutrientId: 'vitaminA',
        nutrientName: 'ビタミンA',
        recommendedIntake: 800, // μg
        actualIntake: 500, // μg
      },
      {
        nutrientId: 'calcium',
        nutrientName: 'カルシウム',
        recommendedIntake: 1000, // mg
        actualIntake: 850, // mg
      },
    ];

    // Expected achievement rates based on formula: (actualIntake / recommendedIntake) * 100
    // Protein: (45 / 50) * 100 = 90.0%
    // Fat: (70 / 65) * 100 = 107.7% (rounded to 1 decimal place)
    // Carbohydrate: (300 / 300) * 100 = 100.0%
    // Vitamin A: (500 / 800) * 100 = 62.5%
    // Calcium: (850 / 1000) * 100 = 85.0%

    const result = calculateNutritionAchievementRate(nutritionData);

    // Verify the result structure and values
    expect(result).toEqual([
      {
        nutrientId: 'protein',
        nutrientName: 'タンパク質',
        achievementRate: 90.0,
      },
      {
        nutrientId: 'fat',
        nutrientName: '脂質',
        achievementRate: 107.7,
      },
      {
        nutrientId: 'carbohydrate',
        nutrientName: '炭水化物',
        achievementRate: 100.0,
      },
      {
        nutrientId: 'vitaminA',
        nutrientName: 'ビタミンA',
        achievementRate: 62.5,
      },
      {
        nutrientId: 'calcium',
        nutrientName: 'カルシウム',
        achievementRate: 85.0,
      },
    ]);

    // Verify that all achievement rates are expressed as percentages
    result.forEach((item) => {
      expect(typeof item.achievementRate).toBe('number');
      // Check that achievement rate is within valid range (can exceed 100%)
      expect(item.achievementRate).toBeGreaterThanOrEqual(0);
    });

    // Verify decimal precision (exactly 1 decimal place)
    result.forEach((item) => {
      const decimalPart = item.achievementRate.toString().split('.')[1];
      if (decimalPart) {
        expect(decimalPart.length).toBeLessThanOrEqual(1);
      }
    });
  });
});