import { calculateSegmentCookingTimeReductionAnalysis } from '../../src/logic/it-7-2-1';

describe('Segment Cooking Time Reduction Analysis - Automatic Sorting by Reduction Rate', () => {
  test('SCEN-933: Multiple segments sorted in descending order by cooking time reduction rate', () => {
    // Precondition: Dashboard system is logged in and segment cooking time reduction analysis screen is opened
    // Trigger: Analysis data is loaded and reduction rate analysis feature is executed
    // Expected: Segments are sorted in descending order by reduction rate, with accurate comparison across segments

    const segmentAnalysisInput = {
      segments: [
        {
          segmentId: 'seg_001',
          segmentName: 'Working Parents (30-40s)',
          targetCookingTimeMinutes: 60,
          actualCookingTimeMinutes: 33,
        },
        {
          segmentId: 'seg_002',
          segmentName: 'Homemakers (40-50s)',
          targetCookingTimeMinutes: 45,
          actualCookingTimeMinutes: 13,
        },
        {
          segmentId: 'seg_003',
          segmentName: 'Single Parents',
          targetCookingTimeMinutes: 50,
          actualCookingTimeMinutes: 36,
        },
      ],
    };

    // Execute analysis function
    const result = calculateSegmentCookingTimeReductionAnalysis(segmentAnalysisInput);

    // Verify: Result structure contains sorted segments with reduction rates
    expect(result).toEqual(
      expect.objectContaining({
        segments: expect.any(Array),
        analysisTimestamp: expect.any(String),
      })
    );

    // Verify: Each segment has required fields
    result.segments.forEach((segment: any) => {
      expect(segment).toEqual(
        expect.objectContaining({
          segmentId: expect.any(String),
          segmentName: expect.any(String),
          reductionRatePercent: expect.any(Number),
          targetCookingTimeMinutes: expect.any(Number),
          actualCookingTimeMinutes: expect.any(Number),
        })
      );
    });

    // Calculate expected reduction rates:
    // Segment A: (60 - 33) / 60 * 100 = 45%
    // Segment B: (45 - 13) / 45 * 100 ≈ 71.11% → rounded to 71%
    // Segment C: (50 - 36) / 50 * 100 = 28%

    // Verify: Reduction rates are calculated correctly
    expect(result.segments[0].reductionRatePercent).toBe(71);
    expect(result.segments[1].reductionRatePercent).toBe(45);
    expect(result.segments[2].reductionRatePercent).toBe(28);

    // Verify: Segments are sorted in descending order by reduction rate
    expect(result.segments[0].segmentId).toBe('seg_002');
    expect(result.segments[0].segmentName).toBe('Homemakers (40-50s)');
    expect(result.segments[1].segmentId).toBe('seg_001');
    expect(result.segments[1].segmentName).toBe('Working Parents (30-40s)');
    expect(result.segments[2].segmentId).toBe('seg_003');
    expect(result.segments[2].segmentName).toBe('Single Parents');

    // Verify: Ordering is strictly descending
    for (let i = 0; i < result.segments.length - 1; i++) {
      expect(result.segments[i].reductionRatePercent).toBeGreaterThanOrEqual(
        result.segments[i + 1].reductionRatePercent
      );
    }

    // Test data mutation: Change reduction rates and verify re-sorting
    const mutatedInput = {
      segments: [
        {
          segmentId: 'seg_001',
          segmentName: 'Working Parents (30-40s)',
          targetCookingTimeMinutes: 60,
          actualCookingTimeMinutes: 12,
        },
        {
          segmentId: 'seg_002',
          segmentName: 'Homemakers (40-50s)',
          targetCookingTimeMinutes: 45,
          actualCookingTimeMinutes: 18,
        },
        {
          segmentId: 'seg_003',
          segmentName: 'Single Parents',
          targetCookingTimeMinutes: 50,
          actualCookingTimeMinutes: 45,
        },
      ],
    };

    const mutatedResult = calculateSegmentCookingTimeReductionAnalysis(mutatedInput);

    // New reduction rates:
    // Segment A: (60 - 12) / 60 * 100 = 80%
    // Segment B: (45 - 18) / 45 * 100 = 60%
    // Segment C: (50 - 45) / 50 * 100 = 10%

    expect(mutatedResult.segments[0].reductionRatePercent).toBe(80);
    expect(mutatedResult.segments[1].reductionRatePercent).toBe(60);
    expect(mutatedResult.segments[2].reductionRatePercent).toBe(10);

    // Verify: New order reflects changed data, still descending
    expect(mutatedResult.segments[0].segmentId).toBe('seg_001');
    expect(mutatedResult.segments[1].segmentId).toBe('seg_002');
    expect(mutatedResult.segments[2].segmentId).toBe('seg_003');

    for (let i = 0; i < mutatedResult.segments.length - 1; i++) {
      expect(mutatedResult.segments[i].reductionRatePercent).toBeGreaterThanOrEqual(
        mutatedResult.segments[i + 1].reductionRatePercent
      );
    }
  });
});