import { calculateAndRankImprovementProposals } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の分類と失敗パターン特定 - 総合スコア算出・課題順位付け', () => {
  // SCEN-716: [edge] 総合スコア算出・課題順位付け機能 - スコアが0点または100点の境界値課題が正確に処理される
  test('should correctly process boundary value proposals with scores of 0, 50, and 100 points', () => {
    // テストデータ: スコアが0点の課題を1件作成
    const zeroScoreProposal = {
      proposal_id: 'prop-0001',
      title: 'Low priority proposal',
      kpi_contribution_score: 10,
      implementation_difficulty_score: 50,
      user_impact_score: 40,
    };

    // テストデータ: スコアが100点の課題を1件作成
    const maxScoreProposal = {
      proposal_id: 'prop-0002',
      title: 'High priority proposal',
      kpi_contribution_score: 100,
      implementation_difficulty_score: 100,
      user_impact_score: 100,
    };

    // テストデータ: スコアが50点の通常課題を1件作成
    const midScoreProposal = {
      proposal_id: 'prop-0003',
      title: 'Medium priority proposal',
      kpi_contribution_score: 50,
      implementation_difficulty_score: 50,
      user_impact_score: 50,
    };

    // 総合スコア算出・課題順位付け機能を実行
    const input = {
      proposals: [zeroScoreProposal, maxScoreProposal, midScoreProposal],
    };
    const result = calculateAndRankImprovementProposals(input);

    // 0点課題の順位が正確に計算されていることを検証
    const zeroScoreSorted = result.ranked_proposals.find(
      (p) => p.proposal_id === 'prop-0001'
    );
    expect(zeroScoreSorted?.overall_score).toBe(0);
    expect(zeroScoreSorted?.rank).toBe(3);

    // 100点課題の順位が正確に計算されていることを検証
    const maxScoreSorted = result.ranked_proposals.find(
      (p) => p.proposal_id === 'prop-0002'
    );
    expect(maxScoreSorted?.overall_score).toBe(100);
    expect(maxScoreSorted?.rank).toBe(1);

    // 50点課題の順位が正確に計算されていることを検証
    const midScoreSorted = result.ranked_proposals.find(
      (p) => p.proposal_id === 'prop-0003'
    );
    expect(midScoreSorted?.overall_score).toBe(50);
    expect(midScoreSorted?.rank).toBe(2);

    // 課題の順位付けが昇順で正確に行われていることを確認
    expect(result.ranked_proposals[0].rank).toBe(1);
    expect(result.ranked_proposals[1].rank).toBe(2);
    expect(result.ranked_proposals[2].rank).toBe(3);

    // 総合スコアが0点、50点、100点の3段階で正確に反映されていることを検証
    expect(result.ranked_proposals[0].overall_score).toBe(100);
    expect(result.ranked_proposals[1].overall_score).toBe(50);
    expect(result.ranked_proposals[2].overall_score).toBe(0);

    // 境界値課題が他の課題と比較して正しく位置付けされていることを確認
    const highestRanked = result.ranked_proposals[0];
    const lowestRanked = result.ranked_proposals[2];
    expect(highestRanked.overall_score).toBeGreaterThan(
      result.ranked_proposals[1].overall_score
    );
    expect(result.ranked_proposals[1].overall_score).toBeGreaterThan(
      lowestRanked.overall_score
    );

    // 結果が3件すべて返されていることを確認
    expect(result.ranked_proposals).toHaveLength(3);

    // ランクが連番であることを確認
    const ranks = result.ranked_proposals.map((p) => p.rank);
    expect(ranks).toEqual([1, 2, 3]);
  });
});