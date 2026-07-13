import { calculateAlgorithmImprovementComparison } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証 - アルゴリズム改善効果の定量比較', () => {
  // SCEN-593: [normal] アルゴリズム改善効果の定量比較 - 改善前後の成功率・調理時間短縮度・ユーザー満足度スコアを数値で正しく比較できる
  test('改善前後のアルゴリズムについて、成功率・調理時間短縮度・ユーザー満足度スコアの各指標が正確な数値で表示され、差分値およびパーセンテージの比較結果が正しく計算・表示される', () => {
    // 改善前のアルゴリズムデータ
    const pre_improvement_data = {
      algorithm_version_id: 'algo_v1_baseline',
      success_rate: 72.5, // パーセンテージ
      cooking_time_reduction: 15.3, // パーセンテージ
      user_satisfaction_score: 78.2, // スコア (0-100)
      sample_size: 450,
      measurement_period_start: '2024-01-01',
      measurement_period_end: '2024-01-31',
    };

    // 改善後のアルゴリズムデータ
    const post_improvement_data = {
      algorithm_version_id: 'algo_v2_improved',
      success_rate: 85.6, // パーセンテージ
      cooking_time_reduction: 28.7, // パーセンテージ
      user_satisfaction_score: 87.9, // スコア (0-100)
      sample_size: 468,
      measurement_period_start: '2024-02-01',
      measurement_period_end: '2024-02-29',
    };

    // 改善効果の定量比較を実行
    const comparison_result = calculateAlgorithmImprovementComparison(
      pre_improvement_data,
      post_improvement_data
    );

    // 期待される計算結果（structured.formula に従う）
    // 成功率の差分: 85.6 - 72.5 = 13.1 ポイント
    // 成功率の改善度合い: ((85.6 - 72.5) / 72.5) * 100 = 18.07586... ≈ 18.08%
    // 調理時間短縮度の差分: 28.7 - 15.3 = 13.4 ポイント
    // 調理時間短縮度の改善度合い: ((28.7 - 15.3) / 15.3) * 100 = 87.58169... ≈ 87.58%
    // ユーザー満足度スコアの差分: 87.9 - 78.2 = 9.7 ポイント
    // ユーザー満足度スコアの改善度合い: ((87.9 - 78.2) / 78.2) * 100 = 12.40408... ≈ 12.40%

    // 成功率の検証
    expect(comparison_result.success_rate_difference).toBe(13.1);
    expect(comparison_result.success_rate_improvement_percentage).toBeCloseTo(18.07586, 4);

    // 調理時間短縮度の検証
    expect(comparison_result.cooking_time_reduction_difference).toBe(13.4);
    expect(comparison_result.cooking_time_reduction_improvement_percentage).toBeCloseTo(87.58169, 4);

    // ユーザー満足度スコアの検証
    expect(comparison_result.user_satisfaction_score_difference).toBe(9.7);
    expect(comparison_result.user_satisfaction_score_improvement_percentage).toBeCloseTo(12.40408, 4);

    // 改善前後の基本情報が正しく記録されているか確認
    expect(comparison_result.pre_algorithm_version).toBe('algo_v1_baseline');
    expect(comparison_result.post_algorithm_version).toBe('algo_v2_improved');
    expect(comparison_result.pre_sample_size).toBe(450);
    expect(comparison_result.post_sample_size).toBe(468);

    // 比較結果の全体構造を検証
    expect(comparison_result).toHaveProperty('success_rate_difference');
    expect(comparison_result).toHaveProperty('success_rate_improvement_percentage');
    expect(comparison_result).toHaveProperty('cooking_time_reduction_difference');
    expect(comparison_result).toHaveProperty('cooking_time_reduction_improvement_percentage');
    expect(comparison_result).toHaveProperty('user_satisfaction_score_difference');
    expect(comparison_result).toHaveProperty('user_satisfaction_score_improvement_percentage');
    expect(comparison_result).toHaveProperty('pre_algorithm_version');
    expect(comparison_result).toHaveProperty('post_algorithm_version');
    expect(comparison_result).toHaveProperty('comparison_timestamp');

    // タイムスタンプが有効な ISO 8601 形式であることを確認
    expect(new Date(comparison_result.comparison_timestamp)).toBeInstanceOf(Date);
    expect(new Date(comparison_result.comparison_timestamp).getTime()).not.toBeNaN();

    // 改善度合いが正の値であることを確認（改善が実現されている）
    expect(comparison_result.success_rate_improvement_percentage).toBeGreaterThan(0);
    expect(comparison_result.cooking_time_reduction_improvement_percentage).toBeGreaterThan(0);
    expect(comparison_result.user_satisfaction_score_improvement_percentage).toBeGreaterThan(0);

    // 差分値が正の値であることを確認（全指標で改善されている）
    expect(comparison_result.success_rate_difference).toBeGreaterThan(0);
    expect(comparison_result.cooking_time_reduction_difference).toBeGreaterThan(0);
    expect(comparison_result.user_satisfaction_score_difference).toBeGreaterThan(0);

    // 改善後の値が改善前の値より大きいことを確認
    expect(comparison_result.post_success_rate).toBeGreaterThan(comparison_result.pre_success_rate);
    expect(comparison_result.post_cooking_time_reduction).toBeGreaterThan(
      comparison_result.pre_cooking_time_reduction
    );
    expect(comparison_result.post_user_satisfaction_score).toBeGreaterThan(
      comparison_result.pre_user_satisfaction_score
    );

    // 各パーセンテージが妥当な範囲内（0～300%）にあることを確認
    expect(comparison_result.success_rate_improvement_percentage).toBeGreaterThanOrEqual(0);
    expect(comparison_result.success_rate_improvement_percentage).toBeLessThan(300);
    expect(comparison_result.cooking_time_reduction_improvement_percentage).toBeGreaterThanOrEqual(0);
    expect(comparison_result.cooking_time_reduction_improvement_percentage).toBeLessThan(300);
    expect(comparison_result.user_satisfaction_score_improvement_percentage).toBeGreaterThanOrEqual(0);
    expect(comparison_result.user_satisfaction_score_improvement_percentage).toBeLessThan(300);
  });
});