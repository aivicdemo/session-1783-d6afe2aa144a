import { classifyMealRejectReason } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-917: [error] 却下修正理由の自動カテゴリ分類機能 - 事前定義カテゴリに該当しない理由テキストが異常値としてフラグ付けされる
  test('事前定義カテゴリに該当しない理由テキストが異常値フラグと共に返される', () => {
    const undefinedReasonText = '予想外の理由でアプリがクラッシュした';

    const result = classifyMealRejectReason({
      reasonText: undefinedReasonText,
      userId: 'user_001',
      mealId: 'meal_20240115_001',
      timestamp: '2024-01-15T14:30:00Z',
    });

    expect(result.status).toBe('異常値');
    expect(result.isError).toBe(true);
    expect(result.category).toBeNull();
  });
});