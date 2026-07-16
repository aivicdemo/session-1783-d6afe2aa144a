import { extractAndAggregateSegmentUsagePatterns } from '../../src/logic/it-1-br-8-2-2-1';

describe('セグメント別利用パターンデータ抽出・集計機能', () => {
  // SCEN-360
  test('日次粒度での集計が完了し、セグメント別の使用頻度パターンが正確に集計される', () => {
    // 準備: テストデータベース用の複数セグメントの日次利用ログデータ
    const segmentUsageLogs = [
      {
        segmentId: 'SEG001',
        segmentName: '年代30代・子供2人・食材制限なし',
        logDate: '2024-01-15',
        mealGenerationAttempts: 3,
        mealRejectionCount: 1,
        cookingTimeMinutes: 25,
        userSatisfactionScore: 4.2,
        featureUsageDetail: {
          mealPlanningFeature: 5,
          nutritionAnalysisFeature: 3,
          budgetManagementFeature: 2,
          allergyManagementFeature: 1,
        },
        abandonmentPointFeature: 'budgetManagementFeature',
      },
      {
        segmentId: 'SEG001',
        segmentName: '年代30代・子供2人・食材制限なし',
        logDate: '2024-01-15',
        mealGenerationAttempts: 2,
        mealRejectionCount: 0,
        cookingTimeMinutes: 20,
        userSatisfactionScore: 4.5,
        featureUsageDetail: {
          mealPlanningFeature: 4,
          nutritionAnalysisFeature: 2,
          budgetManagementFeature: 3,
          allergyManagementFeature: 2,
        },
        abandonmentPointFeature: null,
      },
      {
        segmentId: 'SEG002',
        segmentName: '年代40代・子供1人・食材制限あり',
        logDate: '2024-01-15',
        mealGenerationAttempts: 4,
        mealRejectionCount: 2,
        cookingTimeMinutes: 35,
        userSatisfactionScore: 3.8,
        featureUsageDetail: {
          mealPlanningFeature: 4,
          nutritionAnalysisFeature: 5,
          budgetManagementFeature: 1,
          allergyManagementFeature: 4,
        },
        abandonmentPointFeature: 'mealPlanningFeature',
      },
      {
        segmentId: 'SEG002',
        segmentName: '年代40代・子供1人・食材制限あり',
        logDate: '2024-01-15',
        mealGenerationAttempts: 3,
        mealRejectionCount: 1,
        cookingTimeMinutes: 30,
        userSatisfactionScore: 3.9,
        featureUsageDetail: {
          mealPlanningFeature: 3,
          nutritionAnalysisFeature: 4,
          budgetManagementFeature: 2,
          allergyManagementFeature: 5,
        },
        abandonmentPointFeature: null,
      },
    ];

    const aggregationPeriod = {
      startDate: '2024-01-15',
      endDate: '2024-01-15',
      granularity: 'daily',
    };

    // 実行: セグメント別利用パターンデータ抽出・集計機能を実行
    const result = extractAndAggregateSegmentUsagePatterns(
      segmentUsageLogs,
      aggregationPeriod
    );

    // 期待値の計算（日次粒度での集計）
    // SEG001の日次集計:
    // - 合計試行回数: 3 + 2 = 5
    // - 合計却下数: 1 + 0 = 1
    // - 平均調理時間: (25 + 20) / 2 = 22.5分
    // - 平均満足度: (4.2 + 4.5) / 2 = 4.35
    // - 機能別使用頻度:
    //   - mealPlanningFeature: (5 + 4) / 2 = 4.5
    //   - nutritionAnalysisFeature: (3 + 2) / 2 = 2.5
    //   - budgetManagementFeature: (2 + 3) / 2 = 2.5
    //   - allergyManagementFeature: (1 + 2) / 2 = 1.5
    // - 離脱ポイント: budgetManagementFeature (1回発生)

    // SEG002の日次集計:
    // - 合計試行回数: 4 + 3 = 7
    // - 合計却下数: 2 + 1 = 3
    // - 平均調理時間: (35 + 30) / 2 = 32.5分
    // - 平均満足度: (3.8 + 3.9) / 2 = 3.85
    // - 機能別使用頻度:
    //   - mealPlanningFeature: (4 + 3) / 2 = 3.5
    //   - nutritionAnalysisFeature: (5 + 4) / 2 = 4.5
    //   - budgetManagementFeature: (1 + 2) / 2 = 1.5
    //   - allergyManagementFeature: (4 + 5) / 2 = 4.5
    // - 離脱ポイント: mealPlanningFeature (1回発生)

    // 検証: セグメント別の日次利用パターンデータが完全に抽出・集計されていることを確認
    expect(result).toBeDefined();
    expect(result.aggregatedSegments).toHaveLength(2);

    // SEG001の集計結果の検証
    const seg001Result = result.aggregatedSegments.find(
      (s) => s.segmentId === 'SEG001'
    );
    expect(seg001Result).toBeDefined();
    expect(seg001Result.segmentId).toBe('SEG001');
    expect(seg001Result.segmentName).toBe(
      '年代30代・子供2人・食材制限なし'
    );
    expect(seg001Result.dailyMetrics.totalMealGenerationAttempts).toBe(5);
    expect(seg001Result.dailyMetrics.totalMealRejectionCount).toBe(1);
    expect(seg001Result.dailyMetrics.averageCookingTimeMinutes).toBe(22.5);
    expect(seg001Result.dailyMetrics.averageUserSatisfactionScore).toBeCloseTo(
      4.35,
      2
    );
    expect(
      seg001Result.dailyMetrics.featureUsageAverageByType
    ).toEqual({
      mealPlanningFeature: 4.5,
      nutritionAnalysisFeature: 2.5,
      budgetManagementFeature: 2.5,
      allergyManagementFeature: 1.5,
    });
    expect(seg001Result.dailyMetrics.mostFrequentAbandonmentFeature).toBe(
      'budgetManagementFeature'
    );
    expect(seg001Result.dailyMetrics.abandonmentFrequency).toBe(1);

    // SEG002の集計結果の検証
    const seg002Result = result.aggregatedSegments.find(
      (s) => s.segmentId === 'SEG002'
    );
    expect(seg002Result).toBeDefined();
    expect(seg002Result.segmentId).toBe('SEG002');
    expect(seg002Result.segmentName).toBe(
      '年代40代・子供1人・食材制限あり'
    );
    expect(seg002Result.dailyMetrics.totalMealGenerationAttempts).toBe(7);
    expect(seg002Result.dailyMetrics.totalMealRejectionCount).toBe(3);
    expect(seg002Result.dailyMetrics.averageCookingTimeMinutes).toBe(32.5);
    expect(
      seg002Result.dailyMetrics.averageUserSatisfactionScore
    ).toBeCloseTo(3.85, 2);
    expect(
      seg002Result.dailyMetrics.featureUsageAverageByType
    ).toEqual({
      mealPlanningFeature: 3.5,
      nutritionAnalysisFeature: 4.5,
      budgetManagementFeature: 1.5,
      allergyManagementFeature: 4.5,
    });
    expect(seg002Result.dailyMetrics.mostFrequentAbandonmentFeature).toBe(
      'mealPlanningFeature'
    );
    expect(seg002Result.dailyMetrics.abandonmentFrequency).toBe(1);

    // 全体集計結果の検証
    expect(result.aggregationPeriod.startDate).toBe('2024-01-15');
    expect(result.aggregationPeriod.endDate).toBe('2024-01-15');
    expect(result.aggregationPeriod.granularity).toBe('daily');
    expect(result.aggregationCompletedAt).toBeDefined();
    expect(result.totalLogsProcessed).toBe(4);
    expect(result.totalSegmentsAggregated).toBe(2);
    expect(result.hasError).toBe(false);
  });
});