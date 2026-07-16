import { evaluateImprovementProposalPriority } from '../../src/logic/it-1-br-8-2-1-1';

describe('改善提案優先度評価機能', () => {
  // SCEN-295
  test('改善提案ごとにKPI寄与度・実装難度・ユーザー影響度が正しく評価される', () => {
    // テストデータ: 3件以上の改善提案を準備
    const proposals = [
      {
        id: 'proposal_001',
        name: '栄養バランス改善アルゴリズム修正',
        category: 'algorithm_modification',
        affectedUserSegments: ['stay_at_home_father'],
        affectedNutritionItems: ['protein', 'calcium'],
        affectedDietaryRestrictionTypes: ['allergy_fish'],
      },
      {
        id: 'proposal_002',
        name: '調理時間短縮パラメータ調整',
        category: 'parameter_adjustment',
        affectedUserSegments: ['stay_at_home_father', 'busy_professional'],
        affectedNutritionItems: ['vitamin_a', 'iron'],
        affectedDietaryRestrictionTypes: ['allergy_egg', 'vegetarian'],
      },
      {
        id: 'proposal_003',
        name: '家族好み学習新機能追加',
        category: 'new_feature',
        affectedUserSegments: ['stay_at_home_father', 'health_conscious'],
        affectedNutritionItems: ['sodium'],
        affectedDietaryRestrictionTypes: ['low_sodium'],
      },
    ];

    // 改善提案優先度評価機能を初期化して評価を実行
    const evaluationResult = evaluateImprovementProposalPriority({
      proposals,
      evaluationCriteria: {
        kpiContributionWeights: {
          algorithm_modification: 0.8,
          parameter_adjustment: 0.6,
          new_feature: 0.9,
        },
        implementationDifficultyScale: 1.0, // 1-10 スケール
        userImpactMultiplier: 1.2,
      },
      evaluationPeriod: {
        startDate: '2024-01-01',
        endDate: '2024-03-31',
      },
    });

    // 期待値計算: KPI寄与度の具体値
    // proposal_001: 0.8 * 1.0 (基本値) = 0.8
    // proposal_002: 0.6 * 1.0 (基本値) = 0.6
    // proposal_003: 0.9 * 1.0 (基本値) = 0.9
    expect(evaluationResult.proposals[0].kpiContribution).toBe(0.8);
    expect(evaluationResult.proposals[1].kpiContribution).toBe(0.6);
    expect(evaluationResult.proposals[2].kpiContribution).toBe(0.9);

    // 期待値計算: 実装難度の具体値
    // proposal_001 (algorithm_modification): 難度 7
    // proposal_002 (parameter_adjustment): 難度 4
    // proposal_003 (new_feature): 難度 9
    expect(evaluationResult.proposals[0].implementationDifficulty).toBe(7);
    expect(evaluationResult.proposals[1].implementationDifficulty).toBe(4);
    expect(evaluationResult.proposals[2].implementationDifficulty).toBe(9);

    // 期待値計算: ユーザー影響度の具体値
    // proposal_001: 1 affected segment * 2 nutrition items * 1.2 multiplier = 2.4
    // proposal_002: 2 affected segments * 2 nutrition items * 1.2 multiplier = 4.8
    // proposal_003: 2 affected segments * 1 nutrition item * 1.2 multiplier = 2.4
    expect(evaluationResult.proposals[0].userImpact).toBe(2.4);
    expect(evaluationResult.proposals[1].userImpact).toBe(4.8);
    expect(evaluationResult.proposals[2].userImpact).toBe(2.4);

    // 総合優先度スコア計算: (KPI寄与度 * 0.4 + ユーザー影響度 * 0.4) / 実装難度 * 0.2
    // proposal_001: (0.8 * 0.4 + 2.4 * 0.4) / 7 * 0.2 = (0.32 + 0.96) / 7 * 0.2 = 1.28 / 7 * 0.2 = 0.0366
    // proposal_002: (0.6 * 0.4 + 4.8 * 0.4) / 4 * 0.2 = (0.24 + 1.92) / 4 * 0.2 = 2.16 / 4 * 0.2 = 0.108
    // proposal_003: (0.9 * 0.4 + 2.4 * 0.4) / 9 * 0.2 = (0.36 + 0.96) / 9 * 0.2 = 1.32 / 9 * 0.2 = 0.0293
    expect(evaluationResult.proposals[0].priorityScore).toBeCloseTo(0.0366, 4);
    expect(evaluationResult.proposals[1].priorityScore).toBeCloseTo(0.108, 4);
    expect(evaluationResult.proposals[2].priorityScore).toBeCloseTo(0.0293, 4);

    // 優先度ランク付け (スコアに基づいて自動付与)
    // proposal_002 が最高スコア (0.108) → rank 1
    // proposal_001 が次 (0.0366) → rank 2
    // proposal_003 が最低 (0.0293) → rank 3
    expect(evaluationResult.proposals[1].priorityRank).toBe(1);
    expect(evaluationResult.proposals[0].priorityRank).toBe(2);
    expect(evaluationResult.proposals[2].priorityRank).toBe(3);

    // 評価結果の整合性検証
    expect(evaluationResult.evaluationStatus).toBe('completed');
    expect(evaluationResult.totalProposalsEvaluated).toBe(3);
    expect(evaluationResult.evaluationTimestamp).toBeDefined();

    // 提案 A (proposal_001) の詳細検証
    const proposalA = evaluationResult.proposals[0];
    expect(proposalA.id).toBe('proposal_001');
    expect(proposalA.name).toBe('栄養バランス改善アルゴリズム修正');
    expect(proposalA.kpiContribution).toBe(0.8);
    expect(proposalA.implementationDifficulty).toBe(7);
    expect(proposalA.userImpact).toBe(2.4);
    expect(proposalA.priorityRank).toBe(2);

    // 提案 B (proposal_002) の詳細検証
    const proposalB = evaluationResult.proposals[1];
    expect(proposalB.id).toBe('proposal_002');
    expect(proposalB.name).toBe('調理時間短縮パラメータ調整');
    expect(proposalB.kpiContribution).toBe(0.6);
    expect(proposalB.implementationDifficulty).toBe(4);
    expect(proposalB.userImpact).toBe(4.8);
    expect(proposalB.priorityRank).toBe(1);

    // 提案 C (proposal_003) の詳細検証
    const proposalC = evaluationResult.proposals[2];
    expect(proposalC.id).toBe('proposal_003');
    expect(proposalC.name).toBe('家族好み学習新機能追加');
    expect(proposalC.kpiContribution).toBe(0.9);
    expect(proposalC.implementationDifficulty).toBe(9);
    expect(proposalC.userImpact).toBe(2.4);
    expect(proposalC.priorityRank).toBe(3);

    // 相対的な優先度順位の正確性検証
    const rankedByScore = [...evaluationResult.proposals].sort(
      (a, b) => b.priorityScore - a.priorityScore
    );
    expect(rankedByScore[0].id).toBe('proposal_002');
    expect(rankedByScore[1].id).toBe('proposal_001');
    expect(rankedByScore[2].id).toBe('proposal_003');

    // 優先度スコアの降順を確認
    expect(rankedByScore[0].priorityScore).toBeGreaterThan(rankedByScore[1].priorityScore);
    expect(rankedByScore[1].priorityScore).toBeGreaterThan(rankedByScore[2].priorityScore);

    // 計算ロジック検証: KPI寄与度の根拠が正確に反映されているか
    expect(evaluationResult.proposals.every(p => p.kpiContribution > 0)).toBe(true);
    expect(evaluationResult.proposals.every(p => p.kpiContribution <= 1.0)).toBe(true);

    // 計算ロジック検証: 実装難度が 1-10 スケール内にあるか
    expect(evaluationResult.proposals.every(p => p.implementationDifficulty >= 1)).toBe(true);
    expect(evaluationResult.proposals.every(p => p.implementationDifficulty <= 10)).toBe(true);

    // 計算ロジック検証: ユーザー影響度が正の値か
    expect(evaluationResult.proposals.every(p => p.userImpact > 0)).toBe(true);

    // 計算ロジック検証: 優先度スコアが正の値か
    expect(evaluationResult.proposals.every(p => p.priorityScore > 0)).toBe(true);

    // すべての評価項目が期待値と完全に一致していることを最終確認
    expect({
      proposal_001_kpi: proposalA.kpiContribution,
      proposal_001_difficulty: proposalA.implementationDifficulty,
      proposal_001_impact: proposalA.userImpact,
      proposal_002_kpi: proposalB.kpiContribution,
      proposal_002_difficulty: proposalB.implementationDifficulty,
      proposal_002_impact: proposalB.userImpact,
      proposal_003_kpi: proposalC.kpiContribution,
      proposal_003_difficulty: proposalC.implementationDifficulty,
      proposal_003_impact: proposalC.userImpact,
    }).toEqual({
      proposal_001_kpi: 0.8,
      proposal_001_difficulty: 7,
      proposal_001_impact: 2.4,
      proposal_002_kpi: 0.6,
      proposal_002_difficulty: 4,
      proposal_002_impact: 4.8,
      proposal_003_kpi: 0.9,
      proposal_003_difficulty: 9,
      proposal_003_impact: 2.4,
    });
  });
});