import { calculatePriorityScore } from '../../src/logic/it-1-br-6-2-1-1';

describe('旬食材・割引商品優先度スコア計算機能', () => {
  // SCEN-487
  test('ルール仕様書に不正な値が含まれている場合、計算処理がエラーで停止する', () => {
    // 正常系: 有効なデータで正常に動作することを確認
    const validRuleSpec = {
      season_pattern: {
        name: '春野菜',
        priority_score: 85,
      },
      discount_rate_threshold: 15,
      sales_period_days: 7,
    };

    const validInput = {
      ingredient_name: 'トマト',
      is_seasonal: true,
      discount_rate: 20,
      rule_spec: validRuleSpec,
    };

    const validResult = calculatePriorityScore(validInput);
    expect(typeof validResult).toBe('object');
    expect(validResult.total_priority_score).toBeGreaterThanOrEqual(0);
    expect(validResult.total_priority_score).toBeLessThanOrEqual(100);

    // エラー系: season_pattern が負の数値
    const invalidRuleSpec_negative_score = {
      season_pattern: {
        name: '春野菜',
        priority_score: -10,
      },
      discount_rate_threshold: 15,
      sales_period_days: 7,
    };

    const inputWithNegativeScore = {
      ingredient_name: 'トマト',
      is_seasonal: true,
      discount_rate: 20,
      rule_spec: invalidRuleSpec_negative_score,
    };

    expect(() => calculatePriorityScore(inputWithNegativeScore)).toThrow(/優先度スコア/);

    // エラー系: discount_rate_threshold が null
    const invalidRuleSpec_null_threshold = {
      season_pattern: {
        name: '春野菜',
        priority_score: 85,
      },
      discount_rate_threshold: null,
      sales_period_days: 7,
    };

    const inputWithNullThreshold = {
      ingredient_name: 'トマト',
      is_seasonal: true,
      discount_rate: 20,
      rule_spec: invalidRuleSpec_null_threshold,
    };

    expect(() => calculatePriorityScore(inputWithNullThreshold)).toThrow(/割引率閾値/);

    // エラー系: sales_period_days が undefined
    const invalidRuleSpec_undefined_days = {
      season_pattern: {
        name: '春野菜',
        priority_score: 85,
      },
      discount_rate_threshold: 15,
      sales_period_days: undefined,
    };

    const inputWithUndefinedDays = {
      ingredient_name: 'トマト',
      is_seasonal: true,
      discount_rate: 20,
      rule_spec: invalidRuleSpec_undefined_days,
    };

    expect(() => calculatePriorityScore(inputWithUndefinedDays)).toThrow(/販売期間/);

    // エラー系: season_pattern.name が空文字列
    const invalidRuleSpec_empty_name = {
      season_pattern: {
        name: '',
        priority_score: 85,
      },
      discount_rate_threshold: 15,
      sales_period_days: 7,
    };

    const inputWithEmptyName = {
      ingredient_name: 'トマト',
      is_seasonal: true,
      discount_rate: 20,
      rule_spec: invalidRuleSpec_empty_name,
    };

    expect(() => calculatePriorityScore(inputWithEmptyName)).toThrow(/季節パターン名/);

    // エラー系: rule_spec 全体が null
    const inputWithNullRuleSpec = {
      ingredient_name: 'トマト',
      is_seasonal: true,
      discount_rate: 20,
      rule_spec: null,
    };

    expect(() => calculatePriorityScore(inputWithNullRuleSpec)).toThrow(/ルール仕様書/);

    // エラー系: discount_rate が負の数値
    const validRuleSpec_discount_negative = {
      season_pattern: {
        name: '春野菜',
        priority_score: 85,
      },
      discount_rate_threshold: 15,
      sales_period_days: 7,
    };

    const inputWithNegativeDiscountRate = {
      ingredient_name: 'トマト',
      is_seasonal: true,
      discount_rate: -5,
      rule_spec: validRuleSpec_discount_negative,
    };

    expect(() => calculatePriorityScore(inputWithNegativeDiscountRate)).toThrow(/割引率/);

    // エラー系: sales_period_days が 0 以下
    const invalidRuleSpec_zero_days = {
      season_pattern: {
        name: '春野菜',
        priority_score: 85,
      },
      discount_rate_threshold: 15,
      sales_period_days: 0,
    };

    const inputWithZeroDays = {
      ingredient_name: 'トマト',
      is_seasonal: true,
      discount_rate: 20,
      rule_spec: invalidRuleSpec_zero_days,
    };

    expect(() => calculatePriorityScore(inputWithZeroDays)).toThrow(/販売期間/);

    // エラー系: season_pattern.priority_score が 100 を超える
    const invalidRuleSpec_over_100 = {
      season_pattern: {
        name: '春野菜',
        priority_score: 150,
      },
      discount_rate_threshold: 15,
      sales_period_days: 7,
    };

    const inputWithOverScore = {
      ingredient_name: 'トマト',
      is_seasonal: true,
      discount_rate: 20,
      rule_spec: invalidRuleSpec_over_100,
    };

    expect(() => calculatePriorityScore(inputWithOverScore)).toThrow(/優先度スコア/);
  });
});