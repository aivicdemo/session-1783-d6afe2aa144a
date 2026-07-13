import { calculateNutritionAchievementDegree } from '../../src/logic/it-1-br-3-2-1';

describe('栄養目標達成度の計算・可視化機能 - 実績値が栄養基準値を大幅に超過した場合', () => {
  // SCEN-353
  test('実績値が栄養基準値の150%以上の場合、達成度が正確に計算され、過剰摂取として優先度付けされる', () => {
    const nutrition_standards = {
      protein_g_per_day: 50,
      fat_g_per_day: 60,
      carbohydrate_g_per_day: 300,
    };

    const actual_intake = {
      protein_g: 75,
      fat_g: 90,
      carbohydrate_g: 450,
    };

    const result = calculateNutritionAchievementDegree({
      nutrition_standards,
      actual_intake,
    });

    // 期待値計算:
    // タンパク質: 75 / 50 = 150%
    // 脂質: 90 / 60 = 150%
    // 炭水化物: 450 / 300 = 150%
    // すべて150%ちょうど（基準値に対して150%以上）

    expect(result.protein_achievement_percent).toBe(150);
    expect(result.fat_achievement_percent).toBe(150);
    expect(result.carbohydrate_achievement_percent).toBe(150);

    // 過剰摂取フラグの確認
    expect(result.protein_status).toBe('over_intake');
    expect(result.fat_status).toBe('over_intake');
    expect(result.carbohydrate_status).toBe('over_intake');

    // ギャップ分析の優先度付け確認
    expect(result.gap_analysis_prioritized).toEqual([
      {
        nutrient_name: 'protein',
        achievement_percent: 150,
        status: 'over_intake',
        priority_level: 1,
        warning_flag: true,
        recommended_action: 'タンパク質摂取量を削減してください',
      },
      {
        nutrient_name: 'fat',
        achievement_percent: 150,
        status: 'over_intake',
        priority_level: 1,
        warning_flag: true,
        recommended_action: '脂質摂取量を削減してください',
      },
      {
        nutrient_name: 'carbohydrate',
        achievement_percent: 150,
        status: 'over_intake',
        priority_level: 1,
        warning_flag: true,
        recommended_action: '炭水化物摂取量を削減してください',
      },
    ]);

    // 改善提案が摂取量削減対策であることを確認
    expect(result.improvement_proposals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          proposal_type: 'reduce_intake',
          target_nutrients: ['protein', 'fat', 'carbohydrate'],
          priority_score: 100,
        }),
      ])
    );

    // 総合達成度スコアが150%を超える値として計算されていることを確認
    const average_achievement_percent =
      (150 + 150 + 150) / 3;
    expect(result.overall_achievement_percent).toBe(
      average_achievement_percent
    );
  });

  // SCEN-353: 境界値テスト - 実績値が基準値の150.5%の場合
  test('実績値が基準値の150.5%の場合、達成度が正確に計算されて過剰摂取と判定される', () => {
    const nutrition_standards = {
      protein_g_per_day: 50,
      fat_g_per_day: 60,
      carbohydrate_g_per_day: 300,
    };

    const actual_intake = {
      protein_g: 75.25,
      fat_g: 90.3,
      carbohydrate_g: 451.5,
    };

    const result = calculateNutritionAchievementDegree({
      nutrition_standards,
      actual_intake,
    });

    // タンパク質: 75.25 / 50 = 150.5%
    // 脂質: 90.3 / 60 = 150.5%
    // 炭水化物: 451.5 / 300 = 150.5%

    expect(result.protein_achievement_percent).toBe(150.5);
    expect(result.fat_achievement_percent).toBe(150.5);
    expect(result.carbohydrate_achievement_percent).toBe(150.5);

    expect(result.protein_status).toBe('over_intake');
    expect(result.fat_status).toBe('over_intake');
    expect(result.carbohydrate_status).toBe('over_intake');

    expect(result.gap_analysis_prioritized).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          nutrient_name: 'protein',
          status: 'over_intake',
          warning_flag: true,
        }),
        expect.objectContaining({
          nutrient_name: 'fat',
          status: 'over_intake',
          warning_flag: true,
        }),
        expect.objectContaining({
          nutrient_name: 'carbohydrate',
          status: 'over_intake',
          warning_flag: true,
        }),
      ])
    );
  });

  // SCEN-353: エラーテスト - 栄養基準値が0以下の場合
  test('栄養基準値が0以下の場合、エラーが発生する', () => {
    const nutrition_standards = {
      protein_g_per_day: 0,
      fat_g_per_day: 60,
      carbohydrate_g_per_day: 300,
    };

    const actual_intake = {
      protein_g: 75,
      fat_g: 90,
      carbohydrate_g: 450,
    };

    expect(() =>
      calculateNutritionAchievementDegree({
        nutrition_standards,
        actual_intake,
      })
    ).toThrow(/栄養基準値/);
  });

  // SCEN-353: エラーテスト - 実績値が負数の場合
  test('実績値が負数の場合、エラーが発生する', () => {
    const nutrition_standards = {
      protein_g_per_day: 50,
      fat_g_per_day: 60,
      carbohydrate_g_per_day: 300,
    };

    const actual_intake = {
      protein_g: -10,
      fat_g: 90,
      carbohydrate_g: 450,
    };

    expect(() =>
      calculateNutritionAchievementDegree({
        nutrition_standards,
        actual_intake,
      })
    ).toThrow(/実績値/);
  });

  // SCEN-353: 追加テスト - 実績値が基準値の200%の場合
  test('実績値が基準値の200%の場合、達成度が正確に計算されて過剰摂取として最優先で表示される', () => {
    const nutrition_standards = {
      protein_g_per_day: 50,
      fat_g_per_day: 60,
      carbohydrate_g_per_day: 300,
    };

    const actual_intake = {
      protein_g: 100,
      fat_g: 120,
      carbohydrate_g: 600,
    };

    const result = calculateNutritionAchievementDegree({
      nutrition_standards,
      actual_intake,
    });

    // タンパク質: 100 / 50 = 200%
    // 脂質: 120 / 60 = 200%
    // 炭水化物: 600 / 300 = 200%

    expect(result.protein_achievement_percent).toBe(200);
    expect(result.fat_achievement_percent).toBe(200);
    expect(result.carbohydrate_achievement_percent).toBe(200);

    expect(result.protein_status).toBe('over_intake');
    expect(result.fat_status).toBe('over_intake');
    expect(result.carbohydrate_status).toBe('over_intake');

    // すべての栄養素が最優先度で表示される
    const all_priority_level_one = result.gap_analysis_prioritized.every(
      (item) => item.priority_level === 1
    );
    expect(all_priority_level_one).toBe(true);

    // すべての栄養素に警告フラグが立てられている
    const all_warnings_flagged = result.gap_analysis_prioritized.every(
      (item) => item.warning_flag === true
    );
    expect(all_warnings_flagged).toBe(true);

    // 改善提案の優先スコアが最高値である
    expect(result.improvement_proposals[0].priority_score).toBe(100);
  });

  // SCEN-353: 追加テスト - 複数栄養素が混在している場合（過剰・適正・不足）
  test('複数栄養素が混在している場合、過剰摂取栄養素のみが優先度付けされる', () => {
    const nutrition_standards = {
      protein_g_per_day: 50,
      fat_g_per_day: 60,
      carbohydrate_g_per_day: 300,
    };

    const actual_intake = {
      protein_g: 75, // 150% - 過剰摂取
      fat_g: 60, // 100% - 適正
      carbohydrate_g: 200, // 66.7% - 不足
    };

    const result = calculateNutritionAchievementDegree({
      nutrition_standards,
      actual_intake,
    });

    // タンパク質の過剰摂取を確認
    expect(result.protein_achievement_percent).toBe(150);
    expect(result.protein_status).toBe('over_intake');

    // 脂質の適正摂取を確認
    expect(result.fat_achievement_percent).toBe(100);
    expect(result.fat_status).toBe('adequate');

    // 炭水化物の不足摂取を確認
    expect(result.carbohydrate_achievement_percent).toBe(66.7);
    expect(result.carbohydrate_status).toBe('insufficient');

    // ギャップ分析では過剰摂取栄養素が最優先
    const over_intake_items = result.gap_analysis_prioritized.filter(
      (item) => item.status === 'over_intake'
    );
    expect(over_intake_items.length).toBe(1);
    expect(over_intake_items[0].nutrient_name).toBe('protein');
    expect(over_intake_items[0].priority_level).toBe(1);
    expect(over_intake_items[0].warning_flag).toBe(true);
  });
});