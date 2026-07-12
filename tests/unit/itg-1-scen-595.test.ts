import { judgeQualityGate } from '../../src/logic/it-1-1-1';

describe('品質ゲート判定機能', () => {
  test('SCEN-595: 改善案が定量指標の全合格基準を満たす場合、本番昇格判定が合格と返される', () => {
    // Arrange: 全ての定量指標が合格基準を満たす改善案テストデータを準備
    const improvementProposal = {
      proposal_id: 'proposal_20240115_001',
      algorithm_version_id: 'v2.3.1',
      success_rate_before: 72.5,
      success_rate_after: 85.3,
      success_rate_threshold: 80.0,
      cooking_time_reduction_before: 45.2,
      cooking_time_reduction_after: 38.1,
      cooking_time_reduction_threshold: 40.0,
      user_satisfaction_before: 3.6,
      user_satisfaction_after: 4.2,
      user_satisfaction_threshold: 4.0,
      test_environment_pass: true,
      regression_test_pass: true,
      code_review_pass: true,
    };

    // Act: 品質ゲート判定機能に改善案の指標データを入力して本番昇格判定を実行
    const judgment_result = judgeQualityGate(improvementProposal);

    // Assert: 本番昇格判定が合格（true）と返され、改善案が本番環境への昇格対象として認定されることを検証
    expect(judgment_result).toEqual({
      is_passed: true,
      promotion_eligible: true,
      success_rate_judge: true,
      cooking_time_reduction_judge: true,
      user_satisfaction_judge: true,
      test_environment_judge: true,
      regression_test_judge: true,
      code_review_judge: true,
      all_criteria_met: true,
    });

    // 返却される判定結果の合格フラグが true であることを確認
    expect(judgment_result.is_passed).toBe(true);
    expect(judgment_result.promotion_eligible).toBe(true);
    expect(judgment_result.all_criteria_met).toBe(true);

    // 各定量指標が合格基準を満たしていることを検証
    expect(judgment_result.success_rate_judge).toBe(true);
    expect(judgment_result.cooking_time_reduction_judge).toBe(true);
    expect(judgment_result.user_satisfaction_judge).toBe(true);
    expect(judgment_result.test_environment_judge).toBe(true);
    expect(judgment_result.regression_test_judge).toBe(true);
    expect(judgment_result.code_review_judge).toBe(true);
  });
});