import { aggregateFailurePatterns } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-921: [edge] 失敗パターン集計機能 - 分類済み理由データが存在しない場合に空の失敗パターン集計結果が返される
  test('分類済み理由データが存在しない場合、空の失敗パターン集計結果を返す', () => {
    // Arrange: 分類済み理由データが存在しない状態をセットアップ
    const classifiedReasons: Array<{
      reasonId: string;
      category: string;
      description: string;
      timestamp: string;
    }> = [];

    // Act: 失敗パターン集計機能を実行
    const result = aggregateFailurePatterns(classifiedReasons);

    // Assert: 戻り値が空のオブジェクトまたは空の配列であることを確認
    if (Array.isArray(result)) {
      expect(result).toEqual([]);
    } else {
      expect(Object.keys(result).length).toBe(0);
    }

    // Assert: エラーが発生していないことを確認（戻り値が存在すること）
    expect(result).toBeDefined();
    expect(result).not.toBeNull();
  });
});