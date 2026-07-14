import { classifyAndAggregateRejectionReasons } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-862
  test('失敗パターン分類・集計機能 - 献立却下修正履歴が0件の場合に空の集計結果が返却される', async () => {
    // 初期化: 献立却下修正履歴データベースをクリア
    const rejectionHistories: Array<{
      rejection_id: string;
      menu_id: string;
      user_id: string;
      reason_text: string;
      rejection_timestamp: string;
    }> = [];

    // 失敗パターン分類・集計機能を実行
    const result = await classifyAndAggregateRejectionReasons({
      rejectionHistories: rejectionHistories,
      aggregationPeriodStartDate: new Date('2024-01-01T00:00:00Z'),
      aggregationPeriodEndDate: new Date('2024-01-07T23:59:59Z'),
    });

    // レスポンスが成功（status: 200）であることを確認
    expect(result.status).toBe(200);

    // レスポンスが空のオブジェクトまたは空の配列であることを確認
    expect(result.aggregatedPatterns).toEqual([]);

    // レスポンスに失敗パターン分類データが含まれないことを確認
    expect(result.aggregatedPatterns.length).toBe(0);

    // メッセージが適切に設定されていることを確認
    expect(result.message).toMatch(/no data|empty|0件/i);
  });
});