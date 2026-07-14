import { consolidateAndDeduplicateImprovementTasks } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-707
  test('[error] 改善課題統合・重複排除機能 - 空の改善課題リストが入力されたとき、エラーハンドリングされて空の結果が返される', () => {
    const emptyTaskList: any[] = [];
    
    const result = consolidateAndDeduplicateImprovementTasks(emptyTaskList);
    
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});