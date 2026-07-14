import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { deleteExpiredMealEvaluationData } from '../../src/logic/it-7-2-1';

describe('食事評価データの保持期間管理・自動削除機能', () => {
  // SCEN-622
  test('保持期間ポリシーが未定義の場合、データ削除処理がスキップされエラーログが出力される', () => {
    const mockLogger: { error: string[] } = { error: [] };
    const mockDatabase: { mealEvaluationRecords: Array<{ id: number; createdAt: string }> } = {
      mealEvaluationRecords: [
        { id: 1, createdAt: '2024-01-01T10:00:00Z' },
        { id: 2, createdAt: '2024-01-02T10:00:00Z' },
        { id: 3, createdAt: '2024-01-03T10:00:00Z' },
      ],
    };

    const retentionPolicy = undefined;
    const currentDateTime = new Date('2024-12-31T12:00:00Z');

    const result = deleteExpiredMealEvaluationData({
      retentionPolicy,
      database: mockDatabase,
      logger: mockLogger,
      currentDateTime,
    });

    expect(result.status).toBe('skipped');
    expect(result.deletedCount).toBe(0);
    expect(mockLogger.error.length).toBeGreaterThan(0);
    expect(mockLogger.error[0]).toMatch(/保持期間ポリシー|保持期間設定/);
    expect(mockDatabase.mealEvaluationRecords.length).toBe(3);
    expect(mockDatabase.mealEvaluationRecords).toEqual([
      { id: 1, createdAt: '2024-01-01T10:00:00Z' },
      { id: 2, createdAt: '2024-01-02T10:00:00Z' },
      { id: 3, createdAt: '2024-01-03T10:00:00Z' },
    ]);
  });
});