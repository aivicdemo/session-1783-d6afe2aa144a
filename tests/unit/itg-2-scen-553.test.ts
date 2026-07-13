import { validateNutrientBalance } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能', () => {
  // SCEN-553
  test('栄養バランス検証機能 - 達成度が基準値99.9%のときは不合格判定となる', () => {
    const testMealData = {
      user_id: 'user_12345',
      meal_date: '2024-01-15',
      nutrients: [
        {
          nutrient_id: 'protein',
          nutrient_name: 'タンパク質',
          target_value: 60,
          actual_value: 59.94,
          achievement_rate: 99.9,
        },
        {
          nutrient_id: 'carbohydrate',
          nutrient_name: '炭水化物',
          target_value: 300,
          actual_value: 299.7,
          achievement_rate: 99.9,
        },
        {
          nutrient_id: 'fat',
          nutrient_name: '脂質',
          target_value: 65,
          actual_value: 64.935,
          achievement_rate: 99.9,
        },
        {
          nutrient_id: 'vitamin_a',
          nutrient_name: 'ビタミンA',
          target_value: 850,
          actual_value: 849.15,
          achievement_rate: 99.9,
        },
        {
          nutrient_id: 'vitamin_c',
          nutrient_name: 'ビタミンC',
          target_value: 100,
          actual_value: 99.9,
          achievement_rate: 99.9,
        },
      ],
    };

    const result = validateNutrientBalance(testMealData);

    expect(result.is_pass).toBe(false);
    expect(result.judgment).toBe('不合格');
    expect(result.message).toMatch(/達成度/);
    expect(result.all_nutrients_meet_threshold).toBe(false);
    expect(result.nutrients_below_threshold).toEqual([
      'protein',
      'carbohydrate',
      'fat',
      'vitamin_a',
      'vitamin_c',
    ]);
    expect(result.minimum_achievement_rate).toBe(99.9);
    expect(result.threshold).toBe(100);
    expect(result.validated_at).toBeDefined();
    expect(typeof result.validated_at).toBe('string');
  });
});