import { prioritizeDifferentiationFeaturesByCompetitiveAnalysis } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-695
  test('機能別使用頻度と離脱ポイント分析が完全に一致する境界条件で、正確に差別化機能が優先度付けされる', () => {
    const inputFeatures = [
      {
        feature_id: 'feat_001',
        feature_name: '献立案検索',
        usage_frequency: 85,
        abandonment_rate: 12,
        technical_difficulty: 3,
        implementation_cost: 2500,
        market_positioning_score: 78,
        competitive_uniqueness: 0.72,
        user_satisfaction: 4.2,
      },
      {
        feature_id: 'feat_002',
        feature_name: '栄養分析ダッシュボード',
        usage_frequency: 85,
        abandonment_rate: 12,
        technical_difficulty: 5,
        implementation_cost: 4200,
        market_positioning_score: 82,
        competitive_uniqueness: 0.88,
        user_satisfaction: 4.5,
      },
      {
        feature_id: 'feat_003',
        feature_name: '食材在庫管理',
        usage_frequency: 65,
        abandonment_rate: 22,
        technical_difficulty: 2,
        implementation_cost: 1800,
        market_positioning_score: 71,
        competitive_uniqueness: 0.65,
        user_satisfaction: 3.8,
      },
    ];

    const result = prioritizeDifferentiationFeaturesByCompetitiveAnalysis(inputFeatures);

    expect(result).toEqual({
      prioritized_features: [
        {
          rank: 1,
          feature_id: 'feat_002',
          feature_name: '栄養分析ダッシュボード',
          priority_score: 82.44,
          usage_frequency: 85,
          abandonment_rate: 12,
          differentiation_point: '高い市場ポジショニングと競合ユニークネスが強み',
          secondary_sort_key: 'market_positioning_score_desc',
        },
        {
          rank: 2,
          feature_id: 'feat_001',
          feature_name: '献立案検索',
          priority_score: 78.96,
          usage_frequency: 85,
          abandonment_rate: 12,
          differentiation_point: 'ユーザー満足度と実装効率のバランス',
          secondary_sort_key: 'user_satisfaction_desc',
        },
        {
          rank: 3,
          feature_id: 'feat_003',
          feature_name: '食材在庫管理',
          priority_score: 62.18,
          usage_frequency: 65,
          abandonment_rate: 22,
          differentiation_point: '利用頻度の改善余地あり',
          secondary_sort_key: 'implementation_cost_asc',
        },
      ],
      analysis_metadata: {
        total_features_analyzed: 3,
        features_with_identical_scores: 2,
        identical_score_group: ['feat_001', 'feat_002'],
        identical_score_values: {
          usage_frequency: 85,
          abandonment_rate: 12,
        },
        secondary_sort_applied: true,
        secondary_sort_criteria: ['market_positioning_score', 'user_satisfaction', 'implementation_cost'],
        generated_at: '2024-01-15T09:00:00Z',
      },
    });

    expect(result.prioritized_features).toHaveLength(3);
    expect(result.prioritized_features[0].feature_id).toBe('feat_002');
    expect(result.prioritized_features[0].priority_score).toBeCloseTo(82.44, 1);
    expect(result.prioritized_features[1].feature_id).toBe('feat_001');
    expect(result.prioritized_features[1].priority_score).toBeCloseTo(78.96, 1);
    expect(result.analysis_metadata.features_with_identical_scores).toBe(2);
    expect(result.analysis_metadata.identical_score_group).toEqual(['feat_001', 'feat_002']);
    expect(result.analysis_metadata.secondary_sort_applied).toBe(true);
    expect(result.analysis_metadata.secondary_sort_criteria).toContain('market_positioning_score');
  });
});