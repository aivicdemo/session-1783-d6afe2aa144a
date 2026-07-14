import { classifyRejectReasons } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-624
  test('却下修正理由が空文字列の場合、未分類カテゴリに集計される', () => {
    const empty_reason = '';
    
    const result = classifyRejectReasons([empty_reason]);
    
    expect(result.categories).toHaveProperty('unclassified');
    expect(result.categories.unclassified).toBe(1);
    expect(result.classified_count).toBe(0);
    expect(result.unclassified_count).toBe(1);
    expect(result.total_count).toBe(1);
  });
});