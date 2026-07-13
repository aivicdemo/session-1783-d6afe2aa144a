import { calculateNutritionAchievementScores } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-396
  test('栄養摂取状況分析機能 - 月次の献立実績と食事評価データから栄養項目別達成度スコアが正常に算出される', () => {
    const monthly_nutrition_records = [
      {
        date: '2024-01-01',
        food_items: [
          { name: '鶏胸肉', protein_g: 25, fat_g: 8, carbs_g: 0 },
          { name: 'ブロッコリー', protein_g: 3, fat_g: 0.5, carbs_g: 6, vitamin_c_mg: 120, calcium_mg: 60, iron_mg: 1.2 }
        ]
      },
      {
        date: '2024-01-02',
        food_items: [
          { name: '牛肉', protein_g: 22, fat_g: 15, carbs_g: 0 },
          { name: 'ニンジン', protein_g: 1, fat_g: 0.2, carbs_g: 8, vitamin_a_mcg: 835, calcium_mg: 33, iron_mg: 0.3 }
        ]
      },
      {
        date: '2024-01-03',
        food_items: [
          { name: '白米', protein_g: 2.7, fat_g: 0.3, carbs_g: 53 },
          { name: 'サバ', protein_g: 20, fat_g: 12, carbs_g: 0, vitamin_d_mcg: 16, calcium_mg: 10, iron_mg: 0.8 }
        ]
      },
      {
        date: '2024-01-04',
        food_items: [
          { name: '卵', protein_g: 6.3, fat_g: 5.3, carbs_g: 0.3, vitamin_b12_mcg: 1.83, calcium_mg: 53, iron_mg: 1.8 }
        ]
      },
      {
        date: '2024-01-05',
        food_items: [
          { name: 'オレンジ', protein_g: 0.9, fat_g: 0.3, carbs_g: 12, vitamin_c_mg: 50, calcium_mg: 40, iron_mg: 0.1 }
        ]
      },
      {
        date: '2024-01-06',
        food_items: [
          { name: '豆腐', protein_g: 8, fat_g: 4.8, carbs_g: 1.5, calcium_mg: 350, iron_mg: 1.8 }
        ]
      },
      {
        date: '2024-01-07',
        food_items: [
          { name: 'ほうれん草', protein_g: 2.7, fat_g: 0.4, carbs_g: 3.2, vitamin_a_mcg: 469, calcium_mg: 106, iron_mg: 3.2 }
        ]
      },
      {
        date: '2024-01-08',
        food_items: [
          { name: '鮭', protein_g: 25, fat_g: 13, carbs_g: 0, vitamin_d_mcg: 570, calcium_mg: 12, iron_mg: 0.8 }
        ]
      },
      {
        date: '2024-01-09',
        food_items: [
          { name: 'キウイ', protein_g: 1.1, fat_g: 0.5, carbs_g: 14, vitamin_c_mg: 92.7, calcium_mg: 28, iron_mg: 0.3 }
        ]
      },
      {
        date: '2024-01-10',
        food_items: [
          { name: 'アーモンド', protein_g: 21, fat_g: 50, carbs_g: 22, calcium_mg: 264, iron_mg: 3.7 }
        ]
      }
    ];

    const nutrition_targets = {
      protein_g: 50,
      fat_g: 65,
      carbs_g: 300,
      vitamin_a_mcg: 700,
      vitamin_b12_mcg: 2.4,
      vitamin_c_mg: 100,
      vitamin_d_mcg: 15,
      calcium_mg: 1000,
      iron_mg: 18
    };

    const result = calculateNutritionAchievementScores(
      monthly_nutrition_records,
      nutrition_targets
    );

    // タンパク質: 合計 = 25+3+22+1+2.7+20+6.3+0.9+8+2.7+25+1.1+21 = 139.7g
    // 達成度 = (139.7 / 50) * 100 = 279.4 → clamp to 100 = 100
    expect(result.protein_achievement_score).toBe(100);

    // 脂質: 合計 = 8+0.5+15+0.2+0.3+12+5.3+0.3+4.8+0.4+13+0.5+50 = 111.2g
    // 達成度 = (111.2 / 65) * 100 = 170.92 → clamp to 100 = 100
    expect(result.fat_achievement_score).toBe(100);

    // 炭水化物: 合計 = 0+6+0+8+53+0.3+1.5+3.2+0+14+22 = 108g
    // 達成度 = (108 / 300) * 100 = 36
    expect(result.carbs_achievement_score).toBe(36);

    // ビタミンA: 合計 = 835 + 469 = 1304 mcg
    // 達成度 = (1304 / 700) * 100 = 186.29 → clamp to 100 = 100
    expect(result.vitamin_a_achievement_score).toBe(100);

    // ビタミンB12: 合計 = 1.83 + 0 = 1.83 mcg
    // 達成度 = (1.83 / 2.4) * 100 = 76.25
    expect(result.vitamin_b12_achievement_score).toBe(76.25);

    // ビタミンC: 合計 = 120 + 50 + 92.7 = 262.7 mg
    // 達成度 = (262.7 / 100) * 100 = 262.7 → clamp to 100 = 100
    expect(result.vitamin_c_achievement_score).toBe(100);

    // ビタミンD: 合計 = 16 + 570 = 586 mcg
    // 達成度 = (586 / 15) * 100 = 3906.67 → clamp to 100 = 100
    expect(result.vitamin_d_achievement_score).toBe(100);

    // カルシウム: 合計 = 60 + 33 + 10 + 53 + 40 + 350 + 106 + 12 + 28 + 264 = 956 mg
    // 達成度 = (956 / 1000) * 100 = 95.6
    expect(result.calcium_achievement_score).toBe(95.6);

    // 鉄: 合計 = 1.2 + 0.3 + 0.8 + 1.8 + 0.1 + 1.8 + 3.2 + 0.8 + 0.3 + 3.7 = 13.8 mg
    // 達成度 = (13.8 / 18) * 100 = 76.67
    expect(result.iron_achievement_score).toBe(76.67);

    // 総合栄養達成度スコア = 
    // (100 + 100 + 36 + 100 + 76.25 + 100 + 100 + 95.6 + 76.67) / 9
    // = 784.52 / 9 = 87.17
    expect(result.overall_nutrition_achievement_score).toBe(87.17);

    // スコアがシステムに保存可能な形式で返されることを確認
    expect(result).toHaveProperty('protein_achievement_score');
    expect(result).toHaveProperty('fat_achievement_score');
    expect(result).toHaveProperty('carbs_achievement_score');
    expect(result).toHaveProperty('vitamin_a_achievement_score');
    expect(result).toHaveProperty('vitamin_b12_achievement_score');
    expect(result).toHaveProperty('vitamin_c_achievement_score');
    expect(result).toHaveProperty('vitamin_d_achievement_score');
    expect(result).toHaveProperty('calcium_achievement_score');
    expect(result).toHaveProperty('iron_achievement_score');
    expect(result).toHaveProperty('overall_nutrition_achievement_score');

    // すべてのスコアが0～100の数値であることを確認
    expect(result.protein_achievement_score).toBeGreaterThanOrEqual(0);
    expect(result.protein_achievement_score).toBeLessThanOrEqual(100);
    expect(result.fat_achievement_score).toBeGreaterThanOrEqual(0);
    expect(result.fat_achievement_score).toBeLessThanOrEqual(100);
    expect(result.carbs_achievement_score).toBeGreaterThanOrEqual(0);
    expect(result.carbs_achievement_score).toBeLessThanOrEqual(100);
    expect(result.vitamin_a_achievement_score).toBeGreaterThanOrEqual(0);
    expect(result.vitamin_a_achievement_score).toBeLessThanOrEqual(100);
    expect(result.vitamin_b12_achievement_score).toBeGreaterThanOrEqual(0);
    expect(result.vitamin_b12_achievement_score).toBeLessThanOrEqual(100);
    expect(result.vitamin_c_achievement_score).toBeGreaterThanOrEqual(0);
    expect(result.vitamin_c_achievement_score).toBeLessThanOrEqual(100);
    expect(result.vitamin_d_achievement_score).toBeGreaterThanOrEqual(0);
    expect(result.vitamin_d_achievement_score).toBeLessThanOrEqual(100);
    expect(result.calcium_achievement_score).toBeGreaterThanOrEqual(0);
    expect(result.calcium_achievement_score).toBeLessThanOrEqual(100);
    expect(result.iron_achievement_score).toBeGreaterThanOrEqual(0);
    expect(result.iron_achievement_score).toBeLessThanOrEqual(100);
    expect(result.overall_nutrition_achievement_score).toBeGreaterThanOrEqual(0);
    expect(result.overall_nutrition_achievement_score).toBeLessThanOrEqual(100);

    // レポート表示用のデータ構造が存在することを確認
    expect(result).toHaveProperty('report_format');
    expect(result.report_format).toEqual(
      expect.objectContaining({
        month: '2024-01',
        total_items: 13,
        achievement_breakdown: expect.any(Object)
      })
    );
  });
});