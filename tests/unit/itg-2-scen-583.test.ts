import { sortImprovementProposalsByPriorityAndEvaluationDate } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士による改善案検証評価 - 優先度同一時の評価日時ソート', () => {
  // SCEN-583
  test('同一優先度の改善案が評価日時で正しくソートされる（昇順・降順切り替え対応）', () => {
    // 準備: 同一優先度（優先度3）で異なる評価日時の改善案データ
    const improvementProposals = [
      {
        id: 'proposal_001',
        priority: 3,
        evaluatedAt: new Date('2024-01-15T10:00:00Z').toISOString(),
        title: '栄養項目A改善案',
        description: '栄養基準値の見直し',
      },
      {
        id: 'proposal_002',
        priority: 3,
        evaluatedAt: new Date('2024-01-15T09:30:00Z').toISOString(),
        title: '栄養項目B改善案',
        description: 'アレルギー対応の強化',
      },
      {
        id: 'proposal_003',
        priority: 3,
        evaluatedAt: new Date('2024-01-15T11:00:00Z').toISOString(),
        title: '栄養項目C改善案',
        description: '調理時間短縮ロジック',
      },
    ];

    // 実行: 昇順ソート（古い評価日時から新しい順）
    const sortedAscending = sortImprovementProposalsByPriorityAndEvaluationDate(
      improvementProposals,
      'asc'
    );

    // 検証: 昇順の順序確認
    expect(sortedAscending[0].id).toBe('proposal_002');
    expect(sortedAscending[0].evaluatedAt).toBe(
      new Date('2024-01-15T09:30:00Z').toISOString()
    );
    expect(sortedAscending[1].id).toBe('proposal_001');
    expect(sortedAscending[1].evaluatedAt).toBe(
      new Date('2024-01-15T10:00:00Z').toISOString()
    );
    expect(sortedAscending[2].id).toBe('proposal_003');
    expect(sortedAscending[2].evaluatedAt).toBe(
      new Date('2024-01-15T11:00:00Z').toISOString()
    );

    // 実行: 降順ソート（新しい評価日時から古い順）
    const sortedDescending = sortImprovementProposalsByPriorityAndEvaluationDate(
      improvementProposals,
      'desc'
    );

    // 検証: 降順の順序確認
    expect(sortedDescending[0].id).toBe('proposal_003');
    expect(sortedDescending[0].evaluatedAt).toBe(
      new Date('2024-01-15T11:00:00Z').toISOString()
    );
    expect(sortedDescending[1].id).toBe('proposal_001');
    expect(sortedDescending[1].evaluatedAt).toBe(
      new Date('2024-01-15T10:00:00Z').toISOString()
    );
    expect(sortedDescending[2].id).toBe('proposal_002');
    expect(sortedDescending[2].evaluatedAt).toBe(
      new Date('2024-01-15T09:30:00Z').toISOString()
    );

    // 検証: すべての改善案が同一優先度（3）を保持していることを確認
    expect(sortedAscending.every((p) => p.priority === 3)).toBe(true);
    expect(sortedDescending.every((p) => p.priority === 3)).toBe(true);

    // 検証: ソート後も入力データの数が変わらないこと
    expect(sortedAscending.length).toBe(3);
    expect(sortedDescending.length).toBe(3);

    // 検証: タイムスタンプの秒単位の差異が正しく識別されることを確認
    const timeDiff1 = new Date(sortedAscending[1].evaluatedAt).getTime() -
      new Date(sortedAscending[0].evaluatedAt).getTime();
    expect(timeDiff1).toBe(30 * 60 * 1000); // 30分 = 1,800,000ミリ秒

    const timeDiff2 = new Date(sortedAscending[2].evaluatedAt).getTime() -
      new Date(sortedAscending[1].evaluatedAt).getTime();
    expect(timeDiff2).toBe(60 * 60 * 1000); // 60分 = 3,600,000ミリ秒
  });
});