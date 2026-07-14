import { validateNutritionImprovementEffect } from '../../src/logic/it-7-2-1';

describe('栄養基準改善効果検証機能 - 栄養摂取データ無期間の検証', () => {
  // SCEN-732
  test('栄養摂取データが存在しない期間の改善効果検証は評価不可と判定される', () => {
    const startDate = new Date('2024-01-01T00:00:00Z');
    const endDate = new Date('2024-01-31T23:59:59Z');
    const nutritionRecords = [];
    const userId = 'user-001';
    const algorithmVersionBefore = 'v1.0';
    const algorithmVersionAfter = 'v1.1';

    const result = validateNutritionImprovementEffect({
      userId,
      startDate,
      endDate,
      nutritionRecords,
      algorithmVersionBefore,
      algorithmVersionAfter,
    });

    expect(result.evaluationStatus).toBe('UNEVALUABLE');
    expect(result.message).toBe('指定された期間に栄養摂取データが存在しません');
    expect(result.improvementEffectScore).toBeUndefined();
    expect(result.isEvaluable).toBe(false);
  });
});