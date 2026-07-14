import { aggregateWeeklyMetrics } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの改善効果を週次で集計・比較するダッシュボード機能', () => {
  // SCEN-794: [edge] 外部要因データ自動取得・統合機能 - データ取得対象期間が0日の場合、空のデータセットが適切に処理される
  test('should handle empty dataset when data retrieval period is 0 days', () => {
    // Arrange: データ取得対象期間を0日に設定したリクエスト
    const weeklyAggregationRequest = {
      startDate: new Date('2024-01-15T00:00:00Z'),
      endDate: new Date('2024-01-15T00:00:00Z'), // 同一日付 = 0日間
      algorithmVersionBefore: 'v1.0',
      algorithmVersionAfter: 'v1.1',
      externalDataSources: [
        {
          sourceType: 'weather',
          dataPoints: []
        },
        {
          sourceType: 'event',
          dataPoints: []
        },
        {
          sourceType: 'competitorStrategy',
          dataPoints: []
        }
      ]
    };

    const mealGenerationLogsEmpty = [];
    const userFeedbackLogsEmpty = [];
    const externalDatasetEmpty = [];

    // Act: 0日間のデータ取得・集計処理を実行
    const result = aggregateWeeklyMetrics({
      aggregationRequest: weeklyAggregationRequest,
      mealGenerationLogs: mealGenerationLogsEmpty,
      userFeedbackLogs: userFeedbackLogsEmpty,
      externalDataset: externalDatasetEmpty
    });

    // Assert: 空のデータセットが正常に処理されることを確認
    expect(result).toEqual({
      weekStartDate: new Date('2024-01-15T00:00:00Z'),
      weekEndDate: new Date('2024-01-15T00:00:00Z'),
      dataPointCount: 0,
      mealGenerationSuccessRate: 0,
      cookingTimeReductionDegree: 0,
      userSatisfactionScore: 0,
      beforeAlgorithmVersion: 'v1.0',
      afterAlgorithmVersion: 'v1.1',
      effectDifferencePercentage: 0,
      externalDataIntegrationStatus: 'no_data_available',
      cacheStatus: 'cache_skip_empty_dataset',
      dashboardDisplayMessage: 'No data available for the selected period',
      errorOccurred: false,
      alertGenerated: false,
      successfulPostProcessing: true
    });

    // Assert: 後続処理（統合・キャッシング・表示）が正常に完了したことを確認
    expect(result.successfulPostProcessing).toBe(true);
    expect(result.errorOccurred).toBe(false);
    expect(result.alertGenerated).toBe(false);

    // Assert: ダッシュボード画面にはデータなしの旨を示す適切なメッセージが表示されることを確認
    expect(result.dashboardDisplayMessage).toBe('No data available for the selected period');
    expect(result.cacheStatus).toBe('cache_skip_empty_dataset');
  });
});