import { aggregateWeeklyBehaviorMetrics } from '../../src/logic/it-7-2-1';

describe('週次行動指標自動集計ダッシュボード', () => {
  // SCEN-667: [error] 週次行動指標集計機能 - 集計対象期間にデータが存在しない場合、空の集計結果を返す
  test('集計対象期間にデータが存在しない場合、空の集計結果を返す', () => {
    const weekStartDate = new Date('2024-01-01T00:00:00Z');
    const weekEndDate = new Date('2024-01-07T23:59:59Z');
    const userId = 'user-001';
    const emptyMetricsData = [];

    const result = aggregateWeeklyBehaviorMetrics({
      userId,
      weekStartDate,
      weekEndDate,
      metricsData: emptyMetricsData,
    });

    expect(result).toEqual({
      userId,
      weekStartDate,
      weekEndDate,
      totalGenerationAttempts: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      generationSuccessRate: 0,
      averageCookingTimeMinutes: null,
      cookingTimeReductionAchievementRate: 0,
      averageUserSatisfactionScore: null,
      totalFeedbackCount: 0,
      averageCompletionRate: null,
      averageRejectionRate: null,
      dataPointsCount: 0,
      hasError: false,
      errorMessage: null,
    });

    expect(result.totalGenerationAttempts).toBe(0);
    expect(result.successfulGenerations).toBe(0);
    expect(result.failedGenerations).toBe(0);
    expect(result.generationSuccessRate).toBe(0);
    expect(result.averageCookingTimeMinutes).toBeNull();
    expect(result.cookingTimeReductionAchievementRate).toBe(0);
    expect(result.averageUserSatisfactionScore).toBeNull();
    expect(result.totalFeedbackCount).toBe(0);
    expect(result.averageCompletionRate).toBeNull();
    expect(result.averageRejectionRate).toBeNull();
    expect(result.dataPointsCount).toBe(0);
    expect(result.hasError).toBe(false);
    expect(result.errorMessage).toBeNull();
  });
});