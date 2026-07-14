import { aggregateSegmentSuccessRates } from '../../src/logic/it-7-2-1';

describe('献立生成セグメント別成功率集計', () => {
  // SCEN-927
  test('各セグメントごとに献立生成成功率が正しく算出される', () => {
    const mealPlanLogs = [
      {
        segmentId: 'seg_001_age_30s',
        attemptId: 'att_001',
        success: true,
        timestamp: new Date('2024-01-08T10:00:00Z'),
      },
      {
        segmentId: 'seg_001_age_30s',
        attemptId: 'att_002',
        success: true,
        timestamp: new Date('2024-01-08T11:00:00Z'),
      },
      {
        segmentId: 'seg_001_age_30s',
        attemptId: 'att_003',
        success: false,
        timestamp: new Date('2024-01-08T12:00:00Z'),
      },
      {
        segmentId: 'seg_001_age_30s',
        attemptId: 'att_004',
        success: true,
        timestamp: new Date('2024-01-08T13:00:00Z'),
      },
      {
        segmentId: 'seg_002_age_40s',
        attemptId: 'att_005',
        success: true,
        timestamp: new Date('2024-01-08T10:30:00Z'),
      },
      {
        segmentId: 'seg_002_age_40s',
        attemptId: 'att_006',
        success: true,
        timestamp: new Date('2024-01-08T11:30:00Z'),
      },
      {
        segmentId: 'seg_002_age_40s',
        attemptId: 'att_007',
        success: false,
        timestamp: new Date('2024-01-08T12:30:00Z'),
      },
      {
        segmentId: 'seg_003_family_4person',
        attemptId: 'att_008',
        success: true,
        timestamp: new Date('2024-01-08T10:15:00Z'),
      },
      {
        segmentId: 'seg_003_family_4person',
        attemptId: 'att_009',
        success: false,
        timestamp: new Date('2024-01-08T11:15:00Z'),
      },
    ];

    const result = aggregateSegmentSuccessRates(mealPlanLogs);

    expect(result).toEqual([
      {
        segmentId: 'seg_001_age_30s',
        totalAttempts: 4,
        successCount: 3,
        successRate: 75.0,
      },
      {
        segmentId: 'seg_002_age_40s',
        totalAttempts: 3,
        successCount: 2,
        successRate: 66.67,
      },
      {
        segmentId: 'seg_003_family_4person',
        totalAttempts: 2,
        successCount: 1,
        successRate: 50.0,
      },
    ]);

    const seg001 = result.find((r) => r.segmentId === 'seg_001_age_30s');
    expect(seg001?.successRate).toBeGreaterThanOrEqual(0);
    expect(seg001?.successRate).toBeLessThanOrEqual(100);

    const seg002 = result.find((r) => r.segmentId === 'seg_002_age_40s');
    expect(seg002?.successRate).toBeGreaterThanOrEqual(0);
    expect(seg002?.successRate).toBeLessThanOrEqual(100);

    const seg003 = result.find((r) => r.segmentId === 'seg_003_family_4person');
    expect(seg003?.successRate).toBeGreaterThanOrEqual(0);
    expect(seg003?.successRate).toBeLessThanOrEqual(100);

    expect(seg001?.successRate).not.toEqual(seg002?.successRate);
    expect(seg002?.successRate).not.toEqual(seg003?.successRate);
    expect(seg001?.successRate).not.toEqual(seg003?.successRate);

    expect(seg001?.successRate % 1).toBeLessThanOrEqual(0.01);
    expect(seg002?.successRate % 1).toBeLessThanOrEqual(0.01);
    expect(seg003?.successRate).toBe(50.0);
  });
});