import { validateStatisticalSignificance } from '../../src/logic/it-7-2-1';

describe('IT-7-2-1: Weekly Behavior Metrics Aggregation and Algorithm Improvement Comparison Dashboard', () => {
  test('SCEN-946: Statistical Significance Judgment for Segment-wise Behavior Indicators - Exclude Results with Sample Size Below 30', () => {
    // Prepare test data for sample size 29 (below threshold)
    const segmentDataUnderThreshold = {
      segmentId: 'segment_001',
      segmentName: 'househusband_age30-40',
      metricsData: Array.from({ length: 29 }, (_, i) => ({
        recordId: `record_${i}`,
        menuGenerationSuccessRate: 0.75 + Math.random() * 0.2,
        cookingTimeShorteningDegree: 0.65 + Math.random() * 0.25,
        userSatisfactionScore: 3.8 + Math.random() * 1.2,
        timestamp: new Date('2024-01-15T10:00:00Z').getTime() + i * 3600000,
      })),
      sampleSize: 29,
    };

    // Execute statistical significance judgment with sample size 29
    const resultUnderThreshold = validateStatisticalSignificance(
      segmentDataUnderThreshold
    );

    // Verify result for sample size below 30
    expect(resultUnderThreshold).toEqual({
      segmentId: 'segment_001',
      segmentName: 'househusband_age30-40',
      sampleSize: 29,
      isStatisticallySignificant: false,
      confidenceLevel: 'low',
      shouldExcludeFromDisplay: true,
      exclusionReason: 'サンプルサイズが30未満',
      menuGenerationSuccessRateMean: expect.any(Number),
      cookingTimeShorteningDegreeMean: expect.any(Number),
      userSatisfactionScoreMean: expect.any(Number),
      standardDeviationSuccessRate: expect.any(Number),
      standardDeviationShorteningDegree: expect.any(Number),
      standardDeviationSatisfactionScore: expect.any(Number),
    });

    // Assert that the exclusion flag is set to true
    expect(resultUnderThreshold.shouldExcludeFromDisplay).toBe(true);
    expect(resultUnderThreshold.confidenceLevel).toBe('low');

    // Prepare test data for sample size 30 (at threshold)
    const segmentDataAtThreshold = {
      segmentId: 'segment_002',
      segmentName: 'househusband_age40-50',
      metricsData: Array.from({ length: 30 }, (_, i) => ({
        recordId: `record_30_${i}`,
        menuGenerationSuccessRate: 0.78 + Math.random() * 0.15,
        cookingTimeShorteningDegree: 0.72 + Math.random() * 0.2,
        userSatisfactionScore: 4.0 + Math.random() * 1.0,
        timestamp: new Date('2024-01-15T10:00:00Z').getTime() + i * 3600000,
      })),
      sampleSize: 30,
    };

    // Execute statistical significance judgment with sample size 30
    const resultAtThreshold = validateStatisticalSignificance(
      segmentDataAtThreshold
    );

    // Verify result for sample size at or above 30
    expect(resultAtThreshold).toEqual({
      segmentId: 'segment_002',
      segmentName: 'househusband_age40-50',
      sampleSize: 30,
      isStatisticallySignificant: true,
      confidenceLevel: 'acceptable',
      shouldExcludeFromDisplay: false,
      exclusionReason: null,
      menuGenerationSuccessRateMean: expect.any(Number),
      cookingTimeShorteningDegreeMean: expect.any(Number),
      userSatisfactionScoreMean: expect.any(Number),
      standardDeviationSuccessRate: expect.any(Number),
      standardDeviationShorteningDegree: expect.any(Number),
      standardDeviationSatisfactionScore: expect.any(Number),
    });

    // Assert that the exclusion flag is false for sample size 30
    expect(resultAtThreshold.shouldExcludeFromDisplay).toBe(false);
    expect(resultAtThreshold.confidenceLevel).toBe('acceptable');
    expect(resultAtThreshold.exclusionReason).toBeNull();

    // Verify that means are calculated correctly for sample size 30
    const meanSuccessRate = resultAtThreshold.menuGenerationSuccessRateMean;
    expect(meanSuccessRate).toBeGreaterThanOrEqual(0.63);
    expect(meanSuccessRate).toBeLessThanOrEqual(0.93);

    const meanShorteningDegree =
      resultAtThreshold.cookingTimeShorteningDegreeMean;
    expect(meanShorteningDegree).toBeGreaterThanOrEqual(0.52);
    expect(meanShorteningDegree).toBeLessThanOrEqual(0.92);

    const meanSatisfactionScore = resultAtThreshold.userSatisfactionScoreMean;
    expect(meanSatisfactionScore).toBeGreaterThanOrEqual(3.0);
    expect(meanSatisfactionScore).toBeLessThanOrEqual(5.0);

    // Verify standard deviations are non-negative numbers
    expect(resultAtThreshold.standardDeviationSuccessRate).toBeGreaterThanOrEqual(
      0
    );
    expect(
      resultAtThreshold.standardDeviationShorteningDegree
    ).toBeGreaterThanOrEqual(0);
    expect(resultAtThreshold.standardDeviationSatisfactionScore).toBeGreaterThanOrEqual(
      0
    );
  });
});