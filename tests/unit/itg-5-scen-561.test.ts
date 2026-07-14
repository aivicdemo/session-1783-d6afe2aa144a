import { calculateNutritionAchievementDashboard } from '../../src/logic/it-7-2-1';

describe('栄養達成度可視化機能 - 栄養項目ごとの達成度と優先度付け', () => {
  // SCEN-561
  test('複数栄養項目の目標値と実績値から達成度を百分率で計算し、ギャップが大きい項目を優先度付けして可視化する', () => {
    // ===== Arrange =====
    // 栄養項目ごとの目標値と実績値のデータセット
    const nutritionData = {
      items: [
        {
          nutrient_id: 'protein',
          nutrient_name: 'タンパク質',
          target_value: 60, // 目標値(g)
          actual_value: 45, // 実績値(g)
          unit: 'g',
        },
        {
          nutrient_id: 'fat',
          nutrient_name: '脂質',
          target_value: 65,
          actual_value: 72,
          unit: 'g',
        },
        {
          nutrient_id: 'carbs',
          nutrient_name: '炭水化物',
          target_value: 300,
          actual_value: 285,
          unit: 'g',
        },
        {
          nutrient_id: 'vitaminA',
          nutrient_name: 'ビタミンA',
          target_value: 700, // 目標値(mcg)
          actual_value: 620, // 実績値(mcg)
          unit: 'mcg',
        },
        {
          nutrient_id: 'calcium',
          nutrient_name: 'カルシウム',
          target_value: 1000, // 目標値(mg)
          actual_value: 850, // 実績値(mg)
          unit: 'mg',
        },
      ],
    };

    // ===== Act =====
    const result = calculateNutritionAchievementDashboard(nutritionData);

    // ===== Assert =====
    // 1. すべての栄養項目について達成度が百分率で計算されていることを確認
    expect(result.achievements).toHaveLength(5);

    // 2. 各栄養項目の達成度を具体値で検証
    // タンパク質: 45/60 = 0.75 = 75%
    const proteinAchievement = result.achievements.find((item) => item.nutrient_id === 'protein');
    expect(proteinAchievement).toBeDefined();
    expect(proteinAchievement?.achievement_rate).toBe(75);

    // 脂質: 72/65 = 1.107... = 110.7% → 計算結果110.76923076923077（小数第2位まで丸め）
    const fatAchievement = result.achievements.find((item) => item.nutrient_id === 'fat');
    expect(fatAchievement).toBeDefined();
    expect(fatAchievement?.achievement_rate).toBeCloseTo(110.77, 1);

    // 炭水化物: 285/300 = 0.95 = 95%
    const carbsAchievement = result.achievements.find((item) => item.nutrient_id === 'carbs');
    expect(carbsAchievement).toBeDefined();
    expect(carbsAchievement?.achievement_rate).toBe(95);

    // ビタミンA: 620/700 = 0.886... = 88.6%
    const vitaminAAchievement = result.achievements.find((item) => item.nutrient_id === 'vitaminA');
    expect(vitaminAAchievement).toBeDefined();
    expect(vitaminAAchievement?.achievement_rate).toBeCloseTo(88.57, 1);

    // カルシウム: 850/1000 = 0.85 = 85%
    const calciumAchievement = result.achievements.find((item) => item.nutrient_id === 'calcium');
    expect(calciumAchievement).toBeDefined();
    expect(calciumAchievement?.achievement_rate).toBe(85);

    // 3. ギャップ（目標値と実績値の差分）が正しく計算されていることを確認
    expect(proteinAchievement?.gap).toBe(15); // 60 - 45 = 15
    expect(fatAchievement?.gap).toBe(-7); // 65 - 72 = -7（超過）
    expect(carbsAchievement?.gap).toBe(15); // 300 - 285 = 15
    expect(vitaminAAchievement?.gap).toBe(80); // 700 - 620 = 80
    expect(calciumAchievement?.gap).toBe(150); // 1000 - 850 = 150

    // 4. ギャップの絶対値が大きい項目から優先度順にソートされていることを確認
    // ソート順序: |gap| が大きい順 → カルシウム(150) > ビタミンA(80) > タンパク質(15) = 炭水化物(15) > 脂質(-7)
    const sorted_achievements = result.prioritized_items;
    expect(sorted_achievements).toHaveLength(5);

    // 優先度1: カルシウム（ギャップ 150）
    expect(sorted_achievements[0].nutrient_id).toBe('calcium');
    expect(sorted_achievements[0].gap_abs).toBe(150);
    expect(sorted_achievements[0].priority).toBe(1);

    // 優先度2: ビタミンA（ギャップ 80）
    expect(sorted_achievements[1].nutrient_id).toBe('vitaminA');
    expect(sorted_achievements[1].gap_abs).toBe(80);
    expect(sorted_achievements[1].priority).toBe(2);

    // 優先度3, 4: タンパク質と炭水化物（ギャップ 15）
    expect([sorted_achievements[2].nutrient_id, sorted_achievements[3].nutrient_id]).toContain(
      'protein'
    );
    expect([sorted_achievements[2].nutrient_id, sorted_achievements[3].nutrient_id]).toContain(
      'carbs'
    );
    expect(sorted_achievements[2].gap_abs).toBe(15);
    expect(sorted_achievements[3].gap_abs).toBe(15);
    expect([sorted_achievements[2].priority, sorted_achievements[3].priority]).toEqual([3, 4]);

    // 優先度5: 脂質（ギャップ -7、絶対値 7）
    expect(sorted_achievements[4].nutrient_id).toBe('fat');
    expect(sorted_achievements[4].gap_abs).toBe(7);
    expect(sorted_achievements[4].priority).toBe(5);

    // 5. 達成度が 0～100% 範囲内で表示可能な値であることを確認
    result.achievements.forEach((item) => {
      // 脂質のように110%を超える場合もあるため、非負数であることを確認
      expect(item.achievement_rate).toBeGreaterThanOrEqual(0);
    });

    // 6. 達成度がグラフやプログレスバー用に正確に計算されていることを確認（visualization_value）
    result.achievements.forEach((item) => {
      // visualization_value は 0～100 に正規化された値
      expect(item.visualization_value).toBeGreaterThanOrEqual(0);
      expect(item.visualization_value).toBeLessThanOrEqual(100);
    });

    // ビタミンAの visualization_value を検証: 88.57% → 88.57（正規化後）
    expect(vitaminAAchievement?.visualization_value).toBeCloseTo(88.57, 1);

    // 7. 目標値と実績値を変更後、再計算時に達成度と優先度が動的に更新されることを確認
    const updatedNutritionData = {
      items: [
        {
          nutrient_id: 'protein',
          nutrient_name: 'タンパク質',
          target_value: 60,
          actual_value: 60, // 実績値を目標値と同じに変更
          unit: 'g',
        },
        {
          nutrient_id: 'fat',
          nutrient_name: '脂質',
          target_value: 65,
          actual_value: 30, // 実績値を大幅に低下
          unit: 'g',
        },
        {
          nutrient_id: 'carbs',
          nutrient_name: '炭水化物',
          target_value: 300,
          actual_value: 285,
          unit: 'g',
        },
        {
          nutrient_id: 'vitaminA',
          nutrient_name: 'ビタミンA',
          target_value: 700,
          actual_value: 700, // 実績値を目標値と同じに変更
          unit: 'mcg',
        },
        {
          nutrient_id: 'calcium',
          nutrient_name: 'カルシウム',
          target_value: 1000,
          actual_value: 850,
          unit: 'mg',
        },
      ],
    };

    const updatedResult = calculateNutritionAchievementDashboard(updatedNutritionData);

    // タンパク質の達成度が 100% に更新されたことを確認
    const updatedProteinAchievement = updatedResult.achievements.find(
      (item) => item.nutrient_id === 'protein'
    );
    expect(updatedProteinAchievement?.achievement_rate).toBe(100);
    expect(updatedProteinAchievement?.gap).toBe(0);

    // 脂質のギャップが 35 に変更され、優先度が上昇したことを確認
    const updatedFatAchievement = updatedResult.achievements.find(
      (item) => item.nutrient_id === 'fat'
    );
    expect(updatedFatAchievement?.gap).toBe(35);
    expect(updatedFatAchievement?.gap_abs).toBe(35);

    // ビタミンAの達成度が 100% に更新されたことを確認
    const updatedVitaminAAchievement = updatedResult.achievements.find(
      (item) => item.nutrient_id === 'vitaminA'
    );
    expect(updatedVitaminAAchievement?.achievement_rate).toBe(100);
    expect(updatedVitaminAAchievement?.gap).toBe(0);

    // 更新後の優先度順序を確認: ギャップの絶対値が大きい順
    // カルシウム(150) > 脂質(35) > 炭水化物(15) > タンパク質(0) > ビタミンA(0)
    const updatedSorted = updatedResult.prioritized_items;
    expect(updatedSorted[0].nutrient_id).toBe('calcium');
    expect(updatedSorted[0].gap_abs).toBe(150);
    expect(updatedSorted[1].nutrient_id).toBe('fat');
    expect(updatedSorted[1].gap_abs).toBe(35);
    expect(updatedSorted[2].nutrient_id).toBe('carbs');
    expect(updatedSorted[2].gap_abs).toBe(15);

    // 8. レスポンスが期待される構造を持っていることを確認
    expect(result).toHaveProperty('achievements');
    expect(result).toHaveProperty('prioritized_items');
    expect(result).toHaveProperty('summary');

    // サマリー情報の確認
    expect(result.summary).toHaveProperty('total_items');
    expect(result.summary.total_items).toBe(5);
    expect(result.summary).toHaveProperty('average_achievement_rate');
    expect(result.summary).toHaveProperty('highest_priority_nutrient');
    expect(result.summary.highest_priority_nutrient.nutrient_id).toBe('calcium');
  });
});