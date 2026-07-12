import { classifyImprovementProposals } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-623
  test('失敗パターン分析結果から改善提案が3タイプに自動分類される', () => {
    const failure_patterns = [
      {
        failure_id: 'FP001',
        failure_category: 'nutrition_imbalance',
        description: 'タンパク質摂取量が基準値を30%下回った',
        occurrence_count: 15,
        impact_severity: 'high',
      },
      {
        failure_id: 'FP002',
        failure_category: 'cooking_time_exceeded',
        description: '献立の調理時間が60分を超えた',
        occurrence_count: 8,
        impact_severity: 'medium',
      },
      {
        failure_id: 'FP003',
        failure_category: 'user_requested_feature',
        description: 'ユーザーから「特定食材の除外機能」の要望',
        occurrence_count: 12,
        impact_severity: 'high',
      },
      {
        failure_id: 'FP004',
        failure_category: 'algorithm_bug',
        description: 'アレルギー情報の読み込み失敗により不適切な献立を提案',
        occurrence_count: 5,
        impact_severity: 'critical',
      },
      {
        failure_id: 'FP005',
        failure_category: 'parameter_optimization',
        description: '献立採点ウェイト値の調整により精度向上の余地あり',
        occurrence_count: 22,
        impact_severity: 'medium',
      },
    ];

    const result = classifyImprovementProposals(failure_patterns);

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(5);

    const algorithm_fix_proposals = result.filter(
      (p) => p.proposal_type === 'algorithm_modification'
    );
    expect(algorithm_fix_proposals.length).toBe(1);
    expect(algorithm_fix_proposals[0].failure_id).toBe('FP004');
    expect(algorithm_fix_proposals[0].proposal_type).toBe('algorithm_modification');

    const parameter_adjustment_proposals = result.filter(
      (p) => p.proposal_type === 'parameter_adjustment'
    );
    expect(parameter_adjustment_proposals.length).toBe(2);
    const parameter_ids = parameter_adjustment_proposals.map((p) => p.failure_id);
    expect(parameter_ids).toContain('FP002');
    expect(parameter_ids).toContain('FP005');

    const new_feature_proposals = result.filter(
      (p) => p.proposal_type === 'new_feature'
    );
    expect(new_feature_proposals.length).toBe(2);
    const feature_ids = new_feature_proposals.map((p) => p.failure_id);
    expect(feature_ids).toContain('FP001');
    expect(feature_ids).toContain('FP003');

    const all_types = new Set(result.map((p) => p.proposal_type));
    expect(all_types.has('algorithm_modification')).toBe(true);
    expect(all_types.has('parameter_adjustment')).toBe(true);
    expect(all_types.has('new_feature')).toBe(true);

    result.forEach((proposal) => {
      expect(proposal.failure_id).toBeDefined();
      expect(proposal.proposal_type).toBeDefined();
      expect(['algorithm_modification', 'parameter_adjustment', 'new_feature']).toContain(
        proposal.proposal_type
      );
    });

    const classification_success_rate = result.filter(
      (p) =>
        ['algorithm_modification', 'parameter_adjustment', 'new_feature'].includes(
          p.proposal_type
        )
    ).length;
    expect(classification_success_rate).toBe(result.length);
  });
});