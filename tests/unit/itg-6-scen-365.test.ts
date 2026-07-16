import { compareSegmentCookingTimeReduction } from '../../src/logic/it-8-1-2-1';

describe('IT-8-1-2-1: 調理時間短縮実現度比較・可視化機能', () => {
  // SCEN-365
  test('should throw error when segment lacks cooking time data', () => {
    const segmentAData = {
      segmentId: 'seg_001',
      segmentName: 'セグメントA',
      targetCookingMinutes: 30,
      actualCookingMinutes: 25,
      achievementRate: 83.33,
    };

    const segmentBData = {
      segmentId: 'seg_002',
      segmentName: 'セグメントB',
      targetCookingMinutes: 40,
      actualCookingMinutes: 32,
      achievementRate: 80.0,
    };

    const segmentCData = {
      segmentId: 'seg_003',
      segmentName: 'セグメントC',
      targetCookingMinutes: null,
      actualCookingMinutes: null,
      achievementRate: null,
    };

    const inputSegments = [segmentAData, segmentBData, segmentCData];

    expect(() => {
      compareSegmentCookingTimeReduction(inputSegments);
    }).toThrow(/セグメントC/);
  });

  test('should successfully compare segments when all have cooking time data', () => {
    const segmentAData = {
      segmentId: 'seg_001',
      segmentName: 'セグメントA',
      targetCookingMinutes: 30,
      actualCookingMinutes: 25,
      achievementRate: 83.33,
    };

    const segmentBData = {
      segmentId: 'seg_002',
      segmentName: 'セグメントB',
      targetCookingMinutes: 40,
      actualCookingMinutes: 32,
      achievementRate: 80.0,
    };

    const inputSegments = [segmentAData, segmentBData];

    const result = compareSegmentCookingTimeReduction(inputSegments);

    expect(result).toEqual({
      segments: [
        {
          segmentId: 'seg_001',
          segmentName: 'セグメントA',
          targetCookingMinutes: 30,
          actualCookingMinutes: 25,
          achievementRate: 83.33,
        },
        {
          segmentId: 'seg_002',
          segmentName: 'セグメントB',
          targetCookingMinutes: 40,
          actualCookingMinutes: 32,
          achievementRate: 80.0,
        },
      ],
      status: 'success',
    });
  });

  test('should throw error when segment has zero cooking time data', () => {
    const segmentAData = {
      segmentId: 'seg_001',
      segmentName: 'セグメントA',
      targetCookingMinutes: 30,
      actualCookingMinutes: 25,
      achievementRate: 83.33,
    };

    const segmentBData = {
      segmentId: 'seg_004',
      segmentName: 'セグメントD',
      targetCookingMinutes: 0,
      actualCookingMinutes: 0,
      achievementRate: 0,
    };

    const inputSegments = [segmentAData, segmentBData];

    expect(() => {
      compareSegmentCookingTimeReduction(inputSegments);
    }).toThrow(/蓄積/);
  });

  test('should throw error when segment actual cooking time is missing', () => {
    const segmentAData = {
      segmentId: 'seg_001',
      segmentName: 'セグメントA',
      targetCookingMinutes: 30,
      actualCookingMinutes: 25,
      achievementRate: 83.33,
    };

    const segmentBData = {
      segmentId: 'seg_005',
      segmentName: 'セグメントE',
      targetCookingMinutes: 40,
      actualCookingMinutes: undefined,
      achievementRate: undefined,
    };

    const inputSegments = [segmentAData, segmentBData];

    expect(() => {
      compareSegmentCookingTimeReduction(inputSegments);
    }).toThrow(/セグメントE/);
  });

  test('should handle multiple segments with mixed data availability', () => {
    const segmentAData = {
      segmentId: 'seg_001',
      segmentName: 'セグメントA',
      targetCookingMinutes: 30,
      actualCookingMinutes: 25,
      achievementRate: 83.33,
    };

    const segmentBData = {
      segmentId: 'seg_002',
      segmentName: 'セグメントB',
      targetCookingMinutes: 40,
      actualCookingMinutes: 32,
      achievementRate: 80.0,
    };

    const segmentCData = {
      segmentId: 'seg_003',
      segmentName: 'セグメントC',
      targetCookingMinutes: 25,
      actualCookingMinutes: 20,
      achievementRate: 80.0,
    };

    const inputSegments = [segmentAData, segmentBData, segmentCData];

    const result = compareSegmentCookingTimeReduction(inputSegments);

    expect(result.segments.length).toBe(3);
    expect(result.status).toBe('success');
    expect(result.segments[0].achievementRate).toBe(83.33);
    expect(result.segments[1].achievementRate).toBe(80.0);
    expect(result.segments[2].achievementRate).toBe(80.0);
  });
});