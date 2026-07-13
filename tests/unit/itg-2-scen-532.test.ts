import { calculateNutritionAchievementComparison } from '../../src/logic/it-1-br-2-1-1-1';

describe('栄養基準改善効果検証ダッシュボード', () => {
  // SCEN-532: [edge] 栄養基準改善効果検証機能 - 改善前後で栄養項目別達成度が100%を超える場合、数値が補正される
  test('改善後の栄養項目別達成度が100%を超える場合、数値が100%に補正される', () => {
    const before_achievement_rates = {
      protein: 95,
      calcium: 98,
    };

    const after_achievement_rates = {
      protein: 105,
      calcium: 110,
    };

    const result = calculateNutritionAchievementComparison({
      before_achievement_rates,
      after_achievement_rates,
    });

    // 改善後の達成度が100%を超える場合、100%に補正される
    expect(result.after_achievement_rates_corrected.protein).toBe(100);
    expect(result.after_achievement_rates_corrected.calcium).toBe(100);

    // 補正が発生したことを示すフラグが立つ
    expect(result.has_correction).toBe(true);

    // 補正対象の栄養項目を特定
    expect(result.corrected_items).toEqual(['protein', 'calcium']);

    // 改善前の達成度は補正されない
    expect(result.before_achievement_rates.protein).toBe(95);
    expect(result.before_achievement_rates.calcium).toBe(98);

    // 改善効果の計算（補正後の値を基に）
    // タンパク質：100% - 95% = 5% の改善
    // カルシウム：100% - 98% = 2% の改善
    expect(result.improvement_gap.protein).toBe(5);
    expect(result.improvement_gap.calcium).toBe(2);

    // 改善効果の警告またはインジケーター
    expect(result.warning_message).toContain('100%');
    expect(result.correction_applied_indicator).toBe(true);
  });
});