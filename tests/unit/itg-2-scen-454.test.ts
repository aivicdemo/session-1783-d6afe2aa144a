import { calculateNutritionAchievementRate } from '../../src/logic/it-1-br-2-1-1-1';

describe('栄養達成度可視化機能', () => {
  // SCEN-454
  test('栄養実績値が0の場合に達成度0%として表示される', () => {
    // Arrange
    const nutritionData = {
      userId: 'user_001',
      nutritionItems: [
        {
          nutrientId: 'protein',
          nutrientName: 'タンパク質',
          unit: 'g',
          targetValue: 50,
          actualValue: 0,
        },
        {
          nutrientId: 'calcium',
          nutrientName: 'カルシウム',
          unit: 'mg',
          targetValue: 800,
          actualValue: 0,
        },
        {
          nutrientId: 'iron',
          nutrientName: '鉄分',
          unit: 'mg',
          targetValue: 10,
          actualValue: 5,
        },
      ],
    };

    // Act
    const result = calculateNutritionAchievementRate(nutritionData);

    // Assert
    // 栄養実績値が0の場合、達成度は0%（具体値で検証）
    expect(result.achievements).toEqual([
      {
        nutrientId: 'protein',
        nutrientName: 'タンパク質',
        targetValue: 50,
        actualValue: 0,
        achievementRate: 0,
        displayPercentage: '0%',
        gaugeStatus: 'empty',
        isValid: true,
      },
      {
        nutrientId: 'calcium',
        nutrientName: 'カルシウム',
        targetValue: 800,
        actualValue: 0,
        achievementRate: 0,
        displayPercentage: '0%',
        gaugeStatus: 'empty',
        isValid: true,
      },
      {
        nutrientId: 'iron',
        nutrientName: '鉄分',
        targetValue: 10,
        actualValue: 5,
        achievementRate: 50,
        displayPercentage: '50%',
        gaugeStatus: 'partial',
        isValid: true,
      },
    ]);

    // 表示形式の検証
    const proteinAchievement = result.achievements.find(
      (item) => item.nutrientId === 'protein'
    );
    expect(proteinAchievement).toBeDefined();
    expect(proteinAchievement?.displayPercentage).toBe('0%');
    expect(proteinAchievement?.achievementRate).toBe(0);
    expect(proteinAchievement?.gaugeStatus).toBe('empty');
    expect(proteinAchievement?.isValid).toBe(true);

    // NaN、undefined、null が含まれていないことを検証
    result.achievements.forEach((item) => {
      expect(typeof item.achievementRate).toBe('number');
      expect(item.achievementRate).not.toBe(NaN);
      expect(item.achievementRate).not.toBeUndefined();
      expect(item.achievementRate).not.toBeNull();
      expect(item.displayPercentage).not.toBeUndefined();
      expect(item.displayPercentage).not.toBeNull();
      expect(typeof item.displayPercentage).toBe('string');
      expect(item.gaugeStatus).not.toBeUndefined();
      expect(item.gaugeStatus).not.toBeNull();
    });

    // サマリー検証
    expect(result.summary).toEqual({
      totalNutrients: 3,
      achievedCount: 1,
      partialCount: 1,
      zeroCount: 1,
      overallAchievementRate: 16.67,
    });

    // 全体の達成度計算: (0 + 0 + 50) / (3 * 100) = 50 / 300 = 0.1667 = 16.67%
    expect(result.summary.overallAchievementRate).toBeCloseTo(16.67, 2);
  });
});