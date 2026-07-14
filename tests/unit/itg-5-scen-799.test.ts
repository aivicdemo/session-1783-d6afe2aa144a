import { evaluateModelImprovementProposalPriority } from '../../src/logic/it-7-2-1';

describe('モデル改善提案の優先度判定と外部データ連携', () => {
  // SCEN-799: [error] モデル改善提案変数優先度判定機能 - 優先度判定に必要な精度影響度データが欠落している場合、ルーティングが保留状態になる
  test('精度影響度データが欠落した場合、優先度判定のルーティング状態が保留中になる', () => {
    const proposal_with_missing_accuracy_impact = {
      proposal_id: 'PROP-001',
      algorithm_version_id: 'ALG-V2.3',
      external_factor_variables: [
        {
          variable_id: 'VAR-WEATHER-001',
          variable_name: '気象パターン',
          correlation_coefficient: 0.72,
          statistical_significance: 0.95,
          accuracy_impact_rate: 0.08, // 精度改善への寄与率 8%
          implementation_difficulty_score: 45,
          priority_score: null,
        },
        {
          variable_id: 'VAR-EVENT-001',
          variable_name: 'イベント情報',
          correlation_coefficient: 0.58,
          statistical_significance: 0.88,
          accuracy_impact_rate: undefined, // 欠落
          implementation_difficulty_score: 62,
          priority_score: null,
        },
        {
          variable_id: 'VAR-COMPETITOR-001',
          variable_name: '競合施策',
          correlation_coefficient: 0.41,
          statistical_significance: 0.76,
          accuracy_impact_rate: 0.05,
          implementation_difficulty_score: 58,
          priority_score: null,
        },
      ],
      proposal_timestamp: new Date('2024-02-15T10:30:00Z'),
      submitter_id: 'ANALYST-002',
      review_status: 'PENDING_PRIORITY_EVALUATION',
    };

    const result = evaluateModelImprovementProposalPriority(
      proposal_with_missing_accuracy_impact,
    );

    // 精度影響度データが欠落している場合、ルーティング状態は保留中のまま
    expect(result.routing_status).toBe('PENDING');
    expect(result.routing_status).not.toBe('APPROVED');
    expect(result.routing_status).not.toBe('REJECTED');

    // エラーメッセージが生成される
    expect(result.error_message).toBeDefined();
    expect(result.error_message).toMatch(/精度影響度/);

    // 優先度スコアが計算されない
    expect(result.variables_with_priority).toBeUndefined();

    // タイムスタンプが記録される
    expect(result.evaluation_timestamp).toBeDefined();
    expect(new Date(result.evaluation_timestamp)).toEqual(
      new Date('2024-02-15T10:30:00Z'),
    );

    // システムが異常終了せず、結果オブジェクトが返される
    expect(result).toHaveProperty('proposal_id');
    expect(result.proposal_id).toBe('PROP-001');
  });
});