import { evaluateDevelopmentApproval } from '../../src/logic/it-1-br-8-2-1-1';

describe('ユーザーセグメント別の利用パターン分析ダッシュボード', () => {
  // SCEN-378: [edge] 開発リソース配分・実装スケジュール承認判定 - 市場効果予測が閾値以下の場合、承認フラグがfalseで返却される
  test('市場効果予測が閾値以下の場合、承認フラグfalseを返却する', () => {
    const marketEffectThreshold = 70;
    const marketEffectPredictionBelowThreshold = 70;
    const differentiationFeatures = [
      {
        featureId: 'df-001',
        featureName: '調理時間短縮機能',
        painPoint: '調理時間',
        competitiveDifferenceScore: 45,
      },
      {
        featureId: 'df-002',
        featureName: '食材制限対応',
        painPoint: '食材制限',
        competitiveDifferenceScore: 55,
      },
    ];
    const userPainQuantification = {
      cookingTimeConstraint: {
        frequency: 0.72,
        impactScore: 85,
      },
      foodRestriction: {
        frequency: 0.68,
        impactScore: 78,
      },
      budgetConstraint: {
        frequency: 0.55,
        impactScore: 62,
      },
    };
    const segmentAnalysisResults = {
      targetSegmentId: 'seg-househusband-001',
      recipeGenerationSuccessRate: 0.81,
      cookingTimeShorteningDegree: 0.76,
      userSatisfactionScore: 7.8,
    };
    const implementationResourceAllocation = {
      developmentTeamCapacity: 5,
      estimatedEffort: 3,
      implementationDurationWeeks: 8,
    };

    const result = evaluateDevelopmentApproval({
      marketEffectThreshold,
      marketEffectPrediction: marketEffectPredictionBelowThreshold,
      differentiationFeatures,
      userPainQuantification,
      segmentAnalysisResults,
      implementationResourceAllocation,
    });

    expect(result.approvalFlag).toBe(false);
    expect(typeof result.approvalFlag).toBe('boolean');
    expect(result).toHaveProperty('approvalFlag');
    expect(result).toHaveProperty('marketEffectPrediction');
    expect(result.marketEffectPrediction).toBe(marketEffectPredictionBelowThreshold);
    expect(result.marketEffectPrediction).toBeLessThanOrEqual(marketEffectThreshold);
  });

  test('市場効果予測が閾値を超える場合、承認フラグtrueを返却する', () => {
    const marketEffectThreshold = 70;
    const marketEffectPredictionAboveThreshold = 75;
    const differentiationFeatures = [
      {
        featureId: 'df-001',
        featureName: '調理時間短縮機能',
        painPoint: '調理時間',
        competitiveDifferenceScore: 50,
      },
      {
        featureId: 'df-002',
        featureName: '食材制限対応',
        painPoint: '食材制限',
        competitiveDifferenceScore: 60,
      },
    ];
    const userPainQuantification = {
      cookingTimeConstraint: {
        frequency: 0.75,
        impactScore: 88,
      },
      foodRestriction: {
        frequency: 0.70,
        impactScore: 80,
      },
      budgetConstraint: {
        frequency: 0.58,
        impactScore: 65,
      },
    };
    const segmentAnalysisResults = {
      targetSegmentId: 'seg-househusband-001',
      recipeGenerationSuccessRate: 0.85,
      cookingTimeShorteningDegree: 0.80,
      userSatisfactionScore: 8.2,
    };
    const implementationResourceAllocation = {
      developmentTeamCapacity: 6,
      estimatedEffort: 4,
      implementationDurationWeeks: 10,
    };

    const result = evaluateDevelopmentApproval({
      marketEffectThreshold,
      marketEffectPrediction: marketEffectPredictionAboveThreshold,
      differentiationFeatures,
      userPainQuantification,
      segmentAnalysisResults,
      implementationResourceAllocation,
    });

    expect(result.approvalFlag).toBe(true);
    expect(result.marketEffectPrediction).toBe(marketEffectPredictionAboveThreshold);
    expect(result.marketEffectPrediction).toBeGreaterThan(marketEffectThreshold);
  });

  test('市場効果予測が閾値境界値の場合、承認フラグfalseを返却する', () => {
    const marketEffectThreshold = 70;
    const marketEffectPredictionAtThreshold = 70;
    const differentiationFeatures = [
      {
        featureId: 'df-003',
        featureName: '予算最適化機能',
        painPoint: '予算制約',
        competitiveDifferenceScore: 52,
      },
    ];
    const userPainQuantification = {
      cookingTimeConstraint: {
        frequency: 0.73,
        impactScore: 86,
      },
      foodRestriction: {
        frequency: 0.69,
        impactScore: 79,
      },
      budgetConstraint: {
        frequency: 0.60,
        impactScore: 68,
      },
    };
    const segmentAnalysisResults = {
      targetSegmentId: 'seg-househusband-002',
      recipeGenerationSuccessRate: 0.82,
      cookingTimeShorteningDegree: 0.77,
      userSatisfactionScore: 7.9,
    };
    const implementationResourceAllocation = {
      developmentTeamCapacity: 5,
      estimatedEffort: 3,
      implementationDurationWeeks: 9,
    };

    const result = evaluateDevelopmentApproval({
      marketEffectThreshold,
      marketEffectPrediction: marketEffectPredictionAtThreshold,
      differentiationFeatures,
      userPainQuantification,
      segmentAnalysisResults,
      implementationResourceAllocation,
    });

    expect(result.approvalFlag).toBe(false);
    expect(result.marketEffectPrediction).toBe(marketEffectThreshold);
  });

  test('市場効果予測が極度に低い場合、承認フラグfalseを返却する', () => {
    const marketEffectThreshold = 70;
    const marketEffectPredictionVeryLow = 25;
    const differentiationFeatures = [
      {
        featureId: 'df-004',
        featureName: '家族嗜好学習機能',
        painPoint: '家族好み',
        competitiveDifferenceScore: 35,
      },
    ];
    const userPainQuantification = {
      cookingTimeConstraint: {
        frequency: 0.50,
        impactScore: 70,
      },
      foodRestriction: {
        frequency: 0.45,
        impactScore: 65,
      },
      budgetConstraint: {
        frequency: 0.40,
        impactScore: 55,
      },
    };
    const segmentAnalysisResults = {
      targetSegmentId: 'seg-househusband-003',
      recipeGenerationSuccessRate: 0.70,
      cookingTimeShorteningDegree: 0.65,
      userSatisfactionScore: 6.5,
    };
    const implementationResourceAllocation = {
      developmentTeamCapacity: 3,
      estimatedEffort: 2,
      implementationDurationWeeks: 5,
    };

    const result = evaluateDevelopmentApproval({
      marketEffectThreshold,
      marketEffectPrediction: marketEffectPredictionVeryLow,
      differentiationFeatures,
      userPainQuantification,
      segmentAnalysisResults,
      implementationResourceAllocation,
    });

    expect(result.approvalFlag).toBe(false);
    expect(result.marketEffectPrediction).toBe(marketEffectPredictionVeryLow);
    expect(result.marketEffectPrediction).toBeLessThan(marketEffectThreshold);
  });

  test('市場効果予測が高い場合、承認フラグtrueを返却する', () => {
    const marketEffectThreshold = 70;
    const marketEffectPredictionHigh = 92;
    const differentiationFeatures = [
      {
        featureId: 'df-005',
        featureName: 'AI献立推薦',
        painPoint: '調理時間',
        competitiveDifferenceScore: 75,
      },
      {
        featureId: 'df-006',
        featureName: 'リアルタイム栄養管理',
        painPoint: '栄養バランス',
        competitiveDifferenceScore: 80,
      },
    ];
    const userPainQuantification = {
      cookingTimeConstraint: {
        frequency: 0.85,
        impactScore: 92,
      },
      foodRestriction: {
        frequency: 0.78,
        impactScore: 87,
      },
      budgetConstraint: {
        frequency: 0.72,
        impactScore: 82,
      },
    };
    const segmentAnalysisResults = {
      targetSegmentId: 'seg-househusband-004',
      recipeGenerationSuccessRate: 0.92,
      cookingTimeShorteningDegree: 0.88,
      userSatisfactionScore: 8.8,
    };
    const implementationResourceAllocation = {
      developmentTeamCapacity: 8,
      estimatedEffort: 5,
      implementationDurationWeeks: 12,
    };

    const result = evaluateDevelopmentApproval({
      marketEffectThreshold,
      marketEffectPrediction: marketEffectPredictionHigh,
      differentiationFeatures,
      userPainQuantification,
      segmentAnalysisResults,
      implementationResourceAllocation,
    });

    expect(result.approvalFlag).toBe(true);
    expect(result.marketEffectPrediction).toBe(marketEffectPredictionHigh);
    expect(result.marketEffectPrediction).toBeGreaterThan(marketEffectThreshold);
  });
});