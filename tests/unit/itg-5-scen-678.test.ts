import { calculateNutritionAchievementRate } from '../../src/logic/it-7-2-1';

describe('栄養摂取達成度計算', () => {
  test('SCEN-678: 推奨値に対する実績値の達成率を百分率で正確に計算する', () => {
    // 推奨栄養摂取量を定義
    const recommended_nutrients = {
      protein_g: 50,
      calcium_mg: 800,
      vitamin_c_mg: 100,
    };

    // 実績栄養摂取量を入力
    const actual_nutrients = {
      protein_g: 45,
      calcium_mg: 640,
      vitamin_c_mg: 95,
    };

    // 各栄養素の達成率を計算（実績値÷推奨値×100）
    const result = calculateNutritionAchievementRate(
      recommended_nutrients,
      actual_nutrients
    );

    // 各栄養素の達成率が正確に百分率で返されることを確認
    expect(result.protein_achievement_rate).toBe(90.0);
    expect(result.calcium_achievement_rate).toBe(80.0);
    expect(result.vitamin_c_achievement_rate).toBe(95.0);

    // 全栄養素の平均達成率を計算
    // (90 + 80 + 95) / 3 = 265 / 3 = 88.33...
    expect(result.average_achievement_rate).toBe(88.33);

    // 達成率が0～100%の範囲内か検証
    expect(result.protein_achievement_rate).toBeGreaterThanOrEqual(0);
    expect(result.protein_achievement_rate).toBeLessThanOrEqual(100);
    expect(result.calcium_achievement_rate).toBeGreaterThanOrEqual(0);
    expect(result.calcium_achievement_rate).toBeLessThanOrEqual(100);
    expect(result.vitamin_c_achievement_rate).toBeGreaterThanOrEqual(0);
    expect(result.vitamin_c_achievement_rate).toBeLessThanOrEqual(100);

    // ダッシュボード表示形式での検証（各達成率と平均達成率が含まれること）
    expect(result).toHaveProperty('protein_achievement_rate');
    expect(result).toHaveProperty('calcium_achievement_rate');
    expect(result).toHaveProperty('vitamin_c_achievement_rate');
    expect(result).toHaveProperty('average_achievement_rate');

    // 小数点以下第2位までの丸め処理が正確に行われることを確認
    expect(result.average_achievement_rate).toBeCloseTo(88.33, 2);
  });

  test('SCEN-678-ext: 達成率が100%を超える場合の処理を検証する', () => {
    const recommended_nutrients = {
      protein_g: 50,
      calcium_mg: 800,
      vitamin_c_mg: 100,
    };

    // 実績値が推奨値を上回るケース
    const actual_nutrients = {
      protein_g: 60,
      calcium_mg: 900,
      vitamin_c_mg: 110,
    };

    const result = calculateNutritionAchievementRate(
      recommended_nutrients,
      actual_nutrients
    );

    // 100%を超える達成率も正確に計算されることを確認
    expect(result.protein_achievement_rate).toBe(120.0);
    expect(result.calcium_achievement_rate).toBe(112.5);
    expect(result.vitamin_c_achievement_rate).toBe(110.0);

    // 平均達成率: (120 + 112.5 + 110) / 3 = 342.5 / 3 = 114.17
    expect(result.average_achievement_rate).toBe(114.17);
  });

  test('SCEN-678-ext: 達成率が0%のケースを検証する', () => {
    const recommended_nutrients = {
      protein_g: 50,
      calcium_mg: 800,
      vitamin_c_mg: 100,
    };

    // 実績値がゼロのケース
    const actual_nutrients = {
      protein_g: 0,
      calcium_mg: 0,
      vitamin_c_mg: 0,
    };

    const result = calculateNutritionAchievementRate(
      recommended_nutrients,
      actual_nutrients
    );

    expect(result.protein_achievement_rate).toBe(0.0);
    expect(result.calcium_achievement_rate).toBe(0.0);
    expect(result.vitamin_c_achievement_rate).toBe(0.0);
    expect(result.average_achievement_rate).toBe(0.0);
  });

  test('SCEN-678-ext: 複数栄養素の小数点以下丸め処理を検証する', () => {
    const recommended_nutrients = {
      protein_g: 50,
      calcium_mg: 800,
      vitamin_c_mg: 100,
    };

    // 計算結果が小数になるケース
    const actual_nutrients = {
      protein_g: 33,
      calcium_mg: 533,
      vitamin_c_mg: 67,
    };

    const result = calculateNutritionAchievementRate(
      recommended_nutrients,
      actual_nutrients
    );

    // 33/50 = 0.66 * 100 = 66.00
    expect(result.protein_achievement_rate).toBe(66.0);
    // 533/800 = 0.66625 * 100 = 66.625 → 小数第2位で丸め = 66.63
    expect(result.calcium_achievement_rate).toBe(66.63);
    // 67/100 = 0.67 * 100 = 67.00
    expect(result.vitamin_c_achievement_rate).toBe(67.0);
    // (66 + 66.63 + 67) / 3 = 199.63 / 3 = 66.543... → 66.54
    expect(result.average_achievement_rate).toBe(66.54);
  });
});