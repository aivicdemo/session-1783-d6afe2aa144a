import { evaluateAlgorithmTechnicalFeasibility } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-728: [edge] 技術実現性評価機能 - 既存アルゴリズムとの依存関係が複雑な提案でも技術実現性を正しく評価できる
  test('複雑な依存関係を持つ提案アルゴリズムの技術実現性を正確に評価し、循環依存検出と影響度分析を実施', () => {
    // テストデータ: 既存アルゴリズム A, B, C の定義
    const algorithmA = {
      algorithmId: 'algo_A',
      algorithmName: 'Base Nutrition Algorithm',
      versionNo: 1,
      status: 'active',
      technicalDifficulty: 2,
      implementationDays: 5,
    };

    const algorithmB = {
      algorithmId: 'algo_B',
      algorithmName: 'User Preference Learning',
      versionNo: 1,
      status: 'active',
      technicalDifficulty: 3,
      implementationDays: 8,
    };

    const algorithmC = {
      algorithmId: 'algo_C',
      algorithmName: 'Budget Optimization',
      versionNo: 1,
      status: 'active',
      technicalDifficulty: 2,
      implementationDays: 6,
    };

    // 既存アルゴリズムのリスト
    const existingAlgorithms = [algorithmA, algorithmB, algorithmC];

    // 依存関係の定義: AとBは相互依存、BとCは階層的依存(BがCに依存)
    const dependencyDefinitions = [
      {
        dependentAlgorithmId: 'algo_A',
        dependsOnAlgorithmId: 'algo_B',
        dependencyType: 'mutual',
        criticalityLevel: 'high',
      },
      {
        dependentAlgorithmId: 'algo_B',
        dependsOnAlgorithmId: 'algo_A',
        dependencyType: 'mutual',
        criticalityLevel: 'high',
      },
      {
        dependentAlgorithmId: 'algo_B',
        dependsOnAlgorithmId: 'algo_C',
        dependencyType: 'hierarchical',
        criticalityLevel: 'medium',
      },
    ];

    // 複雑な依存関係を持つ新規提案アルゴリズム: A, B, C すべてに依存
    const proposalAlgorithm = {
      algorithmId: 'algo_proposal_001',
      algorithmName: 'Integrated Menu Generation with Dependencies',
      proposalDescription: 'Comprehensive algorithm combining nutrition, preference learning, and budget optimization',
      versionNo: 1,
      status: 'under_review',
      technicalDifficulty: 4,
      implementationDays: 15,
      dependsOnAlgorithmIds: ['algo_A', 'algo_B', 'algo_C'],
      dependencyDetails: [
        {
          targetAlgorithmId: 'algo_A',
          dependencyType: 'mandatory',
          criticalityLevel: 'high',
          interfaceComplexity: 'complex',
        },
        {
          targetAlgorithmId: 'algo_B',
          dependencyType: 'mandatory',
          criticalityLevel: 'high',
          interfaceComplexity: 'very_complex',
        },
        {
          targetAlgorithmId: 'algo_C',
          dependencyType: 'optional',
          criticalityLevel: 'medium',
          interfaceComplexity: 'moderate',
        },
      ],
    };

    // 技術実現性評価機能を実行
    const evaluationResult = evaluateAlgorithmTechnicalFeasibility({
      existingAlgorithms,
      dependencyDefinitions,
      proposalAlgorithm,
      evaluationDate: '2024-12-15T10:00:00Z',
      evaluatorId: 'dev_team_001',
    });

    // 検証1: 評価レポートが生成されていること
    expect(evaluationResult).toBeDefined();
    expect(evaluationResult.evaluationId).toBeDefined();
    expect(evaluationResult.proposalAlgorithmId).toBe('algo_proposal_001');

    // 検証2: 依存関係グラフが正しく解析されていること
    expect(evaluationResult.dependencyGraphAnalysis).toBeDefined();
    expect(evaluationResult.dependencyGraphAnalysis.totalDependencies).toBe(3);
    expect(evaluationResult.dependencyGraphAnalysis.hasCyclicDependency).toBe(true);
    expect(evaluationResult.dependencyGraphAnalysis.cyclicDependencyPairs).toContainEqual({
      algorithm1: 'algo_A',
      algorithm2: 'algo_B',
    });

    // 検証3: 各依存元の技術的実現可能性スコアが計算されていること
    // スコア計算: (100 - technicalDifficulty * 10) * (1 - implementationDays / 30)
    // algo_A: (100 - 2*10) * (1 - 5/30) = 80 * 0.833 = 66.64 ≈ 67
    // algo_B: (100 - 3*10) * (1 - 8/30) = 70 * 0.733 = 51.31 ≈ 51
    // algo_C: (100 - 2*10) * (1 - 6/30) = 80 * 0.8 = 64
    expect(evaluationResult.dependencyFeasibilityScores).toBeDefined();
    expect(evaluationResult.dependencyFeasibilityScores['algo_A']).toBe(67);
    expect(evaluationResult.dependencyFeasibilityScores['algo_B']).toBe(51);
    expect(evaluationResult.dependencyFeasibilityScores['algo_C']).toBe(64);

    // 検証4: 循環依存の検出
    expect(evaluationResult.circularDependencyDetection).toBeDefined();
    expect(evaluationResult.circularDependencyDetection.hasCircularDependency).toBe(true);
    expect(evaluationResult.circularDependencyDetection.circularChains).toHaveLength(1);
    expect(evaluationResult.circularDependencyDetection.circularChains[0]).toEqual(['algo_A', 'algo_B']);

    // 検証5: 依存関係チェーン全体を通じた影響度分析
    // 提案は A, B, C に依存、B は C に依存するため、チェーン深度は3
    expect(evaluationResult.impactAnalysis).toBeDefined();
    expect(evaluationResult.impactAnalysis.dependencyChainDepth).toBe(3);
    expect(evaluationResult.impactAnalysis.affectedAlgorithmCount).toBe(3);
    expect(evaluationResult.impactAnalysis.criticalityScore).toBe(85); // 高リスク依存が複数あるため高スコア

    // 検証6: 最終的な技術実現性スコアが算出されていること
    // 提案スコア: (100 - 4*10) * (1 - 15/30) = 60 * 0.5 = 30
    // 依存関係による調整: min(67, 51, 64) * 0.8 = 51 * 0.8 = 40.8 ≈ 41
    // 最終スコア: (30 + 41) / 2 = 35.5 ≈ 36
    expect(evaluationResult.technicalFeasibilityScore).toBe(36);

    // 検証7: 評価レベルの判定
    expect(evaluationResult.feasibilityLevel).toBe('条件付き実装');

    // 検証8: 評価レポートに依存関係の複雑性に関する詳細情報が含まれていること
    expect(evaluationResult.detailedReport).toBeDefined();
    expect(evaluationResult.detailedReport.complexityAnalysis).toBeDefined();
    expect(evaluationResult.detailedReport.complexityAnalysis.complexityLevel).toBe('very_high');
    expect(evaluationResult.detailedReport.complexityAnalysis.complexityDescription).toContain('circular');
    expect(evaluationResult.detailedReport.complexityAnalysis.complexityDescription).toContain('3');

    // 検証9: リスク評価が含まれていること
    expect(evaluationResult.detailedReport.riskAssessment).toBeDefined();
    expect(evaluationResult.detailedReport.riskAssessment.riskLevel).toBe('high');
    expect(evaluationResult.detailedReport.riskAssessment.riskFactors).toContain('circular_dependency');
    expect(evaluationResult.detailedReport.riskAssessment.riskFactors).toContain('low_feasibility_score_algo_B');

    // 検証10: 推奨事項が含まれていること
    expect(evaluationResult.detailedReport.recommendations).toBeDefined();
    expect(evaluationResult.detailedReport.recommendations).toHaveLength(3);
    expect(evaluationResult.detailedReport.recommendations[0]).toContain('circular dependency');
    expect(evaluationResult.detailedReport.recommendations[1]).toContain('algo_B');
    expect(evaluationResult.detailedReport.recommendations[2]).toContain('implementation plan');

    // 検証11: 実装見積もりの妥当性が評価されていること
    expect(evaluationResult.detailedReport.implementationEstimate).toBeDefined();
    expect(evaluationResult.detailedReport.implementationEstimate.estimatedDays).toBe(25); // 15 + (8+6)*0.5調整
    expect(evaluationResult.detailedReport.implementationEstimate.confidenceLevel).toBe(0.65);

    // 検証12: 評価タイムスタンプが正しく記録されていること
    expect(evaluationResult.evaluationDate).toBe('2024-12-15T10:00:00Z');
    expect(evaluationResult.evaluatorId).toBe('dev_team_001');

    // 検証13: 条件付き実装の場合、条件が明示されていること
    expect(evaluationResult.conditionalImplementationRequirements).toBeDefined();
    expect(evaluationResult.conditionalImplementationRequirements).toHaveLength(2);
    expect(evaluationResult.conditionalImplementationRequirements[0]).toBe(
      'Resolve circular dependency between algo_A and algo_B'
    );
    expect(evaluationResult.conditionalImplementationRequirements[1]).toBe(
      'Improve feasibility score of algo_B before integration'
    );
  });
});