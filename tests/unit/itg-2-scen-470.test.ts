import { evaluateNutritionStandard } from '../../src/logic/it-1-br-2-1-1-1';

describe('栄養基準ロジック評価機能 - 優先度ランキングに基づくソート', () => {
  // SCEN-470
  test('複数の栄養項目が優先度ランキングに基づいて正しくソートされる', () => {
    const input = {
      nutritionItems: [
        {
          nutrientId: 'protein',
          nutrientName: 'タンパク質',
          targetValue: 60,
          actualValue: 55,
          achievementRate: 91.67,
          priorityRank: 2,
          riskLevel: 'low'
        },
        {
          nutrientId: 'fat',
          nutrientName: '脂質',
          targetValue: 50,
          actualValue: 52,
          achievementRate: 104.0,
          priorityRank: 4,
          riskLevel: 'low'
        },
        {
          nutrientId: 'carbohydrate',
          nutrientName: '炭水化物',
          targetValue: 300,
          actualValue: 280,
          achievementRate: 93.33,
          priorityRank: 3,
          riskLevel: 'low'
        },
        {
          nutrientId: 'vitaminA',
          nutrientName: 'ビタミンA',
          targetValue: 700,
          actualValue: 650,
          achievementRate: 92.86,
          priorityRank: 1,
          riskLevel: 'medium'
        },
        {
          nutrientId: 'calcium',
          nutrientName: 'カルシウム',
          targetValue: 700,
          actualValue: 600,
          achievementRate: 85.71,
          priorityRank: 5,
          riskLevel: 'high'
        }
      ],
      sortOrder: 'ascending',
      evaluationCriteria: {
        minAchievementThreshold: 80,
        targetAchievementRate: 100,
        riskWeighting: { high: 0.4, medium: 0.2, low: 0.1 }
      }
    };

    const result = evaluateNutritionStandard(input);

    expect(result.sortedItems).toBeDefined();
    expect(result.sortedItems).toHaveLength(5);

    expect(result.sortedItems[0].nutrientId).toBe('vitaminA');
    expect(result.sortedItems[0].priorityRank).toBe(1);

    expect(result.sortedItems[1].nutrientId).toBe('protein');
    expect(result.sortedItems[1].priorityRank).toBe(2);

    expect(result.sortedItems[2].nutrientId).toBe('carbohydrate');
    expect(result.sortedItems[2].priorityRank).toBe(3);

    expect(result.sortedItems[3].nutrientId).toBe('fat');
    expect(result.sortedItems[3].priorityRank).toBe(4);

    expect(result.sortedItems[4].nutrientId).toBe('calcium');
    expect(result.sortedItems[4].priorityRank).toBe(5);

    expect(result.evaluationPassed).toBe(true);
    expect(result.improvementGaps).toBeDefined();
    expect(result.improvementGaps).toHaveLength(5);

    const calciumGap = result.improvementGaps.find(
      (gap) => gap.nutrientId === 'calcium'
    );
    expect(calciumGap).toBeDefined();
    expect(calciumGap.gap).toBe(100);
    expect(calciumGap.riskLevel).toBe('high');

    const vitaminAGap = result.improvementGaps.find(
      (gap) => gap.nutrientId === 'vitaminA'
    );
    expect(vitaminAGap).toBeDefined();
    expect(vitaminAGap.gap).toBeCloseTo(7.14, 1);
    expect(vitaminAGap.riskLevel).toBe('medium');

    expect(result.sortLog).toBeDefined();
    expect(result.sortLog.appliedSortOrder).toBe('ascending');
    expect(result.sortLog.itemsCount).toBe(5);
    expect(result.sortLog.timestamp).toBeDefined();
  });
});