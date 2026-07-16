import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { compareAlgorithmImprovementEffects } from '../../src/logic/it-8-1-1-1';

describe('Algorithm Improvement Effect Comparison - Missing Aggregation Data Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-261
  test('should throw error when pre-improvement version aggregation data is missing', () => {
    const preImprovementVersionId = 'v1.0.0';
    const postImprovementVersionId = 'v1.0.1';

    const preImprovementAggregation = null;
    const postImprovementAggregation = {
      versionId: postImprovementVersionId,
      successRate: 0.78,
      avgCookingTimeSeconds: 1200,
      userSatisfactionScore: 4.2,
      sampleCount: 250,
      periodEndDate: new Date('2024-01-31T23:59:59Z'),
    };

    expect(() =>
      compareAlgorithmImprovementEffects({
        preImprovementVersionId,
        postImprovementVersionId,
        preImprovementAggregation,
        postImprovementAggregation,
      })
    ).toThrow(/集計データ/);
  });

  test('should throw error when post-improvement version aggregation data is missing', () => {
    const preImprovementVersionId = 'v1.0.0';
    const postImprovementVersionId = 'v1.0.1';

    const preImprovementAggregation = {
      versionId: preImprovementVersionId,
      successRate: 0.72,
      avgCookingTimeSeconds: 1380,
      userSatisfactionScore: 3.8,
      sampleCount: 200,
      periodEndDate: new Date('2024-01-31T23:59:59Z'),
    };
    const postImprovementAggregation = null;

    expect(() =>
      compareAlgorithmImprovementEffects({
        preImprovementVersionId,
        postImprovementVersionId,
        preImprovementAggregation,
        postImprovementAggregation,
      })
    ).toThrow(/集計データ/);
  });

  test('should throw error when both version aggregation data are missing', () => {
    const preImprovementVersionId = 'v1.0.0';
    const postImprovementVersionId = 'v1.0.1';

    const preImprovementAggregation = null;
    const postImprovementAggregation = null;

    expect(() =>
      compareAlgorithmImprovementEffects({
        preImprovementVersionId,
        postImprovementVersionId,
        preImprovementAggregation,
        postImprovementAggregation,
      })
    ).toThrow(/集計データ/);
  });

  test('should successfully compare when both version aggregation data are present', () => {
    const preImprovementVersionId = 'v1.0.0';
    const postImprovementVersionId = 'v1.0.1';

    const preImprovementAggregation = {
      versionId: preImprovementVersionId,
      successRate: 0.72,
      avgCookingTimeSeconds: 1380,
      userSatisfactionScore: 3.8,
      sampleCount: 200,
      periodEndDate: new Date('2024-01-31T23:59:59Z'),
    };

    const postImprovementAggregation = {
      versionId: postImprovementVersionId,
      successRate: 0.78,
      avgCookingTimeSeconds: 1200,
      userSatisfactionScore: 4.2,
      sampleCount: 250,
      periodEndDate: new Date('2024-01-31T23:59:59Z'),
    };

    const result = compareAlgorithmImprovementEffects({
      preImprovementVersionId,
      postImprovementVersionId,
      preImprovementAggregation,
      postImprovementAggregation,
    });

    expect(result).toBeDefined();
    expect(result.preVersionSuccessRate).toBe(0.72);
    expect(result.postVersionSuccessRate).toBe(0.78);
    expect(result.successRateImprovement).toBe(0.06);
    expect(result.preVersionAvgCookingTimeSeconds).toBe(1380);
    expect(result.postVersionAvgCookingTimeSeconds).toBe(1200);
    expect(result.cookingTimeReductionSeconds).toBe(180);
    expect(result.preVersionUserSatisfactionScore).toBe(3.8);
    expect(result.postVersionUserSatisfactionScore).toBe(4.2);
    expect(result.satisfactionScoreImprovement).toBe(0.4);
    expect(result.comparisonStatus).toBe('success');
  });

  test('should throw error when pre-improvement aggregation data has missing required fields', () => {
    const preImprovementVersionId = 'v1.0.0';
    const postImprovementVersionId = 'v1.0.1';

    const preImprovementAggregation = {
      versionId: preImprovementVersionId,
      successRate: 0.72,
      avgCookingTimeSeconds: 1380,
      userSatisfactionScore: 3.8,
      sampleCount: 200,
      periodEndDate: new Date('2024-01-31T23:59:59Z'),
    };

    const postImprovementAggregation = {
      versionId: postImprovementVersionId,
      successRate: 0.78,
      avgCookingTimeSeconds: 1200,
      userSatisfactionScore: 4.2,
      sampleCount: 250,
    };

    expect(() =>
      compareAlgorithmImprovementEffects({
        preImprovementVersionId,
        postImprovementVersionId,
        preImprovementAggregation,
        postImprovementAggregation,
      })
    ).toThrow(/集計データ/);
  });

  test('should handle empty aggregation object as missing data and throw error', () => {
    const preImprovementVersionId = 'v1.0.0';
    const postImprovementVersionId = 'v1.0.1';

    const preImprovementAggregation = {};
    const postImprovementAggregation = {
      versionId: postImprovementVersionId,
      successRate: 0.78,
      avgCookingTimeSeconds: 1200,
      userSatisfactionScore: 4.2,
      sampleCount: 250,
      periodEndDate: new Date('2024-01-31T23:59:59Z'),
    };

    expect(() =>
      compareAlgorithmImprovementEffects({
        preImprovementVersionId,
        postImprovementVersionId,
        preImprovementAggregation,
        postImprovementAggregation,
      })
    ).toThrow(/集計データ/);
  });
});