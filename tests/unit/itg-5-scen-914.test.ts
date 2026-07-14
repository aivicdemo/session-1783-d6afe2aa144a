import { rankImprovementProposalsByScore } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの成功・失敗パターン分析と改善提案', () => {
  // SCEN-914: [edge] 改善提案優先順位付け機能 - 複数提案のスコアが完全に同一の場合に同一優先度ランクが付与される
  test('同一スコアを持つ複数提案に対して同一の優先度ランクが付与され、以降のランクが正しくスキップされること', () => {
    const proposals = [
      {
        proposalId: 'prop_001',
        title: 'アルゴリズム修正A',
        businessValue: 8,
        technicalDifficulty: 5,
        userImpactScore: 7,
      },
      {
        proposalId: 'prop_002',
        title: 'パラメータ調整B',
        businessValue: 8,
        technicalDifficulty: 5,
        userImpactScore: 7,
      },
      {
        proposalId: 'prop_003',
        title: 'パラメータ調整C',
        businessValue: 8,
        technicalDifficulty: 5,
        userImpactScore: 7,
      },
      {
        proposalId: 'prop_004',
        title: '新機能D',
        businessValue: 6,
        technicalDifficulty: 8,
        userImpactScore: 5,
      },
    ];

    const result = rankImprovementProposalsByScore(proposals);

    expect(result).toEqual([
      {
        proposalId: 'prop_001',
        title: 'アルゴリズム修正A',
        businessValue: 8,
        technicalDifficulty: 5,
        userImpactScore: 7,
        totalScore: 85,
        priorityRank: 1,
      },
      {
        proposalId: 'prop_002',
        title: 'パラメータ調整B',
        businessValue: 8,
        technicalDifficulty: 5,
        userImpactScore: 7,
        totalScore: 85,
        priorityRank: 1,
      },
      {
        proposalId: 'prop_003',
        title: 'パラメータ調整C',
        businessValue: 8,
        technicalDifficulty: 5,
        userImpactScore: 7,
        totalScore: 85,
        priorityRank: 1,
      },
      {
        proposalId: 'prop_004',
        title: '新機能D',
        businessValue: 6,
        technicalDifficulty: 8,
        userImpactScore: 5,
        totalScore: 63,
        priorityRank: 4,
      },
    ]);

    const ranksOfHighScorers = result
      .filter((p) => p.totalScore === 85)
      .map((p) => p.priorityRank);
    expect(ranksOfHighScorers).toEqual([1, 1, 1]);
    expect(result[3].priorityRank).toBe(4);
  });
});