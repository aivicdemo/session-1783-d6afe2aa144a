import { evaluateImprovementProposalPriority } from '../../src/logic/it-1-br-8-2-1-1';

describe('ユーザーセグメント別の利用パターン分析ダッシュボード', () => {
  // SCEN-298
  test('改善提案優先度評価機能 - 優先度スコアが同値の提案が複数ある場合に安定したソート順が保証される', () => {
    // テストデータ: 優先度スコアが同一の改善提案を3件以上作成
    const proposal_1 = {
      id: 'PROP-001',
      title: '栄養バランス基準ロジック改善',
      priorityScore: 75,
      businessValue: 8,
      technicalDifficulty: 5,
      userImpactScore: 9,
      createdAt: new Date('2024-01-01T09:00:00Z'),
      proposer: 'nutritionist_a'
    };

    const proposal_2 = {
      id: 'PROP-002',
      title: '調理時間予測アルゴリズム最適化',
      priorityScore: 75,
      businessValue: 8,
      technicalDifficulty: 5,
      userImpactScore: 9,
      createdAt: new Date('2024-01-01T10:30:00Z'),
      proposer: 'nutritionist_b'
    };

    const proposal_3 = {
      id: 'PROP-003',
      title: '食材制限フィルタリング強化',
      priorityScore: 75,
      businessValue: 8,
      technicalDifficulty: 5,
      userImpactScore: 9,
      createdAt: new Date('2024-01-01T08:15:00Z'),
      proposer: 'nutritionist_c'
    };

    const proposal_4 = {
      id: 'PROP-004',
      title: '家族好み学習機能拡張',
      priorityScore: 75,
      businessValue: 8,
      technicalDifficulty: 5,
      userImpactScore: 9,
      createdAt: new Date('2024-01-01T11:45:00Z'),
      proposer: 'nutritionist_d'
    };

    const inputProposals = [proposal_1, proposal_2, proposal_3, proposal_4];

    // 優先度評価機能を実行してソート結果を取得（3回以上繰り返し実行）
    const sortResult_1 = evaluateImprovementProposalPriority(inputProposals);
    const sortResult_2 = evaluateImprovementProposalPriority(inputProposals);
    const sortResult_3 = evaluateImprovementProposalPriority(inputProposals);
    const sortResult_4 = evaluateImprovementProposalPriority(inputProposals);

    // 期待されるソート順序: createdAt の昇順（タイムスタンプに基づくセカンダリソート）
    // proposal_3 (08:15) → proposal_1 (09:00) → proposal_2 (10:30) → proposal_4 (11:45)
    const expectedOrder = ['PROP-003', 'PROP-001', 'PROP-002', 'PROP-004'];

    // 各実行結果を検証: ソート結果の ID 順序が期待値と一致
    expect(sortResult_1.map((p) => p.id)).toEqual(expectedOrder);
    expect(sortResult_2.map((p) => p.id)).toEqual(expectedOrder);
    expect(sortResult_3.map((p) => p.id)).toEqual(expectedOrder);
    expect(sortResult_4.map((p) => p.id)).toEqual(expectedOrder);

    // 全実行結果でソート順序が完全に一致していることを検証
    const id_sequence_1 = sortResult_1.map((p) => p.id).join(',');
    const id_sequence_2 = sortResult_2.map((p) => p.id).join(',');
    const id_sequence_3 = sortResult_3.map((p) => p.id).join(',');
    const id_sequence_4 = sortResult_4.map((p) => p.id).join(',');

    expect(id_sequence_1).toBe(id_sequence_2);
    expect(id_sequence_2).toBe(id_sequence_3);
    expect(id_sequence_3).toBe(id_sequence_4);

    // 同一優先度スコアの提案群について、タイムスタンプに基づく昇順セカンダリソートが適用されていることを確認
    const timestamps = sortResult_1.map((p) => p.createdAt.getTime());
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1]);
    }

    // 優先度スコアが全て同一であることを確認
    const priorityScores = sortResult_1.map((p) => p.priorityScore);
    expect(new Set(priorityScores).size).toBe(1);
    expect(priorityScores[0]).toBe(75);
  });
});