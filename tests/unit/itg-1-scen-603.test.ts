import { judgeAlgorithmImprovementEffectAndDecidePriority } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-603: [edge] アルゴリズム改善効果判定・優先度決定機能 - 改善後の成功率が最小閾値との境界値に位置する場合、正確に合格判定される
  test('改善後の成功率が最小閾値との境界値に位置する場合、正確に合格判定される', () => {
    const min_success_rate_threshold = 80.0;

    // ケース1: 改善後の成功率が最小閾値と同じ値（80.0%）
    const improvement_success_rate_at_threshold = 80.0;
    const result_at_threshold = judgeAlgorithmImprovementEffectAndDecidePriority({
      post_improvement_success_rate: improvement_success_rate_at_threshold,
      min_success_rate_threshold: min_success_rate_threshold,
      pre_improvement_success_rate: 75.0,
      cooking_time_reduction_degree: 12.5,
      user_satisfaction_score: 85.0,
    });
    expect(result_at_threshold.is_qualified).toBe(true);
    expect(result_at_threshold.priority_rank).toBe('high');

    // ケース2: 改善後の成功率が最小閾値より0.1%低い値（79.9%）
    const improvement_success_rate_below_threshold = 79.9;
    const result_below_threshold = judgeAlgorithmImprovementEffectAndDecidePriority({
      post_improvement_success_rate: improvement_success_rate_below_threshold,
      min_success_rate_threshold: min_success_rate_threshold,
      pre_improvement_success_rate: 75.0,
      cooking_time_reduction_degree: 12.5,
      user_satisfaction_score: 85.0,
    });
    expect(result_below_threshold.is_qualified).toBe(false);
    expect(result_below_threshold.priority_rank).toBe('low');

    // ケース3: 改善後の成功率が最小閾値より0.1%高い値（80.1%）
    const improvement_success_rate_above_threshold = 80.1;
    const result_above_threshold = judgeAlgorithmImprovementEffectAndDecidePriority({
      post_improvement_success_rate: improvement_success_rate_above_threshold,
      min_success_rate_threshold: min_success_rate_threshold,
      pre_improvement_success_rate: 75.0,
      cooking_time_reduction_degree: 12.5,
      user_satisfaction_score: 85.0,
    });
    expect(result_above_threshold.is_qualified).toBe(true);
    expect(result_above_threshold.priority_rank).toBe('high');

    // 改善度スコアの検証（改善効果が大きい場合）
    expect(result_at_threshold.improvement_score).toBeGreaterThanOrEqual(
      result_below_threshold.improvement_score
    );
  });
});