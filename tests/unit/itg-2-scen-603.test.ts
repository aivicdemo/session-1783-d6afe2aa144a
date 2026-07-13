import { assignPriorityToImprovementProposals } from '../../src/logic/it-1-br-2-1-2-1';

describe('改善提案の優先度自動付与', () => {
  // SCEN-603: [edge] 改善提案の優先度自動付与 - 影響度と実装難度が同一の複数提案に対して同じ優先度ランクが付与される
  test('should assign identical priority rank and score to multiple proposals with same impact and difficulty', () => {
    // 手順: 影響度が「高」かつ実装難度が「中」の改善提案A、B、Cを作成し、優先度自動付与機能を実行
    const proposals = [
      {
        proposal_id: 'imp_001',
        title: '改善提案A',
        impact_level: 'high',
        implementation_difficulty: 'medium',
      },
      {
        proposal_id: 'imp_002',
        title: '改善提案B',
        impact_level: 'high',
        implementation_difficulty: 'medium',
      },
      {
        proposal_id: 'imp_003',
        title: '改善提案C',
        impact_level: 'high',
        implementation_difficulty: 'medium',
      },
    ];

    const result = assignPriorityToImprovementProposals(proposals);

    // 期待結果: 3つの提案に同じ優先度ランクが付与されること
    expect(result[0].priority_rank).toBe(2);
    expect(result[1].priority_rank).toBe(2);
    expect(result[2].priority_rank).toBe(2);

    // 期待結果: 3つの提案に同一のスコア値が計算されること
    const expected_score = 75;
    expect(result[0].priority_score).toBe(expected_score);
    expect(result[1].priority_score).toBe(expected_score);
    expect(result[2].priority_score).toBe(expected_score);

    // 期待結果: 優先度自動付与ロジックが一貫性を保つこと
    expect(result[0].priority_rank).toEqual(result[1].priority_rank);
    expect(result[1].priority_rank).toEqual(result[2].priority_rank);
    expect(result[0].priority_score).toEqual(result[1].priority_score);
    expect(result[1].priority_score).toEqual(result[2].priority_score);
  });
});