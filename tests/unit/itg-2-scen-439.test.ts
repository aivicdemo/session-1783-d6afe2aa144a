import { prioritizeNutritionDeficiencies } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量推移分析 - 栄養不足項目優先度付け', () => {
  // SCEN-439
  test('改善効果スコアが無効値の場合、エラーが発生する', () => {
    const deficiencyItem_nullScore = {
      nutrientId: 'vit_c_001',
      nutrientName: 'ビタミンC',
      targetValue: 100,
      actualValue: 45,
      achievementRate: 45,
      improvementEffectScore: null,
      riskLevel: 'high',
    };

    const deficiencyItem_undefinedScore = {
      nutrientId: 'calcium_001',
      nutrientName: 'カルシウム',
      targetValue: 800,
      actualValue: 320,
      achievementRate: 40,
      improvementEffectScore: undefined,
      riskLevel: 'high',
    };

    const deficiencyItem_negativeScore = {
      nutrientId: 'iron_001',
      nutrientName: '鉄',
      targetValue: 18,
      actualValue: 5,
      achievementRate: 28,
      improvementEffectScore: -15,
      riskLevel: 'high',
    };

    const deficiencyItem_nanScore = {
      nutrientId: 'fiber_001',
      nutrientName: '食物繊維',
      targetValue: 25,
      actualValue: 8,
      achievementRate: 32,
      improvementEffectScore: NaN,
      riskLevel: 'high',
    };

    const deficiencyItem_nonNumericScore = {
      nutrientId: 'protein_001',
      nutrientName: 'タンパク質',
      targetValue: 60,
      actualValue: 15,
      achievementRate: 25,
      improvementEffectScore: 'invalid' as any,
      riskLevel: 'high',
    };

    expect(() => {
      prioritizeNutritionDeficiencies([deficiencyItem_nullScore]);
    }).toThrow(/改善効果スコア/);

    expect(() => {
      prioritizeNutritionDeficiencies([deficiencyItem_undefinedScore]);
    }).toThrow(/改善効果スコア/);

    expect(() => {
      prioritizeNutritionDeficiencies([deficiencyItem_negativeScore]);
    }).toThrow(/改善効果スコア/);

    expect(() => {
      prioritizeNutritionDeficiencies([deficiencyItem_nanScore]);
    }).toThrow(/改善効果スコア/);

    expect(() => {
      prioritizeNutritionDeficiencies([deficiencyItem_nonNumericScore]);
    }).toThrow(/改善効果スコア/);
  });

  test('改善効果スコアが有効値の場合、正常に優先度付けが実行される', () => {
    const deficiencyItems = [
      {
        nutrientId: 'vit_c_001',
        nutrientName: 'ビタミンC',
        targetValue: 100,
        actualValue: 45,
        achievementRate: 45,
        improvementEffectScore: 75,
        riskLevel: 'high' as const,
      },
      {
        nutrientId: 'calcium_001',
        nutrientName: 'カルシウム',
        targetValue: 800,
        actualValue: 320,
        achievementRate: 40,
        improvementEffectScore: 60,
        riskLevel: 'high' as const,
      },
      {
        nutrientId: 'iron_001',
        nutrientName: '鉄',
        targetValue: 18,
        actualValue: 5,
        achievementRate: 28,
        improvementEffectScore: 85,
        riskLevel: 'high' as const,
      },
    ];

    const result = prioritizeNutritionDeficiencies(deficiencyItems);

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);
    expect(result[0].nutrientId).toBe('iron_001');
    expect(result[0].priorityScore).toBe(85);
    expect(result[1].nutrientId).toBe('vit_c_001');
    expect(result[1].priorityScore).toBe(75);
    expect(result[2].nutrientId).toBe('calcium_001');
    expect(result[2].priorityScore).toBe(60);
  });

  test('改善効果スコアが境界値（0または100）の場合、正常に処理される', () => {
    const deficiencyItem_zeroScore = {
      nutrientId: 'zinc_001',
      nutrientName: '亜鉛',
      targetValue: 12,
      actualValue: 3,
      achievementRate: 25,
      improvementEffectScore: 0,
      riskLevel: 'high' as const,
    };

    const deficiencyItem_maxScore = {
      nutrientId: 'folate_001',
      nutrientName: '葉酸',
      targetValue: 400,
      actualValue: 80,
      achievementRate: 20,
      improvementEffectScore: 100,
      riskLevel: 'high' as const,
    };

    const result = prioritizeNutritionDeficiencies([
      deficiencyItem_zeroScore,
      deficiencyItem_maxScore,
    ]);

    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(result[0].nutrientId).toBe('folate_001');
    expect(result[0].priorityScore).toBe(100);
    expect(result[1].nutrientId).toBe('zinc_001');
    expect(result[1].priorityScore).toBe(0);
  });
});