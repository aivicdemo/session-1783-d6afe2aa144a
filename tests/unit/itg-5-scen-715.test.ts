import { sortImprovementProposalsByScore } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-715: [normal] 総合スコア算出・課題順位付け機能 - 総合スコアの高い順に改善課題が正確に並び替えられる
  test('should sort improvement proposals by comprehensive score in descending order with consistent ordering for equal scores', () => {
    // 【準備】複数の改善課題データ（異なる総合スコア値を持つ）を準備
    const improvement_proposals = [
      {
        proposal_id: 'prop_001',
        proposal_title: '栄養バランス分析ロジックの改善',
        business_value_score: 85,
        technical_difficulty_score: 60,
        user_impact_score: 75,
        comprehensive_score: 73,
      },
      {
        proposal_id: 'prop_002',
        proposal_title: '家族の好み学習アルゴリズム強化',
        business_value_score: 90,
        technical_difficulty_score: 70,
        user_impact_score: 88,
        comprehensive_score: 82,
      },
      {
        proposal_id: 'prop_003',
        proposal_title: '調理時間予測モデルの精度向上',
        business_value_score: 80,
        technical_difficulty_score: 65,
        user_impact_score: 80,
        comprehensive_score: 75,
      },
      {
        proposal_id: 'prop_004',
        proposal_title: '食材在庫連携システムの拡張',
        business_value_score: 70,
        technical_difficulty_score: 50,
        user_impact_score: 65,
        comprehensive_score: 62,
      },
      {
        proposal_id: 'prop_005',
        proposal_title: '食事制限条件の自動検出',
        business_value_score: 88,
        technical_difficulty_score: 75,
        user_impact_score: 82,
        comprehensive_score: 82,
      },
      {
        proposal_id: 'prop_006',
        proposal_title: 'UI/UX改善による離脱削減',
        business_value_score: 75,
        technical_difficulty_score: 45,
        user_impact_score: 70,
        comprehensive_score: 63,
      },
    ];

    // 【実行】課題一覧に対して総合スコアの降順でソート処理を実行
    const sorted_proposals = sortImprovementProposalsByScore(improvement_proposals);

    // 【検証1】最初の課題の総合スコアが最も高いことを確認
    expect(sorted_proposals[0].comprehensive_score).toBe(82);
    expect(sorted_proposals[0].proposal_id).toBe('prop_002');

    // 【検証2】各課題間のスコア値が降順になっていることを確認
    expect(sorted_proposals[0].comprehensive_score).toBe(82);
    expect(sorted_proposals[1].comprehensive_score).toBe(82);
    expect(sorted_proposals[2].comprehensive_score).toBe(75);
    expect(sorted_proposals[3].comprehensive_score).toBe(73);
    expect(sorted_proposals[4].comprehensive_score).toBe(63);
    expect(sorted_proposals[5].comprehensive_score).toBe(62);

    // 【検証3】最後の課題の総合スコアが最も低いことを確認
    expect(sorted_proposals[5].comprehensive_score).toBe(62);
    expect(sorted_proposals[5].proposal_id).toBe('prop_004');

    // 【検証4】同一スコア値を持つ課題が存在する場合、その相対的な順序が一貫していることを確認
    // prop_002 (score 82) と prop_005 (score 82) が連続して並んでいることを確認
    const equal_score_proposals = sorted_proposals.filter(
      (p) => p.comprehensive_score === 82
    );
    expect(equal_score_proposals.length).toBe(2);
    expect(equal_score_proposals[0].proposal_id).toBe('prop_002');
    expect(equal_score_proposals[1].proposal_id).toBe('prop_005');

    // 【検証5】ソート結果全体が総合スコアで単調非増加になっていることを最終確認
    for (let i = 0; i < sorted_proposals.length - 1; i++) {
      expect(sorted_proposals[i].comprehensive_score).toBeGreaterThanOrEqual(
        sorted_proposals[i + 1].comprehensive_score
      );
    }

    // 【検証6】ソート処理で元の配列の要素数が変わらないことを確認
    expect(sorted_proposals.length).toBe(improvement_proposals.length);

    // 【検証7】すべての proposal_id が保持されていることを確認
    const sorted_ids = sorted_proposals.map((p) => p.proposal_id).sort();
    const original_ids = improvement_proposals
      .map((p) => p.proposal_id)
      .sort();
    expect(sorted_ids).toEqual(original_ids);
  });
});