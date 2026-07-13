import { calculateVariablePriorityScore } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-463
  test('モデル改善提案変数優先度自動判定機能 - 高影響度・低実装難易度の変数が最優先度に自動ルーティングされる', () => {
    // 高影響度・低実装難易度のケース
    const highImpactLowEffortVariable = {
      variable_id: 'VAR-001',
      variable_name: '気象パターン',
      impact_score: 85,
      implementation_difficulty_score: 20,
      effect_prediction_value: 12.5,
    };

    const resultHighImpactLowEffort = calculateVariablePriorityScore(
      highImpactLowEffortVariable.impact_score,
      highImpactLowEffortVariable.implementation_difficulty_score
    );

    expect(resultHighImpactLowEffort.priority_score).toBe(82.5);
    expect(resultHighImpactLowEffort.priority_level).toBe('Priority 1');
    expect(resultHighImpactLowEffort.priority_rank).toBe(1);

    // 中影響度・中実装難易度のケース
    const mediumImpactMediumEffortVariable = {
      variable_id: 'VAR-002',
      variable_name: 'イベント情報',
      impact_score: 55,
      implementation_difficulty_score: 50,
      effect_prediction_value: 7.2,
    };

    const resultMediumImpactMediumEffort = calculateVariablePriorityScore(
      mediumImpactMediumEffortVariable.impact_score,
      mediumImpactMediumEffortVariable.implementation_difficulty_score
    );

    expect(resultMediumImpactMediumEffort.priority_score).toBe(27.5);
    expect(resultMediumImpactMediumEffort.priority_level).toBe('Priority 2');
    expect(resultMediumImpactMediumEffort.priority_rank).toBe(2);

    // 低影響度・高実装難易度のケース
    const lowImpactHighEffortVariable = {
      variable_id: 'VAR-003',
      variable_name: '競合施策',
      impact_score: 30,
      implementation_difficulty_score: 80,
      effect_prediction_value: 2.1,
    };

    const resultLowImpactHighEffort = calculateVariablePriorityScore(
      lowImpactHighEffortVariable.impact_score,
      lowImpactHighEffortVariable.implementation_difficulty_score
    );

    expect(resultLowImpactHighEffort.priority_score).toBe(-25);
    expect(resultLowImpactHighEffort.priority_level).toBe('Priority 3');
    expect(resultLowImpactHighEffort.priority_rank).toBe(3);

    // 複数変数の優先度ランキング検証
    const sortedResults = [
      resultHighImpactLowEffort,
      resultMediumImpactMediumEffort,
      resultLowImpactHighEffort,
    ].sort((a, b) => b.priority_score - a.priority_score);

    expect(sortedResults[0].priority_rank).toBe(1);
    expect(sortedResults[0].variable_id).toBe('VAR-001');
    expect(sortedResults[0].priority_score).toBe(82.5);

    expect(sortedResults[1].priority_rank).toBe(2);
    expect(sortedResults[1].variable_id).toBe('VAR-002');
    expect(sortedResults[1].priority_score).toBe(27.5);

    expect(sortedResults[2].priority_rank).toBe(3);
    expect(sortedResults[2].variable_id).toBe('VAR-003');
    expect(sortedResults[2].priority_score).toBe(-25);

    // 最優先度変数の検証
    const topPriorityVariable = sortedResults[0];
    expect(topPriorityVariable.priority_level).toBe('Priority 1');
    expect(topPriorityVariable.impact_score).toBeGreaterThan(75);
    expect(topPriorityVariable.implementation_difficulty_score).toBeLessThan(30);

    // スコア計算式の検証（影響度が高く、実装難易度が低いほど優先度スコアが高い）
    // 優先度スコア = 影響度スコア × 1.0 - 実装難易度スコア × 1.0
    expect(topPriorityVariable.priority_score).toBe(85 - 20);
  });
});