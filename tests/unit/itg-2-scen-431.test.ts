import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { calculateNutritionAchievementScore } from '../../src/logic/it-1-br-2-1-1-1';

const fetchMock = require('jest-fetch-mock');

describe('栄養摂取達成度可視化ダッシュボード', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-431
  test('食事評価データが蓄積されていない場合、達成度スコア計算がエラーで中断される', async () => {
    // Arrange: 食事評価データなしの状態を設定
    const userId = 'user_001';
    const startDate = new Date('2024-01-01T00:00:00Z');
    const endDate = new Date('2024-01-31T23:59:59Z');

    fetchMock.mockResponseOnce(
      JSON.stringify({
        userId: userId,
        mealRecords: [],
        nutritionRecords: [],
      }),
      { status: 200 }
    );

    // Act & Assert: エラーケース - データ不足
    await expect(
      calculateNutritionAchievementScore({
        userId: userId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })
    ).rejects.toThrow(/データ不足/);

    // Assert: 食事評価データなしの状態でもシステムがクラッシュしないことを確認
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/nutrition/records'),
      expect.objectContaining({
        method: 'GET',
      })
    );
  });

  // ハッピーパス: 食事評価データが充分に蓄積されている場合
  test('食事評価データが蓄積されている場合、達成度スコアが正常に計算される', async () => {
    // Arrange
    const userId = 'user_001';
    const startDate = new Date('2024-01-01T00:00:00Z');
    const endDate = new Date('2024-01-31T23:59:59Z');
    const targetCalories = 2000;
    const actualCalories = 1950;
    const targetProtein = 50;
    const actualProtein = 48;
    const targetFat = 65;
    const actualFat = 62;
    const targetCarbohydrate = 300;
    const actualCarbohydrate = 295;

    // 期待される達成度スコア計算
    // calorie_score = (1950 / 2000) * 100 = 97.5
    // protein_score = (48 / 50) * 100 = 96.0
    // fat_score = (62 / 65) * 100 = 95.38...
    // carbohydrate_score = (295 / 300) * 100 = 98.33...
    // overall_score = (97.5 + 96.0 + 95.38 + 98.33) / 4 = 96.80 (平均値)
    const expectedCalorieScore = 97.5;
    const expectedProteinScore = 96.0;
    const expectedFatScore = 95.38;
    const expectedCarbohydrateScore = 98.33;
    const expectedOverallScore = 96.80;

    fetchMock.mockResponseOnce(
      JSON.stringify({
        userId: userId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        mealRecords: [
          {
            recordId: 'meal_001',
            userId: userId,
            date: '2024-01-15',
            nutritionData: {
              calories: actualCalories,
              protein: actualProtein,
              fat: actualFat,
              carbohydrate: actualCarbohydrate,
            },
          },
        ],
        nutritionTargets: {
          calories: targetCalories,
          protein: targetProtein,
          fat: targetFat,
          carbohydrate: targetCarbohydrate,
        },
      }),
      { status: 200 }
    );

    // Act
    const result = await calculateNutritionAchievementScore({
      userId: userId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    // Assert
    expect(result).toEqual({
      userId: userId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      nutritionScores: {
        calories: {
          target: targetCalories,
          actual: actualCalories,
          achievementScore: expectedCalorieScore,
        },
        protein: {
          target: targetProtein,
          actual: actualProtein,
          achievementScore: expectedProteinScore,
        },
        fat: {
          target: targetFat,
          actual: actualFat,
          achievementScore: expectedFatScore,
        },
        carbohydrate: {
          target: targetCarbohydrate,
          actual: actualCarbohydrate,
          achievementScore: expectedCarbohydrateScore,
        },
      },
      overallAchievementScore: expectedOverallScore,
      lastUpdated: expect.any(String),
    });

    // Assert: API が正常に呼ばれたことを確認
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/nutrition/records'),
      expect.objectContaining({
        method: 'GET',
      })
    );
  });

  // 境界値テスト: 達成度が 0% の場合
  test('実績値が 0 の場合、達成度スコアが 0 となる', async () => {
    // Arrange
    const userId = 'user_002';
    const startDate = new Date('2024-02-01T00:00:00Z');
    const endDate = new Date('2024-02-29T23:59:59Z');
    const targetCalories = 2000;
    const actualCalories = 0;

    fetchMock.mockResponseOnce(
      JSON.stringify({
        userId: userId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        mealRecords: [
          {
            recordId: 'meal_002',
            userId: userId,
            date: '2024-02-15',
            nutritionData: {
              calories: actualCalories,
              protein: 0,
              fat: 0,
              carbohydrate: 0,
            },
          },
        ],
        nutritionTargets: {
          calories: targetCalories,
          protein: 50,
          fat: 65,
          carbohydrate: 300,
        },
      }),
      { status: 200 }
    );

    // Act
    const result = await calculateNutritionAchievementScore({
      userId: userId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    // Assert: 実績が 0 の場合、達成度は 0
    expect(result.nutritionScores.calories.achievementScore).toBe(0);
    expect(result.overallAchievementScore).toBe(0);
  });

  // 境界値テスト: 達成度が 100% を超える場合
  test('実績値が目標値を超える場合、達成度スコアが 100 を超える値となる', async () => {
    // Arrange
    const userId = 'user_003';
    const startDate = new Date('2024-03-01T00:00:00Z');
    const endDate = new Date('2024-03-31T23:59:59Z');
    const targetCalories = 2000;
    const actualCalories = 2400; // 120%

    // 期待される達成度: (2400 / 2000) * 100 = 120
    const expectedScore = 120;

    fetchMock.mockResponseOnce(
      JSON.stringify({
        userId: userId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        mealRecords: [
          {
            recordId: 'meal_003',
            userId: userId,
            date: '2024-03-15',
            nutritionData: {
              calories: actualCalories,
              protein: 60,
              fat: 75,
              carbohydrate: 360,
            },
          },
        ],
        nutritionTargets: {
          calories: targetCalories,
          protein: 50,
          fat: 65,
          carbohydrate: 300,
        },
      }),
      { status: 200 }
    );

    // Act
    const result = await calculateNutritionAchievementScore({
      userId: userId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    // Assert
    expect(result.nutritionScores.calories.achievementScore).toBe(expectedScore);
  });

  // エラーケース: 栄養目標値が 0 の場合 (ゼロ除算対策)
  test('栄養目標値が 0 の場合、エラーが発生する', async () => {
    // Arrange
    const userId = 'user_004';
    const startDate = new Date('2024-04-01T00:00:00Z');
    const endDate = new Date('2024-04-30T23:59:59Z');

    fetchMock.mockResponseOnce(
      JSON.stringify({
        userId: userId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        mealRecords: [
          {
            recordId: 'meal_004',
            userId: userId,
            date: '2024-04-15',
            nutritionData: {
              calories: 100,
              protein: 10,
              fat: 5,
              carbohydrate: 20,
            },
          },
        ],
        nutritionTargets: {
          calories: 0, // ゼロ除算トリガー
          protein: 50,
          fat: 65,
          carbohydrate: 300,
        },
      }),
      { status: 200 }
    );

    // Act & Assert
    await expect(
      calculateNutritionAchievementScore({
        userId: userId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })
    ).rejects.toThrow(/目標値/);
  });

  // エラーケース: API レスポンスが 4xx/5xx の場合
  test('API レスポンスが 500 の場合、エラーが発生する', async () => {
    // Arrange
    const userId = 'user_005';
    const startDate = new Date('2024-05-01T00:00:00Z');
    const endDate = new Date('2024-05-31T23:59:59Z');

    fetchMock.mockResponseOnce(
      JSON.stringify({
        error: 'Internal Server Error',
      }),
      { status: 500 }
    );

    // Act & Assert
    await expect(
      calculateNutritionAchievementScore({
        userId: userId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })
    ).rejects.toThrow(/サーバー/);
  });

  // 複数栄養素で達成度が混在する場合
  test('複数栄養素の達成度が混在している場合、正しく平均スコアが計算される', async () => {
    // Arrange
    const userId = 'user_006';
    const startDate = new Date('2024-06-01T00:00:00Z');
    const endDate = new Date('2024-06-30T23:59:59Z');

    // スコア計算:
    // calories: (1800 / 2000) * 100 = 90
    // protein: (60 / 50) * 100 = 120
    // fat: (50 / 65) * 100 = 76.92
    // carbohydrate: (280 / 300) * 100 = 93.33
    // overall: (90 + 120 + 76.92 + 93.33) / 4 = 95.06

    const expectedOverallScore = 95.06;

    fetchMock.mockResponseOnce(
      JSON.stringify({
        userId: userId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        mealRecords: [
          {
            recordId: 'meal_006',
            userId: userId,
            date: '2024-06-15',
            nutritionData: {
              calories: 1800,
              protein: 60,
              fat: 50,
              carbohydrate: 280,
            },
          },
        ],
        nutritionTargets: {
          calories: 2000,
          protein: 50,
          fat: 65,
          carbohydrate: 300,
        },
      }),
      { status: 200 }
    );

    // Act
    const result = await calculateNutritionAchievementScore({
      userId: userId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    // Assert: 平均スコアが期待値に接近していることを確認 (浮動小数点誤差許容)
    expect(result.overallAchievementScore).toBeCloseTo(expectedOverallScore, 1);
  });
});