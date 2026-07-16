import {
  analyzeFeatureUsageAndDropoffPoints,
} from '../../src/logic/it-1-br-8-2-2-1';

describe('Feature Usage Frequency and Dropoff Point Analysis', () => {
  // SCEN-392
  test('should process session with zero dropoff points without error and mark as no dropoff', () => {
    const input = {
      sessionId: 'session-001',
      userId: 'user-001',
      segmentId: 'segment-stay-at-home-father',
      collectionPeriod: {
        startDate: new Date('2024-01-01T00:00:00Z'),
        endDate: new Date('2024-01-31T23:59:59Z'),
      },
      featureUsageLogs: [
        {
          featureId: 'feature-meal-planning',
          featureName: '献立計画',
          usageTimestamp: new Date('2024-01-15T09:00:00Z'),
          duration_seconds: 300,
          actionType: 'view',
        },
        {
          featureId: 'feature-meal-planning',
          featureName: '献立計画',
          usageTimestamp: new Date('2024-01-15T09:05:30Z'),
          duration_seconds: 450,
          actionType: 'generate',
        },
        {
          featureId: 'feature-ingredient-restriction',
          featureName: '食材制限',
          usageTimestamp: new Date('2024-01-15T10:00:00Z'),
          duration_seconds: 180,
          actionType: 'view',
        },
        {
          featureId: 'feature-ingredient-restriction',
          featureName: '食材制限',
          usageTimestamp: new Date('2024-01-15T10:03:00Z'),
          duration_seconds: 120,
          actionType: 'submit',
        },
      ],
      dropoffLogs: [],
      analysisConfig: {
        minDropoffThreshold: 1,
        featureUsageAggregationLevel: 'daily',
        includeZeroUsageFeatures: false,
      },
    };

    const result = analyzeFeatureUsageAndDropoffPoints(input);

    expect(result).toEqual({
      sessionId: 'session-001',
      userId: 'user-001',
      segmentId: 'segment-stay-at-home-father',
      analysisTimestamp: expect.any(Date),
      status: 'success',
      featureUsageFrequency: [
        {
          featureId: 'feature-meal-planning',
          featureName: '献立計画',
          usageCount: 2,
          totalDuration_seconds: 750,
          averageDuration_seconds: 375,
          usageRank: 1,
        },
        {
          featureId: 'feature-ingredient-restriction',
          featureName: '食材制限',
          usageCount: 2,
          totalDuration_seconds: 300,
          averageDuration_seconds: 150,
          usageRank: 2,
        },
      ],
      dropoffPointAnalysis: {
        hasDropoff: false,
        dropoffCount: 0,
        dropoffDetails: [],
        dropoffStatus: '離脱なし',
      },
      priorityScore: 0,
      dataQuality: {
        totalLogsProcessed: 4,
        validLogsCount: 4,
        invalidLogsCount: 0,
        completenessRate: 1.0,
      },
      errorDetails: null,
    });

    expect(result.status).toBe('success');
    expect(result.dropoffPointAnalysis.dropoffCount).toBe(0);
    expect(result.dropoffPointAnalysis.hasDropoff).toBe(false);
    expect(result.dropoffPointAnalysis.dropoffStatus).toBe('離脱なし');
    expect(result.featureUsageFrequency.length).toBe(2);
    expect(result.featureUsageFrequency[0].featureId).toBe(
      'feature-meal-planning'
    );
    expect(result.featureUsageFrequency[0].usageCount).toBe(2);
    expect(result.featureUsageFrequency[0].totalDuration_seconds).toBe(750);
    expect(result.featureUsageFrequency[1].featureId).toBe(
      'feature-ingredient-restriction'
    );
    expect(result.featureUsageFrequency[1].usageCount).toBe(2);
    expect(result.featureUsageFrequency[1].totalDuration_seconds).toBe(300);
    expect(result.dataQuality.totalLogsProcessed).toBe(4);
    expect(result.dataQuality.validLogsCount).toBe(4);
    expect(result.dataQuality.invalidLogsCount).toBe(0);
    expect(result.dataQuality.completenessRate).toBe(1.0);
    expect(result.errorDetails).toBeNull();
  });
});