import { validateNutritionStandardEffectiveness } from '../../src/logic/it-1-br-2-1-1-1';

describe('栄養基準設定の有効性判定と改善項目の可視化', () => {
  // SCEN-514
  test('栄養摂取データが不足している場合、有効性判定不可のエラーが発生する', () => {
    const insufficientDataInput = {
      userId: 'user-001',
      period: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      },
      nutritionItems: [],
      actualIntakeValues: {},
      standardValues: {
        protein: 60,
        carbohydrate: 300,
        fat: 65,
        calcium: 800,
        iron: 8,
        vitaminC: 100,
      },
    };

    expect(() => validateNutritionStandardEffectiveness(insufficientDataInput)).toThrow(/栄養摂取データ/);
  });

  test('必須の栄養摂取項目が空欄の場合、エラーが発生する', () => {
    const missingMandatoryItemInput = {
      userId: 'user-002',
      period: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      },
      nutritionItems: ['protein', 'carbohydrate'],
      actualIntakeValues: {
        protein: null,
        carbohydrate: 280,
      },
      standardValues: {
        protein: 60,
        carbohydrate: 300,
        fat: 65,
        calcium: 800,
        iron: 8,
        vitaminC: 100,
      },
    };

    expect(() => validateNutritionStandardEffectiveness(missingMandatoryItemInput)).toThrow(/栄養摂取データ/);
  });

  test('十分な栄養摂取データがある場合、有効性判定結果と改善項目を返す', () => {
    const sufficientDataInput = {
      userId: 'user-003',
      period: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      },
      nutritionItems: ['protein', 'carbohydrate', 'fat', 'calcium', 'iron', 'vitaminC'],
      actualIntakeValues: {
        protein: 55,
        carbohydrate: 280,
        fat: 60,
        calcium: 700,
        iron: 7,
        vitaminC: 95,
      },
      standardValues: {
        protein: 60,
        carbohydrate: 300,
        fat: 65,
        calcium: 800,
        iron: 8,
        vitaminC: 100,
      },
    };

    const result = validateNutritionStandardEffectiveness(sufficientDataInput);

    expect(result).toHaveProperty('validity');
    expect(result.validity).toBe(true);
    expect(result).toHaveProperty('achievementRates');
    expect(result.achievementRates.protein).toBe(92);
    expect(result.achievementRates.carbohydrate).toBe(93);
    expect(result.achievementRates.fat).toBe(92);
    expect(result.achievementRates.calcium).toBe(88);
    expect(result.achievementRates.iron).toBe(88);
    expect(result.achievementRates.vitaminC).toBe(95);
    expect(result).toHaveProperty('improvementItems');
    expect(Array.isArray(result.improvementItems)).toBe(true);
    expect(result.improvementItems.length).toBeGreaterThan(0);
    expect(result.improvementItems[0]).toHaveProperty('item');
    expect(result.improvementItems[0]).toHaveProperty('gap');
    expect(result.improvementItems[0]).toHaveProperty('priority');
  });

  test('全栄養項目が基準値を達成している場合、改善ギャップは0で優先度なし', () => {
    const perfectAchievementInput = {
      userId: 'user-004',
      period: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      },
      nutritionItems: ['protein', 'carbohydrate', 'fat', 'calcium', 'iron', 'vitaminC'],
      actualIntakeValues: {
        protein: 60,
        carbohydrate: 300,
        fat: 65,
        calcium: 800,
        iron: 8,
        vitaminC: 100,
      },
      standardValues: {
        protein: 60,
        carbohydrate: 300,
        fat: 65,
        calcium: 800,
        iron: 8,
        vitaminC: 100,
      },
    };

    const result = validateNutritionStandardEffectiveness(perfectAchievementInput);

    expect(result.validity).toBe(true);
    expect(result.achievementRates.protein).toBe(100);
    expect(result.achievementRates.carbohydrate).toBe(100);
    expect(result.achievementRates.fat).toBe(100);
    expect(result.achievementRates.calcium).toBe(100);
    expect(result.achievementRates.iron).toBe(100);
    expect(result.achievementRates.vitaminC).toBe(100);
    expect(result.improvementItems.length).toBe(0);
  });

  test('複数の栄養項目が基準値を下回る場合、優先度順に改善項目がソートされる', () => {
    const multipleDeficiencyInput = {
      userId: 'user-005',
      period: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      },
      nutritionItems: ['protein', 'carbohydrate', 'fat', 'calcium', 'iron', 'vitaminC'],
      actualIntakeValues: {
        protein: 30,
        carbohydrate: 150,
        fat: 30,
        calcium: 400,
        iron: 2,
        vitaminC: 30,
      },
      standardValues: {
        protein: 60,
        carbohydrate: 300,
        fat: 65,
        calcium: 800,
        iron: 8,
        vitaminC: 100,
      },
    };

    const result = validateNutritionStandardEffectiveness(multipleDeficiencyInput);

    expect(result.validity).toBe(true);
    expect(result.improvementItems.length).toBeGreaterThanOrEqual(6);
    expect(result.improvementItems[0].priority).toBeGreaterThanOrEqual(1);
    expect(result.improvementItems[0].priority).toBeLessThanOrEqual(10);
    const prioritySequence = result.improvementItems.map((item: { priority: number }) => item.priority);
    for (let i = 1; i < prioritySequence.length; i++) {
      expect(prioritySequence[i - 1]).toBeLessThanOrEqual(prioritySequence[i]);
    }
  });

  test('空のstandardValuesが渡された場合、エラーが発生する', () => {
    const noStandardValuesInput = {
      userId: 'user-006',
      period: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      },
      nutritionItems: ['protein'],
      actualIntakeValues: {
        protein: 55,
      },
      standardValues: {},
    };

    expect(() => validateNutritionStandardEffectiveness(noStandardValuesInput)).toThrow(/栄養摂取データ/);
  });
});