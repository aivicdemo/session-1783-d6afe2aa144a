import { evaluateSegmentStatisticalSignificance } from '../../src/logic/it-7-2-1';

describe('Segment Statistical Significance Evaluation', () => {
  // SCEN-945
  test('should mark results with p-value >= 0.05 as requiring further investigation', () => {
    const segmentAnalysisResults = [
      {
        segmentId: 'segment_001',
        segmentName: 'Age 30-40 with 2 children',
        successRate: 0.82,
        successRatePValue: 0.03,
        cookingTimeReduction: 0.15,
        cookingTimeReductionPValue: 0.02,
        satisfactionScore: 4.2,
        satisfactionScorePValue: 0.08,
        sampleSize: 145,
        analysisTimestamp: '2024-01-15T11:00:00Z'
      },
      {
        segmentId: 'segment_002',
        segmentName: 'Age 40-50 with 3+ children',
        successRate: 0.78,
        successRatePValue: 0.06,
        cookingTimeReduction: 0.12,
        cookingTimeReductionPValue: 0.04,
        satisfactionScore: 3.9,
        satisfactionScorePValue: 0.15,
        sampleSize: 98,
        analysisTimestamp: '2024-01-15T11:00:00Z'
      },
      {
        segmentId: 'segment_003',
        segmentName: 'Age 25-30 with 1 child',
        successRate: 0.85,
        successRatePValue: 0.01,
        cookingTimeReduction: 0.18,
        cookingTimeReductionPValue: 0.05,
        satisfactionScore: 4.5,
        satisfactionScorePValue: 0.002,
        sampleSize: 167,
        analysisTimestamp: '2024-01-15T11:00:00Z'
      }
    ];

    const significanceThreshold = 0.05;

    const evaluationResult = evaluateSegmentStatisticalSignificance(
      segmentAnalysisResults,
      significanceThreshold
    );

    expect(evaluationResult.totalSegments).toBe(3);
    expect(evaluationResult.significantResults).toBe(1);
    expect(evaluationResult.requiresInvestigation).toBe(2);

    expect(evaluationResult.segmentEvaluations).toEqual([
      {
        segmentId: 'segment_001',
        segmentName: 'Age 30-40 with 2 children',
        successRateSignificant: true,
        successRatePValue: 0.03,
        cookingTimeReductionSignificant: true,
        cookingTimeReductionPValue: 0.02,
        satisfactionScoreSignificant: false,
        satisfactionScorePValue: 0.08,
        overallSignificant: false,
        flagForInvestigation: true,
        investigationReason: 'satisfactionScore',
        sampleSize: 145
      },
      {
        segmentId: 'segment_002',
        segmentName: 'Age 40-50 with 3+ children',
        successRateSignificant: false,
        successRatePValue: 0.06,
        cookingTimeReductionSignificant: true,
        cookingTimeReductionPValue: 0.04,
        satisfactionScoreSignificant: false,
        satisfactionScorePValue: 0.15,
        overallSignificant: false,
        flagForInvestigation: true,
        investigationReason: 'successRate, satisfactionScore',
        sampleSize: 98
      },
      {
        segmentId: 'segment_003',
        segmentName: 'Age 25-30 with 1 child',
        successRateSignificant: true,
        successRatePValue: 0.01,
        cookingTimeReductionSignificant: false,
        cookingTimeReductionPValue: 0.05,
        satisfactionScoreSignificant: true,
        satisfactionScorePValue: 0.002,
        overallSignificant: false,
        flagForInvestigation: true,
        investigationReason: 'cookingTimeReduction',
        sampleSize: 167
      }
    ]);

    const investigationFlaggedSegments = evaluationResult.segmentEvaluations.filter(
      (seg) => seg.flagForInvestigation === true
    );

    expect(investigationFlaggedSegments.length).toBe(2);
    expect(investigationFlaggedSegments.map((seg) => seg.segmentId)).toEqual([
      'segment_002',
      'segment_003'
    ]);

    const segment001Details = evaluationResult.segmentEvaluations[0];
    expect(segment001Details.flagForInvestigation).toBe(true);
    expect(segment001Details.investigationReason).toBe('satisfactionScore');

    const segment002Details = evaluationResult.segmentEvaluations[1];
    expect(segment002Details.flagForInvestigation).toBe(true);
    expect(segment002Details.investigationReason).toBe('successRate, satisfactionScore');

    const allInvestigationFlaggedIds = evaluationResult.segmentEvaluations
      .filter((seg) => seg.flagForInvestigation)
      .map((seg) => seg.segmentId);

    expect(allInvestigationFlaggedIds).toContain('segment_002');
    expect(allInvestigationFlaggedIds).toContain('segment_003');

    expect(evaluationResult.filterableMetadata).toEqual({
      analysisTimestamp: '2024-01-15T11:00:00Z',
      significanceThreshold: 0.05,
      evaluatedAt: expect.any(String),
      dataQualityIndicator: 'PASSED'
    });
  });
});