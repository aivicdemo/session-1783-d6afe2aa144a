import { classifyMealFeedbackReason } from '../../src/logic/it-7-3-1';

describe('献立却下修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-576: [edge] 献立却下修正理由の自動カテゴリ分類機能 - いずれのカテゴリにも該当しない理由テキストが『未分類』として処理される
  test('should classify unmatched reason text as uncategorized', () => {
    // Arrange
    const unclassified_reason_text = '特殊な要件により却下';
    const predefined_categories = [
      '栄養バランス',
      '食材調達',
      '調理工程',
      '食材制限',
      '予算超過',
      '調理時間超過',
      '家族好み未反映',
    ];

    // Act
    const classification_result = classifyMealFeedbackReason(
      unclassified_reason_text,
      predefined_categories
    );

    // Assert - 分類結果が『未分類』であることを検証
    expect(classification_result.category).toBe('未分類');
    expect(classification_result.confidence_score).toBe(0);
    expect(classification_result.matched_keywords).toEqual([]);
    expect(classification_result.is_unclassified).toBe(true);

    // データベース記録として保持されるべき情報を検証
    expect(classification_result.original_text).toBe(unclassified_reason_text);
    expect(classification_result.classification_timestamp).toBeDefined();
    expect(typeof classification_result.classification_timestamp).toBe('string');
  });
});