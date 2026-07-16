import { analyzeUserSegmentUtilizationPatterns } from '../../src/logic/it-1-br-8-2-2-1';

describe('ユーザーセグメント別利用パターン分析 - 制約条件入力と離脱ポイント自動抽出', () => {
  // SCEN-237
  test('制約条件入力に応じてセグメント別利用パターンと離脱ポイントが正確に自動抽出・可視化される', () => {
    const analysisInput = {
      selectedSegments: ['newUser', 'existingUser', 'churnedUser'],
      constraints: {
        deviceType: ['mobile', 'tablet'],
        usageTimeSlot: ['morning', 'afternoon'],
        featureUsageFrequency: 'medium',
        analysisStartDate: '2024-01-15',
        analysisEndDate: '2024-03-15',
      },
      minSampleSize: 50,
    };

    const mockUtilizationLogs = [
      {
        userId: 'user001',
        segment: 'newUser',
        deviceType: 'mobile',
        usageTimeSlot: 'morning',
        featureInteractions: [
          { featureName: 'mealPlanGeneration', timestamp: '2024-01-15T08:00:00Z', duration: 180 },
          { featureName: 'allergyManagement', timestamp: '2024-01-15T08:15:00Z', duration: 120 },
        ],
        abandonmentPoint: 'nutritionDashboard',
        abandonmentTimestamp: '2024-01-15T08:45:00Z',
      },
      {
        userId: 'user002',
        segment: 'newUser',
        deviceType: 'mobile',
        usageTimeSlot: 'morning',
        featureInteractions: [
          { featureName: 'mealPlanGeneration', timestamp: '2024-01-20T09:00:00Z', duration: 200 },
          { featureName: 'budgetTracking', timestamp: '2024-01-20T09:20:00Z', duration: 90 },
        ],
        abandonmentPoint: 'shoppingList',
        abandonmentTimestamp: '2024-01-20T09:50:00Z',
      },
      {
        userId: 'user003',
        segment: 'existingUser',
        deviceType: 'tablet',
        usageTimeSlot: 'afternoon',
        featureInteractions: [
          { featureName: 'mealPlanGeneration', timestamp: '2024-02-01T14:00:00Z', duration: 150 },
          { featureName: 'nutritionDashboard', timestamp: '2024-02-01T14:30:00Z', duration: 300 },
          { featureName: 'allergyManagement', timestamp: '2024-02-01T15:00:00Z', duration: 100 },
        ],
        abandonmentPoint: null,
        abandonmentTimestamp: null,
      },
      {
        userId: 'user004',
        segment: 'existingUser',
        deviceType: 'tablet',
        usageTimeSlot: 'afternoon',
        featureInteractions: [
          { featureName: 'budgetTracking', timestamp: '2024-02-10T14:15:00Z', duration: 240 },
          { featureName: 'shoppingList', timestamp: '2024-02-10T14:50:00Z', duration: 180 },
        ],
        abandonmentPoint: 'nutritionDashboard',
        abandonmentTimestamp: '2024-02-10T15:30:00Z',
      },
      {
        userId: 'user005',
        segment: 'churnedUser',
        deviceType: 'mobile',
        usageTimeSlot: 'morning',
        featureInteractions: [
          { featureName: 'mealPlanGeneration', timestamp: '2024-03-01T08:30:00Z', duration: 120 },
        ],
        abandonmentPoint: 'allergyManagement',
        abandonmentTimestamp: '2024-03-01T09:00:00Z',
      },
      {
        userId: 'user006',
        segment: 'churnedUser',
        deviceType: 'mobile',
        usageTimeSlot: 'morning',
        featureInteractions: [
          { featureName: 'budgetTracking', timestamp: '2024-03-05T08:00:00Z', duration: 90 },
        ],
        abandonmentPoint: 'mealPlanGeneration',
        abandonmentTimestamp: '2024-03-05T08:30:00Z',
      },
    ];

    const result = analyzeUserSegmentUtilizationPatterns(analysisInput, mockUtilizationLogs);

    expect(result).toBeDefined();
    expect(result.analysisStatus).toBe('completed');
    expect(result.segmentCount).toBe(3);
    expect(result.totalAnalyzedUsers).toBe(6);
    expect(result.analysisTimestamp).toBeDefined();

    const newUserSegment = result.segmentAnalysis.find((seg) => seg.segmentName === 'newUser');
    expect(newUserSegment).toBeDefined();
    expect(newUserSegment.userCount).toBe(2);
    expect(newUserSegment.abandonmentRate).toBe(100);
    expect(newUserSegment.topAbandonmentPoints).toContain('nutritionDashboard');
    expect(newUserSegment.topAbandonmentPoints).toContain('shoppingList');
    expect(newUserSegment.averageSessionDuration).toBe(197.5);
    expect(newUserSegment.mostUsedFeatures).toEqual(['mealPlanGeneration', 'allergyManagement', 'budgetTracking']);

    const existingUserSegment = result.segmentAnalysis.find((seg) => seg.segmentName === 'existingUser');
    expect(existingUserSegment).toBeDefined();
    expect(existingUserSegment.userCount).toBe(2);
    expect(existingUserSegment.abandonmentRate).toBe(50);
    expect(existingUserSegment.topAbandonmentPoints).toEqual(['nutritionDashboard']);
    expect(existingUserSegment.averageSessionDuration).toBe(245);
    expect(existingUserSegment.mostUsedFeatures).toEqual(['mealPlanGeneration', 'nutritionDashboard', 'allergyManagement', 'budgetTracking', 'shoppingList']);

    const churnedUserSegment = result.segmentAnalysis.find((seg) => seg.segmentName === 'churnedUser');
    expect(churnedUserSegment).toBeDefined();
    expect(churnedUserSegment.userCount).toBe(2);
    expect(churnedUserSegment.abandonmentRate).toBe(100);
    expect(churnedUserSegment.topAbandonmentPoints).toContain('allergyManagement');
    expect(churnedUserSegment.topAbandonmentPoints).toContain('mealPlanGeneration');
    expect(churnedUserSegment.averageSessionDuration).toBe(105);
    expect(churnedUserSegment.mostUsedFeatures).toEqual(['mealPlanGeneration', 'budgetTracking']);

    expect(result.constraintFilterApplied).toEqual({
      deviceTypes: ['mobile', 'tablet'],
      timeSlots: ['morning', 'afternoon'],
      frequencyLevel: 'medium',
    });

    expect(result.visualizationData).toBeDefined();
    expect(result.visualizationData.abandonmentHeatmapBySegment).toBeDefined();
    expect(result.visualizationData.abandonmentHeatmapBySegment['newUser']).toEqual({
      nutritionDashboard: 1,
      shoppingList: 1,
    });
    expect(result.visualizationData.abandonmentHeatmapBySegment['existingUser']).toEqual({
      nutritionDashboard: 1,
    });
    expect(result.visualizationData.abandonmentHeatmapBySegment['churnedUser']).toEqual({
      allergyManagement: 1,
      mealPlanGeneration: 1,
    });

    expect(result.visualizationData.featureUsageDistribution).toBeDefined();
    expect(result.visualizationData.featureUsageDistribution['mealPlanGeneration']).toBe(5);
    expect(result.visualizationData.featureUsageDistribution['budgetTracking']).toBe(3);
    expect(result.visualizationData.featureUsageDistribution['allergyManagement']).toBe(3);

    expect(result.detailedAbandonmentInsights).toBeDefined();
    expect(result.detailedAbandonmentInsights.length).toBe(4);

    const nutritionDashboardInsight = result.detailedAbandonmentInsights.find(
      (insight) => insight.abandonmentPoint === 'nutritionDashboard'
    );
    expect(nutritionDashboardInsight).toBeDefined();
    expect(nutritionDashboardInsight.affectedSegments).toEqual(['newUser', 'existingUser']);
    expect(nutritionDashboardInsight.occurrenceCount).toBe(2);
    expect(nutritionDashboardInsight.percentageOfTotalAbandonments).toBe(50);

    const shoppingListInsight = result.detailedAbandonmentInsights.find(
      (insight) => insight.abandonmentPoint === 'shoppingList'
    );
    expect(shoppingListInsight).toBeDefined();
    expect(shoppingListInsight.affectedSegments).toEqual(['newUser']);
    expect(shoppingListInsight.occurrenceCount).toBe(1);
    expect(shoppingListInsight.percentageOfTotalAbandonments).toBe(25);

    expect(result.filterCapabilities).toEqual({
      availableSegments: ['newUser', 'existingUser', 'churnedUser'],
      availableFeatures: ['mealPlanGeneration', 'allergyManagement', 'budgetTracking', 'shoppingList', 'nutritionDashboard'],
      dateRangeCustomizable: true,
      deviceTypeFilterable: true,
      timeSlotFilterable: true,
    });

    expect(result.dataQualityMetrics).toBeDefined();
    expect(result.dataQualityMetrics.totalRecordsProcessed).toBe(6);
    expect(result.dataQualityMetrics.recordsWithAbandonmentData).toBe(5);
    expect(result.dataQualityMetrics.recordsWithoutAbandonmentData).toBe(1);
    expect(result.dataQualityMetrics.completenessRate).toBe(83.33);
  });
});