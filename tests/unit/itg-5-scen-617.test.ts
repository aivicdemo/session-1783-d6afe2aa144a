import { calculateWeeklyImprovementMetrics } from '../../src/logic/it-7-2-1';

describe('Weekly Algorithm Improvement Metrics Calculation', () => {
  // SCEN-617
  test('should calculate pre-week comparison metrics and determine improvement success when threshold exceeded', () => {
    // Baseline (previous week) data
    const previousWeekData = {
      satisfactionScore: 3.5,
      completionRate: 0.78,
      rejectionRate: 0.22,
      cookingTimeMinutes: 45,
    };

    // Improved (current week) data
    const currentWeekData = {
      satisfactionScore: 4.2,
      completionRate: 0.88,
      rejectionRate: 0.12,
      cookingTimeMinutes: 35,
    };

    // Minimum threshold for improvement success
    const improvementThreshold = 0.05;

    // Execute improvement metrics calculation
    const result = calculateWeeklyImprovementMetrics({
      previousWeekSatisfactionScore: previousWeekData.satisfactionScore,
      currentWeekSatisfactionScore: currentWeekData.satisfactionScore,
      previousWeekCompletionRate: previousWeekData.completionRate,
      currentWeekCompletionRate: currentWeekData.completionRate,
      previousWeekRejectionRate: previousWeekData.rejectionRate,
      currentWeekRejectionRate: currentWeekData.rejectionRate,
      previousWeekCookingTimeMinutes: previousWeekData.cookingTimeMinutes,
      currentWeekCookingTimeMinutes: currentWeekData.cookingTimeMinutes,
      improvementThresholdRatio: improvementThreshold,
    });

    // Calculate expected metric changes (pre-week comparison)
    // Satisfaction score change rate: (4.2 - 3.5) / 3.5 = 0.2 (20% improvement)
    const expectedSatisfactionChangeRate = (4.2 - 3.5) / 3.5;
    expect(result.satisfactionScoreChangeRate).toBeCloseTo(0.2, 2);

    // Completion rate change rate: (0.88 - 0.78) / 0.78 = 0.128 (12.8% improvement)
    const expectedCompletionChangeRate = (0.88 - 0.78) / 0.78;
    expect(result.completionRateChangeRate).toBeCloseTo(0.128, 2);

    // Rejection rate reduction: (0.22 - 0.12) / 0.22 = 0.454 (45.4% reduction)
    const expectedRejectionReduction = (0.22 - 0.12) / 0.22;
    expect(result.rejectionRateReduction).toBeCloseTo(0.454, 2);

    // Cooking time reduction: (45 - 35) / 45 = 0.222 (22.2% shorter)
    const expectedCookingTimeReduction = (45 - 35) / 45;
    expect(result.cookingTimeShorteningRate).toBeCloseTo(0.222, 2);

    // Total improvement score: average of all metrics
    // (0.2 + 0.128 + 0.454 + 0.222) / 4 = 0.251
    const expectedTotalImprovementScore =
      (expectedSatisfactionChangeRate +
        expectedCompletionChangeRate +
        expectedRejectionReduction +
        expectedCookingTimeReduction) /
      4;
    expect(result.totalImprovementScore).toBeCloseTo(0.251, 2);

    // Verify improvement success determination: total score > threshold
    // 0.251 > 0.05 → true
    expect(result.isImprovementSuccess).toBe(true);

    // Verify improvement status display
    expect(result.improvementStatus).toBe('改善成功');

    // Verify all required fields exist in result
    expect(result).toHaveProperty('satisfactionScoreChangeRate');
    expect(result).toHaveProperty('completionRateChangeRate');
    expect(result).toHaveProperty('rejectionRateReduction');
    expect(result).toHaveProperty('cookingTimeShorteningRate');
    expect(result).toHaveProperty('totalImprovementScore');
    expect(result).toHaveProperty('isImprovementSuccess');
    expect(result).toHaveProperty('improvementStatus');
  });
});