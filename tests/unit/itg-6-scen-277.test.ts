import { analyzeFeatureUsageAndAttritionBySegment } from '../../src/logic/it-1-br-8-2-2-1';

describe('Feature Usage and Attrition Analysis with Data Quality Validation', () => {
  // SCEN-277: [edge] データ品質検証機能 - 閾値判定で境界値ちょうどの異常値が正確に検出される
  test('should detect boundary value anomalies with 100% accuracy in threshold judgment', () => {
    // Setup: Initialize data quality validation with explicit thresholds
    const minThreshold = 100;
    const maxThreshold = 1000;
    const testDataset = [
      { value: 99, description: 'below min threshold' },
      { value: 100, description: 'at min threshold (lower boundary)' },
      { value: 101, description: 'above min threshold' },
      { value: 500, description: 'middle normal value' },
      { value: 999, description: 'below max threshold' },
      { value: 1000, description: 'at max threshold (upper boundary)' },
      { value: 1001, description: 'above max threshold' },
    ];

    // Execute: Run data quality validation algorithm
    const result = analyzeFeatureUsageAndAttritionBySegment({
      dataPoints: testDataset.map(d => d.value),
      minThreshold: minThreshold,
      maxThreshold: maxThreshold,
      segmentId: 'test-segment-001',
      analysisDate: new Date('2024-01-15T11:00:00Z'),
    });

    // Verify: Boundary value judgment accuracy (condition 1)
    // Value 99 should be anomalous (below min threshold 100)
    expect(result.anomalies).toContainEqual(
      expect.objectContaining({
        value: 99,
        isAnomaly: true,
        anomalyType: 'below_minimum',
      })
    );

    // Value 100 should be at boundary (treated as normal boundary case)
    expect(result.anomalies).toContainEqual(
      expect.objectContaining({
        value: 100,
        isAnomaly: false,
        boundaryStatus: 'at_lower_boundary',
      })
    );

    // Value 101 should be normal
    expect(result.anomalies).toContainEqual(
      expect.objectContaining({
        value: 101,
        isAnomaly: false,
      })
    );

    // Verify: Middle normal value (condition 2a)
    expect(result.anomalies).toContainEqual(
      expect.objectContaining({
        value: 500,
        isAnomaly: false,
      })
    );

    // Value 999 should be normal
    expect(result.anomalies).toContainEqual(
      expect.objectContaining({
        value: 999,
        isAnomaly: false,
      })
    );

    // Value 1000 should be at boundary (treated as normal boundary case)
    expect(result.anomalies).toContainEqual(
      expect.objectContaining({
        value: 1000,
        isAnomaly: false,
        boundaryStatus: 'at_upper_boundary',
      })
    );

    // Value 1001 should be anomalous (above max threshold 1000)
    expect(result.anomalies).toContainEqual(
      expect.objectContaining({
        value: 1001,
        isAnomaly: true,
        anomalyType: 'above_maximum',
      })
    );

    // Verify: Accuracy metrics (condition 3)
    // All boundary value test cases should have 0 false positives
    expect(result.detectionAccuracy).toBe(1.0);
    expect(result.falsePositiveCount).toBe(0);
    expect(result.falseNegativeCount).toBe(0);

    // Verify: Total anomaly count matches expected (2 anomalies: 99, 1001)
    expect(result.anomalies.filter((a: any) => a.isAnomaly === true)).toHaveLength(2);

    // Verify: Boundary cases are correctly identified (not flagged as anomalies)
    const boundaryValues = result.anomalies.filter(
      (a: any) => a.boundaryStatus === 'at_lower_boundary' || a.boundaryStatus === 'at_upper_boundary'
    );
    expect(boundaryValues).toHaveLength(2);
    expect(boundaryValues.map((b: any) => b.value)).toEqual(
      expect.arrayContaining([100, 1000])
    );

    // Verify: Quality report shows 100% precision
    expect(result.qualityReport).toMatchObject({
      totalDataPoints: 7,
      anomalyDetectionPrecision: 1.0,
      boundaryDetectionAccuracy: 1.0,
      noFalseDetections: true,
    });
  });
});