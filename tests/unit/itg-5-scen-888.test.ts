import { generateFailurePatternPriorityMatrix } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-888: [edge] 失敗パターン優先度マトリクスの生成 - 失敗パターン集計データが空の場合に空マトリクスが返される
  test('失敗パターン集計データが空の場合、空のマトリクス構造が返される', () => {
    // 入力: 空の失敗パターン集計データ
    const emptyFailurePatterns: Array<{
      category: string;
      frequency: number;
      userImpactScore: number;
      implementationDifficulty: number;
    }> = [];

    // マトリクス生成関数を実行
    const result = generateFailurePatternPriorityMatrix(emptyFailurePatterns);

    // 戻り値の型を確認
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();

    // 戻り値が有効なマトリクスオブジェクトの形式であることを検証
    expect(result).toHaveProperty('rows');
    expect(result).toHaveProperty('columns');
    expect(result).toHaveProperty('matrix');

    // マトリクスのサイズ（行数・列数）が0であることを確認
    expect(result.rows).toBe(0);
    expect(result.columns).toBe(0);

    // マトリクスデータが空配列であることを確認
    expect(Array.isArray(result.matrix)).toBe(true);
    expect(result.matrix.length).toBe(0);

    // エラーが発生していないことを確認（関数が正常に完了したことを示す）
    expect(result).toBeDefined();
    expect(result.rows).toEqual(0);
    expect(result.columns).toEqual(0);
  });
});