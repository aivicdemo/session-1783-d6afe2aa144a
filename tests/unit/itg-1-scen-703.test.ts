import { validateSegmentAnalysisStatisticalSignificance } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-703
  test('セグメント別分析結果の信頼度が有意水準を超える場合に有効なデータとして判定される', () => {
    const segmentAnalysisResults = [
      {
        segmentId: 'seg_001',
        segmentName: '年代20代',
        sampleSize: 150,
        meanSatisfactionScore: 4.2,
        standardDeviation: 0.85,
        pValue: 0.032,
        confidenceIntervalLower: 4.05,
        confidenceIntervalUpper: 4.35,
      },
      {
        segmentId: 'seg_002',
        segmentName: '年代30代',
        sampleSize: 120,
        meanSatisfactionScore: 3.9,
        standardDeviation: 0.92,
        pValue: 0.058,
        confidenceIntervalLower: 3.72,
        confidenceIntervalUpper: 4.08,
      },
      {
        segmentId: 'seg_003',
        segmentName: '年代40代',
        sampleSize: 200,
        meanSatisfactionScore: 4.5,
        standardDeviation: 0.78,
        pValue: 0.008,
        confidenceIntervalLower: 4.38,
        confidenceIntervalUpper: 4.62,
      },
    ];

    const significanceLevel = 0.05;

    const result = validateSegmentAnalysisStatisticalSignificance(
      segmentAnalysisResults,
      significanceLevel
    );

    expect(result).toEqual({
      isValid: true,
      validSegments: [
        {
          segmentId: 'seg_001',
          segmentName: '年代20代',
          sampleSize: 150,
          meanSatisfactionScore: 4.2,
          standardDeviation: 0.85,
          pValue: 0.032,
          confidenceIntervalLower: 4.05,
          confidenceIntervalUpper: 4.35,
          isStatisticallySignificant: true,
          validationStatus: '有効',
        },
        {
          segmentId: 'seg_003',
          segmentName: '年代40代',
          sampleSize: 200,
          meanSatisfactionScore: 4.5,
          standardDeviation: 0.78,
          pValue: 0.008,
          confidenceIntervalLower: 4.38,
          confidenceIntervalUpper: 4.62,
          isStatisticallySignificant: true,
          validationStatus: '有効',
        },
      ],
      invalidSegments: [
        {
          segmentId: 'seg_002',
          segmentName: '年代30代',
          sampleSize: 120,
          meanSatisfactionScore: 3.9,
          standardDeviation: 0.92,
          pValue: 0.058,
          confidenceIntervalLower: 3.72,
          confidenceIntervalUpper: 4.08,
          isStatisticallySignificant: false,
          validationStatus: '無効',
        },
      ],
      significanceLevel: 0.05,
      validSegmentCount: 2,
      totalSegmentCount: 3,
      validSegmentPercentage: 66.67,
    });

    expect(result.validSegments.length).toBe(2);
    expect(result.invalidSegments.length).toBe(1);
    expect(result.validSegmentPercentage).toBeCloseTo(66.67, 2);

    const validSegmentIds = result.validSegments.map((seg) => seg.segmentId);
    expect(validSegmentIds).toContain('seg_001');
    expect(validSegmentIds).toContain('seg_003');
    expect(validSegmentIds).not.toContain('seg_002');

    result.validSegments.forEach((segment) => {
      expect(segment.isStatisticallySignificant).toBe(true);
      expect(segment.validationStatus).toBe('有効');
      expect(segment.pValue).toBeLessThanOrEqual(significanceLevel);
      expect(segment.confidenceIntervalUpper).toBeGreaterThan(
        segment.confidenceIntervalLower
      );
    });

    result.invalidSegments.forEach((segment) => {
      expect(segment.isStatisticallySignificant).toBe(false);
      expect(segment.validationStatus).toBe('無効');
      expect(segment.pValue).toBeGreaterThan(significanceLevel);
    });
  });
});