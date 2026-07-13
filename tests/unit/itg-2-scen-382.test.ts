import { analyzeSegmentDifferentiationEffect } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザーセグメント別効果分析機能 - 最高差別化効果特定', () => {
  // SCEN-382
  test('複数セグメント間で最高差別化効果が見込めるセグメント・機能が正しく特定される', () => {
    const segmentData = [
      {
        segmentId: 'seg_001',
        segmentName: '30代主婦層',
        userCount: 250,
        features: [
          {
            featureId: 'feat_meal_opt',
            featureName: '食事プラン最適化機能',
            successRate: 0.92,
            cookingTimeReduction: 28.5,
            satisfactionScore: 8.7,
          },
          {
            featureId: 'feat_nutri_track',
            featureName: '栄養追跡機能',
            successRate: 0.85,
            cookingTimeReduction: 15.2,
            satisfactionScore: 7.9,
          },
        ],
      },
      {
        segmentId: 'seg_002',
        segmentName: '40代共働き層',
        userCount: 180,
        features: [
          {
            featureId: 'feat_meal_opt',
            featureName: '食事プラン最適化機能',
            successRate: 0.78,
            cookingTimeReduction: 22.3,
            satisfactionScore: 7.2,
          },
          {
            featureId: 'feat_nutri_track',
            featureName: '栄養追跡機能',
            successRate: 0.81,
            cookingTimeReduction: 18.6,
            satisfactionScore: 8.1,
          },
        ],
      },
      {
        segmentId: 'seg_003',
        segmentName: '20代独身層',
        userCount: 120,
        features: [
          {
            featureId: 'feat_meal_opt',
            featureName: '食事プラン最適化機能',
            successRate: 0.88,
            cookingTimeReduction: 35.7,
            satisfactionScore: 8.4,
          },
          {
            featureId: 'feat_nutri_track',
            featureName: '栄養追跡機能',
            successRate: 0.79,
            cookingTimeReduction: 12.4,
            satisfactionScore: 7.1,
          },
        ],
      },
    ];

    const result = analyzeSegmentDifferentiationEffect(segmentData);

    expect(result).toEqual({
      topSegmentId: 'seg_001',
      topSegmentName: '30代主婦層',
      topFeatureId: 'feat_meal_opt',
      topFeatureName: '食事プラン最適化機能',
      differentiationScore: 87.53,
      successRate: 0.92,
      cookingTimeReduction: 28.5,
      satisfactionScore: 8.7,
      comparisonMetrics: [
        {
          segmentId: 'seg_001',
          segmentName: '30代主婦層',
          featureId: 'feat_meal_opt',
          featureName: '食事プラン最適化機能',
          differentiationScore: 87.53,
          isTopCombination: true,
        },
        {
          segmentId: 'seg_001',
          segmentName: '30代主婦層',
          featureId: 'feat_nutri_track',
          featureName: '栄養追跡機能',
          differentiationScore: 76.29,
          isTopCombination: false,
        },
        {
          segmentId: 'seg_002',
          segmentName: '40代共働き層',
          featureId: 'feat_meal_opt',
          featureName: '食事プラン最適化機能',
          differentiationScore: 68.84,
          isTopCombination: false,
        },
        {
          segmentId: 'seg_002',
          segmentName: '40代共働き層',
          featureId: 'feat_nutri_track',
          featureName: '栄養追跡機能',
          differentiationScore: 74.21,
          isTopCombination: false,
        },
        {
          segmentId: 'seg_003',
          segmentName: '20代独身層',
          featureId: 'feat_meal_opt',
          featureName: '食事プラン最適化機能',
          differentiationScore: 84.47,
          isTopCombination: false,
        },
        {
          segmentId: 'seg_003',
          segmentName: '20代独身層',
          featureId: 'feat_nutri_track',
          featureName: '栄養追跡機能',
          differentiationScore: 63.08,
          isTopCombination: false,
        },
      ],
      statisticalSignificance: 0.95,
      marginVsSecondPlace: 3.06,
    });
  });
});