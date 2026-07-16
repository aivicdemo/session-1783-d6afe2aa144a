import { validateNutritionImprovementEffect } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログから食材制限・調理時間制限・予算制約の優先度マトリクス生成', () => {
  // SCEN-225: [edge] 栄養基準設定の改善効果検証 - 栄養素目標値の±5%境界値付近でユーザー実績が改善効果判定基準を満たすか満たさないか判定される
  test('栄養素目標値±5%境界値付近でのユーザー実績改善効果判定を正確に判定する', () => {
    const targetNutritionValue = 100;
    const improvementThresholdPercentage = 5;
    const lowerBoundary = targetNutritionValue * (1 - improvementThresholdPercentage / 100);
    const upperBoundary = targetNutritionValue * (1 + improvementThresholdPercentage / 100);

    // 期待値：下限境界値 = 95.0, 上限境界値 = 105.0
    expect(lowerBoundary).toBe(95.0);
    expect(upperBoundary).toBe(105.0);

    // ケース1: ユーザー実績が94.9（目標値-5.1%）→ 改善効果判定基準を満たさない
    const result1 = validateNutritionImprovementEffect({
      targetValue: targetNutritionValue,
      actualValue: 94.9,
      thresholdPercentage: improvementThresholdPercentage,
    });
    expect(result1.isImproved).toBe(false);
    expect(result1.variancePercentage).toBeCloseTo(-5.1, 1);

    // ケース2: ユーザー実績が95.0（目標値-5.0%）→ 改善効果判定基準を満たす
    const result2 = validateNutritionImprovementEffect({
      targetValue: targetNutritionValue,
      actualValue: 95.0,
      thresholdPercentage: improvementThresholdPercentage,
    });
    expect(result2.isImproved).toBe(true);
    expect(result2.variancePercentage).toBeCloseTo(-5.0, 1);

    // ケース3: ユーザー実績が95.1（目標値-4.9%）→ 改善効果判定基準を満たす
    const result3 = validateNutritionImprovementEffect({
      targetValue: targetNutritionValue,
      actualValue: 95.1,
      thresholdPercentage: improvementThresholdPercentage,
    });
    expect(result3.isImproved).toBe(true);
    expect(result3.variancePercentage).toBeCloseTo(-4.9, 1);

    // ケース4: ユーザー実績が104.9（目標値+4.9%）→ 改善効果判定基準を満たす
    const result4 = validateNutritionImprovementEffect({
      targetValue: targetNutritionValue,
      actualValue: 104.9,
      thresholdPercentage: improvementThresholdPercentage,
    });
    expect(result4.isImproved).toBe(true);
    expect(result4.variancePercentage).toBeCloseTo(4.9, 1);

    // ケース5: ユーザー実績が105.0（目標値+5.0%）→ 改善効果判定基準を満たす
    const result5 = validateNutritionImprovementEffect({
      targetValue: targetNutritionValue,
      actualValue: 105.0,
      thresholdPercentage: improvementThresholdPercentage,
    });
    expect(result5.isImproved).toBe(true);
    expect(result5.variancePercentage).toBeCloseTo(5.0, 1);

    // ケース6: ユーザー実績が105.1（目標値+5.1%）→ 改善効果判定基準を満たさない
    const result6 = validateNutritionImprovementEffect({
      targetValue: targetNutritionValue,
      actualValue: 105.1,
      thresholdPercentage: improvementThresholdPercentage,
    });
    expect(result6.isImproved).toBe(false);
    expect(result6.variancePercentage).toBeCloseTo(5.1, 1);

    // 統合検証：境界値の内側と外側の判定結果が期待通り
    const allResults = [result1, result2, result3, result4, result5, result6];
    const improvedCount = allResults.filter((r) => r.isImproved).length;
    const notImprovedCount = allResults.filter((r) => !r.isImproved).length;

    expect(improvedCount).toBe(4);
    expect(notImprovedCount).toBe(2);
    expect(allResults[0].isImproved).toBe(false);
    expect(allResults[1].isImproved).toBe(true);
    expect(allResults[5].isImproved).toBe(false);
  });
});