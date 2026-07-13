import { validateAlgorithmImprovementJudgment, determineNextPriorityAfterImprovement } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能', () => {
  // SCEN-591
  test('改善前後の成功率が同一の場合に進捗なしと判定される', () => {
    const pre_success_rate = 85.5;
    const post_success_rate = 85.5;
    const current_priority = 3;
    const minimum_threshold = 80.0;
    const target_goal_rate = 92.0;

    const improvement_result = validateAlgorithmImprovementJudgment({
      pre_success_rate: pre_success_rate,
      post_success_rate: post_success_rate,
      minimum_threshold: minimum_threshold,
      target_goal_rate: target_goal_rate,
    });

    expect(improvement_result.judgment_status).toBe('No Improvement');
    expect(improvement_result.improvement_delta).toBe(0.0);
    expect(improvement_result.meets_minimum_threshold).toBe(true);
    expect(improvement_result.meets_target_goal).toBe(false);

    const priority_result = determineNextPriorityAfterImprovement({
      judgment_status: improvement_result.judgment_status,
      current_priority: current_priority,
      improvement_delta: improvement_result.improvement_delta,
    });

    expect(priority_result.next_priority).toBe(current_priority);
    expect(priority_result.priority_adjusted).toBe(false);
    expect(priority_result.reason).toContain('No Improvement');
  });
});