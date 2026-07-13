import { calculateNutritionAchievementDifference } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能', () => {
  test('SCEN-535: [edge] 栄養項目別達成度比較機能 - 改善前後の栄養摂取データが同一の場合、効果差が0と判定される', () => {
    // 改善前の栄養摂取データ
    const preImprovementData = {
      protein_g: 50,
      fat_g: 30,
      carbohydrate_g: 200,
    };

    // 改善後の栄養摂取データ（改善前と同一）
    const postImprovementData = {
      protein_g: 50,
      fat_g: 30,
      carbohydrate_g: 200,
    };

    // 比較分析を実行
    const result = calculateNutritionAchievementDifference(
      preImprovementData,
      postImprovementData
    );

    // タンパク質の効果差が0
    expect(result.protein_difference).toBe(0);

    // 脂質の効果差が0
    expect(result.fat_difference).toBe(0);

    // 炭水化物の効果差が0
    expect(result.carbohydrate_difference).toBe(0);

    // 総合効果差が0
    expect(result.total_difference).toBe(0);

    // 改善効果なしと判定される
    expect(result.improvement_status).toBe('no_improvement');

    // グラフ・サマリーに変化がないことが反映される
    expect(result.has_significant_change).toBe(false);
  });
});