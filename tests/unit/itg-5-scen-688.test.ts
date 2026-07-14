import { determineNextValidationTiming } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズム改善効果検証ダッシュボード - 月次検証サイクル自動決定', () => {
  // SCEN-688: 月次検証サイクル終了時に次回実行タイミングと検証頻度を自動決定する
  test('should automatically determine next validation timing and frequency at end of monthly cycle', () => {
    // 前提: 月次検証サイクルが完了し、改善提案が優先度付けされた状態
    // 発生条件: 月次検証サイクル終了時に決定処理がトリガー
    // 期待結果: 次回検証実行タイミングと検証頻度が自動決定され、画面表示・システム保存・スケジューラ反映される

    const current_validation_cycle_end_date = new Date('2024-02-29T23:59:59Z');
    const previous_validation_result_avg_accuracy = 87.5; // 前월検증 평균 정확도
    const validation_items_completed_count = 12;
    const validation_items_total_count = 12;
    const algorithm_improvement_proposals_submitted_count = 5;
    const prior_month_validation_frequency_days = 30;

    const input_params = {
      current_validation_cycle_end_date,
      previous_validation_result_avg_accuracy,
      validation_items_completed_count,
      validation_items_total_count,
      algorithm_improvement_proposals_submitted_count,
      prior_month_validation_frequency_days,
    };

    const result = determineNextValidationTiming(input_params);

    // 1. 次回実行タイミングが決定されたことを確認
    expect(result.next_validation_execution_date).toBeDefined();
    expect(result.next_validation_execution_date).toBeInstanceOf(Date);

    // 2. 期待される次回実行タイミング（月初＝3月1日）
    const expected_next_execution_date = new Date('2024-03-01T09:00:00Z');
    expect(result.next_validation_execution_date).toEqual(expected_next_execution_date);

    // 3. 検証頻度が決定されたことを確認
    expect(result.validation_frequency_days).toBeDefined();
    expect(typeof result.validation_frequency_days).toBe('number');

    // 4. 期待される検証頻度（精度87.5%→月次継続）
    expect(result.validation_frequency_days).toBe(30);

    // 5. 決定理由が含まれていることを確認
    expect(result.decision_rationale).toBeDefined();
    expect(typeof result.decision_rationale).toBe('string');

    // 6. 妥当性チェック基準を満たしているか確認
    expect(result.validation_criteria_met).toBe(true);

    // 7. すべての検証項目が完了していることが反映されていることを確認
    expect(result.all_items_completed).toBe(true);

    // 8. 改善提案件数がシステムに記録されていることを確認
    expect(result.improvement_proposals_count).toBe(5);

    // 9. スケジューラ反映ステータスが有効になっていることを確認
    expect(result.scheduler_reflection_status).toBe('reflected');

    // 10. 決定内容のタイムスタンプが保存されていることを確認
    expect(result.decision_timestamp).toBeDefined();
    expect(result.decision_timestamp).toBeInstanceOf(Date);

    // 11. 決定内容が妥当性判定条件を満たしていることを確認
    // - 検証項目完了率が100% ✓
    // - 前回精度が70%以上 ✓
    // - 改善提案が存在 ✓
    const completion_rate = (validation_items_completed_count / validation_items_total_count) * 100;
    expect(completion_rate).toBe(100);
    expect(previous_validation_result_avg_accuracy).toBeGreaterThanOrEqual(70);
    expect(algorithm_improvement_proposals_submitted_count).toBeGreaterThan(0);

    // 12. 精度が高い場合（87.5%）は月次検証を継続（30日）
    // 精度が低い場合（<80%）は週次検証へ変更（7日）になるはずだが、
    // 本テストケースは87.5%なので月次継続が期待される
    if (previous_validation_result_avg_accuracy >= 85) {
      expect(result.validation_frequency_days).toBe(30);
    }

    // 13. 次回実行タイミングが当月末の翌日から30日以内に設定されていることを確認
    const days_until_next_execution =
      (result.next_validation_execution_date.getTime() - current_validation_cycle_end_date.getTime()) /
      (1000 * 60 * 60 * 24);
    expect(days_until_next_execution).toBeGreaterThan(0);
    expect(days_until_next_execution).toBeLessThanOrEqual(35);

    // 14. 全体構造が保存可能な形式であることを確認
    expect(result).toHaveProperty('next_validation_execution_date');
    expect(result).toHaveProperty('validation_frequency_days');
    expect(result).toHaveProperty('decision_rationale');
    expect(result).toHaveProperty('validation_criteria_met');
    expect(result).toHaveProperty('all_items_completed');
    expect(result).toHaveProperty('improvement_proposals_count');
    expect(result).toHaveProperty('scheduler_reflection_status');
    expect(result).toHaveProperty('decision_timestamp');
  });
});