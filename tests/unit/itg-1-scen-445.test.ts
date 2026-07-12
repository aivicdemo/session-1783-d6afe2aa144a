import { calculateAlgorithmImprovementMetrics } from '../../src/logic/it-1-1-1';

describe('アルゴリズム改善効果の定量比較機能', () => {
  // SCEN-445: [normal] アルゴリズム改善効果の定量比較機能 - 改善前後の献立生成成功率が正確に集計される
  test('改善前後の献立生成成功率がそれぞれ正確に集計され、成功件数、成功率、改善効果（差分値）が数学的に正確な値として表示される', () => {
    // テストデータ: 改善前アルゴリズムで生成した献立100件
    // 成功判定基準: 栄養バランス充足、食材の組み合わせ適正、調理時間内
    const pre_improvement_menus = Array.from({ length: 100 }, (_, i) => ({
      menu_id: `pre_${i + 1}`,
      algorithm_version: 'v1.0',
      nutrition_balance_score: i < 75 ? 85 + Math.random() * 15 : 60 + Math.random() * 20,
      ingredient_compatibility_score: i < 75 ? 80 + Math.random() * 20 : 50 + Math.random() * 25,
      cooking_time_minutes: i < 75 ? 30 + Math.random() * 15 : 45 + Math.random() * 20,
      cooking_time_limit_minutes: 45,
      is_successful: i < 75,
      generated_at: new Date('2024-01-01T09:00:00Z'),
    }));

    // テストデータ: 改善後アルゴリズムで生成した献立100件
    // 同じ判定基準を適用
    const post_improvement_menus = Array.from({ length: 100 }, (_, i) => ({
      menu_id: `post_${i + 1}`,
      algorithm_version: 'v2.0',
      nutrition_balance_score: i < 88 ? 88 + Math.random() * 12 : 65 + Math.random() * 18,
      ingredient_compatibility_score: i < 88 ? 85 + Math.random() * 15 : 55 + Math.random() * 23,
      cooking_time_minutes: i < 88 ? 28 + Math.random() * 12 : 42 + Math.random() * 18,
      cooking_time_limit_minutes: 45,
      is_successful: i < 88,
      generated_at: new Date('2024-01-08T09:00:00Z'),
    }));

    // 改善前アルゴリズムの成功率集計機能を実行
    const pre_metrics = calculateAlgorithmImprovementMetrics({
      pre_improvement_menus,
      post_improvement_menus,
      nutrition_balance_threshold: 75,
      ingredient_compatibility_threshold: 70,
      cooking_time_threshold_minutes: 45,
    });

    // 期待値: 改善前の成功件数は75件
    expect(pre_metrics.pre_improvement_success_count).toBe(75);

    // 期待値: 改善前の成功率は75.0%
    expect(pre_metrics.pre_improvement_success_rate).toBe(75.0);

    // 期待値: 改善後の成功件数は88件
    expect(pre_metrics.post_improvement_success_count).toBe(88);

    // 期待値: 改善後の成功率は88.0%
    expect(pre_metrics.post_improvement_success_rate).toBe(88.0);

    // 期待値: 改善効果（成功率差分）は13.0%
    expect(pre_metrics.improvement_rate_difference).toBe(13.0);

    // 期待値: 改善効果（成功件数差分）は13件
    expect(pre_metrics.improvement_success_count_difference).toBe(13);

    // 期待値: 成功件数の改善倍率は117.33% (88 / 75 = 1.1733...)
    expect(pre_metrics.improvement_multiplier).toBeCloseTo(1.1733, 3);

    // 期待値: 集計結果がデータベース保存用オブジェクトとして正しく構造化されていることを確認
    expect(pre_metrics).toEqual(
      expect.objectContaining({
        pre_improvement_success_count: expect.any(Number),
        pre_improvement_success_rate: expect.any(Number),
        post_improvement_success_count: expect.any(Number),
        post_improvement_success_rate: expect.any(Number),
        improvement_rate_difference: expect.any(Number),
        improvement_success_count_difference: expect.any(Number),
        improvement_multiplier: expect.any(Number),
        aggregated_at: expect.any(String),
      })
    );

    // 期待値: 集計タイムスタンプが ISO 8601 形式で記録されていることを確認
    expect(pre_metrics.aggregated_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );

    // 期待値: 成功率が0～100の範囲内であることを確認
    expect(pre_metrics.pre_improvement_success_rate).toBeGreaterThanOrEqual(0);
    expect(pre_metrics.pre_improvement_success_rate).toBeLessThanOrEqual(100);
    expect(pre_metrics.post_improvement_success_rate).toBeGreaterThanOrEqual(0);
    expect(pre_metrics.post_improvement_success_rate).toBeLessThanOrEqual(100);

    // 期待値: 成功件数がメニュー数以下であることを確認
    expect(pre_metrics.pre_improvement_success_count).toBeLessThanOrEqual(100);
    expect(pre_metrics.post_improvement_success_count).toBeLessThanOrEqual(100);
  });
});