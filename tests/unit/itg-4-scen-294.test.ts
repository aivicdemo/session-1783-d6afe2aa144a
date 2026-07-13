import { generateImprovementProposalReport } from '../../src/logic/it-3-br-6-3-3';

describe('予測精度低下要因の可視化ダッシュボード', () => {
  // SCEN-294: [edge] 改善提案書生成時の要因別スコアリング - スコアがすべて同一値の場合に安定して同じ順序で出力される
  test('要因別スコアがすべて同一値の場合、複数回実行で出力順序が常に同じであること', () => {
    const test_proposals = [
      {
        proposal_id: 'PROP_001',
        quality_score: 75,
        cost_reduction_score: 75,
        lead_time_improvement_score: 75,
        supply_chain_stability_score: 75,
        registered_at: new Date('2024-01-01T09:00:00Z'),
      },
      {
        proposal_id: 'PROP_002',
        quality_score: 75,
        cost_reduction_score: 75,
        lead_time_improvement_score: 75,
        supply_chain_stability_score: 75,
        registered_at: new Date('2024-01-02T10:00:00Z'),
      },
      {
        proposal_id: 'PROP_003',
        quality_score: 75,
        cost_reduction_score: 75,
        lead_time_improvement_score: 75,
        supply_chain_stability_score: 75,
        registered_at: new Date('2024-01-03T11:00:00Z'),
      },
    ];

    // 初回実行の結果を取得
    const first_execution = generateImprovementProposalReport(test_proposals);
    const first_order = first_execution.proposals.map(
      (p: { proposal_id: string }) => p.proposal_id
    );

    // 2回目から5回目までの実行結果と順序を比較
    for (let i = 0; i < 4; i++) {
      const current_execution = generateImprovementProposalReport(test_proposals);
      const current_order = current_execution.proposals.map(
        (p: { proposal_id: string }) => p.proposal_id
      );
      expect(current_order).toEqual(first_order);
    }

    // 期待される順序は登録順序（registered_at による安定ソート）
    expect(first_order).toEqual(['PROP_001', 'PROP_002', 'PROP_003']);

    // 複合スコア値が正しく計算されていることを確認
    first_execution.proposals.forEach(
      (proposal: {
        proposal_id: string;
        composite_score: number;
        quality_score: number;
        cost_reduction_score: number;
        lead_time_improvement_score: number;
        supply_chain_stability_score: number;
      }) => {
        const expected_composite_score =
          (proposal.quality_score +
            proposal.cost_reduction_score +
            proposal.lead_time_improvement_score +
            proposal.supply_chain_stability_score) /
          4;
        expect(proposal.composite_score).toBe(expected_composite_score);
        expect(proposal.composite_score).toBe(75);
      }
    );
  });
});