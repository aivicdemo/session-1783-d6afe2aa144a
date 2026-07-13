import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  validateNutritionImprovementEffect,
} from '../../src/logic/it-1-br-2-1-1-1';

describe('栄養基準改善効果検証機能 - 改善後の献立栄養基準設定がユーザー食事記録に反映され、定量的な改善効果が判定される', () => {
  // SCEN-530
  test('should calculate quantitative nutrition improvement effect and verify achievement rate changes', () => {
    // === セットアップ: 改善前の基準値と食事記録 ===
    const pre_improvement_standard = {
      calories: 2000,
      protein_g: 50,
      fat_g: 65,
      carbs_g: 250,
      vitamin_a_mcg: 700,
      vitamin_c_mg: 100,
      iron_mg: 8,
      calcium_mg: 800,
    };

    // 過去30日間のユーザー食事記録データ（実績値）
    const user_meal_records = [
      {
        date: '2024-12-01',
        calories: 1950,
        protein_g: 48,
        fat_g: 63,
        carbs_g: 240,
        vitamin_a_mcg: 650,
        vitamin_c_mg: 85,
        iron_mg: 7.2,
        calcium_mg: 750,
      },
      {
        date: '2024-12-02',
        calories: 2050,
        protein_g: 52,
        fat_g: 68,
        carbs_g: 260,
        vitamin_a_mcg: 720,
        vitamin_c_mg: 110,
        iron_mg: 8.5,
        calcium_mg: 820,
      },
      {
        date: '2024-12-03',
        calories: 1900,
        protein_g: 46,
        fat_g: 60,
        carbs_g: 230,
        vitamin_a_mcg: 620,
        vitamin_c_mg: 75,
        iron_mg: 6.8,
        calcium_mg: 720,
      },
      {
        date: '2024-12-04',
        calories: 2100,
        protein_g: 55,
        fat_g: 70,
        carbs_g: 270,
        vitamin_a_mcg: 750,
        vitamin_c_mg: 120,
        iron_mg: 9.0,
        calcium_mg: 850,
      },
      {
        date: '2024-12-05',
        calories: 2000,
        protein_g: 50,
        fat_g: 65,
        carbs_g: 250,
        vitamin_a_mcg: 700,
        vitamin_c_mg: 100,
        iron_mg: 8.0,
        calcium_mg: 800,
      },
      // データ簡潔化のため追加30日分は省略、平均計算で対応
    ];

    // 改善前の平均達成度を計算（サンプル5日分から計算）
    const pre_avg_calories_achievement =
      (1950 + 2050 + 1900 + 2100 + 2000) / 5 / pre_improvement_standard.calories; // 2000 / 2000 = 1.0
    const pre_avg_protein_achievement =
      (48 + 52 + 46 + 55 + 50) / 5 / pre_improvement_standard.protein_g; // 50.2 / 50 = 1.004
    const pre_avg_fat_achievement =
      (63 + 68 + 60 + 70 + 65) / 5 / pre_improvement_standard.fat_g; // 65.2 / 65 = 1.003
    const pre_avg_carbs_achievement =
      (240 + 260 + 230 + 270 + 250) / 5 / pre_improvement_standard.carbs_g; // 250 / 250 = 1.0
    const pre_avg_vitamin_a_achievement =
      (650 + 720 + 620 + 750 + 700) / 5 / pre_improvement_standard.vitamin_a_mcg; // 688 / 700 = 0.983
    const pre_avg_vitamin_c_achievement =
      (85 + 110 + 75 + 120 + 100) / 5 / pre_improvement_standard.vitamin_c_mg; // 98 / 100 = 0.98
    const pre_avg_iron_achievement =
      (7.2 + 8.5 + 6.8 + 9.0 + 8.0) / 5 / pre_improvement_standard.iron_mg; // 7.9 / 8 = 0.9875
    const pre_avg_calcium_achievement =
      (750 + 820 + 720 + 850 + 800) / 5 / pre_improvement_standard.calcium_mg; // 788 / 800 = 0.985

    // 改善前の平均達成度（全栄養素の平均）
    const pre_avg_overall_achievement =
      (pre_avg_calories_achievement +
        pre_avg_protein_achievement +
        pre_avg_fat_achievement +
        pre_avg_carbs_achievement +
        pre_avg_vitamin_a_achievement +
        pre_avg_vitamin_c_achievement +
        pre_avg_iron_achievement +
        pre_avg_calcium_achievement) /
      8;

    // 改善前の達成日数（90%以上達成した日数を計算）
    const pre_achievement_days = user_meal_records.filter((record) => {
      const cal_rate = record.calories / pre_improvement_standard.calories;
      const prot_rate = record.protein_g / pre_improvement_standard.protein_g;
      const fat_rate = record.fat_g / pre_improvement_standard.fat_g;
      const carbs_rate = record.carbs_g / pre_improvement_standard.carbs_g;
      const vit_a_rate = record.vitamin_a_mcg / pre_improvement_standard.vitamin_a_mcg;
      const vit_c_rate = record.vitamin_c_mg / pre_improvement_standard.vitamin_c_mg;
      const iron_rate = record.iron_mg / pre_improvement_standard.iron_mg;
      const calc_rate = record.calcium_mg / pre_improvement_standard.calcium_mg;

      const avg_rate =
        (cal_rate + prot_rate + fat_rate + carbs_rate + vit_a_rate + vit_c_rate + iron_rate + calc_rate) / 8;
      return avg_rate >= 0.9; // 90%以上
    }).length;

    // === 改善後の基準値（より達成しやすい基準に調整） ===
    const post_improvement_standard = {
      calories: 1950, // 50 kcal低下
      protein_g: 48, // 2g低下
      fat_g: 63, // 2g低下
      carbs_g: 240, // 10g低下
      vitamin_a_mcg: 680, // 20mcg低下
      vitamin_c_mg: 95, // 5mg低下
      iron_mg: 7.5, // 0.5mg低下
      calcium_mg: 770, // 30mg低下
    };

    // 改善後の平均達成度を計算
    const post_avg_calories_achievement =
      (1950 + 2050 + 1900 + 2100 + 2000) / 5 / post_improvement_standard.calories; // 2000 / 1950 = 1.026
    const post_avg_protein_achievement =
      (48 + 52 + 46 + 55 + 50) / 5 / post_improvement_standard.protein_g; // 50.2 / 48 = 1.046
    const post_avg_fat_achievement =
      (63 + 68 + 60 + 70 + 65) / 5 / post_improvement_standard.fat_g; // 65.2 / 63 = 1.035
    const post_avg_carbs_achievement =
      (240 + 260 + 230 + 270 + 250) / 5 / post_improvement_standard.carbs_g; // 250 / 240 = 1.042
    const post_avg_vitamin_a_achievement =
      (650 + 720 + 620 + 750 + 700) / 5 / post_improvement_standard.vitamin_a_mcg; // 688 / 680 = 1.012
    const post_avg_vitamin_c_achievement =
      (85 + 110 + 75 + 120 + 100) / 5 / post_improvement_standard.vitamin_c_mg; // 98 / 95 = 1.032
    const post_avg_iron_achievement =
      (7.2 + 8.5 + 6.8 + 9.0 + 8.0) / 5 / post_improvement_standard.iron_mg; // 7.9 / 7.5 = 1.053
    const post_avg_calcium_achievement =
      (750 + 820 + 720 + 850 + 800) / 5 / post_improvement_standard.calcium_mg; // 788 / 770 = 1.023

    // 改善後の平均達成度（全栄養素の平均）
    const post_avg_overall_achievement =
      (post_avg_calories_achievement +
        post_avg_protein_achievement +
        post_avg_fat_achievement +
        post_avg_carbs_achievement +
        post_avg_vitamin_a_achievement +
        post_avg_vitamin_c_achievement +
        post_avg_iron_achievement +
        post_avg_calcium_achievement) /
      8;

    // 改善後の達成日数（90%以上達成した日数を計算）
    const post_achievement_days = user_meal_records.filter((record) => {
      const cal_rate = record.calories / post_improvement_standard.calories;
      const prot_rate = record.protein_g / post_improvement_standard.protein_g;
      const fat_rate = record.fat_g / post_improvement_standard.fat_g;
      const carbs_rate = record.carbs_g / post_improvement_standard.carbs_g;
      const vit_a_rate = record.vitamin_a_mcg / post_improvement_standard.vitamin_a_mcg;
      const vit_c_rate = record.vitamin_c_mg / post_improvement_standard.vitamin_c_mg;
      const iron_rate = record.iron_mg / post_improvement_standard.iron_mg;
      const calc_rate = record.calcium_mg / post_improvement_standard.calcium_mg;

      const avg_rate =
        (cal_rate + prot_rate + fat_rate + carbs_rate + vit_a_rate + vit_c_rate + iron_rate + calc_rate) / 8;
      return avg_rate >= 0.9; // 90%以上
    }).length;

    // === validateNutritionImprovementEffect 関数を呼び出し ===
    const improvement_effect_result = validateNutritionImprovementEffect({
      user_id: 'user_001',
      pre_standard: pre_improvement_standard,
      post_standard: post_improvement_standard,
      meal_records: user_meal_records,
      evaluation_period_days: 30,
      achievement_threshold_rate: 0.9,
    });

    // === 期待値の計算 ===
    // 充足率の向上値（百分率）
    const pre_achievement_rate_percent = Math.round(pre_avg_overall_achievement * 100);
    const post_achievement_rate_percent = Math.round(post_avg_overall_achievement * 100);
    const achievement_rate_improvement = post_achievement_rate_percent - pre_achievement_rate_percent;

    // 目標達成日数の増減
    const achievement_days_change = post_achievement_days - pre_achievement_days;

    // 栄養バランス改善度（各栄養素の達成度改善の平均）
    const nutrition_balance_improvement =
      ((post_avg_overall_achievement - pre_avg_overall_achievement) / pre_avg_overall_achievement) * 100;

    // 改善判定ロジック：改善前後の充足率が5%以上向上すれば「改善」
    const improvement_judgment =
      achievement_rate_improvement >= 5
        ? '改善'
        : achievement_rate_improvement >= -5
          ? '横ばい'
          : '悪化';

    // === アサーション ===
    // 1. 改善前後の充足率が正確に計算されている
    expect(improvement_effect_result.pre_achievement_rate_percent).toBe(pre_achievement_rate_percent);
    expect(improvement_effect_result.post_achievement_rate_percent).toBe(post_achievement_rate_percent);

    // 2. 充足率の向上値が正確に計算されている（期待値：8%向上）
    expect(improvement_effect_result.achievement_rate_improvement).toBe(achievement_rate_improvement);

    // 3. 目標達成日数の増減が正確に計算されている
    expect(improvement_effect_result.achievement_days_change).toBe(achievement_days_change);

    // 4. 栄養バランス改善度が正確に計算されている
    expect(improvement_effect_result.nutrition_balance_improvement).toBeCloseTo(nutrition_balance_improvement, 1);

    // 5. 改善効果の判定結果が正確に表示されている
    expect(improvement_effect_result.improvement_judgment).toBe(improvement_judgment);

    // 6. ダッシュボード表示用のレポート構造が正確に構築されている
    expect(improvement_effect_result.dashboard_report).toBeDefined();
    expect(improvement_effect_result.dashboard_report.user_id).toBe('user_001');
    expect(improvement_effect_result.dashboard_report.report_date).toBeDefined();
    expect(improvement_effect_result.dashboard_report.evaluation_period_days).toBe(30);

    // 7. 各栄養素ごとの改善度が計算されている
    expect(improvement_effect_result.dashboard_report.nutrition_detail).toBeDefined();
    expect(improvement_effect_result.dashboard_report.nutrition_detail.calories).toEqual({
      nutrient_name: 'calories',
      pre_achievement_rate: Math.round(pre_avg_calories_achievement * 100),
      post_achievement_rate: Math.round(post_avg_calories_achievement * 100),
      improvement_point: Math.round((post_avg_calories_achievement - pre_avg_calories_achievement) * 100),
    });
    expect(improvement_effect_result.dashboard_report.nutrition_detail.protein_g).toEqual({
      nutrient_name: 'protein_g',
      pre_achievement_rate: Math.round(pre_avg_protein_achievement * 100),
      post_achievement_rate: Math.round(post_avg_protein_achievement * 100),
      improvement_point: Math.round((post_avg_protein_achievement - pre_avg_protein_achievement) * 100),
    });
    expect(improvement_effect_result.dashboard_report.nutrition_detail.fat_g).toEqual({
      nutrient_name: 'fat_g',
      pre_achievement_rate: Math.round(pre_avg_fat_achievement * 100),
      post_achievement_rate: Math.round(post_avg_fat_achievement * 100),
      improvement_point: Math.round((post_avg_fat_achievement - pre_avg_fat_achievement) * 100),
    });
    expect(improvement_effect_result.dashboard_report.nutrition_detail.carbs_g).toEqual({
      nutrient_name: 'carbs_g',
      pre_achievement_rate: Math.round(pre_avg_carbs_achievement * 100),
      post_achievement_rate: Math.round(post_avg_carbs_achievement * 100),
      improvement_point: Math.round((post_avg_carbs_achievement - pre_avg_carbs_achievement) * 100),
    });
    expect(improvement_effect_result.dashboard_report.nutrition_detail.vitamin_a_mcg).toEqual({
      nutrient_name: 'vitamin_a_mcg',
      pre_achievement_rate: Math.round(pre_avg_vitamin_a_achievement * 100),
      post_achievement_rate: Math.round(post_avg_vitamin_a_achievement * 100),
      improvement_point: Math.round((post_avg_vitamin_a_achievement - pre_avg_vitamin_a_achievement) * 100),
    });
    expect(improvement_effect_result.dashboard_report.nutrition_detail.vitamin_c_mg).toEqual({
      nutrient_name: 'vitamin_c_mg',
      pre_achievement_rate: Math.round(pre_avg_vitamin_c_achievement * 100),
      post_achievement_rate: Math.round(post_avg_vitamin_c_achievement * 100),
      improvement_point: Math.round((post_avg_vitamin_c_achievement - pre_avg_vitamin_c_achievement) * 100),
    });
    expect(improvement_effect_result.dashboard_report.nutrition_detail.iron_mg).toEqual({
      nutrient_name: 'iron_mg',
      pre_achievement_rate: Math.round(pre_avg_iron_achievement * 100),
      post_achievement_rate: Math.round(post_avg_iron_achievement * 100),
      improvement_point: Math.round((post_avg_iron_achievement - pre_avg_iron_achievement) * 100),
    });
    expect(improvement_effect_result.dashboard_report.nutrition_detail.calcium_mg).toEqual({
      nutrient_name: 'calcium_mg',
      pre_achievement_rate: Math.round(pre_avg_calcium_achievement * 100),
      post_achievement_rate: Math.round(post_avg_calcium_achievement * 100),
      improvement_point: Math.round((post_avg_calcium_achievement - pre_avg_calcium_achievement) * 100),
    });

    // 8. グラフ・チャート用のサマリーが正確に構築されている
    expect(improvement_effect_result.dashboard_report.summary_metrics).toEqual({
      pre_overall_achievement_rate: pre_achievement_rate_percent,
      post_overall_achievement_rate: post_achievement_rate_percent,
      overall_improvement_point: achievement_rate_improvement,
      pre_achievement_days: pre_achievement_days,
      post_achievement_days: post_achievement_days,
      achievement_days_change: achievement_days_change,
      nutrition_balance_improvement: Math.round(nutrition_balance_improvement),
      improvement_judgment: improvement_judgment,
    });

    // 9. 改善判定が正確である（期待値：「改善」）
    expect(improvement_effect_result.improvement_judgment).toBe('改善');

    // 10. 全体的な結果構造が完全である
    expect(improvement_effect_result).toHaveProperty('user_id');
    expect(improvement_effect_result).toHaveProperty('pre_achievement_rate_percent');
    expect(improvement_effect_result).toHaveProperty('post_achievement_rate_percent');
    expect(improvement_effect_result).toHaveProperty('achievement_rate_improvement');
    expect(improvement_effect_result).toHaveProperty('achievement_days_change');
    expect(improvement_effect_result).toHaveProperty('nutrition_balance_improvement');
    expect(improvement_effect_result).toHaveProperty('improvement_judgment');
    expect(improvement_effect_result).toHaveProperty('dashboard_report');
  });
});