import { prioritizeImprovementProposals } from '../../src/logic/it-1-br-2-1-2-1';

describe('改善提案管理機能 - 優先度付けと一貫性保証', () => {
  test('SCEN-477: 同一優先度の提案に対してソート順序が一貫性を保つ', () => {
    // 前提: 栄養士が複数の改善提案を入力し、同一の優先度レベル（高）を持つ提案が複数件存在
    const proposalSet1 = [
      {
        proposalId: 'PROP-001',
        proposalName: '栄養項目Aの改善案',
        priority: 'HIGH',
        businessValue: 8,
        technicalDifficulty: 5,
        userImpact: 7,
        createdAt: '2024-01-15T09:00:00Z',
        proposalStatus: 'PENDING_APPROVAL'
      },
      {
        proposalId: 'PROP-002',
        proposalName: '栄養項目Bの改善案',
        priority: 'HIGH',
        businessValue: 8,
        technicalDifficulty: 5,
        userImpact: 7,
        createdAt: '2024-01-15T10:30:00Z',
        proposalStatus: 'PENDING_APPROVAL'
      },
      {
        proposalId: 'PROP-003',
        proposalName: '栄養項目Cの改善案',
        priority: 'HIGH',
        businessValue: 8,
        technicalDifficulty: 5,
        userImpact: 7,
        createdAt: '2024-01-15T08:15:00Z',
        proposalStatus: 'PENDING_APPROVAL'
      },
      {
        proposalId: 'PROP-004',
        proposalName: '栄養項目Dの改善案',
        priority: 'HIGH',
        businessValue: 8,
        technicalDifficulty: 5,
        userImpact: 7,
        createdAt: '2024-01-15T11:45:00Z',
        proposalStatus: 'PENDING_APPROVAL'
      }
    ];

    // 発生条件: 提案一覧をソート機能で優先度順に並び替える（1回目）
    const sortedResult1 = prioritizeImprovementProposals(proposalSet1);

    // 期待値（1回目のソート結果）: 同一優先度内は作成日時の昇順
    const expectedOrder1 = [
      'PROP-003', // 08:15:00
      'PROP-001', // 09:00:00
      'PROP-002', // 10:30:00
      'PROP-004'  // 11:45:00
    ];

    expect(sortedResult1.map((p) => p.proposalId)).toEqual(expectedOrder1);

    // 発生条件: ページをリロードし同じソート条件で提案を表示（2回目）
    const sortedResult2 = prioritizeImprovementProposals(proposalSet1);

    // 期待値（2回目のソート結果）: 1回目と同一の順序を保つ
    expect(sortedResult2.map((p) => p.proposalId)).toEqual(expectedOrder1);

    // 発生条件: 複数回（3回目）ページを再読み込みしてソート結果を検証
    const sortedResult3 = prioritizeImprovementProposals(proposalSet1);

    // 期待値（3回目のソート結果）: 1回目・2回目と同一の順序を保つ
    expect(sortedResult3.map((p) => p.proposalId)).toEqual(expectedOrder1);

    // 発生条件: 同一優先度内の副次ソート条件（作成日時）が正しく適用されているか確認
    expect(sortedResult3[0].createdAt).toBe('2024-01-15T08:15:00Z');
    expect(sortedResult3[1].createdAt).toBe('2024-01-15T09:00:00Z');
    expect(sortedResult3[2].createdAt).toBe('2024-01-15T10:30:00Z');
    expect(sortedResult3[3].createdAt).toBe('2024-01-15T11:45:00Z');

    // 期待値: すべての提案が同一優先度（HIGH）を保持
    expect(sortedResult3.every((p) => p.priority === 'HIGH')).toBe(true);

    // 期待値: ソート処理後も提案の件数が変わらない
    expect(sortedResult3.length).toBe(4);

    // 期待値: 各提案のビジネス価値・技術難度・ユーザーインパクトが変更されていない
    expect(sortedResult3[0].businessValue).toBe(8);
    expect(sortedResult3[0].technicalDifficulty).toBe(5);
    expect(sortedResult3[0].userImpact).toBe(7);
    expect(sortedResult3[1].businessValue).toBe(8);
    expect(sortedResult3[1].technicalDifficulty).toBe(5);
    expect(sortedResult3[1].userImpact).toBe(7);
  });
});