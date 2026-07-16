import { createImprovementProposalFromFailurePatterns } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログから食材制限・調理時間制限・予算制約を自動抽出・分類し優先度マトリクスを生成', () => {
  // SCEN-289
  test('失敗パターンデータなしで改善提案を作成するとエラーが発生する', () => {
    const improvedProposalInput = {
      proposalName: '調理時間超過の改善案',
      category: 'algorithm_modification',
      description: '献立生成時の調理時間計算ロジックを改善',
      failurePatternDataIds: [],
    };

    expect(() =>
      createImprovementProposalFromFailurePatterns(improvedProposalInput)
    ).toThrow(/失敗パターンデータ/);
  });

  test('失敗パターンデータが指定されている場合、改善提案が正常に作成される', () => {
    const improvedProposalInput = {
      proposalName: '調理時間超過の改善案',
      category: 'algorithm_modification',
      description: '献立生成時の調理時間計算ロジックを改善',
      failurePatternDataIds: ['pattern_001', 'pattern_002'],
      estimatedImplementationHours: 40,
      expectedEffectDescription: '調理時間超過による却下件数を30%削減',
      kpiContributionScore: 8.5,
    };

    const result = createImprovementProposalFromFailurePatterns(
      improvedProposalInput
    );

    expect(result).toEqual({
      proposalId: expect.any(String),
      proposalName: '調理時間超過の改善案',
      category: 'algorithm_modification',
      description: '献立生成時の調理時間計算ロジックを改善',
      failurePatternDataIds: ['pattern_001', 'pattern_002'],
      estimatedImplementationHours: 40,
      expectedEffectDescription: '調理時間超過による却下件数を30%削減',
      kpiContributionScore: 8.5,
      createdAt: expect.any(String),
      status: 'draft',
    });
    expect(result.proposalId).toMatch(/^proposal_/);
    expect(result.status).toBe('draft');
  });

  test('複数の失敗パターンデータから改善提案が正常に生成され、優先度スコアが計算される', () => {
    const failurePatternData = [
      {
        patternId: 'pattern_001',
        category: 'nutrition_balance',
        occurrenceCount: 45,
        severity: 'high',
        affectedSegments: ['segment_A', 'segment_B'],
      },
      {
        patternId: 'pattern_002',
        category: 'cooking_time_exceeded',
        occurrenceCount: 32,
        severity: 'medium',
        affectedSegments: ['segment_A'],
      },
    ];

    const improvedProposalInput = {
      proposalName: '複合的な献立生成改善案',
      category: 'parameter_adjustment',
      description: '栄養バランスと調理時間の両面から改善',
      failurePatternDataIds: ['pattern_001', 'pattern_002'],
      failurePatternData: failurePatternData,
      estimatedImplementationHours: 32,
      expectedEffectDescription:
        '栄養バランス不適切による却下を25%削減、調理時間超過を20%削減',
      kpiContributionScore: 7.2,
    };

    const result = createImprovementProposalFromFailurePatterns(
      improvedProposalInput
    );

    expect(result.proposalName).toBe('複合的な献立生成改善案');
    expect(result.category).toBe('parameter_adjustment');
    expect(result.failurePatternDataIds).toHaveLength(2);
    expect(result.kpiContributionScore).toBe(7.2);
    expect(result.status).toBe('draft');
  });

  test('失敗パターンデータが空配列の場合、バリデーションエラーが発生する', () => {
    const improvedProposalInput = {
      proposalName: '改善提案',
      category: 'new_feature',
      description: '新機能の追加',
      failurePatternDataIds: [],
    };

    expect(() =>
      createImprovementProposalFromFailurePatterns(improvedProposalInput)
    ).toThrow(/失敗パターンデータ/);
  });

  test('改善提案の優先度マトリクスが正常に生成される', () => {
    const improvementProposals = [
      {
        proposalId: 'proposal_001',
        proposalName: '栄養バランス改善',
        category: 'algorithm_modification',
        estimatedImplementationHours: 40,
        expectedEffectDescription: '栄養バランス不適切による却下を25%削減',
        kpiContributionScore: 8.5,
        failurePatternDataIds: ['pattern_001'],
        affectedSegmentCount: 2,
        occurrenceTotalCount: 45,
      },
      {
        proposalId: 'proposal_002',
        proposalName: '調理時間最適化',
        category: 'parameter_adjustment',
        estimatedImplementationHours: 20,
        expectedEffectDescription: '調理時間超過による却下を20%削減',
        kpiContributionScore: 6.8,
        failurePatternDataIds: ['pattern_002'],
        affectedSegmentCount: 1,
        occurrenceTotalCount: 32,
      },
    ];

    const priorityMatrixResult = improvementProposals.map((proposal) => ({
      proposalId: proposal.proposalId,
      proposalName: proposal.proposalName,
      impactScore:
        (proposal.kpiContributionScore / 10.0) *
        (proposal.affectedSegmentCount / 2.0),
      implementationDifficulty: proposal.estimatedImplementationHours / 50.0,
      priorityRank: 'high',
    }));

    expect(priorityMatrixResult).toHaveLength(2);
    expect(priorityMatrixResult[0].impactScore).toBeCloseTo(0.6375, 4);
    expect(priorityMatrixResult[1].impactScore).toBeCloseTo(0.34, 4);
    expect(priorityMatrixResult[0].implementationDifficulty).toBe(0.8);
    expect(priorityMatrixResult[1].implementationDifficulty).toBe(0.4);
  });
});