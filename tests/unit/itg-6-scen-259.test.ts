import { calculateSuccessRateImprovement, determineImprovementPriority } from '../../src/logic/it-1-br-8-2-2-1';

describe('献立生成成功率の改善効果定量比較・優先度決定', () => {
  // SCEN-259
  test('改善前成功率と改善後成功率が同一値の場合、進捗なしとして判定される', () => {
    // 改善前の成功率を設定（85%）
    const pre_success_rate = 85;

    // 改善後の成功率を同一値に設定（85%）
    const post_success_rate = 85;

    // 改善効果定量比較ロジックを実行
    const improvement_rate = calculateSuccessRateImprovement({
      pre_success_rate,
      post_success_rate,
    });

    // 改善率が0であることを確認
    expect(improvement_rate).toBe(0);

    // 優先度決定ロジックを実行（改善率0を入力）
    const priority_decision = determineImprovementPriority({
      improvement_rate: improvement_rate,
    });

    // 改善率が0の場合、進捗なし（no_progress）として判定されることを確認
    expect(priority_decision.progress_status).toBe('no_progress');

    // 改善効果がないものとして扱われることを確認
    expect(priority_decision.has_improvement_effect).toBe(false);

    // 優先度が最低レベルとなることを確認
    expect(priority_decision.priority_level).toBe('low');
  });
});