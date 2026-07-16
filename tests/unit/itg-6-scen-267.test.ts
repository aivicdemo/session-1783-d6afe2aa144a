import { assignPriorityRankToImprovementProposal } from '../../src/logic/it-1-br-8-2-1-1';

describe('改善提案優先度付与機能 - 影響度と実装難度の2軸評価から優先度ランク自動付与', () => {
  // SCEN-267
  test('改善提案の影響度と実装難度の2軸評価に基づいて優先度ランク（高・中・低）が正確に自動付与される', () => {
    // テスト用の改善提案データを複数準備（全9パターン）
    const testCases = [
      // 影響度「高」×実装難度「低」→ 優先度「高」
      {
        proposal_id: 'prop_001',
        impact_level: 'high',
        implementation_difficulty: 'low',
        expected_priority_rank: 'high',
      },
      // 影響度「高」×実装難度「中」→ 優先度「高」
      {
        proposal_id: 'prop_002',
        impact_level: 'high',
        implementation_difficulty: 'medium',
        expected_priority_rank: 'high',
      },
      // 影響度「高」×実装難度「高」→ 優先度「中」
      {
        proposal_id: 'prop_003',
        impact_level: 'high',
        implementation_difficulty: 'high',
        expected_priority_rank: 'medium',
      },
      // 影響度「中」×実装難度「低」→ 優先度「高」
      {
        proposal_id: 'prop_004',
        impact_level: 'medium',
        implementation_difficulty: 'low',
        expected_priority_rank: 'high',
      },
      // 影響度「中」×実装難度「中」→ 優先度「中」
      {
        proposal_id: 'prop_005',
        impact_level: 'medium',
        implementation_difficulty: 'medium',
        expected_priority_rank: 'medium',
      },
      // 影響度「中」×実装難度「高」→ 優先度「低」
      {
        proposal_id: 'prop_006',
        impact_level: 'medium',
        implementation_difficulty: 'high',
        expected_priority_rank: 'low',
      },
      // 影響度「低」×実装難度「低」→ 優先度「中」
      {
        proposal_id: 'prop_007',
        impact_level: 'low',
        implementation_difficulty: 'low',
        expected_priority_rank: 'medium',
      },
      // 影響度「低」×実装難度「中」→ 優先度「低」
      {
        proposal_id: 'prop_008',
        impact_level: 'low',
        implementation_difficulty: 'medium',
        expected_priority_rank: 'low',
      },
      // 影響度「低」×実装難度「高」→ 優先度「低」
      {
        proposal_id: 'prop_009',
        impact_level: 'low',
        implementation_difficulty: 'high',
        expected_priority_rank: 'low',
      },
    ];

    // すべての評価パターン（全9パターン）について優先度ランクが正しく付与されることを確認
    testCases.forEach((testCase) => {
      const result = assignPriorityRankToImprovementProposal({
        proposal_id: testCase.proposal_id,
        impact_level: testCase.impact_level,
        implementation_difficulty: testCase.implementation_difficulty,
      });

      // 優先度ランクが期待値と一致することを検証
      expect(result.priority_rank).toBe(testCase.expected_priority_rank);

      // 評価結果がシステムに正常に保存されるための必須フィールドが存在することを検証
      expect(result.proposal_id).toBe(testCase.proposal_id);
      expect(result.impact_level).toBe(testCase.impact_level);
      expect(result.implementation_difficulty).toBe(testCase.implementation_difficulty);
      expect(result.assigned_at).toBeDefined();
      expect(typeof result.assigned_at).toBe('string');
    });

    // 具体的な重要なケース（影響度「高」×実装難度「低」）の詳細検証
    const highImpactLowDifficultyResult = assignPriorityRankToImprovementProposal({
      proposal_id: 'prop_high_priority',
      impact_level: 'high',
      implementation_difficulty: 'low',
    });
    expect(highImpactLowDifficultyResult.priority_rank).toBe('high');
    expect(highImpactLowDifficultyResult.proposal_id).toBe('prop_high_priority');

    // 具体的な重要なケース（影響度「中」×実装難度「中」）の詳細検証
    const mediumImpactMediumDifficultyResult = assignPriorityRankToImprovementProposal({
      proposal_id: 'prop_medium_priority',
      impact_level: 'medium',
      implementation_difficulty: 'medium',
    });
    expect(mediumImpactMediumDifficultyResult.priority_rank).toBe('medium');
    expect(mediumImpactMediumDifficultyResult.proposal_id).toBe('prop_medium_priority');

    // 具体的な重要なケース（影響度「低」×実装難度「高」）の詳細検証
    const lowImpactHighDifficultyResult = assignPriorityRankToImprovementProposal({
      proposal_id: 'prop_low_priority',
      impact_level: 'low',
      implementation_difficulty: 'high',
    });
    expect(lowImpactHighDifficultyResult.priority_rank).toBe('low');
    expect(lowImpactHighDifficultyResult.proposal_id).toBe('prop_low_priority');
  });
});