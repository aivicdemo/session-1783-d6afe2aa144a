import { calculateNutritionAchievementScore } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-398
  test('栄養摂取状況分析機能 - 栄養目標値がゼロの項目に対して達成度スコアが適切に計算される', () => {
    // Arrange: 目標値にゼロを含む栄養項目を設定
    const nutritionTargets = {
      protein_g: 60,
      carbohydrate_g: 300,
      fat_g: 65,
      sodium_mg: 0,
      calcium_mg: 800,
      iron_mg: 8,
    };

    // 実績値を設定（全項目で摂取あり）
    const nutritionActuals = {
      protein_g: 55,
      carbohydrate_g: 280,
      fat_g: 60,
      sodium_mg: 2000,
      calcium_mg: 600,
      iron_mg: 7,
    };

    // Act: 達成度スコアを計算
    const result = calculateNutritionAchievementScore(
      nutritionTargets,
      nutritionActuals
    );

    // Assert: 結果の型と構造を検証
    expect(result).toBeDefined();
    expect(typeof result.overallScore).toBe('number');
    expect(typeof result.itemScores).toBe('object');
    expect(Array.isArray(result.excludedItems)).toBe(true);

    // Assert: 目標値がゼロの項目が除外されていることを検証
    expect(result.excludedItems).toContain('sodium_mg');
    expect(result.excludedItems.length).toBe(1);

    // Assert: 除外された項目のスコアが計算されていないことを検証
    expect(result.itemScores.sodium_mg).toBeUndefined();

    // Assert: ゼロ以外の目標値を持つ項目のスコアが計算されていることを検証
    expect(typeof result.itemScores.protein_g).toBe('number');
    expect(typeof result.itemScores.carbohydrate_g).toBe('number');
    expect(typeof result.itemScores.fat_g).toBe('number');
    expect(typeof result.itemScores.calcium_mg).toBe('number');
    expect(typeof result.itemScores.iron_mg).toBe('number');

    // Assert: 各スコアが 0～100 の範囲内であることを検証
    expect(result.itemScores.protein_g).toBeGreaterThanOrEqual(0);
    expect(result.itemScores.protein_g).toBeLessThanOrEqual(100);
    expect(result.itemScores.carbohydrate_g).toBeGreaterThanOrEqual(0);
    expect(result.itemScores.carbohydrate_g).toBeLessThanOrEqual(100);
    expect(result.itemScores.fat_g).toBeGreaterThanOrEqual(0);
    expect(result.itemScores.fat_g).toBeLessThanOrEqual(100);
    expect(result.itemScores.calcium_mg).toBeGreaterThanOrEqual(0);
    expect(result.itemScores.calcium_mg).toBeLessThanOrEqual(100);
    expect(result.itemScores.iron_mg).toBeGreaterThanOrEqual(0);
    expect(result.itemScores.iron_mg).toBeLessThanOrEqual(100);

    // Assert: 全体スコアが 0～100 の範囲内であることを検証
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);

    // Assert: 全体スコアが NaN でないことを検証
    expect(Number.isNaN(result.overallScore)).toBe(false);

    // Assert: エラーフラグが存在せず false であることを検証
    expect(result.hasError).toBe(false);
    expect(result.errorMessage).toBeNull();

    // Assert: 計算対象の項目数が正しいこと（6項目 - 1除外 = 5項目）を検証
    expect(Object.keys(result.itemScores).length).toBe(5);

    // Assert: 具体的なスコア値を検証
    // protein: 55/60 = 91.67%
    expect(result.itemScores.protein_g).toBeCloseTo(91.67, 1);
    // carbohydrate: 280/300 = 93.33%
    expect(result.itemScores.carbohydrate_g).toBeCloseTo(93.33, 1);
    // fat: 60/65 = 92.31%
    expect(result.itemScores.fat_g).toBeCloseTo(92.31, 1);
    // calcium: 600/800 = 75%
    expect(result.itemScores.calcium_mg).toBeCloseTo(75, 1);
    // iron: 7/8 = 87.5%
    expect(result.itemScores.iron_mg).toBeCloseTo(87.5, 1);

    // Assert: 全体スコアが 5 項目の平均値であることを検証
    // (91.67 + 93.33 + 92.31 + 75 + 87.5) / 5 = 87.96
    expect(result.overallScore).toBeCloseTo(87.96, 1);
  });
});