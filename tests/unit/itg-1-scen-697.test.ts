import { assignPrioritiesToDifferentiationFeatures } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-697
  test('セグメント別利用パターン分析結果から差別化機能の優先順位が正しく決定される', () => {
    const segmentAnalysisData = {
      segments: [
        {
          segmentId: 'seg_001',
          segmentName: 'busy_professional',
          userCount: 450,
          mealtimePreferenceScore: 85,
          budgetSensitivity: 72,
          nutritionFocusScore: 65,
          mealPlanAcceptanceRate: 78,
          cookingTimeReductionAchievement: 68,
          userSatisfactionScore: 82,
          featureUsageFrequency: {
            mealRecommendation: 92,
            nutritionManagement: 58,
            shoppingListIntegration: 88,
            socialSharing: 34,
          },
          sessionDurationMinutes: 15,
          conversionRate: 0.81,
          churnRate: 0.08,
        },
        {
          segmentId: 'seg_002',
          segmentName: 'family_nutrition_focused',
          userCount: 320,
          mealtimePreferenceScore: 78,
          budgetSensitivity: 58,
          nutritionFocusScore: 94,
          mealPlanAcceptanceRate: 88,
          cookingTimeReductionAchievement: 62,
          userSatisfactionScore: 79,
          featureUsageFrequency: {
            mealRecommendation: 76,
            nutritionManagement: 95,
            shoppingListIntegration: 72,
            socialSharing: 28,
          },
          sessionDurationMinutes: 22,
          conversionRate: 0.74,
          churnRate: 0.12,
        },
        {
          segmentId: 'seg_003',
          segmentName: 'budget_conscious',
          userCount: 280,
          mealtimePreferenceScore: 68,
          budgetSensitivity: 92,
          nutritionFocusScore: 52,
          mealPlanAcceptanceRate: 71,
          cookingTimeReductionAchievement: 55,
          userSatisfactionScore: 64,
          featureUsageFrequency: {
            mealRecommendation: 68,
            nutritionManagement: 38,
            shoppingListIntegration: 85,
            socialSharing: 22,
          },
          sessionDurationMinutes: 12,
          conversionRate: 0.62,
          churnRate: 0.18,
        },
      ],
      analysisDate: '2024-02-15T10:00:00Z',
    };

    const differentiationFeatureCandidates = [
      {
        featureId: 'feat_meal_rec',
        featureName: 'mealRecommendation',
        estimatedImplementationDifficulty: 35,
        expectedROIPercentage: 28,
        targetSegmentIds: ['seg_001', 'seg_002'],
      },
      {
        featureId: 'feat_nutr_mgmt',
        featureName: 'nutritionManagement',
        estimatedImplementationDifficulty: 52,
        expectedROIPercentage: 42,
        targetSegmentIds: ['seg_002'],
      },
      {
        featureId: 'feat_shop_int',
        featureName: 'shoppingListIntegration',
        estimatedImplementationDifficulty: 48,
        expectedROIPercentage: 35,
        targetSegmentIds: ['seg_001', 'seg_003'],
      },
      {
        featureId: 'feat_social_share',
        featureName: 'socialSharing',
        estimatedImplementationDifficulty: 28,
        expectedROIPercentage: 12,
        targetSegmentIds: ['seg_001'],
      },
    ];

    const result = assignPrioritiesToDifferentiationFeatures({
      segmentAnalysisData,
      differentiationFeatureCandidates,
    });

    expect(result).toBeDefined();
    expect(result.prioritizedFeatures).toBeDefined();
    expect(Array.isArray(result.prioritizedFeatures)).toBe(true);
    expect(result.prioritizedFeatures.length).toBe(4);

    expect(result.prioritizedFeatures[0].featureName).toBe(
      'nutritionManagement'
    );
    expect(result.prioritizedFeatures[0].priorityScore).toBe(76);
    expect(result.prioritizedFeatures[0].priorityRank).toBe(1);

    expect(result.prioritizedFeatures[1].featureName).toBe(
      'mealRecommendation'
    );
    expect(result.prioritizedFeatures[1].priorityScore).toBe(68);
    expect(result.prioritizedFeatures[1].priorityRank).toBe(2);

    expect(result.prioritizedFeatures[2].featureName).toBe(
      'shoppingListIntegration'
    );
    expect(result.prioritizedFeatures[2].priorityScore).toBe(62);
    expect(result.prioritizedFeatures[2].priorityRank).toBe(3);

    expect(result.prioritizedFeatures[3].featureName).toBe('socialSharing');
    expect(result.prioritizedFeatures[3].priorityScore).toBe(28);
    expect(result.prioritizedFeatures[3].priorityRank).toBe(4);

    for (const feature of result.prioritizedFeatures) {
      expect(feature.priorityScore).toBeGreaterThanOrEqual(0);
      expect(feature.priorityScore).toBeLessThanOrEqual(100);
    }

    for (let i = 0; i < result.prioritizedFeatures.length - 1; i++) {
      expect(result.prioritizedFeatures[i].priorityScore).toBeGreaterThanOrEqual(
        result.prioritizedFeatures[i + 1].priorityScore
      );
    }

    expect(result.prioritizedFeatures[0].targetSegmentAllocation).toBeDefined();
    expect(
      result.prioritizedFeatures[0].targetSegmentAllocation.primarySegment
    ).toBe('seg_002');
    expect(
      result.prioritizedFeatures[0].targetSegmentAllocation.secondarySegments
    ).toContain('seg_001');

    expect(
      result.prioritizedFeatures[1].targetSegmentAllocation.primarySegment
    ).toBe('seg_001');

    expect(result.allocationStrategy).toBeDefined();
    expect(result.allocationStrategy.totalAllocatedResources).toBe(100);
    expect(result.allocationStrategy.phaseRolloutPlan).toBeDefined();
    expect(Array.isArray(result.allocationStrategy.phaseRolloutPlan)).toBe(
      true
    );
    expect(result.allocationStrategy.phaseRolloutPlan.length).toBe(3);

    expect(result.allocationStrategy.phaseRolloutPlan[0].phaseName).toBe(
      'Phase 1'
    );
    expect(result.allocationStrategy.phaseRolloutPlan[0].allocatedPercentage).toBe(
      40
    );
    expect(
      result.allocationStrategy.phaseRolloutPlan[0].targetedFeatures
    ).toContain('nutritionManagement');

    expect(result.allocationStrategy.phaseRolloutPlan[1].phaseName).toBe(
      'Phase 2'
    );
    expect(result.allocationStrategy.phaseRolloutPlan[1].allocatedPercentage).toBe(
      35
    );

    expect(result.allocationStrategy.phaseRolloutPlan[2].phaseName).toBe(
      'Phase 3'
    );
    expect(result.allocationStrategy.phaseRolloutPlan[2].allocatedPercentage).toBe(
      25
    );

    expect(result.prioritizationLogic).toBeDefined();
    expect(result.prioritizationLogic.roiWeightage).toBe(0.4);
    expect(result.prioritizationLogic.implementationDifficultyWeightage).toBe(0.3);
    expect(result.prioritizationLogic.segmentCoverageWeightage).toBe(0.3);

    expect(result.generatedAt).toBeDefined();
    expect(typeof result.generatedAt).toBe('string');

    const timestamp = new Date(result.generatedAt);
    expect(timestamp.getTime()).toBeGreaterThan(0);
  });
});