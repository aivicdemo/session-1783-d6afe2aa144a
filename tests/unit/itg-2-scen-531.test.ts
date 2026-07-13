import { describe, test, expect } from '@jest/globals';
import { verifyNutritionStandardImprovementEffect } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証 - 改善効果検証機能', () => {
  // SCEN-531: [error] 栄養基準改善効果検証機能 - デプロイ後のユーザー食事記録がない場合、改善効果検証がスキップされる
  test('ユーザー食事記録が存在しない場合、改善効果検証処理がスキップされ、エラーなく適切なスキップ状態が返される', () => {
    // Arrange: 食事記録が空の状態でテスト
    const userId = 'user-test-001';
    const deploymentDate = new Date('2024-01-15T00:00:00Z');
    const mealRecords: Array<{
      recordId: string;
      userId: string;
      mealDate: Date;
      nutritionData: Record<string, number>;
    }> = []; // 空の食事記録

    // Act: 改善効果検証処理をトリガー
    const result = verifyNutritionStandardImprovementEffect({
      userId,
      deploymentDate,
      mealRecords,
    });

    // Assert: スキップ状態が適切に返される
    expect(result).toEqual({
      status: 'skipped',
      reason: '食事記録がありません',
      userId,
      verificationExecuted: false,
      improvedEffectScores: [],
      errorMessage: null,
    });
  });

  test('デプロイ後1週間未満のユーザー食事記録のみ存在する場合、検証が実行されない', () => {
    // Arrange: デプロイ後3日分の食事記録のみ
    const userId = 'user-test-002';
    const deploymentDate = new Date('2024-01-15T00:00:00Z');
    const mealRecords = [
      {
        recordId: 'meal-001',
        userId,
        mealDate: new Date('2024-01-16T12:00:00Z'),
        nutritionData: { protein: 50, carbs: 200, fat: 60 },
      },
      {
        recordId: 'meal-002',
        userId,
        mealDate: new Date('2024-01-17T12:00:00Z'),
        nutritionData: { protein: 55, carbs: 210, fat: 65 },
      },
    ];

    // Act
    const result = verifyNutritionStandardImprovementEffect({
      userId,
      deploymentDate,
      mealRecords,
    });

    // Assert: 検証がスキップされる
    expect(result).toEqual({
      status: 'skipped',
      reason: 'デプロイ後7日以上の食事記録が必要です',
      userId,
      verificationExecuted: false,
      improvedEffectScores: [],
      errorMessage: null,
    });
  });

  test('デプロイ後7日以上のユーザー食事記録が存在する場合、改善効果検証が実行される', () => {
    // Arrange: デプロイ後10日分の食事記録を用意
    const userId = 'user-test-003';
    const deploymentDate = new Date('2024-01-15T00:00:00Z');
    const mealRecords = [
      {
        recordId: 'meal-001',
        userId,
        mealDate: new Date('2024-01-16T12:00:00Z'),
        nutritionData: { protein: 50, carbs: 200, fat: 60, calcium: 800, iron: 15 },
      },
      {
        recordId: 'meal-002',
        userId,
        mealDate: new Date('2024-01-17T12:00:00Z'),
        nutritionData: { protein: 55, carbs: 210, fat: 65, calcium: 850, iron: 16 },
      },
      {
        recordId: 'meal-003',
        userId,
        mealDate: new Date('2024-01-18T12:00:00Z'),
        nutritionData: { protein: 52, carbs: 205, fat: 62, calcium: 820, iron: 15.5 },
      },
      {
        recordId: 'meal-004',
        userId,
        mealDate: new Date('2024-01-19T12:00:00Z'),
        nutritionData: { protein: 58, carbs: 215, fat: 68, calcium: 880, iron: 17 },
      },
      {
        recordId: 'meal-005',
        userId,
        mealDate: new Date('2024-01-20T12:00:00Z'),
        nutritionData: { protein: 54, carbs: 208, fat: 64, calcium: 840, iron: 15.8 },
      },
      {
        recordId: 'meal-006',
        userId,
        mealDate: new Date('2024-01-21T12:00:00Z'),
        nutritionData: { protein: 56, carbs: 212, fat: 66, calcium: 860, iron: 16.2 },
      },
      {
        recordId: 'meal-007',
        userId,
        mealDate: new Date('2024-01-22T12:00:00Z'),
        nutritionData: { protein: 51, carbs: 202, fat: 61, calcium: 810, iron: 15.2 },
      },
      {
        recordId: 'meal-008',
        userId,
        mealDate: new Date('2024-01-23T12:00:00Z'),
        nutritionData: { protein: 57, carbs: 218, fat: 67, calcium: 870, iron: 16.5 },
      },
      {
        recordId: 'meal-009',
        userId,
        mealDate: new Date('2024-01-24T12:00:00Z'),
        nutritionData: { protein: 53, carbs: 207, fat: 63, calcium: 830, iron: 15.5 },
      },
      {
        recordId: 'meal-010',
        userId,
        mealDate: new Date('2024-01-25T12:00:00Z'),
        nutritionData: { protein: 55, carbs: 211, fat: 65, calcium: 850, iron: 16.3 },
      },
    ];

    // Act
    const result = verifyNutritionStandardImprovementEffect({
      userId,
      deploymentDate,
      mealRecords,
    });

    // Assert: 検証が実行され、達成度スコアが計算される
    expect(result.status).toBe('success');
    expect(result.verificationExecuted).toBe(true);
    expect(result.errorMessage).toBeNull();
    expect(Array.isArray(result.improvedEffectScores)).toBe(true);
    expect(result.improvedEffectScores.length).toBeGreaterThan(0);

    // 各栄養項目の達成度スコアを確認 (例: protein, carbs, fat など)
    const proteinScore = result.improvedEffectScores.find(
      (score: { nutrientName: string; achievementRate: number }) =>
        score.nutrientName === 'protein'
    );
    expect(proteinScore).toBeDefined();
    expect(typeof proteinScore.achievementRate).toBe('number');
    expect(proteinScore.achievementRate).toBeGreaterThanOrEqual(0);
    expect(proteinScore.achievementRate).toBeLessThanOrEqual(100);
  });

  test('ユーザーIDがnullの場合、エラーが発生する', () => {
    // Arrange
    const userId = null as any;
    const deploymentDate = new Date('2024-01-15T00:00:00Z');
    const mealRecords: any[] = [];

    // Act & Assert
    expect(() =>
      verifyNutritionStandardImprovementEffect({
        userId,
        deploymentDate,
        mealRecords,
      })
    ).toThrow(/ユーザーID/);
  });

  test('デプロイ日がnullの場合、エラーが発生する', () => {
    // Arrange
    const userId = 'user-test-004';
    const deploymentDate = null as any;
    const mealRecords: any[] = [];

    // Act & Assert
    expect(() =>
      verifyNutritionStandardImprovementEffect({
        userId,
        deploymentDate,
        mealRecords,
      })
    ).toThrow(/デプロイ日/);
  });

  test('食事記録がnullの場合、デフォルトの空配列として処理される', () => {
    // Arrange
    const userId = 'user-test-005';
    const deploymentDate = new Date('2024-01-15T00:00:00Z');
    const mealRecords = null as any;

    // Act
    const result = verifyNutritionStandardImprovementEffect({
      userId,
      deploymentDate,
      mealRecords,
    });

    // Assert: スキップ状態が返される
    expect(result.status).toBe('skipped');
    expect(result.verificationExecuted).toBe(false);
  });

  test('デプロイ後の食事記録のみを集計対象とする', () => {
    // Arrange: デプロイ前後の食事記録が混在する場合
    const userId = 'user-test-006';
    const deploymentDate = new Date('2024-01-15T00:00:00Z');
    const mealRecords = [
      // デプロイ前の記録 (対象外)
      {
        recordId: 'meal-old-001',
        userId,
        mealDate: new Date('2024-01-14T12:00:00Z'),
        nutritionData: { protein: 40, carbs: 180, fat: 50 },
      },
      // デプロイ後の記録 (対象)
      {
        recordId: 'meal-001',
        userId,
        mealDate: new Date('2024-01-16T12:00:00Z'),
        nutritionData: { protein: 50, carbs: 200, fat: 60, calcium: 800, iron: 15 },
      },
      {
        recordId: 'meal-002',
        userId,
        mealDate: new Date('2024-01-17T12:00:00Z'),
        nutritionData: { protein: 55, carbs: 210, fat: 65, calcium: 850, iron: 16 },
      },
      {
        recordId: 'meal-003',
        userId,
        mealDate: new Date('2024-01-18T12:00:00Z'),
        nutritionData: { protein: 52, carbs: 205, fat: 62, calcium: 820, iron: 15.5 },
      },
      {
        recordId: 'meal-004',
        userId,
        mealDate: new Date('2024-01-19T12:00:00Z'),
        nutritionData: { protein: 58, carbs: 215, fat: 68, calcium: 880, iron: 17 },
      },
      {
        recordId: 'meal-005',
        userId,
        mealDate: new Date('2024-01-20T12:00:00Z'),
        nutritionData: { protein: 54, carbs: 208, fat: 64, calcium: 840, iron: 15.8 },
      },
      {
        recordId: 'meal-006',
        userId,
        mealDate: new Date('2024-01-21T12:00:00Z'),
        nutritionData: { protein: 56, carbs: 212, fat: 66, calcium: 860, iron: 16.2 },
      },
      {
        recordId: 'meal-007',
        userId,
        mealDate: new Date('2024-01-22T12:00:00Z'),
        nutritionData: { protein: 51, carbs: 202, fat: 61, calcium: 810, iron: 15.2 },
      },
      {
        recordId: 'meal-008',
        userId,
        mealDate: new Date('2024-01-23T12:00:00Z'),
        nutritionData: { protein: 57, carbs: 218, fat: 67, calcium: 870, iron: 16.5 },
      },
      {
        recordId: 'meal-009',
        userId,
        mealDate: new Date('2024-01-24T12:00:00Z'),
        nutritionData: { protein: 53, carbs: 207, fat: 63, calcium: 830, iron: 15.5 },
      },
      {
        recordId: 'meal-010',
        userId,
        mealDate: new Date('2024-01-25T12:00:00Z'),
        nutritionData: { protein: 55, carbs: 211, fat: 65, calcium: 850, iron: 16.3 },
      },
    ];

    // Act
    const result = verifyNutritionStandardImprovementEffect({
      userId,
      deploymentDate,
      mealRecords,
    });

    // Assert: 検証が実行される (デプロイ前の記録は除外、10日分のデプロイ後記録が集計対象)
    expect(result.status).toBe('success');
    expect(result.verificationExecuted).toBe(true);
    expect(result.improvedEffectScores.length).toBeGreaterThan(0);
  });
});