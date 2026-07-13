import { calculateNutritionAchievementRate } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証', () => {
  // SCEN-481
  test('推奨値がゼロの場合に達成率計算エラーを適切に処理する', () => {
    // ハッピーパス: 推奨値がゼロの場合、ゼロ除算を回避し適切なエラーレスポンスを返す
    const input_zero_recommended = {
      nutritionName: 'ビタミンD',
      recommendedValue: 0,
      actualValue: 2.5,
      unit: 'μg',
    };

    const result_zero_recommended = calculateNutritionAchievementRate(input_zero_recommended);

    // 推奨値がゼロの場合、達成率計算ができないため、エラーコードとメッセージを返す
    expect(result_zero_recommended).toEqual({
      achievementRate: null,
      status: 'error',
      message: '推奨値がゼロのため達成率を計算できません',
    });

    // ハッピーパス: 正常値での達成率計算（推奨値 > 0）
    const input_normal = {
      nutritionName: 'タンパク質',
      recommendedValue: 50,
      actualValue: 45,
      unit: 'g',
    };

    const result_normal = calculateNutritionAchievementRate(input_normal);

    // 達成率 = (実績値 / 推奨値) * 100 = (45 / 50) * 100 = 90
    expect(result_normal).toEqual({
      achievementRate: 90,
      status: 'success',
      message: null,
    });

    // ハッピーパス: 推奨値を超過した場合の達成率（100%以上）
    const input_exceed = {
      nutritionName: 'カルシウム',
      recommendedValue: 600,
      actualValue: 750,
      unit: 'mg',
    };

    const result_exceed = calculateNutritionAchievementRate(input_exceed);

    // 達成率 = (750 / 600) * 100 = 125
    expect(result_exceed).toEqual({
      achievementRate: 125,
      status: 'success',
      message: null,
    });

    // エラーケース: 実績値が負数（業務的に不正）
    const input_negative_actual = {
      nutritionName: '鉄',
      recommendedValue: 8,
      actualValue: -1,
      unit: 'mg',
    };

    expect(() => {
      calculateNutritionAchievementRate(input_negative_actual);
    }).toThrow(/実績値/);

    // エラーケース: 推奨値が負数（業務的に不正）
    const input_negative_recommended = {
      nutritionName: 'ビタミンC',
      recommendedValue: -10,
      actualValue: 50,
      unit: 'mg',
    };

    expect(() => {
      calculateNutritionAchievementRate(input_negative_recommended);
    }).toThrow(/推奨値/);

    // ハッピーパス: 実績値がゼロの場合（摂取なし）
    const input_zero_actual = {
      nutritionName: 'ビタミンA',
      recommendedValue: 700,
      actualValue: 0,
      unit: 'μgRAE',
    };

    const result_zero_actual = calculateNutritionAchievementRate(input_zero_actual);

    // 達成率 = (0 / 700) * 100 = 0
    expect(result_zero_actual).toEqual({
      achievementRate: 0,
      status: 'success',
      message: null,
    });

    // ハッピーパス: 小数値での達成率計算
    const input_decimal = {
      nutritionName: '葉酸',
      recommendedValue: 240,
      actualValue: 180.5,
      unit: 'μg',
    };

    const result_decimal = calculateNutritionAchievementRate(input_decimal);

    // 達成率 = (180.5 / 240) * 100 = 75.20833...を小数第2位で丸める = 75.21
    expect(result_decimal).toEqual({
      achievementRate: 75.21,
      status: 'success',
      message: null,
    });
  });
});