import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { calculateWeeklyDashboardMetrics } from '../../src/logic/it-1-br-2-1-1-1';

describe('Weekly Dashboard Aggregation for Nutrition Intake Metrics', () => {
  // SCEN-378
  test('should handle first week without prior week data gracefully', () => {
    // Setup: User A initialized on current date (first registration)
    const currentDate = new Date('2024-01-15T00:00:00Z');
    const userIdA = 'user_a_001';

    // First week user food intake records (Day 1-7 of first week)
    const firstWeekRecords = [
      {
        recordId: 'rec_001',
        userId: userIdA,
        recordDate: new Date('2024-01-08T12:00:00Z'),
        nutrientIntake: {
          calories: 2100,
          protein: 65,
          fat: 70,
          carbohydrates: 280,
          fiber: 22,
          calcium: 850,
          iron: 12,
        },
      },
      {
        recordId: 'rec_002',
        userId: userIdA,
        recordDate: new Date('2024-01-09T12:00:00Z'),
        nutrientIntake: {
          calories: 2050,
          protein: 62,
          fat: 68,
          carbohydrates: 275,
          fiber: 21,
          calcium: 820,
          iron: 11,
        },
      },
      {
        recordId: 'rec_003',
        userId: userIdA,
        recordDate: new Date('2024-01-10T12:00:00Z'),
        nutrientIntake: {
          calories: 2200,
          protein: 68,
          fat: 75,
          carbohydrates: 290,
          fiber: 24,
          calcium: 900,
          iron: 13,
        },
      },
    ];

    // Nutrition target standards (set by nutritionist)
    const nutritionTargets = {
      calories: 2000,
      protein: 60,
      fat: 65,
      carbohydrates: 270,
      fiber: 25,
      calcium: 1000,
      iron: 18,
    };

    // Calculate weekly dashboard metrics
    const weeklyMetrics = calculateWeeklyDashboardMetrics({
      userId: userIdA,
      weekStartDate: new Date('2024-01-08T00:00:00Z'),
      weekEndDate: new Date('2024-01-14T23:59:59Z'),
      foodRecords: firstWeekRecords,
      nutritionTargets: nutritionTargets,
      userRegistrationDate: currentDate,
    });

    // Assertions: Verify core weekly metrics are calculated correctly
    expect(weeklyMetrics).toBeDefined();
    expect(weeklyMetrics.userId).toBe(userIdA);
    expect(weeklyMetrics.weekStartDate).toEqual(new Date('2024-01-08T00:00:00Z'));

    // Verify weekly aggregates are computed from available records
    expect(weeklyMetrics.weeklyAggregates).toBeDefined();
    expect(weeklyMetrics.weeklyAggregates.avgCalories).toBe(2117);
    expect(weeklyMetrics.weeklyAggregates.avgProtein).toBe(65);
    expect(weeklyMetrics.weeklyAggregates.avgFat).toBe(71);
    expect(weeklyMetrics.weeklyAggregates.avgCarbohydrates).toBe(282);
    expect(weeklyMetrics.weeklyAggregates.avgFiber).toBe(22);
    expect(weeklyMetrics.weeklyAggregates.avgCalcium).toBe(857);
    expect(weeklyMetrics.weeklyAggregates.avgIron).toBe(12);

    // Verify achievement rates are calculated vs nutritionTargets
    expect(weeklyMetrics.achievementScores).toBeDefined();
    expect(weeklyMetrics.achievementScores.caloriesAchievementRate).toBe(106);
    expect(weeklyMetrics.achievementScores.proteinAchievementRate).toBe(108);
    expect(weeklyMetrics.achievementScores.fatAchievementRate).toBe(109);
    expect(weeklyMetrics.achievementScores.carbohydratesAchievementRate).toBe(104);
    expect(weeklyMetrics.achievementScores.fiberAchievementRate).toBe(88);
    expect(weeklyMetrics.achievementScores.calciumAchievementRate).toBe(86);
    expect(weeklyMetrics.achievementScores.ironAchievementRate).toBe(67);

    // Critical assertion: Prior week comparison data should be null/N/A since no prior week exists
    expect(weeklyMetrics.priorWeekComparison).toBeNull();

    // Verify isFirstWeek flag is set to true
    expect(weeklyMetrics.isFirstWeek).toBe(true);

    // Verify improvement gaps for each nutrient are identified and prioritized
    expect(weeklyMetrics.improvementGaps).toBeDefined();
    expect(weeklyMetrics.improvementGaps).toHaveLength(7);

    // Iron is the lowest achievement (67%), should be highest priority
    expect(weeklyMetrics.improvementGaps[0]).toEqual({
      nutrient: 'iron',
      targetValue: 18,
      actualValue: 12,
      gapValue: 6,
      gapPercentage: 33,
      priority: 1,
    });

    // Fiber is second lowest (88%), should be second priority
    expect(weeklyMetrics.improvementGaps[1]).toEqual({
      nutrient: 'fiber',
      targetValue: 25,
      actualValue: 22,
      gapValue: 3,
      gapPercentage: 12,
      priority: 2,
    });

    // Calcium is third (86%), should be third priority
    expect(weeklyMetrics.improvementGaps[2]).toEqual({
      nutrient: 'calcium',
      targetValue: 1000,
      actualValue: 857,
      gapValue: 143,
      gapPercentage: 14,
      priority: 3,
    });

    // Carbohydrates is fourth (104%), above target
    expect(weeklyMetrics.improvementGaps[3]).toEqual({
      nutrient: 'carbohydrates',
      targetValue: 270,
      actualValue: 282,
      gapValue: -12,
      gapPercentage: -4,
      priority: 4,
    });

    // Fat is fifth (109%), above target
    expect(weeklyMetrics.improvementGaps[4]).toEqual({
      nutrient: 'fat',
      targetValue: 65,
      actualValue: 71,
      gapValue: -6,
      gapPercentage: -9,
      priority: 5,
    });

    // Protein is sixth (108%), above target
    expect(weeklyMetrics.improvementGaps[5]).toEqual({
      nutrient: 'protein',
      targetValue: 60,
      actualValue: 65,
      gapValue: -5,
      gapPercentage: -8,
      priority: 6,
    });

    // Calories is lowest priority (106%), above target
    expect(weeklyMetrics.improvementGaps[6]).toEqual({
      nutrient: 'calories',
      targetValue: 2000,
      actualValue: 2117,
      gapValue: -117,
      gapPercentage: -6,
      priority: 7,
    });

    // Verify dashboard-ready output structure for UI rendering
    expect(weeklyMetrics.dashboardDisplay).toBeDefined();
    expect(weeklyMetrics.dashboardDisplay.weekLabel).toBe('Week of Jan 8 - Jan 14, 2024');
    expect(weeklyMetrics.dashboardDisplay.priorWeekComparisonLabel).toBe('N/A');
    expect(weeklyMetrics.dashboardDisplay.isInitialWeek).toBe(true);

    // Verify no error is thrown and system handles gracefully
    expect(weeklyMetrics.errorOccurred).toBe(false);
    expect(weeklyMetrics.errorMessage).toBeNull();
  });
});