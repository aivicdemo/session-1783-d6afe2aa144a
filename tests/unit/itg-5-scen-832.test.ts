import { aggregateFailurePatterns } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-832
  test('集計対象期間に却下修正データが存在しない場合、集計結果が0件として正しく返却される', () => {
    const aggregationPeriodStartDate = new Date('2024-01-01T00:00:00Z');
    const aggregationPeriodEndDate = new Date('2024-01-31T23:59:59Z');
    const rejectionModificationRecords: Array<{
      rejectionModificationId: string;
      userId: string;
      mealplanId: string;
      rejectionModificationReasonText: string;
      rejectionModificationCategory: string;
      rejectionModificationTimestamp: Date;
      createdAt: Date;
    }> = [];

    const result = aggregateFailurePatterns({
      rejectionModificationRecords,
      aggregationPeriodStartDate,
      aggregationPeriodEndDate,
    });

    expect(result.status).toBe(200);
    expect(result.aggregationCount).toBe(0);
    expect(result.aggregationData).toEqual([]);
    expect(result.errorMessage).toBeUndefined();
  });
});