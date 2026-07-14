import { calculateEffectDifference } from '../../src/logic/it-7-2-1';

describe('効果差定量比較機能 - アルゴリズム改善前後の指標差と統計的有意性判定', () => {
  // SCEN-857: [normal] 効果差定量比較機能 - 改善前後の指標差が正常に計算され統計的有意性が判定される
  test('改善前後の指標差が正確に計算され、t検定による統計的有意性が正しく判定される', () => {
    // 改善前アルゴリズムの性能指標データ
    const before_metrics = {
      success_rate_mean: 0.72,
      success_rate_std: 0.08,
      success_rate_sample_size: 145,
      cooking_time_reduction_mean: 8.5,
      cooking_time_reduction_std: 2.1,
      cooking_time_reduction_sample_size: 145,
      satisfaction_score_mean: 3.4,
      satisfaction_score_std: 0.6,
      satisfaction_score_sample_size: 145,
    };

    // 改善後アルゴリズムの性能指標データ
    const after_metrics = {
      success_rate_mean: 0.78,
      success_rate_std: 0.07,
      success_rate_sample_size: 152,
      cooking_time_reduction_mean: 12.3,
      cooking_time_reduction_std: 1.9,
      cooking_time_reduction_sample_size: 152,
      satisfaction_score_mean: 3.95,
      satisfaction_score_std: 0.55,
      satisfaction_score_sample_size: 152,
    };

    // 有意水準設定
    const significance_level = 0.05;

    // 差分計算実行
    const result = calculateEffectDifference({
      before_metrics,
      after_metrics,
      significance_level,
    });

    // 指標差の検証（改善後 - 改善前）
    expect(result.success_rate_difference).toBe(0.06);
    expect(result.cooking_time_reduction_difference).toBe(3.8);
    expect(result.satisfaction_score_difference).toBe(0.55);

    // 成功率に関するt検定結果の検証
    expect(result.success_rate_t_statistic).toBeCloseTo(5.21, 2);
    expect(result.success_rate_p_value).toBeLessThan(0.001);
    expect(result.success_rate_is_significant).toBe(true);

    // 調理時間短縮度に関するt検定結果の検証
    expect(result.cooking_time_reduction_t_statistic).toBeCloseTo(14.76, 2);
    expect(result.cooking_time_reduction_p_value).toBeLessThan(0.001);
    expect(result.cooking_time_reduction_is_significant).toBe(true);

    // 満足度スコアに関するt検定結果の検証
    expect(result.satisfaction_score_t_statistic).toBeCloseTo(6.83, 2);
    expect(result.satisfaction_score_p_value).toBeLessThan(0.001);
    expect(result.satisfaction_score_is_significant).toBe(true);

    // p値と有意水準の比較
    expect(result.success_rate_p_value).toBeLessThan(significance_level);
    expect(result.cooking_time_reduction_p_value).toBeLessThan(significance_level);
    expect(result.satisfaction_score_p_value).toBeLessThan(significance_level);

    // 有意水準0.01での判定結果を確認
    const result_strict = calculateEffectDifference({
      before_metrics,
      after_metrics,
      significance_level: 0.01,
    });

    expect(result_strict.success_rate_is_significant).toBe(true);
    expect(result_strict.cooking_time_reduction_is_significant).toBe(true);
    expect(result_strict.satisfaction_score_is_significant).toBe(true);
  });

  test('複数の指標パターンについて一貫性のある結果が得られる - メモリ使用量指標を含む', () => {
    // 改善前メモリ使用量指標
    const before_metrics = {
      memory_usage_mean: 245.6,
      memory_usage_std: 32.4,
      memory_usage_sample_size: 120,
      response_time_mean: 2.8,
      response_time_std: 0.45,
      response_time_sample_size: 120,
    };

    // 改善後メモリ使用量指標
    const after_metrics = {
      memory_usage_mean: 198.3,
      memory_usage_std: 28.1,
      memory_usage_sample_size: 128,
      response_time_mean: 1.95,
      response_time_std: 0.38,
      response_time_sample_size: 128,
    };

    const significance_level = 0.05;

    const result = calculateEffectDifference({
      before_metrics,
      after_metrics,
      significance_level,
    });

    // メモリ使用量の差分（改善 = 低下）
    expect(result.memory_usage_difference).toBe(-47.3);

    // レスポンスタイムの差分（改善 = 低下）
    expect(result.response_time_difference).toBe(-0.85);

    // メモリ使用量のt検定結果
    expect(result.memory_usage_t_statistic).toBeCloseTo(10.82, 2);
    expect(result.memory_usage_p_value).toBeLessThan(0.001);
    expect(result.memory_usage_is_significant).toBe(true);

    // レスポンスタイムのt検定結果
    expect(result.response_time_t_statistic).toBeCloseTo(13.67, 2);
    expect(result.response_time_p_value).toBeLessThan(0.001);
    expect(result.response_time_is_significant).toBe(true);

    // 有意性判定の一貫性確認
    expect(result.memory_usage_is_significant).toBe(true);
    expect(result.response_time_is_significant).toBe(true);
  });

  test('有意水準0.05での判定が正確に動作し、有意差がない場合は適切に判定される', () => {
    // 改善幅が小さいケース
    const before_metrics = {
      precision_mean: 0.85,
      precision_std: 0.12,
      precision_sample_size: 80,
    };

    const after_metrics = {
      precision_mean: 0.86,
      precision_std: 0.11,
      precision_sample_size: 85,
    };

    const significance_level = 0.05;

    const result = calculateEffectDifference({
      before_metrics,
      after_metrics,
      significance_level,
    });

    // 指標差の計算確認
    expect(result.precision_difference).toBe(0.01);

    // t統計量とp値の計算
    expect(result.precision_t_statistic).toBeCloseTo(0.56, 2);
    expect(result.precision_p_value).toBeGreaterThan(0.05);

    // 有意差なしの判定
    expect(result.precision_is_significant).toBe(false);
  });

  test('サンプルサイズが異なる場合のウェルチのt検定計算が正確に実行される', () => {
    const before_metrics = {
      f1_score_mean: 0.79,
      f1_score_std: 0.095,
      f1_score_sample_size: 110,
    };

    const after_metrics = {
      f1_score_mean: 0.86,
      f1_score_std: 0.082,
      f1_score_sample_size: 165,
    };

    const significance_level = 0.05;

    const result = calculateEffectDifference({
      before_metrics,
      after_metrics,
      significance_level,
    });

    // 指標差の計算確認
    expect(result.f1_score_difference).toBe(0.07);

    // ウェルチのt検定統計量とp値
    expect(result.f1_score_t_statistic).toBeCloseTo(5.92, 2);
    expect(result.f1_score_p_value).toBeLessThan(0.001);
    expect(result.f1_score_is_significant).toBe(true);
  });

  test('複数の有意水準での判定切り替えが正確に動作する', () => {
    const before_metrics = {
      accuracy_mean: 0.88,
      accuracy_std: 0.065,
      accuracy_sample_size: 135,
    };

    const after_metrics = {
      accuracy_mean: 0.925,
      accuracy_std: 0.055,
      accuracy_sample_size: 142,
    };

    // 有意水準0.05での判定
    const result_005 = calculateEffectDifference({
      before_metrics,
      after_metrics,
      significance_level: 0.05,
    });

    expect(result_005.accuracy_difference).toBe(0.045);
    expect(result_005.accuracy_p_value).toBeLessThan(0.001);
    expect(result_005.accuracy_is_significant).toBe(true);

    // 有意水準0.01での判定
    const result_001 = calculateEffectDifference({
      before_metrics,
      after_metrics,
      significance_level: 0.01,
    });

    expect(result_001.accuracy_difference).toBe(0.045);
    expect(result_001.accuracy_p_value).toBeLessThan(0.001);
    expect(result_001.accuracy_is_significant).toBe(true);

    // 有意水準0.001での判定
    const result_0001 = calculateEffectDifference({
      before_metrics,
      after_metrics,
      significance_level: 0.001,
    });

    expect(result_0001.accuracy_difference).toBe(0.045);
    expect(result_0001.accuracy_p_value).toBeLessThan(0.001);
    expect(result_0001.accuracy_is_significant).toBe(true);
  });

  test('数値計算の精度誤差が許容範囲内であることを確認', () => {
    const before_metrics = {
      kpi_value_mean: 42.567,
      kpi_value_std: 5.234,
      kpi_value_sample_size: 98,
    };

    const after_metrics = {
      kpi_value_mean: 51.893,
      kpi_value_std: 4.156,
      kpi_value_sample_size: 105,
    };

    const significance_level = 0.05;

    const result = calculateEffectDifference({
      before_metrics,
      after_metrics,
      significance_level,
    });

    // 指標差の計算確認（許容誤差 ±0.001）
    expect(result.kpi_value_difference).toBeCloseTo(9.326, 3);

    // t統計量の計算確認（許容誤差 ±0.01）
    expect(result.kpi_value_t_statistic).toBeCloseTo(12.84, 2);

    // p値の計算確認（許容誤差 ±0.0001）
    expect(result.kpi_value_p_value).toBeLessThan(0.001);
    expect(result.kpi_value_p_value).toBeGreaterThan(0.0001);

    // 有意性判定の確認
    expect(result.kpi_value_is_significant).toBe(true);
  });
});