import { classifyReasonByCategory } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類', () => {
  // SCEN-952: [edge] 却下修正理由の自動カテゴリ分類 - マスタに未登録のカテゴリに該当する理由テキストを『その他』として分類する
  test('should classify unregistered category reason text as "その他"', () => {
    // Arrange: マスタに未登録のカテゴリに該当する却下修正理由テキスト
    const unregistered_reason_text = '子どもが急に病気になったので食べられなくなった';
    const registered_categories = [
      '栄養',
      '予算',
      '好み',
      '調理時間',
      '食材在庫'
    ];

    // Act: 自動カテゴリ分類機能に入力
    const classification_result = classifyReasonByCategory(
      unregistered_reason_text,
      registered_categories
    );

    // Assert: マスタに未登録のカテゴリに該当する理由テキストが『その他』として正しく分類されていることを確認
    expect(classification_result).toEqual({
      classified_category: 'その他',
      confidence_score: expect.any(Number),
      original_text: unregistered_reason_text,
      classification_timestamp: expect.any(String)
    });
    expect(classification_result.classified_category).toBe('その他');
    expect(classification_result.confidence_score).toBeGreaterThanOrEqual(0);
    expect(classification_result.confidence_score).toBeLessThanOrEqual(100);
    expect(typeof classification_result.classification_timestamp).toBe('string');
  });
});