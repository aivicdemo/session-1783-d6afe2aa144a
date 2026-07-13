import { describe, test, expect } from "@jest/globals";
import { calculateSegmentStatistics } from "../../src/logic/it-1-br-2-1-1-1";

describe("Segment-wise effect analysis - statistics calculation for edge cases", () => {
  test("SCEN-381: calculates statistics correctly when segment has zero or one user", () => {
    // Setup: Segment with zero users
    const emptySegmentUsers: Array<{
      userId: string;
      satisfactionScore: number;
      cookingTimeReduction: number;
      nutritionAchievementRate: number;
    }> = [];

    const emptySegmentResult = calculateSegmentStatistics({
      segmentId: "seg_empty_001",
      segmentName: "Empty Segment",
      users: emptySegmentUsers,
    });

    // Assertion: Zero users - statistics should be N/A or 0
    expect(emptySegmentResult.userCount).toBe(0);
    expect(emptySegmentResult.averageSatisfactionScore).toBe(0);
    expect(emptySegmentResult.averageCookingTimeReduction).toBe(0);
    expect(emptySegmentResult.averageNutritionAchievementRate).toBe(0);
    expect(emptySegmentResult.standardDeviationSatisfaction).toBe(0);
    expect(emptySegmentResult.standardDeviationCookingTime).toBe(0);
    expect(emptySegmentResult.medianSatisfactionScore).toBe(0);
    expect(emptySegmentResult.hasError).toBe(false);

    // Setup: Segment with one user
    const singleUserSegmentUsers = [
      {
        userId: "user_001",
        satisfactionScore: 85,
        cookingTimeReduction: 12,
        nutritionAchievementRate: 92,
      },
    ];

    const singleUserSegmentResult = calculateSegmentStatistics({
      segmentId: "seg_single_001",
      segmentName: "Single User Segment",
      users: singleUserSegmentUsers,
    });

    // Assertion: One user - statistics should equal the single user's values
    expect(singleUserSegmentResult.userCount).toBe(1);
    expect(singleUserSegmentResult.averageSatisfactionScore).toBe(85);
    expect(singleUserSegmentResult.averageCookingTimeReduction).toBe(12);
    expect(singleUserSegmentResult.averageNutritionAchievementRate).toBe(92);
    expect(singleUserSegmentResult.standardDeviationSatisfaction).toBe(0);
    expect(singleUserSegmentResult.standardDeviationCookingTime).toBe(0);
    expect(singleUserSegmentResult.medianSatisfactionScore).toBe(85);
    expect(singleUserSegmentResult.hasError).toBe(false);

    // Setup: Segment with multiple users for comparison
    const multiUserSegmentUsers = [
      {
        userId: "user_002",
        satisfactionScore: 80,
        cookingTimeReduction: 10,
        nutritionAchievementRate: 90,
      },
      {
        userId: "user_003",
        satisfactionScore: 90,
        cookingTimeReduction: 15,
        nutritionAchievementRate: 95,
      },
      {
        userId: "user_004",
        satisfactionScore: 85,
        cookingTimeReduction: 12,
        nutritionAchievementRate: 92,
      },
    ];

    const multiUserSegmentResult = calculateSegmentStatistics({
      segmentId: "seg_multi_001",
      segmentName: "Multi User Segment",
      users: multiUserSegmentUsers,
    });

    // Assertion: Multiple users - statistics calculated correctly
    // Average satisfaction: (80 + 90 + 85) / 3 = 85
    expect(multiUserSegmentResult.userCount).toBe(3);
    expect(multiUserSegmentResult.averageSatisfactionScore).toBe(85);
    // Average cooking time reduction: (10 + 15 + 12) / 3 = 12.33...
    expect(multiUserSegmentResult.averageCookingTimeReduction).toBeCloseTo(
      12.33,
      1
    );
    // Average nutrition achievement: (90 + 95 + 92) / 3 = 92.33...
    expect(multiUserSegmentResult.averageNutritionAchievementRate).toBeCloseTo(
      92.33,
      1
    );
    // Median satisfaction (sorted: 80, 85, 90) = 85
    expect(multiUserSegmentResult.medianSatisfactionScore).toBe(85);
    // Standard deviation of satisfaction scores
    expect(
      multiUserSegmentResult.standardDeviationSatisfaction
    ).toBeCloseTo(4.08, 1);
    expect(multiUserSegmentResult.hasError).toBe(false);

    // Assertion: Data consistency validation - single user result should differ from multi-user averages
    expect(singleUserSegmentResult.averageSatisfactionScore).toBe(85);
    expect(multiUserSegmentResult.averageSatisfactionScore).toBe(85);
    // Although both have same average satisfaction, the standard deviations differ
    expect(singleUserSegmentResult.standardDeviationSatisfaction).toBe(0);
    expect(multiUserSegmentResult.standardDeviationSatisfaction).toBeGreaterThan(0);

    // Assertion: Empty segment vs single user vs multi-user consistency
    expect(emptySegmentResult.userCount).toBe(0);
    expect(singleUserSegmentResult.userCount).toBe(1);
    expect(multiUserSegmentResult.userCount).toBe(3);

    // Assertion: Verify no error flags are set in any segment
    expect(emptySegmentResult.hasError).toBe(false);
    expect(singleUserSegmentResult.hasError).toBe(false);
    expect(multiUserSegmentResult.hasError).toBe(false);

    // Assertion: All segments return valid numeric results (no null/undefined)
    expect(typeof emptySegmentResult.averageSatisfactionScore).toBe("number");
    expect(typeof singleUserSegmentResult.averageSatisfactionScore).toBe(
      "number"
    );
    expect(typeof multiUserSegmentResult.averageSatisfactionScore).toBe(
      "number"
    );

    // Assertion: Division by zero or invalid operations do not produce NaN or Infinity
    expect(Number.isNaN(emptySegmentResult.averageSatisfactionScore)).toBe(
      false
    );
    expect(
      Number.isFinite(emptySegmentResult.averageSatisfactionScore)
    ).toBe(true);
    expect(Number.isNaN(singleUserSegmentResult.averageSatisfactionScore)).toBe(
      false
    );
    expect(
      Number.isFinite(singleUserSegmentResult.averageSatisfactionScore)
    ).toBe(true);
    expect(Number.isNaN(multiUserSegmentResult.averageSatisfactionScore)).toBe(
      false
    );
    expect(
      Number.isFinite(multiUserSegmentResult.averageSatisfactionScore)
    ).toBe(true);
  });
});