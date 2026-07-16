import { analyzeFeatureUsageAndDropoffPoints } from '../../src/logic/it-1-br-8-2-2-1';

describe('機能別使用頻度・離脱ポイント自動抽出・分析', () => {
  // SCEN-258: [edge] 献立生成成功率の改善効果定量比較・優先度決定 - 改善目標値が0%の場合、閾値判定が正常に実行され優先度が決定される
  test('改善目標値が0%の場合、閾値判定と優先度決定が正常に実行される', () => {
    const currentSuccessRate = 75;
    const improvementTarget = 0;
    const minimumThreshold = 50;

    const result = analyzeFeatureUsageAndDropoffPoints({
      currentSuccessRate,
      improvementTarget,
      minimumThreshold,
      segmentData: [
        {
          segmentId: 'segment_primary',
          featureName: 'meal_generation',
          usageFrequency: 45,
          dropoffRate: 12,
          improvementEffectScore: 8.5,
        },
        {
          segmentId: 'segment_secondary',
          featureName: 'ingredient_restriction',
          usageFrequency: 32,
          dropoffRate: 18,
          improvementEffectScore: 6.2,
        },
      ],
    });

    expect(result).toBeDefined();
    expect(result.thresholdJudgmentPassed).toBe(true);
    expect(result.priorityScore).toBe(75);
    expect(result.currentSuccessRateValidated).toBe(75);
    expect(result.improvementTargetValidated).toBe(0);
    expect(result.comparisonBasisValid).toBe(true);
    expect(result.priorityDecisionExecution).toBe('completed');
    expect(result.priorityRank).toBe('high');
    expect(result.improvementEffectNegative).toBe(false);
    expect(result.segmentAnalysisResults).toHaveLength(2);
    expect(result.segmentAnalysisResults[0]).toEqual({
      segmentId: 'segment_primary',
      featureName: 'meal_generation',
      usageFrequency: 45,
      dropoffRate: 12,
      improvementEffectScore: 8.5,
      adjustedPriorityScore: 76.125,
      recommendedAction: 'accelerate',
    });
    expect(result.segmentAnalysisResults[1]).toEqual({
      segmentId: 'segment_secondary',
      featureName: 'ingredient_restriction',
      usageFrequency: 32,
      dropoffRate: 18,
      improvementEffectScore: 6.2,
      adjustedPriorityScore: 70.372,
      recommendedAction: 'standard',
    });
    expect(result.comparisonMetrics).toEqual({
      baselineSuccessRate: 75,
      targetSuccessRate: 0,
      relativeDifferential: 75,
      achievementGapPercentage: 100,
      priorityComparabilityIndex: 1.0,
    });
    expect(result.statusCode).toBe(200);
  });
});