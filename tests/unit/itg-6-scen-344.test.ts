import { analyzeFeatureUsageBySegment } from '../../src/logic/it-1-br-8-2-2-1';

describe('機能別使用頻度分析機能 - セグメント別集計とランキング表示', () => {
  // SCEN-344
  test('各機能の使用頻度がセグメント別に集計され、ランキング形式で可視化される', () => {
    const mockUsageLogs = [
      {
        userId: 'user_1',
        segmentId: 'segment_free',
        segmentName: 'Free User',
        featureName: 'meal_generator',
        usageCount: 15,
        timestamp: new Date('2024-01-15T10:00:00Z'),
      },
      {
        userId: 'user_1',
        segmentId: 'segment_free',
        segmentName: 'Free User',
        featureName: 'nutrition_dashboard',
        usageCount: 8,
        timestamp: new Date('2024-01-15T11:00:00Z'),
      },
      {
        userId: 'user_1',
        segmentId: 'segment_free',
        segmentName: 'Free User',
        featureName: 'meal_history',
        usageCount: 12,
        timestamp: new Date('2024-01-15T12:00:00Z'),
      },
      {
        userId: 'user_2',
        segmentId: 'segment_free',
        segmentName: 'Free User',
        featureName: 'meal_generator',
        usageCount: 10,
        timestamp: new Date('2024-01-15T13:00:00Z'),
      },
      {
        userId: 'user_2',
        segmentId: 'segment_free',
        segmentName: 'Free User',
        featureName: 'nutrition_dashboard',
        usageCount: 5,
        timestamp: new Date('2024-01-15T14:00:00Z'),
      },
      {
        userId: 'user_3',
        segmentId: 'segment_premium',
        segmentName: 'Premium User',
        featureName: 'meal_generator',
        usageCount: 25,
        timestamp: new Date('2024-01-15T15:00:00Z'),
      },
      {
        userId: 'user_3',
        segmentId: 'segment_premium',
        segmentName: 'Premium User',
        featureName: 'nutrition_dashboard',
        usageCount: 20,
        timestamp: new Date('2024-01-15T16:00:00Z'),
      },
      {
        userId: 'user_3',
        segmentId: 'segment_premium',
        segmentName: 'Premium User',
        featureName: 'budget_management',
        usageCount: 18,
        timestamp: new Date('2024-01-15T17:00:00Z'),
      },
      {
        userId: 'user_4',
        segmentId: 'segment_premium',
        segmentName: 'Premium User',
        featureName: 'meal_generator',
        usageCount: 22,
        timestamp: new Date('2024-01-15T18:00:00Z'),
      },
      {
        userId: 'user_4',
        segmentId: 'segment_premium',
        segmentName: 'Premium User',
        featureName: 'nutrition_dashboard',
        usageCount: 19,
        timestamp: new Date('2024-01-15T19:00:00Z'),
      },
      {
        userId: 'user_5',
        segmentId: 'segment_enterprise',
        segmentName: 'Enterprise User',
        featureName: 'meal_generator',
        usageCount: 40,
        timestamp: new Date('2024-01-15T20:00:00Z'),
      },
      {
        userId: 'user_5',
        segmentId: 'segment_enterprise',
        segmentName: 'Enterprise User',
        featureName: 'advanced_analytics',
        usageCount: 35,
        timestamp: new Date('2024-01-15T21:00:00Z'),
      },
      {
        userId: 'user_5',
        segmentId: 'segment_enterprise',
        segmentName: 'Enterprise User',
        featureName: 'budget_management',
        usageCount: 30,
        timestamp: new Date('2024-01-15T22:00:00Z'),
      },
      {
        userId: 'user_6',
        segmentId: 'segment_enterprise',
        segmentName: 'Enterprise User',
        featureName: 'meal_generator',
        usageCount: 38,
        timestamp: new Date('2024-01-15T23:00:00Z'),
      },
      {
        userId: 'user_6',
        segmentId: 'segment_enterprise',
        segmentName: 'Enterprise User',
        featureName: 'advanced_analytics',
        usageCount: 32,
        timestamp: new Date('2024-01-16T00:00:00Z'),
      },
    ];

    const result = analyzeFeatureUsageBySegment(mockUsageLogs);

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);

    const freeSegmentResult = result.find((seg) => seg.segmentId === 'segment_free');
    expect(freeSegmentResult).toBeDefined();
    expect(freeSegmentResult!.segmentName).toBe('Free User');
    expect(freeSegmentResult!.features).toBeDefined();
    expect(Array.isArray(freeSegmentResult!.features)).toBe(true);
    expect(freeSegmentResult!.features.length).toBe(3);

    expect(freeSegmentResult!.features[0].featureName).toBe('meal_generator');
    expect(freeSegmentResult!.features[0].totalUsageCount).toBe(25);
    expect(freeSegmentResult!.features[1].featureName).toBe('meal_history');
    expect(freeSegmentResult!.features[1].totalUsageCount).toBe(12);
    expect(freeSegmentResult!.features[2].featureName).toBe('nutrition_dashboard');
    expect(freeSegmentResult!.features[2].totalUsageCount).toBe(13);

    for (let i = 0; i < freeSegmentResult!.features.length - 1; i++) {
      expect(freeSegmentResult!.features[i].totalUsageCount).toBeGreaterThanOrEqual(
        freeSegmentResult!.features[i + 1].totalUsageCount,
      );
    }

    const premiumSegmentResult = result.find((seg) => seg.segmentId === 'segment_premium');
    expect(premiumSegmentResult).toBeDefined();
    expect(premiumSegmentResult!.segmentName).toBe('Premium User');
    expect(premiumSegmentResult!.features).toBeDefined();
    expect(premiumSegmentResult!.features.length).toBe(3);

    expect(premiumSegmentResult!.features[0].featureName).toBe('meal_generator');
    expect(premiumSegmentResult!.features[0].totalUsageCount).toBe(47);
    expect(premiumSegmentResult!.features[1].featureName).toBe('nutrition_dashboard');
    expect(premiumSegmentResult!.features[1].totalUsageCount).toBe(39);
    expect(premiumSegmentResult!.features[2].featureName).toBe('budget_management');
    expect(premiumSegmentResult!.features[2].totalUsageCount).toBe(18);

    for (let i = 0; i < premiumSegmentResult!.features.length - 1; i++) {
      expect(premiumSegmentResult!.features[i].totalUsageCount).toBeGreaterThanOrEqual(
        premiumSegmentResult!.features[i + 1].totalUsageCount,
      );
    }

    const enterpriseSegmentResult = result.find((seg) => seg.segmentId === 'segment_enterprise');
    expect(enterpriseSegmentResult).toBeDefined();
    expect(enterpriseSegmentResult!.segmentName).toBe('Enterprise User');
    expect(enterpriseSegmentResult!.features).toBeDefined();
    expect(enterpriseSegmentResult!.features.length).toBe(3);

    expect(enterpriseSegmentResult!.features[0].featureName).toBe('meal_generator');
    expect(enterpriseSegmentResult!.features[0].totalUsageCount).toBe(78);
    expect(enterpriseSegmentResult!.features[1].featureName).toBe('advanced_analytics');
    expect(enterpriseSegmentResult!.features[1].totalUsageCount).toBe(67);
    expect(enterpriseSegmentResult!.features[2].featureName).toBe('budget_management');
    expect(enterpriseSegmentResult!.features[2].totalUsageCount).toBe(30);

    for (let i = 0; i < enterpriseSegmentResult!.features.length - 1; i++) {
      expect(enterpriseSegmentResult!.features[i].totalUsageCount).toBeGreaterThanOrEqual(
        enterpriseSegmentResult!.features[i + 1].totalUsageCount,
      );
    }

    const allSegmentIds = result.map((seg) => seg.segmentId);
    expect(allSegmentIds).toContain('segment_free');
    expect(allSegmentIds).toContain('segment_premium');
    expect(allSegmentIds).toContain('segment_enterprise');
  });
});