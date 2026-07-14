import { aggregateWeeklyMetrics } from "../../src/logic/it-7-2-1";

describe("Weekly metrics aggregation for algorithm improvement", () => {
  test("SCEN-661: Gradual rollout control with single user segment", () => {
    // Initialize test environment for gradual rollout
    const rolloutConfig = {
      algorithmVersionId: "algo_v2_001",
      targetSegmentId: "segment_stay_home_dad",
      stages: [
        { percentage: 10, durationDays: 7 },
        { percentage: 50, durationDays: 7 },
        { percentage: 100, durationDays: 0 },
      ],
      startDate: new Date("2024-01-15T09:00:00Z"),
    };

    const segmentUserData = {
      segmentId: "segment_stay_home_dad",
      totalUsers: 100,
      users: Array.from({ length: 100 }, (_, i) => ({
        userId: `user_${String(i + 1).padStart(3, "0")}`,
        joinedDate: new Date("2024-01-01T00:00:00Z"),
      })),
    };

    // Execute Stage 1: 10% rollout
    const stage1Result = aggregateWeeklyMetrics({
      versionId: "algo_v2_001",
      currentStage: 0,
      targetPercentage: 10,
      segmentUsers: segmentUserData.users,
      metricsData: [
        {
          userId: "user_001",
          successRate: 0.92,
          cookingTimeReduction: 15,
          satisfactionScore: 4.5,
          timestamp: new Date("2024-01-15T11:00:00Z"),
        },
        {
          userId: "user_002",
          successRate: 0.85,
          cookingTimeReduction: 10,
          satisfactionScore: 4.2,
          timestamp: new Date("2024-01-15T11:00:00Z"),
        },
        {
          userId: "user_003",
          successRate: 0.88,
          cookingTimeReduction: 12,
          satisfactionScore: 4.3,
          timestamp: new Date("2024-01-15T11:00:00Z"),
        },
        {
          userId: "user_004",
          successRate: 0.90,
          cookingTimeReduction: 14,
          satisfactionScore: 4.4,
          timestamp: new Date("2024-01-15T11:00:00Z"),
        },
        {
          userId: "user_005",
          successRate: 0.87,
          cookingTimeReduction: 11,
          satisfactionScore: 4.1,
          timestamp: new Date("2024-01-15T11:00:00Z"),
        },
        {
          userId: "user_006",
          successRate: 0.89,
          cookingTimeReduction: 13,
          satisfactionScore: 4.3,
          timestamp: new Date("2024-01-15T11:00:00Z"),
        },
        {
          userId: "user_007",
          successRate: 0.86,
          cookingTimeReduction: 9,
          satisfactionScore: 4.0,
          timestamp: new Date("2024-01-15T11:00:00Z"),
        },
        {
          userId: "user_008",
          successRate: 0.91,
          cookingTimeReduction: 16,
          satisfactionScore: 4.6,
          timestamp: new Date("2024-01-15T11:00:00Z"),
        },
        {
          userId: "user_009",
          successRate: 0.84,
          cookingTimeReduction: 8,
          satisfactionScore: 3.9,
          timestamp: new Date("2024-01-15T11:00:00Z"),
        },
        {
          userId: "user_010",
          successRate: 0.93,
          cookingTimeReduction: 17,
          satisfactionScore: 4.7,
          timestamp: new Date("2024-01-15T11:00:00Z"),
        },
      ],
    });

    // Verify Stage 1 distribution
    expect(stage1Result.stage).toBe(1);
    expect(stage1Result.targetedUserCount).toBe(10);
    expect(stage1Result.aggregatedMetrics.avgSuccessRate).toBe(0.885);
    expect(stage1Result.aggregatedMetrics.avgCookingTimeReduction).toBe(12.5);
    expect(stage1Result.aggregatedMetrics.avgSatisfactionScore).toBe(4.25);
    expect(stage1Result.rolloutHistory.length).toBe(1);
    expect(stage1Result.rolloutHistory[0].stage).toBe(1);
    expect(stage1Result.rolloutHistory[0].percentage).toBe(10);
    expect(stage1Result.rolloutHistory[0].userCount).toBe(10);
    expect(stage1Result.rolloutHistory[0].timestamp).toEqual(
      new Date("2024-01-15T11:00:00Z")
    );

    // Simulate progression to Stage 2: 50% rollout
    const stage2Result = aggregateWeeklyMetrics({
      versionId: "algo_v2_001",
      currentStage: 1,
      targetPercentage: 50,
      segmentUsers: segmentUserData.users,
      metricsData: [
        ...stage1Result.aggregatedMetrics.userMetrics,
        {
          userId: "user_011",
          successRate: 0.86,
          cookingTimeReduction: 11,
          satisfactionScore: 4.1,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_012",
          successRate: 0.89,
          cookingTimeReduction: 13,
          satisfactionScore: 4.3,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_013",
          successRate: 0.87,
          cookingTimeReduction: 12,
          satisfactionScore: 4.2,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_014",
          successRate: 0.90,
          cookingTimeReduction: 14,
          satisfactionScore: 4.4,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_015",
          successRate: 0.85,
          cookingTimeReduction: 10,
          satisfactionScore: 4.0,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_016",
          successRate: 0.88,
          cookingTimeReduction: 12,
          satisfactionScore: 4.2,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_017",
          successRate: 0.91,
          cookingTimeReduction: 15,
          satisfactionScore: 4.5,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_018",
          successRate: 0.86,
          cookingTimeReduction: 11,
          satisfactionScore: 4.1,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_019",
          successRate: 0.89,
          cookingTimeReduction: 13,
          satisfactionScore: 4.3,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_020",
          successRate: 0.87,
          cookingTimeReduction: 12,
          satisfactionScore: 4.2,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_021",
          successRate: 0.84,
          cookingTimeReduction: 9,
          satisfactionScore: 3.9,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_022",
          successRate: 0.92,
          cookingTimeReduction: 16,
          satisfactionScore: 4.6,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_023",
          successRate: 0.88,
          cookingTimeReduction: 13,
          satisfactionScore: 4.3,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_024",
          successRate: 0.86,
          cookingTimeReduction: 11,
          satisfactionScore: 4.1,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_025",
          successRate: 0.90,
          cookingTimeReduction: 14,
          satisfactionScore: 4.4,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_026",
          successRate: 0.87,
          cookingTimeReduction: 12,
          satisfactionScore: 4.2,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_027",
          successRate: 0.89,
          cookingTimeReduction: 13,
          satisfactionScore: 4.3,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_028",
          successRate: 0.85,
          cookingTimeReduction: 10,
          satisfactionScore: 4.0,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_029",
          successRate: 0.91,
          cookingTimeReduction: 15,
          satisfactionScore: 4.5,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_030",
          successRate: 0.88,
          cookingTimeReduction: 13,
          satisfactionScore: 4.3,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_031",
          successRate: 0.86,
          cookingTimeReduction: 11,
          satisfactionScore: 4.1,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_032",
          successRate: 0.89,
          cookingTimeReduction: 13,
          satisfactionScore: 4.3,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_033",
          successRate: 0.87,
          cookingTimeReduction: 12,
          satisfactionScore: 4.2,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_034",
          successRate: 0.90,
          cookingTimeReduction: 14,
          satisfactionScore: 4.4,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_035",
          successRate: 0.85,
          cookingTimeReduction: 10,
          satisfactionScore: 4.0,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_036",
          successRate: 0.88,
          cookingTimeReduction: 12,
          satisfactionScore: 4.2,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_037",
          successRate: 0.91,
          cookingTimeReduction: 15,
          satisfactionScore: 4.5,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_038",
          successRate: 0.86,
          cookingTimeReduction: 11,
          satisfactionScore: 4.1,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_039",
          successRate: 0.89,
          cookingTimeReduction: 13,
          satisfactionScore: 4.3,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_040",
          successRate: 0.87,
          cookingTimeReduction: 12,
          satisfactionScore: 4.2,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_041",
          successRate: 0.84,
          cookingTimeReduction: 9,
          satisfactionScore: 3.9,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_042",
          successRate: 0.92,
          cookingTimeReduction: 16,
          satisfactionScore: 4.6,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_043",
          successRate: 0.88,
          cookingTimeReduction: 13,
          satisfactionScore: 4.3,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_044",
          successRate: 0.86,
          cookingTimeReduction: 11,
          satisfactionScore: 4.1,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_045",
          successRate: 0.90,
          cookingTimeReduction: 14,
          satisfactionScore: 4.4,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_046",
          successRate: 0.87,
          cookingTimeReduction: 12,
          satisfactionScore: 4.2,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_047",
          successRate: 0.89,
          cookingTimeReduction: 13,
          satisfactionScore: 4.3,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_048",
          successRate: 0.85,
          cookingTimeReduction: 10,
          satisfactionScore: 4.0,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_049",
          successRate: 0.91,
          cookingTimeReduction: 15,
          satisfactionScore: 4.5,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
        {
          userId: "user_050",
          successRate: 0.88,
          cookingTimeReduction: 13,
          satisfactionScore: 4.3,
          timestamp: new Date("2024-01-22T11:00:00Z"),
        },
      ],
    });

    // Verify Stage 2 expansion
    expect(stage2Result.stage).toBe(2);
    expect(stage2Result.targetedUserCount).toBe(50);
    expect(stage2Result.aggregatedMetrics.avgSuccessRate).toBeCloseTo(0.8806, 3);
    expect(stage2Result.aggregatedMetrics.avgCookingTimeReduction).toBeCloseTo(
      12.26,
      1
    );
    expect(stage2Result.aggregatedMetrics.avgSatisfactionScore).toBeCloseTo(
      4.226,
      2
    );
    expect(stage2Result.rolloutHistory.length).toBe(2);
    expect(stage2Result.rolloutHistory[1].stage).toBe(2);
    expect(stage2Result.rolloutHistory[1].percentage).toBe(50);
    expect(stage2Result.rolloutHistory[1].userCount).toBe(50);

    // Simulate progression to Stage 3: 100% rollout
    const stage3MetricsData = [
      ...stage2Result.aggregatedMetrics.userMetrics,
      ...Array.from({ length: 50 }, (_, i) => ({
        userId: `user_${String(i + 51).padStart(3, "0")}`,
        successRate: 0.87 + Math.random() * 0.06,
        cookingTimeReduction: 11 + Math.floor(Math.random() * 6),
        satisfactionScore: 4.1 + Math.random() * 0.5,
        timestamp: new Date("2024-01-29T11:00:00Z"),
      })),
    ];

    const stage3Result = aggregateWeeklyMetrics({
      versionId: "algo_v2_001",
      currentStage: 2,
      targetPercentage: 100,
      segmentUsers: segmentUserData.users,
      metricsData: stage3MetricsData,
    });

    // Verify Stage 3 full rollout
    expect(stage3Result.stage).toBe(3);
    expect(stage3Result.targetedUserCount).toBe(100);
    expect(stage3Result.rolloutHistory.length).toBe(3);
    expect(stage3Result.rolloutHistory[2].stage).toBe(3);
    expect(stage3Result.rolloutHistory[2].percentage).toBe(100);
    expect(stage3Result.rolloutHistory[2].userCount).toBe(100);
    expect(stage3Result.rolloutHistory[2].timestamp).toEqual(
      new Date("2024-01-29T11:00:00Z")
    );

    // Verify rollout history accuracy
    expect(stage3Result.rolloutHistory[0].percentage).toBe(10);
    expect(stage3Result.rolloutHistory[1].percentage).toBe(50);
    expect(stage3Result.rolloutHistory[2].percentage).toBe(100);
    expect(stage3Result.rolloutHistory[0].userCount).toBe(10);
    expect(stage3Result.rolloutHistory[1].userCount).toBe(50);
    expect(stage3Result.rolloutHistory[2].userCount).toBe(100);

    // Verify metrics consistency
    expect(stage3Result.aggregatedMetrics.userMetrics.length).toBe(100);
    expect(stage3Result.isRolloutComplete).toBe(true);
    expect(stage3Result.aggregatedMetrics.avgSuccessRate).toBeGreaterThan(0.84);
    expect(stage3Result.aggregatedMetrics.avgSuccessRate).toBeLessThan(0.93);
    expect(stage3Result.aggregatedMetrics.avgCookingTimeReduction).toBeGreaterThan(
      8
    );
    expect(stage3Result.aggregatedMetrics.avgCookingTimeReduction).toBeLessThan(
      18
    );
    expect(stage3Result.aggregatedMetrics.avgSatisfactionScore).toBeGreaterThan(
      3.8
    );
    expect(stage3Result.aggregatedMetrics.avgSatisfactionScore).toBeLessThan(4.8);
  });
});