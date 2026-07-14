import {
  analyzeSegmentEffectiveness,
  SegmentAnalysisInput,
  SegmentAnalysisResult,
} from "../../src/logic/it-7-2-1";

describe("IT-7-2-1: Segment-Based Effect Analysis for Menu Generation Algorithm", () => {
  // SCEN-595: Segment-based effectiveness analysis - aggregates success rate, cooking time reduction, and satisfaction score by segment (homemaker, dual-income, etc.) and identifies the segment with highest differentiation effect
  test("should aggregate segment-wise metrics and identify highest differentiation effect segment", () => {
    // Setup: Define multiple segments with user records containing performance metrics
    const analysisInput: SegmentAnalysisInput = {
      segments: [
        {
          segmentId: "seg_001_homemaker",
          segmentName: "Homemaker (Specialized Homemakers)",
          userRecords: [
            {
              userId: "user_001",
              menuGenerationAttempts: 10,
              successfulGenerations: 9,
              targetCookingTimeMinutes: 45,
              actualCookingTimeMinutes: 38,
              familySatisfactionScore: 4.8,
            },
            {
              userId: "user_002",
              menuGenerationAttempts: 8,
              successfulGenerations: 7,
              targetCookingTimeMinutes: 50,
              actualCookingTimeMinutes: 40,
              familySatisfactionScore: 4.6,
            },
            {
              userId: "user_003",
              menuGenerationAttempts: 12,
              successfulGenerations: 11,
              targetCookingTimeMinutes: 40,
              actualCookingTimeMinutes: 33,
              familySatisfactionScore: 4.9,
            },
          ],
        },
        {
          segmentId: "seg_002_dualincome",
          segmentName: "Dual-Income Household",
          userRecords: [
            {
              userId: "user_004",
              menuGenerationAttempts: 15,
              successfulGenerations: 12,
              targetCookingTimeMinutes: 30,
              actualCookingTimeMinutes: 28,
              familySatisfactionScore: 4.2,
            },
            {
              userId: "user_005",
              menuGenerationAttempts: 11,
              successfulGenerations: 9,
              targetCookingTimeMinutes: 35,
              actualCookingTimeMinutes: 32,
              familySatisfactionScore: 4.1,
            },
            {
              userId: "user_006",
              menuGenerationAttempts: 9,
              successfulGenerations: 7,
              targetCookingTimeMinutes: 28,
              actualCookingTimeMinutes: 26,
              familySatisfactionScore: 4.3,
            },
          ],
        },
        {
          segmentId: "seg_003_single",
          segmentName: "Single Household",
          userRecords: [
            {
              userId: "user_007",
              menuGenerationAttempts: 5,
              successfulGenerations: 4,
              targetCookingTimeMinutes: 20,
              actualCookingTimeMinutes: 19,
              familySatisfactionScore: 3.9,
            },
            {
              userId: "user_008",
              menuGenerationAttempts: 7,
              successfulGenerations: 5,
              targetCookingTimeMinutes: 25,
              actualCookingTimeMinutes: 24,
              familySatisfactionScore: 3.8,
            },
          ],
        },
      ],
      analysisTimestamp: new Date("2024-01-15T11:00:00Z"),
    };

    // Execute segment analysis
    const result: SegmentAnalysisResult = analyzeSegmentEffectiveness(
      analysisInput
    );

    // Validation 1: Verify success rate aggregation for Homemaker segment
    // Expected: (9 + 7 + 11) / (10 + 8 + 12) = 27 / 30 = 0.90 = 90%
    expect(result.segmentMetrics[0].successRate).toBe(0.9);

    // Validation 2: Verify success rate aggregation for Dual-Income segment
    // Expected: (12 + 9 + 7) / (15 + 11 + 9) = 28 / 35 = 0.8 = 80%
    expect(result.segmentMetrics[1].successRate).toBe(0.8);

    // Validation 3: Verify success rate aggregation for Single segment
    // Expected: (4 + 5) / (5 + 7) = 9 / 12 = 0.75 = 75%
    expect(result.segmentMetrics[2].successRate).toBe(0.75);

    // Validation 4: Verify cooking time reduction for Homemaker segment
    // Expected: (45 - 38 + 50 - 40 + 40 - 33) / 3 = (7 + 10 + 7) / 3 = 24 / 3 = 8.0 minutes
    expect(result.segmentMetrics[0].cookingTimeReductionMinutes).toBe(8.0);

    // Validation 5: Verify cooking time reduction for Dual-Income segment
    // Expected: (30 - 28 + 35 - 32 + 28 - 26) / 3 = (2 + 3 + 2) / 3 = 7 / 3 = 2.33 minutes
    expect(result.segmentMetrics[1].cookingTimeReductionMinutes).toBeCloseTo(
      2.33,
      2
    );

    // Validation 6: Verify cooking time reduction for Single segment
    // Expected: (20 - 19 + 25 - 24) / 2 = (1 + 1) / 2 = 1.0 minutes
    expect(result.segmentMetrics[2].cookingTimeReductionMinutes).toBe(1.0);

    // Validation 7: Verify satisfaction score for Homemaker segment
    // Expected: (4.8 + 4.6 + 4.9) / 3 = 14.3 / 3 = 4.77
    expect(result.segmentMetrics[0].averageSatisfactionScore).toBeCloseTo(
      4.77,
      2
    );

    // Validation 8: Verify satisfaction score for Dual-Income segment
    // Expected: (4.2 + 4.1 + 4.3) / 3 = 12.6 / 3 = 4.2
    expect(result.segmentMetrics[1].averageSatisfactionScore).toBeCloseTo(
      4.2,
      2
    );

    // Validation 9: Verify satisfaction score for Single segment
    // Expected: (3.9 + 3.8) / 2 = 7.7 / 2 = 3.85
    expect(result.segmentMetrics[2].averageSatisfactionScore).toBeCloseTo(
      3.85,
      2
    );

    // Validation 10: Verify segment names are preserved
    expect(result.segmentMetrics[0].segmentName).toBe(
      "Homemaker (Specialized Homemakers)"
    );
    expect(result.segmentMetrics[1].segmentName).toBe("Dual-Income Household");
    expect(result.segmentMetrics[2].segmentName).toBe("Single Household");

    // Validation 11: Verify highest differentiation effect segment identification
    // Homemaker segment has highest composite score: 90% success, 8.0 min reduction, 4.77 satisfaction
    expect(result.highestDifferentiationSegmentId).toBe("seg_001_homemaker");
    expect(result.highestDifferentiationSegmentName).toBe(
      "Homemaker (Specialized Homemakers)"
    );

    // Validation 12: Verify differentiation scores are calculated and ranked
    expect(result.segmentMetrics[0].differentiationScore).toBeGreaterThan(
      result.segmentMetrics[1].differentiationScore
    );
    expect(result.segmentMetrics[1].differentiationScore).toBeGreaterThan(
      result.segmentMetrics[2].differentiationScore
    );

    // Validation 13: Verify segment ranking by differentiation effect
    // Expected order: Homemaker > Dual-Income > Single
    expect(result.segmentRankingByDifferentiation[0].segmentId).toBe(
      "seg_001_homemaker"
    );
    expect(result.segmentRankingByDifferentiation[0].rank).toBe(1);
    expect(result.segmentRankingByDifferentiation[1].segmentId).toBe(
      "seg_002_dualincome"
    );
    expect(result.segmentRankingByDifferentiation[1].rank).toBe(2);
    expect(result.segmentRankingByDifferentiation[2].segmentId).toBe(
      "seg_003_single"
    );
    expect(result.segmentRankingByDifferentiation[2].rank).toBe(3);

    // Validation 14: Verify comparative analysis - success rate gap
    // Gap between Homemaker and Single: 90% - 75% = 15%
    const successRateGap =
      result.segmentMetrics[0].successRate -
      result.segmentMetrics[2].successRate;
    expect(successRateGap).toBe(0.15);

    // Validation 15: Verify comparative analysis - cooking time reduction gap
    // Gap between Homemaker and Single: 8.0 - 1.0 = 7.0 minutes
    const cookingTimeGap =
      result.segmentMetrics[0].cookingTimeReductionMinutes -
      result.segmentMetrics[2].cookingTimeReductionMinutes;
    expect(cookingTimeGap).toBe(7.0);

    // Validation 16: Verify comparative analysis - satisfaction score gap
    // Gap between Homemaker and Single: 4.77 - 3.85 = 0.92
    const satisfactionGap =
      result.segmentMetrics[0].averageSatisfactionScore -
      result.segmentMetrics[2].averageSatisfactionScore;
    expect(satisfactionGap).toBeCloseTo(0.92, 2);

    // Validation 17: Verify analysis timestamp is set
    expect(result.analysisTimestamp).toEqual(
      new Date("2024-01-15T11:00:00Z")
    );

    // Validation 18: Verify all segments are included in metrics
    expect(result.segmentMetrics.length).toBe(3);

    // Validation 19: Verify composite differentiation score reflects all three metrics
    // Composite = (successRate * 0.4) + (cookingTimeReduction / 10 * 0.3) + (satisfactionScore / 5 * 0.3)
    // Homemaker: (0.9 * 0.4) + (8.0 / 10 * 0.3) + (4.77 / 5 * 0.3) = 0.36 + 0.24 + 0.286 = 0.886
    expect(result.segmentMetrics[0].differentiationScore).toBeCloseTo(0.886, 3);

    // Validation 20: Verify result structure contains required fields
    expect(result).toHaveProperty("segmentMetrics");
    expect(result).toHaveProperty("highestDifferentiationSegmentId");
    expect(result).toHaveProperty("highestDifferentiationSegmentName");
    expect(result).toHaveProperty("segmentRankingByDifferentiation");
    expect(result).toHaveProperty("analysisTimestamp");
  });
});