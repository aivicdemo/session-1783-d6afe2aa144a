import { analyzeWeeklyMetrics } from '../../src/logic/it-7-2-1';

describe('週次分析タイミング判定と行動指標集計', () => {
  // SCEN-747: [edge] 分析タイミング判定機能 - 月曜日 08:59 では分析タイミング判定がスキップされる
  test('月曜日 08:59 では分析タイミング判定がスキップされ分析処理が実行されないこと', () => {
    // Arrange: 月曜日 08:59 のタイムスタンプを作成
    // 2024-01-08 は月曜日
    const skipTimestamp = new Date('2024-01-08T08:59:00Z');
    const executionTime = skipTimestamp.getTime();

    const metricsInput = {
      currentTimeUnixMs: executionTime,
      previousMetricsSnapshot: {
        generationSuccessRate: 0.85,
        cookingTimeReductionDegree: 0.72,
        userSatisfactionScore: 4.2,
        weekStartDate: '2024-01-01T00:00:00Z',
      },
      algorithmVersionId: 'v2.1.0',
      analysisSchedule: {
        targetDayOfWeek: 1, // Monday
        targetHourUtc: 9, // 09:00 UTC
      },
    };

    // Act: 分析タイミング判定機能を実行
    const result = analyzeWeeklyMetrics(metricsInput);

    // Assert: 分析タイミング判定がスキップされたことを検証
    expect(result.shouldExecuteAnalysis).toBe(false);
    expect(result.status).toBe('SKIPPED');
    expect(result.skipReason).toMatch(/時刻未到達|threshold/i);
    expect(result.metricsSnapshot).toBeUndefined();
    expect(result.comparisonResult).toBeUndefined();
  });
});