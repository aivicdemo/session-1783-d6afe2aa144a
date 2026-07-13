import { calculateImprovementProposalPriority } from '../../src/logic/it-1-br-2-1-2-1';

describe('改善提案の優先度自動付与機能', () => {
  // SCEN-602
  test('影響度または実装難度が未入力の改善提案に対してエラーが発生する', () => {
    // 影響度が未入力の場合
    const proposalMissingImpact = {
      title: '栄養バランス改善ロジック',
      description: '栄養項目ごとの推奨値達成率を向上させるため、献立生成アルゴリズムを改善する提案',
      impact: null,
      implementationDifficulty: 7,
    };

    expect(() => calculateImprovementProposalPriority(proposalMissingImpact)).toThrow(/影響度/);

    // 実装難度が未入力の場合
    const proposalMissingDifficulty = {
      title: '栄養バランス改善ロジック',
      description: '栄養項目ごとの推奨値達成率を向上させるため、献立生成アルゴリズムを改善する提案',
      impact: 8,
      implementationDifficulty: null,
    };

    expect(() => calculateImprovementProposalPriority(proposalMissingDifficulty)).toThrow(/実装難度/);

    // 影響度と実装難度の両方が未入力の場合
    const proposalMissingBoth = {
      title: '栄養バランス改善ロジック',
      description: '栄養項目ごとの推奨値達成率を向上させるため、献立生成アルゴリズムを改善する提案',
      impact: null,
      implementationDifficulty: null,
    };

    expect(() => calculateImprovementProposalPriority(proposalMissingBoth)).toThrow(/影響度/);

    // 影響度と実装難度の両方が入力されている場合は正常に処理される
    const proposalComplete = {
      title: '栄養バランス改善ロジック',
      description: '栄養項目ごとの推奨値達成率を向上させるため、献立生成アルゴリズムを改善する提案',
      impact: 8,
      implementationDifficulty: 7,
    };

    const result = calculateImprovementProposalPriority(proposalComplete);
    expect(result).toHaveProperty('priorityRank');
    expect(['高', '中', '低']).toContain(result.priorityRank);
    expect(result).toHaveProperty('priorityScore');
    expect(typeof result.priorityScore).toBe('number');
  });
});