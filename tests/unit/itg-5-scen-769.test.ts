import { classifyFailurePatternCategory } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-769: [edge] 失敗パターン自動カテゴリ分類機能 - 定義済みカテゴリに該当しない理由の場合、その他カテゴリに分類される
  test('定義済みカテゴリに該当しない理由は「その他」に分類される', () => {
    // Arrange: 定義済みカテゴリに該当しないテストデータを準備
    const undefinedReasonInput = {
      failurePatternId: 'fp_001',
      reason: '謎の現象が発生しました',
      timestamp: new Date('2024-01-15T10:30:00Z'),
      userId: 'user_123',
    };

    const predefinedCategories = [
      '栄養バランス不適切',
      '家族好み未反映',
      '調理時間超過',
      '食材制限漏れ',
      'ネットワークエラー',
      'タイムアウト',
      'メモリ不足',
    ];

    // Act: 失敗パターン自動カテゴリ分類機能を実行
    const classificationResult = classifyFailurePatternCategory(
      undefinedReasonInput.reason,
      predefinedCategories
    );

    // Assert: 分類結果がその他カテゴリに分類されたことを検証
    expect(classificationResult.category).toBe('その他');
    expect(classificationResult.confidence).toBeLessThanOrEqual(100);
    expect(classificationResult.confidence).toBeGreaterThanOrEqual(0);
    expect(predefinedCategories).not.toContain(classificationResult.category);
    expect(classificationResult.matchedKeywords).toEqual([]);

    // 分類結果が定義済みカテゴリのいずれにも該当していないことを確認
    const isInPredefinedCategories = predefinedCategories.includes(
      classificationResult.category
    );
    expect(isInPredefinedCategories).toBe(false);
  });
});