import { prioritizeImprovementProposals } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズム改善提案の定量比較・優先度付け', () => {
  // SCEN-614: 複数改善案の定量比較・優先度付け機能
  test('複数の改善案に対して精度差・実装コスト・家族満足度への影響が定量比較され、優先度付けされたリストが生成される', () => {
    const improvement_proposals = [
      {
        proposal_id: 'PROP-001',
        proposal_name: '栄養バランスロジック改善',
        accuracy_diff_percent: 12.5,
        implementation_cost_points: 45,
        family_satisfaction_impact_score: 8,
      },
      {
        proposal_id: 'PROP-002',
        proposal_name: 'ユーザー嗜好学習アルゴリズム改善',
        accuracy_diff_percent: 8.3,
        implementation_cost_points: 65,
        family_satisfaction_impact_score: 9,
      },
      {
        proposal_id: 'PROP-003',
        proposal_name: '調理時間制約最適化',
        accuracy_diff_percent: 6.7,
        implementation_cost_points: 30,
        family_satisfaction_impact_score: 6,
      },
      {
        proposal_id: 'PROP-004',
        proposal_name: '食材制限条件フィルタリング改善',
        accuracy_diff_percent: 15.2,
        implementation_cost_points: 50,
        family_satisfaction_impact_score: 7,
      },
    ];

    const result = prioritizeImprovementProposals(improvement_proposals);

    expect(result).toBeDefined();
    expect(result.length).toBe(4);

    // 優先度スコア計算ロジック検証
    // 期待スコア = (精度差 × 2.0) + (家族満足度 × 5.0) - (実装コスト × 0.3)
    const expected_scores = [
      {
        proposal_id: 'PROP-001',
        priority_score: 12.5 * 2.0 + 8 * 5.0 - 45 * 0.3, // 25 + 40 - 13.5 = 51.5
      },
      {
        proposal_id: 'PROP-002',
        priority_score: 8.3 * 2.0 + 9 * 5.0 - 65 * 0.3, // 16.6 + 45 - 19.5 = 42.1
      },
      {
        proposal_id: 'PROP-003',
        priority_score: 6.7 * 2.0 + 6 * 5.0 - 30 * 0.3, // 13.4 + 30 - 9 = 34.4
      },
      {
        proposal_id: 'PROP-004',
        priority_score: 15.2 * 2.0 + 7 * 5.0 - 50 * 0.3, // 30.4 + 35 - 15 = 50.4
      },
    ];

    // 優先度スコアの降順ソート確認
    const sorted_proposal_ids = result.map((p) => p.proposal_id);
    expect(sorted_proposal_ids).toEqual([
      'PROP-001', // スコア 51.5
      'PROP-004', // スコア 50.4
      'PROP-002', // スコア 42.1
      'PROP-003', // スコア 34.4
    ]);

    // 各改善案のスコア検証
    expect(result[0].proposal_id).toBe('PROP-001');
    expect(result[0].priority_score).toBeCloseTo(51.5, 1);
    expect(result[0].accuracy_diff_percent).toBe(12.5);
    expect(result[0].implementation_cost_points).toBe(45);
    expect(result[0].family_satisfaction_impact_score).toBe(8);

    expect(result[1].proposal_id).toBe('PROP-004');
    expect(result[1].priority_score).toBeCloseTo(50.4, 1);
    expect(result[1].accuracy_diff_percent).toBe(15.2);
    expect(result[1].implementation_cost_points).toBe(50);
    expect(result[1].family_satisfaction_impact_score).toBe(7);

    expect(result[2].proposal_id).toBe('PROP-002');
    expect(result[2].priority_score).toBeCloseTo(42.1, 1);
    expect(result[2].accuracy_diff_percent).toBe(8.3);
    expect(result[2].implementation_cost_points).toBe(65);
    expect(result[2].family_satisfaction_impact_score).toBe(9);

    expect(result[3].proposal_id).toBe('PROP-003');
    expect(result[3].priority_score).toBeCloseTo(34.4, 1);
    expect(result[3].accuracy_diff_percent).toBe(6.7);
    expect(result[3].implementation_cost_points).toBe(30);
    expect(result[3].family_satisfaction_impact_score).toBe(6);

    // 優先度ランクの検証
    expect(result[0].priority_rank).toBe('high');
    expect(result[1].priority_rank).toBe('high');
    expect(result[2].priority_rank).toBe('medium');
    expect(result[3].priority_rank).toBe('low');

    // すべての改善案に proposal_name が保持されていることを確認
    result.forEach((proposal) => {
      expect(proposal.proposal_name).toBeDefined();
      expect(typeof proposal.proposal_name).toBe('string');
    });
  });
});