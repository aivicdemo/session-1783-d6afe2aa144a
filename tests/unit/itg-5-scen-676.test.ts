import { aggregateFailurePatterns } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-676: [error] 失敗パターン集計機能 - 集計対象期間に却下修正データが存在しない場合、空の集計結果を返す
  test('集計対象期間に却下修正データが存在しない場合、空のオブジェクトを返す', () => {
    const startDate = new Date('2024-01-01T00:00:00Z');
    const endDate = new Date('2024-01-31T23:59:59Z');
    const rejectionRecords: any[] = [];

    const result = aggregateFailurePatterns({
      records: rejectionRecords,
      startDate,
      endDate,
    });

    expect(result).toEqual({});
  });
});