import { calculateNutritionAchievementScore } from "../../src/logic/it-1-br-2-1-1-1";

describe("栄養摂取達成度可視化機能", () => {
  // SCEN-430
  test("複数の栄養項目において達成度スコアが正確に集計される", () => {
    // ============================================================================
    // 前提: 栄養管理・分析ダッシュボードシステムにログイン済み
    //       複数の栄養項目（タンパク質、脂質、炭水化物、ビタミンA、ビタミンC、
    //       カルシウム、鉄分）の摂取データが入力済み
    // ============================================================================

    const nutrition_target_values = {
      protein_g: 60,
      fat_g: 65,
      carbohydrate_g: 300,
      vitamin_a_mcg: 700,
      vitamin_c_mg: 100,
      calcium_mg: 800,
      iron_mg: 8,
    };

    const nutrition_actual_values = {
      protein_g: 54,
      fat_g: 52,
      carbohydrate_g: 280,
      vitamin_a_mcg: 650,
      vitamin_c_mg: 95,
      calcium_mg: 720,
      iron_mg: 7.2,
    };

    // ============================================================================
    // 実行: calculateNutritionAchievementScore を呼び出し、
    //       各栄養項目の達成度スコアと総合スコアを計算
    // ============================================================================

    const result = calculateNutritionAchievementScore({
      target_values: nutrition_target_values,
      actual_values: nutrition_actual_values,
    });

    // ============================================================================
    // 期待値計算 (structured.formula に基づいて具体値で検証)
    //
    // 各栄養項目の達成度スコア = (実績値 / 目標値) × 100 (小数第1位で丸め)
    // ただし、100%を超える場合は 100 で上限
    //
    // タンパク質: (54 / 60) × 100 = 90.0 → 90
    // 脂質: (52 / 65) × 100 = 80.0 → 80
    // 炭水化物: (280 / 300) × 100 = 93.333... → 93
    // ビタミンA: (650 / 700) × 100 = 92.857... → 93
    // ビタミンC: (95 / 100) × 100 = 95.0 → 95
    // カルシウム: (720 / 800) × 100 = 90.0 → 90
    // 鉄分: (7.2 / 8) × 100 = 90.0 → 90
    //
    // 総合スコア = (90 + 80 + 93 + 93 + 95 + 90 + 90) / 7 = 721 / 7 = 102.857...
    // → 103 (小数第1位で丸め)
    // ただし最大値は 100 に制限されるため、総合スコアの上限は 100
    // ============================================================================

    // 個別スコアの検証
    expect(result.individual_scores.protein_score).toBe(90);
    expect(result.individual_scores.fat_score).toBe(80);
    expect(result.individual_scores.carbohydrate_score).toBe(93);
    expect(result.individual_scores.vitamin_a_score).toBe(93);
    expect(result.individual_scores.vitamin_c_score).toBe(95);
    expect(result.individual_scores.calcium_score).toBe(90);
    expect(result.individual_scores.iron_score).toBe(90);

    // 総合スコアの検証 (上限 100)
    expect(result.overall_score).toBe(100);

    // すべてのスコアが 0 以上 100 以下の範囲内であることを検証
    expect(result.individual_scores.protein_score).toBeGreaterThanOrEqual(0);
    expect(result.individual_scores.protein_score).toBeLessThanOrEqual(100);
    expect(result.individual_scores.fat_score).toBeGreaterThanOrEqual(0);
    expect(result.individual_scores.fat_score).toBeLessThanOrEqual(100);
    expect(result.overall_score).toBeGreaterThanOrEqual(0);
    expect(result.overall_score).toBeLessThanOrEqual(100);
  });

  // ============================================================================
  // 追加テストケース: 一部栄養項目が目標値を超過した場合
  // ============================================================================
  test("一部栄養項目が目標値を超過した場合、スコアは 100 で上限される", () => {
    const nutrition_target_values = {
      protein_g: 50,
      fat_g: 50,
      carbohydrate_g: 250,
      vitamin_a_mcg: 600,
      vitamin_c_mg: 80,
      calcium_mg: 700,
      iron_mg: 6,
    };

    // 一部が目標値を超過
    const nutrition_actual_values = {
      protein_g: 65, // 130% (上限 100)
      fat_g: 45, // 90%
      carbohydrate_g: 260, // 104% (上限 100)
      vitamin_a_mcg: 600, // 100%
      vitamin_c_mg: 100, // 125% (上限 100)
      calcium_mg: 700, // 100%
      iron_mg: 5, // 83%
    };

    const result = calculateNutritionAchievementScore({
      target_values: nutrition_target_values,
      actual_values: nutrition_actual_values,
    });

    // 超過した項目は 100 で上限される
    expect(result.individual_scores.protein_score).toBe(100);
    expect(result.individual_scores.fat_score).toBe(90);
    expect(result.individual_scores.carbohydrate_score).toBe(100);
    expect(result.individual_scores.vitamin_a_score).toBe(100);
    expect(result.individual_scores.vitamin_c_score).toBe(100);
    expect(result.individual_scores.calcium_score).toBe(100);
    expect(result.individual_scores.iron_score).toBe(83);

    // 総合スコア = (100 + 90 + 100 + 100 + 100 + 100 + 83) / 7 = 673 / 7 = 96.14...
    // → 96 (小数第1位で丸め)
    expect(result.overall_score).toBe(96);
  });

  // ============================================================================
  // 追加テストケース: すべての栄養項目が目標値を達成した場合
  // ============================================================================
  test("すべての栄養項目が目標値を達成した場合、総合スコアは 100 になる", () => {
    const nutrition_target_values = {
      protein_g: 60,
      fat_g: 65,
      carbohydrate_g: 300,
      vitamin_a_mcg: 700,
      vitamin_c_mg: 100,
      calcium_mg: 800,
      iron_mg: 8,
    };

    // すべて目標値と同じ
    const nutrition_actual_values = {
      protein_g: 60,
      fat_g: 65,
      carbohydrate_g: 300,
      vitamin_a_mcg: 700,
      vitamin_c_mg: 100,
      calcium_mg: 800,
      iron_mg: 8,
    };

    const result = calculateNutritionAchievementScore({
      target_values: nutrition_target_values,
      actual_values: nutrition_actual_values,
    });

    expect(result.individual_scores.protein_score).toBe(100);
    expect(result.individual_scores.fat_score).toBe(100);
    expect(result.individual_scores.carbohydrate_score).toBe(100);
    expect(result.individual_scores.vitamin_a_score).toBe(100);
    expect(result.individual_scores.vitamin_c_score).toBe(100);
    expect(result.individual_scores.calcium_score).toBe(100);
    expect(result.individual_scores.iron_score).toBe(100);

    // 総合スコア = 100
    expect(result.overall_score).toBe(100);
  });

  // ============================================================================
  // 追加テストケース: 一部栄養項目が 0 に近い場合
  // ============================================================================
  test("一部栄養項目が極度に不足した場合、個別スコアは 0 に近くなる", () => {
    const nutrition_target_values = {
      protein_g: 60,
      fat_g: 65,
      carbohydrate_g: 300,
      vitamin_a_mcg: 700,
      vitamin_c_mg: 100,
      calcium_mg: 800,
      iron_mg: 8,
    };

    const nutrition_actual_values = {
      protein_g: 3, // 5%
      fat_g: 32.5, // 50%
      carbohydrate_g: 150, // 50%
      vitamin_a_mcg: 350, // 50%
      vitamin_c_mg: 50, // 50%
      calcium_mg: 400, // 50%
      iron_mg: 4, // 50%
    };

    const result = calculateNutritionAchievementScore({
      target_values: nutrition_target_values,
      actual_values: nutrition_actual_values,
    });

    expect(result.individual_scores.protein_score).toBe(5);
    expect(result.individual_scores.fat_score).toBe(50);

    // 総合スコア = (5 + 50 + 50 + 50 + 50 + 50 + 50) / 7 = 305 / 7 = 43.57...
    // → 44 (小数第1位で丸め)
    expect(result.overall_score).toBe(44);
  });

  // ============================================================================
  // エラーテストケース: 目標値が不正な場合
  // ============================================================================
  test("目標値が 0 以下の場合、エラーが発生する", () => {
    const nutrition_target_values = {
      protein_g: 0, // 不正な目標値
      fat_g: 65,
      carbohydrate_g: 300,
      vitamin_a_mcg: 700,
      vitamin_c_mg: 100,
      calcium_mg: 800,
      iron_mg: 8,
    };

    const nutrition_actual_values = {
      protein_g: 54,
      fat_g: 52,
      carbohydrate_g: 280,
      vitamin_a_mcg: 650,
      vitamin_c_mg: 95,
      calcium_mg: 720,
      iron_mg: 7.2,
    };

    expect(() =>
      calculateNutritionAchievementScore({
        target_values: nutrition_target_values,
        actual_values: nutrition_actual_values,
      })
    ).toThrow(/目標値/);
  });

  // ============================================================================
  // エラーテストケース: 実績値が負数の場合
  // ============================================================================
  test("実績値が負数の場合、エラーが発生する", () => {
    const nutrition_target_values = {
      protein_g: 60,
      fat_g: 65,
      carbohydrate_g: 300,
      vitamin_a_mcg: 700,
      vitamin_c_mg: 100,
      calcium_mg: 800,
      iron_mg: 8,
    };

    const nutrition_actual_values = {
      protein_g: -10, // 不正な実績値
      fat_g: 52,
      carbohydrate_g: 280,
      vitamin_a_mcg: 650,
      vitamin_c_mg: 95,
      calcium_mg: 720,
      iron_mg: 7.2,
    };

    expect(() =>
      calculateNutritionAchievementScore({
        target_values: nutrition_target_values,
        actual_values: nutrition_actual_values,
      })
    ).toThrow(/実績値/);
  });

  // ============================================================================
  // エラーテストケース: 栄養項目のキーが不一致の場合
  // ============================================================================
  test("目標値と実績値の栄養項目キーが異なる場合、エラーが発生する", () => {
    const nutrition_target_values = {
      protein_g: 60,
      fat_g: 65,
      carbohydrate_g: 300,
      vitamin_a_mcg: 700,
      vitamin_c_mg: 100,
      calcium_mg: 800,
      iron_mg: 8,
    };

    const nutrition_actual_values = {
      protein_g: 54,
      fat_g: 52,
      carbohydrate_g: 280,
      vitamin_b12_mcg: 5, // 異なるキー
      vitamin_c_mg: 95,
      calcium_mg: 720,
      iron_mg: 7.2,
    };

    expect(() =>
      calculateNutritionAchievementScore({
        target_values: nutrition_target_values,
        actual_values: nutrition_actual_values,
      })
    ).toThrow(/キー/);
  });
});