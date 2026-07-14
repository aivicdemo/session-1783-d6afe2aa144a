import { classifyMealRejectReason } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-699
  test('理由が空文字列の場合、分類エラーを返す', () => {
    const emptyReason = '';
    
    const result = classifyMealRejectReason(emptyReason);
    
    expect(result.error).toBe(true);
    expect(result.errorMessage).toMatch(/理由/);
  });
});