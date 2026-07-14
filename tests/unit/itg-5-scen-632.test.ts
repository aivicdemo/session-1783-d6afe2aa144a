import { describe, test, expect } from "@jest/globals";
import {
  calculateSuccessRateImprovement,
  calculateCookingTimeReduction,
  calculateSatisfactionScoreChange,
  aggregateAlgorithmMetrics,
  compareAlgorithmVersions,
  exportComparisonResultsToCSV,
} from "../../src/logic/it-7-2-1";

describe("IT-7-2-1: Algorithm Improvement Effect Quantitative Comparison Dashboard", () => {
  test("SCEN-632: Improvement effect quantitative comparison - Pre and post-improvement metrics are accurately aggregated and compared", () => {
    // Setup: Pre-improvement algorithm metrics
    const preImprovementData = {
      algorithmVersionId: "algo_v1",
      successRate: 0.8, // 80%
      averageCookingTime: 30, // minutes
      averageSatisfactionScore: 3.5, // out of 5
      sampleSize: 100,
      collectionDate: "2024-01-08",
    };

    // Setup: Post-improvement algorithm metrics
    const postImprovementData = {
      algorithmVersionId: "algo_v2",
      successRate: 0.95, // 95%
      averageCookingTime: 20, // minutes
      averageSatisfactionScore: 4.8, // out of 5
      sampleSize: 100,
      collectionDate: "2024-01-15",
    };

    // Test 1: Success rate improvement calculation
    // Formula: (95% - 80%) / 80% * 100 = +18.75%
    const successRateChange = calculateSuccessRateImprovement(
      preImprovementData.successRate,
      postImprovementData.successRate
    );
    expect(successRateChange).toBe(18.75);

    // Test 2: Cooking time reduction calculation
    // Formula: (30 - 20) / 30 * 100 = 33.33% reduction
    const cookingTimeReduction = calculateCookingTimeReduction(
      preImprovementData.averageCookingTime,
      postImprovementData.averageCookingTime
    );
    expect(cookingTimeReduction).toBeCloseTo(33.33, 2);

    // Test 3: Satisfaction score change calculation
    // Formula: (4.8 - 3.5) / 3.5 * 100 = +37.14%
    const satisfactionChange = calculateSatisfactionScoreChange(
      preImprovementData.averageSatisfactionScore,
      postImprovementData.averageSatisfactionScore
    );
    expect(satisfactionChange).toBeCloseTo(37.14, 2);

    // Test 4: Aggregate multiple improvement patterns
    const improvementPatterns = [
      {
        patternId: "pattern_001",
        preData: {
          successRate: 0.8,
          cookingTime: 30,
          satisfactionScore: 3.5,
        },
        postData: {
          successRate: 0.95,
          cookingTime: 20,
          satisfactionScore: 4.8,
        },
      },
      {
        patternId: "pattern_002",
        preData: {
          successRate: 0.75,
          cookingTime: 35,
          satisfactionScore: 3.2,
        },
        postData: {
          successRate: 0.92,
          cookingTime: 22,
          satisfactionScore: 4.5,
        },
      },
      {
        patternId: "pattern_003",
        preData: {
          successRate: 0.85,
          cookingTime: 25,
          satisfactionScore: 3.8,
        },
        postData: {
          successRate: 0.98,
          cookingTime: 18,
          satisfactionScore: 4.9,
        },
      },
    ];

    const aggregatedMetrics = aggregateAlgorithmMetrics(improvementPatterns);
    expect(aggregatedMetrics).toEqual({
      patternCount: 3,
      averageSuccessRateImprovement: expect.any(Number),
      averageCookingTimeReduction: expect.any(Number),
      averageSatisfactionScoreChange: expect.any(Number),
      minSuccessRateImprovement: expect.any(Number),
      maxSuccessRateImprovement: expect.any(Number),
    });

    // Verify aggregated values are within reasonable bounds
    expect(aggregatedMetrics.averageSuccessRateImprovement).toBeGreaterThan(
      15
    );
    expect(aggregatedMetrics.averageSuccessRateImprovement).toBeLessThan(30);
    expect(aggregatedMetrics.averageCookingTimeReduction).toBeGreaterThan(25);
    expect(aggregatedMetrics.averageCookingTimeReduction).toBeLessThan(40);
    expect(aggregatedMetrics.averageSatisfactionScoreChange).toBeGreaterThan(
      30
    );
    expect(aggregatedMetrics.averageSatisfactionScoreChange).toBeLessThan(45);

    // Test 5: Compare algorithm versions with full comparison object
    const comparisonResult = compareAlgorithmVersions(
      preImprovementData,
      postImprovementData
    );

    expect(comparisonResult).toEqual({
      versionBefore: "algo_v1",
      versionAfter: "algo_v2",
      successRateImprovement: 18.75,
      cookingTimeReduction: expect.any(Number),
      satisfactionScoreChange: expect.any(Number),
      overallImprovementScore: expect.any(Number),
      isSignificantImprovement: expect.any(Boolean),
      comparisonDate: expect.any(String),
    });

    // Validate specific comparison values
    expect(comparisonResult.successRateImprovement).toBe(18.75);
    expect(comparisonResult.cookingTimeReduction).toBeCloseTo(33.33, 2);
    expect(comparisonResult.satisfactionScoreChange).toBeCloseTo(37.14, 2);

    // Test 6: Overall improvement score calculation
    // Should be composite of the three metrics with appropriate weighting
    expect(comparisonResult.overallImprovementScore).toBeGreaterThan(0);
    expect(comparisonResult.overallImprovementScore).toBeLessThanOrEqual(100);

    // Test 7: Significant improvement threshold (e.g., overall score > 30)
    expect(comparisonResult.isSignificantImprovement).toBe(true);

    // Test 8: CSV export functionality
    const csvOutput = exportComparisonResultsToCSV(comparisonResult);
    expect(typeof csvOutput).toBe("string");
    expect(csvOutput).toContain("algo_v1");
    expect(csvOutput).toContain("algo_v2");
    expect(csvOutput).toContain("18.75");
    expect(csvOutput).toContain(String(comparisonResult.successRateImprovement));

    // Test 9: CSV output contains correct numeric values
    const csvLines = csvOutput.split("\n");
    expect(csvLines.length).toBeGreaterThan(1);
    expect(csvLines[0]).toContain("Version"); // Header row expected

    // Test 10: Multiple independent pattern comparisons
    const patternComparisonResults = improvementPatterns.map((pattern) => {
      return compareAlgorithmVersions(
        {
          algorithmVersionId: "pre",
          successRate: pattern.preData.successRate,
          averageCookingTime: pattern.preData.cookingTime,
          averageSatisfactionScore: pattern.preData.satisfactionScore,
          sampleSize: 100,
          collectionDate: "2024-01-08",
        },
        {
          algorithmVersionId: "post",
          successRate: pattern.postData.successRate,
          averageCookingTime: pattern.postData.cookingTime,
          averageSatisfactionScore: pattern.postData.satisfactionScore,
          sampleSize: 100,
          collectionDate: "2024-01-15",
        }
      );
    });

    // Verify each pattern produces independent, consistent results
    expect(patternComparisonResults.length).toBe(3);
    patternComparisonResults.forEach((result) => {
      expect(result.successRateImprovement).toBeGreaterThan(0);
      expect(result.cookingTimeReduction).toBeGreaterThan(0);
      expect(result.satisfactionScoreChange).toBeGreaterThan(0);
      expect(result.overallImprovementScore).toBeGreaterThan(0);
    });

    // Test 11: Verify pattern results are independent (different values)
    const successRateImprovements = patternComparisonResults.map(
      (r) => r.successRateImprovement
    );
    const uniqueImprovements = new Set(successRateImprovements);
    expect(uniqueImprovements.size).toBe(3);

    // Test 12: Boundary condition - Zero or minimal improvement
    const zeroImprovementResult = compareAlgorithmVersions(
      {
        algorithmVersionId: "algo_v1",
        successRate: 0.8,
        averageCookingTime: 30,
        averageSatisfactionScore: 3.5,
        sampleSize: 100,
        collectionDate: "2024-01-08",
      },
      {
        algorithmVersionId: "algo_v1_same",
        successRate: 0.8,
        averageCookingTime: 30,
        averageSatisfactionScore: 3.5,
        sampleSize: 100,
        collectionDate: "2024-01-15",
      }
    );

    expect(zeroImprovementResult.successRateImprovement).toBe(0);
    expect(zeroImprovementResult.cookingTimeReduction).toBe(0);
    expect(zeroImprovementResult.satisfactionScoreChange).toBe(0);
    expect(zeroImprovementResult.isSignificantImprovement).toBe(false);

    // Test 13: Validation - Pre-improvement metrics cannot be null
    expect(() => {
      compareAlgorithmVersions(null as any, postImprovementData);
    }).toThrow(/before/i);

    // Test 14: Validation - Post-improvement metrics cannot be null
    expect(() => {
      compareAlgorithmVersions(preImprovementData, null as any);
    }).toThrow(/after/i);

    // Test 15: Validation - Success rate must be between 0 and 1
    expect(() => {
      compareAlgorithmVersions(
        {
          ...preImprovementData,
          successRate: 1.5,
        },
        postImprovementData
      );
    }).toThrow(/success/i);

    // Test 16: Validation - Cooking time must be positive
    expect(() => {
      compareAlgorithmVersions(
        {
          ...preImprovementData,
          averageCookingTime: -5,
        },
        postImprovementData
      );
    }).toThrow(/cooking/i);

    // Test 17: Validation - Satisfaction score must be between 0 and 5
    expect(() => {
      compareAlgorithmVersions(
        preImprovementData,
        {
          ...postImprovementData,
          averageSatisfactionScore: 6.0,
        }
      );
    }).toThrow(/satisfaction/i);

    // Test 18: Large improvement scenario (edge case)
    const largeImprovementResult = compareAlgorithmVersions(
      {
        algorithmVersionId: "algo_old",
        successRate: 0.5,
        averageCookingTime: 60,
        averageSatisfactionScore: 2.0,
        sampleSize: 100,
        collectionDate: "2024-01-01",
      },
      {
        algorithmVersionId: "algo_new",
        successRate: 0.98,
        averageCookingTime: 15,
        averageSatisfactionScore: 4.9,
        sampleSize: 100,
        collectionDate: "2024-01-15",
      }
    );

    expect(largeImprovementResult.successRateImprovement).toBe(96);
    expect(largeImprovementResult.cookingTimeReduction).toBeCloseTo(75, 1);
    expect(largeImprovementResult.satisfactionScoreChange).toBe(145);
    expect(largeImprovementResult.overallImprovementScore).toBeGreaterThan(80);
    expect(largeImprovementResult.isSignificantImprovement).toBe(true);

    // Test 19: CSV output consistency across multiple exports
    const csvExport1 = exportComparisonResultsToCSV(comparisonResult);
    const csvExport2 = exportComparisonResultsToCSV(comparisonResult);
    expect(csvExport1).toBe(csvExport2);

    // Test 20: CSV contains all required fields
    const csvContent = csvOutput;
    expect(csvContent).toContain("Success Rate");
    expect(csvContent).toContain("Cooking Time");
    expect(csvContent).toContain("Satisfaction Score");
    expect(csvContent).toContain("Improvement");
  });
});