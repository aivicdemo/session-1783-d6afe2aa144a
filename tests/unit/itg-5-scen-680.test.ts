import { calculateNutritionAchievementDegree } from '../../src/logic/it-7-2-1';

describe('栄養摂取達成度計算 - ゼロ除算エラー処理', () => {
  // SCEN-680
  test('推奨値がゼロの場合、ゼロ除算エラーを適切に処理する', () => {
    // テストデータ: 推奨値が0に設定された栄養摂取データ
    const nutritionData = {
      nutrientId: 'protein_001',
      nutrientName: 'タンパク質',
      recommendedValue: 0,
      actualValue: 25,
      unit: 'g',
    };

    // ゼロ除算エラー処理の検証
    // ケース1: エラーが throw されることを確認
    expect(() => calculateNutritionAchievementDegree(nutritionData)).toThrow(/推奨値/);
  });

  test('推奨値が正常な場合、達成度をパーセンテージで返す', () => {
    // 正常なテストデータ
    const nutritionData = {
      nutrientId: 'protein_002',
      nutrientName: 'タンパク質',
      recommendedValue: 50,
      actualValue: 40,
      unit: 'g',
    };

    // 期待値: actualValue / recommendedValue * 100 = 40 / 50 * 100 = 80
    const result = calculateNutritionAchievementDegree(nutritionData);
    expect(result).toBe(80);
  });

  test('推奨値がマイナスの場合、不正値エラーを発生させる', () => {
    const nutritionData = {
      nutrientId: 'protein_003',
      nutrientName: 'タンパク質',
      recommendedValue: -50,
      actualValue: 25,
      unit: 'g',
    };

    expect(() => calculateNutritionAchievementDegree(nutritionData)).toThrow(/推奨値/);
  });

  test('実績値がゼロの場合、達成度0%を返す', () => {
    const nutritionData = {
      nutrientId: 'protein_004',
      nutrientName: 'タンパク質',
      recommendedValue: 50,
      actualValue: 0,
      unit: 'g',
    };

    // 期待値: 0 / 50 * 100 = 0
    const result = calculateNutritionAchievementDegree(nutritionData);
    expect(result).toBe(0);
  });

  test('実績値が推奨値を超過した場合、100%以上の達成度を返す', () => {
    const nutritionData = {
      nutrientId: 'protein_005',
      nutrientName: 'タンパク質',
      recommendedValue: 50,
      actualValue: 75,
      unit: 'g',
    };

    // 期待値: 75 / 50 * 100 = 150
    const result = calculateNutritionAchievementDegree(nutritionData);
    expect(result).toBe(150);
  });
});