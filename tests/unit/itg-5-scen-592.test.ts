import { calculateWeeklyMetrics } from "../../src/logic/it-7-2-1";

describe("Weekly Aggregation and Dashboard - Meal Generation Success Rate, Cooking Time Reduction, and Satisfaction Score Comparison", () => {
  test("SCEN-592: Calculate and display weekly metrics with previous week comparison", () => {
    // Current week data (e.g., Week of 2024-01-15 to 2024-01-21)
    const currentWeekData = {
      weekStart: new Date("2024-01-15T00:00:00Z"),
      weekEnd: new Date("2024-01-21T23:59:59Z"),
      mealGenerationAttempts: 14,
      mealGenerationSuccesses: 12,
      totalCookingTimeMinutes: 450,
      targetCookingTimeMinutes: 420,
      satisfactionScoresArray: [
        4.5, 4.2, 4.8, 4.1, 4.9, 4.3, 4.6, 4.0, 4.7, 4.4, 4.2, 4.5,
      ],
    };

    // Previous week data (e.g., Week of 2024-01-08 to 2024-01-14)
    const previousWeekData = {
      weekStart: new Date("2024-01-08T00:00:00Z"),
      weekEnd: new Date("2024-01-14T23:59:59Z"),
      mealGenerationAttempts: 14,
      mealGenerationSuccesses: 10,
      totalCookingTimeMinutes: 480,
      targetCookingTimeMinutes: 420,
      satisfactionScoresArray: [
        3.8, 4.0, 3.9, 4.1, 3.7, 3.9, 4.0, 3.8, 4.2, 3.9, 4.1, 3.8,
      ],
    };

    // Calculate metrics
    const result = calculateWeeklyMetrics(
      currentWeekData,
      previousWeekData
    );

    // Assertion 1: Current week meal generation success rate
    // Expected: 12 / 14 = 0.8571 = 85.71%
    expect(result.currentWeek.mealGenerationSuccessRate).toBe(85.71);

    // Assertion 2: Previous week meal generation success rate
    // Expected: 10 / 14 = 0.7143 = 71.43%
    expect(result.previousWeek.mealGenerationSuccessRate).toBe(71.43);

    // Assertion 3: Meal generation success rate difference (positive = improvement)
    // Expected: 85.71 - 71.43 = 14.28 percentage points
    expect(result.mealGenerationSuccessRateDifference).toBe(14.28);

    // Assertion 4: Meal generation success rate percentage change
    // Expected: (14.28 / 71.43) * 100 = 20.00%
    expect(result.mealGenerationSuccessRatePercentageChange).toBe(20.0);

    // Assertion 5: Current week cooking time reduction degree
    // Expected: (target - actual) / target * 100 = (420 - 450) / 420 * 100 = -7.14%
    // Negative indicates exceeding target
    expect(result.currentWeek.cookingTimeReductionDegree).toBe(-7.14);

    // Assertion 6: Previous week cooking time reduction degree
    // Expected: (420 - 480) / 420 * 100 = -14.29%
    expect(result.previousWeek.cookingTimeReductionDegree).toBe(-14.29);

    // Assertion 7: Cooking time reduction degree improvement
    // Expected: -7.14 - (-14.29) = 7.15 percentage points (closer to target is improvement)
    expect(result.cookingTimeReductionDegreeDifference).toBe(7.15);

    // Assertion 8: Cooking time reduction degree percentage change
    // Expected: (7.15 / 14.29) * 100 = 50.04%
    expect(result.cookingTimeReductionDegreePercentageChange).toBe(50.04);

    // Assertion 9: Current week average satisfaction score
    // Expected: (4.5 + 4.2 + 4.8 + 4.1 + 4.9 + 4.3 + 4.6 + 4.0 + 4.7 + 4.4 + 4.2 + 4.5) / 12 = 54.2 / 12 = 4.52
    expect(result.currentWeek.averageSatisfactionScore).toBe(4.52);

    // Assertion 10: Previous week average satisfaction score
    // Expected: (3.8 + 4.0 + 3.9 + 4.1 + 3.7 + 3.9 + 4.0 + 3.8 + 4.2 + 3.9 + 4.1 + 3.8) / 12 = 47.1 / 12 = 3.93
    expect(result.previousWeek.averageSatisfactionScore).toBe(3.93);

    // Assertion 11: Satisfaction score difference
    // Expected: 4.52 - 3.93 = 0.59
    expect(result.satisfactionScoreDifference).toBe(0.59);

    // Assertion 12: Satisfaction score percentage change
    // Expected: (0.59 / 3.93) * 100 = 15.01%
    expect(result.satisfactionScorePercentageChange).toBe(15.01);

    // Assertion 13: Dashboard display object structure validation
    expect(result).toHaveProperty("dashboardDisplay");
    expect(result.dashboardDisplay).toHaveProperty("successRateChart");
    expect(result.dashboardDisplay).toHaveProperty("cookingTimeChart");
    expect(result.dashboardDisplay).toHaveProperty("satisfactionScoreChart");
    expect(result.dashboardDisplay).toHaveProperty("comparisonTable");

    // Assertion 14: Success rate chart data correctness
    expect(result.dashboardDisplay.successRateChart).toEqual({
      currentWeek: 85.71,
      previousWeek: 71.43,
      difference: 14.28,
      percentageChange: 20.0,
      trend: "improvement",
    });

    // Assertion 15: Cooking time reduction chart data correctness
    expect(result.dashboardDisplay.cookingTimeChart).toEqual({
      currentWeek: -7.14,
      previousWeek: -14.29,
      difference: 7.15,
      percentageChange: 50.04,
      trend: "improvement",
    });

    // Assertion 16: Satisfaction score chart data correctness
    expect(result.dashboardDisplay.satisfactionScoreChart).toEqual({
      currentWeek: 4.52,
      previousWeek: 3.93,
      difference: 0.59,
      percentageChange: 15.01,
      trend: "improvement",
    });

    // Assertion 17: Comparison table row validation
    expect(result.dashboardDisplay.comparisonTable).toHaveLength(3);
    expect(result.dashboardDisplay.comparisonTable[0]).toEqual({
      metric: "Meal Generation Success Rate (%)",
      currentWeek: 85.71,
      previousWeek: 71.43,
      difference: 14.28,
      percentageChange: 20.0,
    });

    expect(result.dashboardDisplay.comparisonTable[1]).toEqual({
      metric: "Cooking Time Reduction Degree (%)",
      currentWeek: -7.14,
      previousWeek: -14.29,
      difference: 7.15,
      percentageChange: 50.04,
    });

    expect(result.dashboardDisplay.comparisonTable[2]).toEqual({
      metric: "Average Satisfaction Score",
      currentWeek: 4.52,
      previousWeek: 3.93,
      difference: 0.59,
      percentageChange: 15.01,
    });

    // Assertion 18: Trend determination for all metrics
    expect(result.dashboardDisplay.successRateChart.trend).toBe("improvement");
    expect(result.dashboardDisplay.cookingTimeChart.trend).toBe("improvement");
    expect(result.dashboardDisplay.satisfactionScoreChart.trend).toBe(
      "improvement"
    );

    // Assertion 19: Overall improvement flag
    expect(result.overallImprovementFlag).toBe(true);

    // Assertion 20: Summary message generation
    expect(result.summaryMessage).toContain("14.28");
    expect(result.summaryMessage).toContain("20.0");
  });
});