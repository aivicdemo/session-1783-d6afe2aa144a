import { aggregateMenuGenerationFailurePatterns } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-627
  test('失敗パターン集計機能 - 集計対象の却下修正履歴が0件の場合、パターン集計は空結果として返される', () => {
    const emptyRejectionHistory: any[] = [];

    const result = aggregateMenuGenerationFailurePatterns(emptyRejectionHistory);

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});