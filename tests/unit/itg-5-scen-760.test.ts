import { approvePurchasingTrends } from '../../src/logic/it-7-2-1';

describe('購買傾向承認判定機能 - 空データ時のエラーハンドリング', () => {
  // SCEN-760
  test('購買傾向データが空の場合、承認判定がスキップされエラーが記録される', () => {
    const emptyTrendData = [];
    const errorLogs: Array<{ timestamp: string; message: string; level: string }> = [];

    const mockLogger = {
      error: (msg: string) => {
        errorLogs.push({
          timestamp: new Date('2024-01-15T10:30:00Z').toISOString(),
          message: msg,
          level: 'ERROR',
        });
      },
    };

    const result = approvePurchasingTrends({
      trends: emptyTrendData,
      logger: mockLogger,
    });

    expect(result.approved).toBe(false);
    expect(result.skipped).toBe(true);
    expect(errorLogs.length).toBe(1);
    expect(errorLogs[0].message).toMatch(/購買傾向データ/);
    expect(result.errorCode).toBe('EMPTY_TREND_DATA');
  });
});