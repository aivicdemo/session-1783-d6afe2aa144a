import { aggregateUserChurnMetrics, generateDifferentiationFeatureList } from '../../src/logic/it-7-3-1';

describe('専業主夫層ペイン定量化と差別化軸生成', () => {
  // SCEN-937
  test('離脱ポイント頻度とペイン要因カテゴリが集計され、定量根拠付き差別化機能リストが優先度順に生成される', () => {
    // テストデータ: 専業主夫層の離脱ポイント情報
    const churnPointData = [
      {
        userId: 'user_001',
        segment: 'homemaker_husband',
        churnStage: 'constraint_input',
        churnReason: 'time_consuming',
        timestamp: '2024-01-08T14:30:00Z',
      },
      {
        userId: 'user_002',
        segment: 'homemaker_husband',
        churnStage: 'constraint_input',
        churnReason: 'time_consuming',
        timestamp: '2024-01-08T15:45:00Z',
      },
      {
        userId: 'user_003',
        segment: 'homemaker_husband',
        churnStage: 'menu_review',
        churnReason: 'family_preference_mismatch',
        timestamp: '2024-01-08T16:20:00Z',
      },
      {
        userId: 'user_004',
        segment: 'homemaker_husband',
        churnStage: 'constraint_input',
        churnReason: 'time_consuming',
        timestamp: '2024-01-08T17:00:00Z',
      },
      {
        userId: 'user_005',
        segment: 'homemaker_husband',
        churnStage: 'menu_confirmation',
        churnReason: 'nutritional_balance',
        timestamp: '2024-01-08T18:10:00Z',
      },
    ];

    // テストデータ: 専業主夫層のペイン要因情報
    const painFactorData = [
      {
        userId: 'user_001',
        segment: 'homemaker_husband',
        painCategory: 'input_complexity',
        painContent: 'constraint_input_too_verbose',
        importanceScore: 8.5,
      },
      {
        userId: 'user_002',
        segment: 'homemaker_husband',
        painCategory: 'input_complexity',
        painContent: 'constraint_input_too_verbose',
        importanceScore: 8.2,
      },
      {
        userId: 'user_003',
        segment: 'homemaker_husband',
        painCategory: 'preference_learning',
        painContent: 'family_preference_not_reflected',
        importanceScore: 7.8,
      },
      {
        userId: 'user_004',
        segment: 'homemaker_husband',
        painCategory: 'input_complexity',
        painContent: 'constraint_input_too_verbose',
        importanceScore: 8.1,
      },
      {
        userId: 'user_005',
        segment: 'homemaker_husband',
        painCategory: 'nutrition_balance',
        painContent: 'nutritional_balance_algorithm_inaccurate',
        importanceScore: 7.5,
      },
    ];

    // 離脱ポイント頻度の集計処理を実行
    const churnMetrics = aggregateUserChurnMetrics({
      churnPointData,
      painFactorData,
      segment: 'homemaker_husband',
    });

    // 集計結果の検証: 離脱ポイント頻度
    expect(churnMetrics.churnStageFrequency).toEqual({
      constraint_input: 3,
      menu_review: 1,
      menu_confirmation: 1,
    });

    expect(churnMetrics.churnReasonFrequency).toEqual({
      time_consuming: 3,
      family_preference_mismatch: 1,
      nutritional_balance: 1,
    });

    // ペイン要因カテゴリの集計結果の検証
    expect(churnMetrics.painCategoryAggregation).toEqual({
      input_complexity: {
        count: 3,
        avgImportanceScore: 8.27,
        affectedUserCount: 3,
      },
      preference_learning: {
        count: 1,
        avgImportanceScore: 7.8,
        affectedUserCount: 1,
      },
      nutrition_balance: {
        count: 1,
        avgImportanceScore: 7.5,
        affectedUserCount: 1,
      },
    });

    // 全体統計情報の検証
    expect(churnMetrics.totalChurnCount).toBe(5);
    expect(churnMetrics.overallChurnRate).toBe(0.6);
    expect(churnMetrics.dominantPainCategory).toBe('input_complexity');
    expect(churnMetrics.dominantChurnStage).toBe('constraint_input');

    // 差別化機能リスト生成処理を実行
    const differentiationFeatures = generateDifferentiationFeatureList({
      churnMetrics,
      competitiveBenchmark: {
        avgFeatureCount: 4.2,
        avgUserSatisfactionScore: 7.1,
      },
    });

    // 差別化機能リストが定量根拠付きで生成されていることを検証
    expect(differentiationFeatures).toHaveLength(3);

    // 優先度スコア順にソートされていることを検証
    expect(differentiationFeatures[0]).toEqual({
      featureId: 'constraint_input_simplification',
      featureName: 'Constraint Input Simplification',
      painCategory: 'input_complexity',
      priorityScore: 92.5,
      quantitativeRationale: {
        churnFrequency: 3,
        avgPainImportanceScore: 8.27,
        affectedUserPercentage: 60.0,
      },
      expectedImpact: {
        estimatedChurnReduction: 0.35,
        estimatedSatisfactionGainScore: 1.8,
      },
    });

    expect(differentiationFeatures[1]).toEqual({
      featureId: 'preference_learning_enhancement',
      featureName: 'Family Preference Learning Enhancement',
      painCategory: 'preference_learning',
      priorityScore: 74.8,
      quantitativeRationale: {
        churnFrequency: 1,
        avgPainImportanceScore: 7.8,
        affectedUserPercentage: 20.0,
      },
      expectedImpact: {
        estimatedChurnReduction: 0.15,
        estimatedSatisfactionGainScore: 1.2,
      },
    });

    expect(differentiationFeatures[2]).toEqual({
      featureId: 'nutrition_algorithm_refinement',
      featureName: 'Nutrition Algorithm Refinement',
      painCategory: 'nutrition_balance',
      priorityScore: 71.5,
      quantitativeRationale: {
        churnFrequency: 1,
        avgPainImportanceScore: 7.5,
        affectedUserPercentage: 20.0,
      },
      expectedImpact: {
        estimatedChurnReduction: 0.12,
        estimatedSatisfactionGainScore: 1.0,
      },
    });

    // 優先度スコアが降順にソートされていることを検証
    expect(differentiationFeatures[0].priorityScore).toBeGreaterThan(
      differentiationFeatures[1].priorityScore
    );
    expect(differentiationFeatures[1].priorityScore).toBeGreaterThan(
      differentiationFeatures[2].priorityScore
    );

    // ダッシュボード表示形式での検証: トレーサビリティ確保
    differentiationFeatures.forEach((feature) => {
      expect(feature.featureId).toBeDefined();
      expect(feature.featureName).toBeDefined();
      expect(feature.painCategory).toBeDefined();
      expect(feature.priorityScore).toBeGreaterThan(0);
      expect(feature.priorityScore).toBeLessThanOrEqual(100);
      expect(feature.quantitativeRationale).toBeDefined();
      expect(feature.quantitativeRationale.churnFrequency).toBeGreaterThan(0);
      expect(feature.quantitativeRationale.avgPainImportanceScore).toBeGreaterThan(0);
      expect(feature.quantitativeRationale.affectedUserPercentage).toBeGreaterThan(0);
      expect(feature.quantitativeRationale.affectedUserPercentage).toBeLessThanOrEqual(100);
      expect(feature.expectedImpact).toBeDefined();
      expect(feature.expectedImpact.estimatedChurnReduction).toBeGreaterThan(0);
      expect(feature.expectedImpact.estimatedChurnReduction).toBeLessThan(1);
      expect(feature.expectedImpact.estimatedSatisfactionGainScore).toBeGreaterThan(0);
    });

    // ダッシュボード集計結果がテストデータと一致することを検証
    expect(churnMetrics.totalChurnCount).toBe(churnPointData.length);
    expect(differentiationFeatures.length).toBe(3);

    // すべての痛点カテゴリがカバーされていることを確認
    const coveredCategories = new Set(
      differentiationFeatures.map((f) => f.painCategory)
    );
    expect(coveredCategories.has('input_complexity')).toBe(true);
    expect(coveredCategories.has('preference_learning')).toBe(true);
    expect(coveredCategories.has('nutrition_balance')).toBe(true);
  });
});