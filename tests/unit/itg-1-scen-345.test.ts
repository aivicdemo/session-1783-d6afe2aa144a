import { calculateConstraintComplianceScores } from '../../src/logic/it-1-br-1783670064270-1-1-1';

describe('複数制約条件の充足度判定', () => {
  // SCEN-345
  test('複数の制約条件を満たす献立案に対して各制約ごとの充足度スコアと総合評価スコアが正しく計算される', () => {
    const menu_proposal = {
      menu_id: 'menu_001',
      dishes: [
        {
          dish_id: 'dish_001',
          dish_name: '鶏胸肉の塩焼き',
          calories: 300,
          sodium_g: 1.5,
          protein_g: 40,
          allergens: ['鶏'],
        },
        {
          dish_id: 'dish_002',
          dish_name: 'ブロッコリーの炒め',
          calories: 80,
          sodium_g: 0.8,
          protein_g: 5,
          allergens: [],
        },
        {
          dish_id: 'dish_003',
          dish_name: '玄米ご飯',
          calories: 250,
          sodium_g: 0.3,
          protein_g: 6,
          allergens: [],
        },
      ],
      total_calories: 630,
      total_sodium_g: 2.6,
      total_protein_g: 51,
    };

    const constraint_conditions = {
      calorie_limit: 2000,
      sodium_limit_g: 8,
      protein_minimum_g: 50,
      allergen_exclusions: ['卵', 'えび', '牛乳', 'ピーナッツ', 'そば'],
    };

    const result = calculateConstraintComplianceScores(
      menu_proposal,
      constraint_conditions
    );

    // カロリー充足度スコア: (630 / 2000) * 100 = 31.5
    expect(result.calorie_compliance_score).toBe(31.5);

    // 塩分充足度スコア: (2.6 / 8) * 100 = 32.5
    expect(result.sodium_compliance_score).toBe(32.5);

    // タンパク質充足度スコア: (51 / 50) * 100 = 102 → 上限100に正規化 = 100
    expect(result.protein_compliance_score).toBe(100);

    // アレルギー制約充足度スコア: 鶏は除外対象でない → 100
    expect(result.allergen_compliance_score).toBe(100);

    // 総合評価スコア（加重平均）:
    // (31.5 * 0.25 + 32.5 * 0.25 + 100 * 0.25 + 100 * 0.25) = (7.875 + 8.125 + 25 + 25) = 66
    expect(result.overall_evaluation_score).toBe(66);

    // 各スコアが0～100の範囲内であることを検証
    expect(result.calorie_compliance_score).toBeGreaterThanOrEqual(0);
    expect(result.calorie_compliance_score).toBeLessThanOrEqual(100);
    expect(result.sodium_compliance_score).toBeGreaterThanOrEqual(0);
    expect(result.sodium_compliance_score).toBeLessThanOrEqual(100);
    expect(result.protein_compliance_score).toBeGreaterThanOrEqual(0);
    expect(result.protein_compliance_score).toBeLessThanOrEqual(100);
    expect(result.allergen_compliance_score).toBeGreaterThanOrEqual(0);
    expect(result.allergen_compliance_score).toBeLessThanOrEqual(100);
    expect(result.overall_evaluation_score).toBeGreaterThanOrEqual(0);
    expect(result.overall_evaluation_score).toBeLessThanOrEqual(100);

    // 計算根拠となった数値がログに含まれていることを確認
    expect(result.calculation_log).toBeDefined();
    expect(result.calculation_log).toContain('630');
    expect(result.calculation_log).toContain('2000');
    expect(result.calculation_log).toContain('2.6');
    expect(result.calculation_log).toContain('8');
    expect(result.calculation_log).toContain('51');
    expect(result.calculation_log).toContain('50');
  });
});