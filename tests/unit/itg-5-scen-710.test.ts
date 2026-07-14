import { calculateImprovementProposalPriorityScores } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-710: [normal] 優先度スコアリング機能 - 複数の改善課題が総合スコアに基づいて降順に正確に並び替えられる
  test('複数の改善課題が総合スコアに基づいて降順に正確に並び替えられる', () => {
    const improvement_proposals = [
      {
        proposal_id: 'prop-001',
        title: '栄養バランス改善アルゴリズム',
        business_value_score: 85,
        technical_difficulty_score: 60,
        user_impact_score: 75,
      },
      {
        proposal_id: 'prop-002',
        title: '調理時間予測ロジック最適化',
        business_value_score: 70,
        technical_difficulty_score: 45,
        user_impact_score: 80,
      },
      {
        proposal_id: 'prop-003',
        title: '家族好み学習機能',
        business_value_score: 90,
        technical_difficulty_score: 70,
        user_impact_score: 85,
      },
      {
        proposal_id: 'prop-004',
        title: '食材在庫連携最適化',
        business_value_score: 65,
        technical_difficulty_score: 55,
        user_impact_score: 60,
      },
    ];

    const result = calculateImprovementProposalPriorityScores(improvement_proposals);

    // 結果は降順に並び替えられている
    expect(result).toHaveLength(4);

    // 最上位の課題の総合スコアが最も高いことを検証
    // prop-003: (90 + 70 + 85) / 3 = 81.67
    // prop-001: (85 + 60 + 75) / 3 = 73.33
    // prop-002: (70 + 45 + 80) / 3 = 65
    // prop-004: (65 + 55 + 60) / 3 = 60
    expect(result[0].proposal_id).toBe('prop-003');
    expect(result[0].total_priority_score).toBeCloseTo(81.67, 1);

    // 2番目の課題を検証
    expect(result[1].proposal_id).toBe('prop-001');
    expect(result[1].total_priority_score).toBeCloseTo(73.33, 1);

    // 3番目の課題を検証
    expect(result[2].proposal_id).toBe('prop-002');
    expect(result[2].total_priority_score).toBeCloseTo(65, 1);

    // 最下位の課題の総合スコアが最も低いことを検証
    expect(result[3].proposal_id).toBe('prop-004');
    expect(result[3].total_priority_score).toBeCloseTo(60, 1);

    // 各課題のスコアが降順に並んでいることを確認
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].total_priority_score).toBeGreaterThanOrEqual(
        result[i + 1].total_priority_score
      );
    }

    // 各改善課題が全必須フィールドを持つ
    result.forEach((item) => {
      expect(item).toHaveProperty('proposal_id');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('business_value_score');
      expect(item).toHaveProperty('technical_difficulty_score');
      expect(item).toHaveProperty('user_impact_score');
      expect(item).toHaveProperty('total_priority_score');
      expect(typeof item.proposal_id).toBe('string');
      expect(typeof item.title).toBe('string');
      expect(typeof item.total_priority_score).toBe('number');
    });
  });
});