import { validateNutritionBalance } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能', () => {
  test('SCEN-549: [normal] 栄養バランス検証機能 - 献立の栄養項目別達成度が基準値を満たすとき合格判定が返される', () => {
    // Arrange
    const mealNutritionData = {
      mealId: 'meal_2024_01_15_001',
      userId: 'user_123',
      recordDate: '2024-01-15T11:00:00Z',
      nutritionItems: [
        {
          nutrientId: 'protein',
          nutrientName: 'タンパク質',
          actualValue: 55,
          unit: 'g',
          standardValue: 50,
          recommendedDailyValue: 50,
        },
        {
          nutrientId: 'fat',
          nutrientName: '脂質',
          actualValue: 65,
          unit: 'g',
          standardValue: 60,
          recommendedDailyValue: 60,
        },
        {
          nutrientId: 'carbohydrate',
          nutrientName: '炭水化物',
          actualValue: 280,
          unit: 'g',
          standardValue: 250,
          recommendedDailyValue: 250,
        },
        {
          nutrientId: 'vitamin_a',
          nutrientName: 'ビタミンA',
          actualValue: 700,
          unit: 'µg',
          standardValue: 650,
          recommendedDailyValue: 650,
        },
        {
          nutrientId: 'mineral_iron',
          nutrientName: '鉄（ミネラル）',
          actualValue: 12,
          unit: 'mg',
          standardValue: 10,
          recommendedDailyValue: 10,
        },
      ],
    };

    // Act
    const result = validateNutritionBalance(mealNutritionData);

    // Assert - 合格判定の確認
    expect(result.judgmentStatus).toBe('pass');
    expect(result.isQualified).toBe(true);

    // Assert - 栄養項目別達成度の確認（すべて100%以上）
    expect(result.nutritionAchievementRates).toEqual({
      protein: 110, // (55/50) * 100
      fat: 108.33, // (65/60) * 100
      carbohydrate: 112, // (280/250) * 100
      vitamin_a: 107.69, // (700/650) * 100
      mineral_iron: 120, // (12/10) * 100
    });

    // Assert - 総合達成度スコアの確認（全項目の平均が100%以上）
    expect(result.overallAchievementScore).toBeGreaterThanOrEqual(100);

    // Assert - 達成度パーセンテージがすべて基準値以上であることを確認
    const allAchievementPercentages = Object.values(
      result.nutritionAchievementRates,
    );
    allAchievementPercentages.forEach((percentage) => {
      expect(percentage).toBeGreaterThanOrEqual(100);
    });

    // Assert - 不適合項目がないことを確認
    expect(result.failedNutrients).toEqual([]);

    // Assert - メタデータの確認
    expect(result.mealId).toBe('meal_2024_01_15_001');
    expect(result.userId).toBe('user_123');
    expect(result.validationTimestamp).toBeDefined();
  });
});