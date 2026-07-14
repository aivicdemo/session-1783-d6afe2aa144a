import { aggregateRejectionPatterns } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-650: [edge] 失敗パターン集計機能 - 却下修正データが0件の状態で集計がエラーなく処理される
  test('却下修正データが0件の状態で失敗パターン集計が正常に完了し、空の集計結果が返却される', () => {
    // 初期化：却下修正データが0件の状態を準備
    const rejectionDataset: Array<{
      rejectionId: string;
      userId: string;
      mealPlanId: string;
      rejectionReason: string;
      category: string;
      timestamp: string;
    }> = [];

    // 失敗パターン集計機能の初期化処理を実行
    // 集計対象データとして空の却下修正データセットを入力
    const aggregationResult = aggregateRejectionPatterns(rejectionDataset);

    // 処理の完了ステータスを確認
    expect(aggregationResult).toBeDefined();
    expect(aggregationResult).not.toBeNull();

    // 集計結果のオブジェクトが正常に生成されたことを検証
    expect(typeof aggregationResult).toBe('object');

    // 集計結果が空または0件であることを確認
    expect(aggregationResult.totalCount).toBe(0);
    expect(aggregationResult.byCategory).toEqual({});
    expect(aggregationResult.categoryDistribution).toEqual([]);

    // エラーログ或いは警告ログが出力されていないことを確認
    // （関数内部で例外が発生していないかを間接的に検証）
    expect(aggregationResult.hasError).toBe(false);
    expect(aggregationResult.errorMessage).toBeUndefined();
  });
});