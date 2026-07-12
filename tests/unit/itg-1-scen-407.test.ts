import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fetchMock from 'jest-fetch-mock';
import { aggregateMonthlyCostWithNoRecords } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  // SCEN-407: [edge] 月次食費集計・提案機能 - 購入記録がない場合、月次集計で食費実績が0として処理される
  it('購入記録がない場合、月次集計で食費実績が0として処理される', async () => {
    const userId = 'user-test-001';
    const targetYear = 2024;
    const targetMonth = 1;

    // API: 購入記録取得エンドポイント（空配列を返す）
    fetchMock.mockResponseOnce(
      JSON.stringify({
        purchaseRecords: [],
        totalCount: 0,
      }),
      { status: 200 }
    );

    // API: 月次集計結果取得エンドポイント
    fetchMock.mockResponseOnce(
      JSON.stringify({
        userId,
        year: targetYear,
        month: targetMonth,
        totalAmount: 0,
        purchaseCount: 0,
        categoryBreakdown: [],
        averagePricePerItem: 0,
      }),
      { status: 200 }
    );

    // ロジック関数を実行
    const result = await aggregateMonthlyCostWithNoRecords({
      userId,
      targetYear,
      targetMonth,
    });

    // 期待値: 月次集計データが正しく集計されていることを検証
    expect(result.totalAmount).toBe(0);
    expect(result.purchaseCount).toBe(0);
    expect(result.categoryBreakdown).toEqual([]);
    expect(result.averagePricePerItem).toBe(0);

    // API呼び出しの検証
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(`/api/purchase-records?userId=${userId}&year=${targetYear}&month=${targetMonth}`),
      expect.objectContaining({ method: 'GET' })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining(`/api/monthly-cost-aggregation?userId=${userId}&year=${targetYear}&month=${targetMonth}`),
      expect.objectContaining({ method: 'GET' })
    );
  });
});