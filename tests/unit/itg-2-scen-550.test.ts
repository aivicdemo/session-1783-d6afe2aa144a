import { validateNutritionBalance } from '../../src/logic/it-1-br-2-1-1-1';

describe('栄養バランス検証機能', () => {
  test('SCEN-550: いずれかの栄養項目が基準値を下回るとき不合格判定が返される', () => {
    const nutritionInput = {
      protein: {
        standard: 50,
        actual: 40,
      },
      fat: {
        standard: 60,
        actual: 60,
      },
      carbohydrate: {
        standard: 300,
        actual: 300,
      },
    };

    const result = validateNutritionBalance(nutritionInput);

    expect(result.status).toBe('不合格');
    expect(result.belowStandardItems).toContain('タンパク質');
    expect(result.belowStandardItems.length).toBe(1);
    expect(result.message).toMatch(/タンパク質/);
    expect(result.achievementRate.protein).toBe(80);
    expect(result.achievementRate.fat).toBe(100);
    expect(result.achievementRate.carbohydrate).toBe(100);
  });
});