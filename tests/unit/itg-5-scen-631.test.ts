import { aggregateWeeklyMetrics } from '../../src/logic/it-7-2-1';

describe('アルゴリズム改善・検証ダッシュボード - 週次集計と改善前後効果比較', () => {
  // SCEN-631: [normal] 統合済みアルゴリズムが翌週の献立生成から正確に適用される
  test('改善前後アルゴリズムの週次集計メトリクスを比較し、改善効果が定量化される', () => {
    const previousWeekGenerationLogs = [
      {
        generationId: 'gen-001',
        algorithmVersionId: 'algo-v1',
        generatedAt: '2024-01-08T10:00:00Z',
        familyId: 'fam-001',
        proposalCount: 3,
        acceptanceCount: 2,
        rejectionCount: 1,
        rejectionReasons: ['栄養バランス不適切', '調理時間超過'],
      },
      {
        generationId: 'gen-002',
        algorithmVersionId: 'algo-v1',
        generatedAt: '2024-01-09T10:00:00Z',
        familyId: 'fam-002',
        proposalCount: 3,
        acceptanceCount: 2,
        rejectionCount: 1,
        rejectionReasons: ['家族好み未反映'],
      },
      {
        generationId: 'gen-003',
        algorithmVersionId: 'algo-v1',
        generatedAt: '2024-01-10T10:00:00Z',
        familyId: 'fam-003',
        proposalCount: 3,
        acceptanceCount: 3,
        rejectionCount: 0,
        rejectionReasons: [],
      },
    ];

    const currentWeekGenerationLogs = [
      {
        generationId: 'gen-004',
        algorithmVersionId: 'algo-v2',
        generatedAt: '2024-01-15T10:00:00Z',
        familyId: 'fam-001',
        proposalCount: 3,
        acceptanceCount: 3,
        rejectionCount: 0,
        rejectionReasons: [],
      },
      {
        generationId: 'gen-005',
        algorithmVersionId: 'algo-v2',
        generatedAt: '2024-01-16T10:00:00Z',
        familyId: 'fam-002',
        proposalCount: 3,
        acceptanceCount: 3,
        rejectionCount: 0,
        rejectionReasons: [],
      },
      {
        generationId: 'gen-006',
        algorithmVersionId: 'algo-v2',
        generatedAt: '2024-01-17T10:00:00Z',
        familyId: 'fam-003',
        proposalCount: 3,
        acceptanceCount: 3,
        rejectionCount: 0,
        rejectionReasons: [],
      },
    ];

    const userFeedback = [
      { generationId: 'gen-001', satisfactionScore: 3 },
      { generationId: 'gen-002', satisfactionScore: 2 },
      { generationId: 'gen-003', satisfactionScore: 5 },
      { generationId: 'gen-004', satisfactionScore: 5 },
      { generationId: 'gen-005', satisfactionScore: 4 },
      { generationId: 'gen-006', satisfactionScore: 5 },
    ];

    const mealExecutionData = [
      { generationId: 'gen-001', plannedCookingTime: 45, actualCookingTime: 52 },
      { generationId: 'gen-002', plannedCookingTime: 40, actualCookingTime: 48 },
      { generationId: 'gen-003', plannedCookingTime: 35, actualCookingTime: 33 },
      { generationId: 'gen-004', plannedCookingTime: 40, actualCookingTime: 38 },
      { generationId: 'gen-005', plannedCookingTime: 35, actualCookingTime: 34 },
      { generationId: 'gen-006', plannedCookingTime: 40, actualCookingTime: 39 },
    ];

    const result = aggregateWeeklyMetrics({
      previousWeekLogs: previousWeekGenerationLogs,
      currentWeekLogs: currentWeekGenerationLogs,
      userFeedbackRecords: userFeedback,
      mealExecutionRecords: mealExecutionData,
    });

    // 前週の集計値検証
    expect(result.previousWeek.successRate).toBe(66.67);
    expect(result.previousWeek.rejectionRate).toBe(33.33);
    expect(result.previousWeek.averageSatisfactionScore).toBe(3.33);
    expect(result.previousWeek.averageCookingTimeDeviation).toBeCloseTo(5.67, 1);

    // 当週の集計値検証
    expect(result.currentWeek.successRate).toBe(100);
    expect(result.currentWeek.rejectionRate).toBe(0);
    expect(result.currentWeek.averageSatisfactionScore).toBe(4.67);
    expect(result.currentWeek.averageCookingTimeDeviation).toBeCloseTo(0.33, 1);

    // 改善効果（前週 → 当週の差分）検証
    expect(result.improvementEffect.successRateImprovement).toBe(33.33);
    expect(result.improvementEffect.rejectionRateImprovement).toBe(-33.33);
    expect(result.improvementEffect.satisfactionScoreImprovement).toBeCloseTo(1.34, 1);
    expect(result.improvementEffect.cookingTimeDeviationReduction).toBeCloseTo(5.34, 1);

    // 統計的有意性判定（改善効果が最小閾値以上か）
    expect(result.improvementEffect.isStatisticallySignificant).toBe(true);
    expect(result.improvementEffect.significanceLevel).toBe('高');

    // アルゴリズムバージョンの適用確認
    expect(result.appliedAlgorithmVersion).toBe('algo-v2');
    expect(result.previousAlgorithmVersion).toBe('algo-v1');
    expect(result.deploymentDate).toBe('2024-01-15T00:00:00Z');

    // 改善が最小閾値を超えているか検証
    expect(result.meetsMinimumThreshold).toBe(true);
    expect(result.minimumThresholds.successRateThreshold).toBe(5);
    expect(result.minimumThresholds.satisfactionScoreThreshold).toBe(0.5);

    // 改善提案レコード構造の検証
    expect(result.recommendedNextActions).toHaveLength(2);
    expect(result.recommendedNextActions[0]).toEqual({
      action: 'パラメータ調整',
      description: '調理時間予測精度が大幅改善（5.34分削減）。次週も継続監視',
      priority: 'medium',
    });
    expect(result.recommendedNextActions[1]).toEqual({
      action: '段階的展開完了',
      description: 'algo-v2の全セグメント展開可能。本番環境への完全置換を推奨',
      priority: 'high',
    });

    // ダッシュボード表示用の可視化フィールド検証
    expect(result.dashboardVisualization).toHaveProperty('successRateTrend');
    expect(result.dashboardVisualization.successRateTrend).toEqual({
      previous: 66.67,
      current: 100,
      delta: 33.33,
      unit: '%',
    });
    expect(result.dashboardVisualization).toHaveProperty('satisfactionTrend');
    expect(result.dashboardVisualization.satisfactionTrend).toEqual({
      previous: 3.33,
      current: 4.67,
      delta: 1.34,
      unit: 'point',
    });

    // 改善前後の比較レポート用フィールド検証
    expect(result.comparisonReport).toHaveProperty('generationCountPrevious');
    expect(result.comparisonReport.generationCountPrevious).toBe(3);
    expect(result.comparisonReport).toHaveProperty('generationCountCurrent');
    expect(result.comparisonReport.generationCountCurrent).toBe(3);
    expect(result.comparisonReport).toHaveProperty('rejectionReasonsAnalysis');
    expect(result.comparisonReport.rejectionReasonsAnalysis).toEqual([
      { reason: '栄養バランス不適切', count: 1, percentage: 33.33 },
      { reason: '調理時間超過', count: 1, percentage: 33.33 },
      { reason: '家族好み未反映', count: 1, percentage: 33.33 },
    ]);

    // 適用日時と有効性検証
    expect(result.integrationStatus).toBe('active');
    expect(result.integrationTimestamp).toBe('2024-01-15T10:00:00Z');
    expect(result.isAppliedToCurrentGeneration).toBe(true);
  });
});