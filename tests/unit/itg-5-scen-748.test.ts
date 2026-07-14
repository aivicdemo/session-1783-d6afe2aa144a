import { aggregateWeeklyMetrics } from '../../src/logic/it-7-2-1';

describe('献立生成の週次集計と改善前後効果比較', () => {
  // SCEN-748: [error] 分析タイミング判定機能 - 火曜日以降に月曜日データを入力した場合でも判定対象外となる
  test('should exclude Monday data when submitted after Tuesday', () => {
    // Arrange: テスト環境の現在日時を木曜日に設定
    const currentDate = new Date('2024-01-11T09:00:00Z'); // 2024-01-11 は木曜日
    const mondayData = {
      date: '2024-01-08', // 前週の月曜日
      successCount: 5,
      totalAttempts: 10,
      avgCookingTimeMinutes: 35.5,
      satisfactionScore: 78,
      completionRate: 92,
    };

    const inputParams = {
      submissionDate: currentDate.toISOString(),
      metricsData: [mondayData],
      analysisWindow: 'weekly',
    };

    // Act: 分析タイミング判定機能を呼び出す
    const result = aggregateWeeklyMetrics(inputParams);

    // Assert: 月曜日のデータは判定対象外として扱われることを確認
    expect(result.isOutOfWindow).toBe(true);
    expect(result.excludedRecords).toEqual([
      {
        date: '2024-01-08',
        reason: 'data_submitted_after_analysis_window',
      },
    ]);
    expect(result.processedMetrics).toEqual([]);
    expect(result.error).toMatch(/分析対象外/);
  });
});