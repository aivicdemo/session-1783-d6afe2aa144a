import { classifyRejectionReason } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-602: [error] 献立却下修正理由の自動分類・集計機能 - 既定カテゴリに該当しない場合のエラーハンドリング
  test('既定カテゴリに該当しない修正理由データに対して、エラーまたは未分類として適切にハンドリングできる', () => {
    // === 準備フェーズ ===
    // 既定カテゴリに該当しない修正理由データを複数パターン準備
    const invalidReasonPatterns = [
      '',                              // 空文字列
      null,                            // null
      undefined,                       // 未定義値
      '   ',                           // 空白のみ
      '!@#$%^&*()',                   // 特殊文字のみ
      '😀🍕🎉',                          // 絵文字のみ
      'xyz123nonsense',                // 既定カテゴリに該当しないテキスト
    ];

    const validCategories = [
      'nutritional_imbalance',         // 栄養バランス不適切
      'family_preference_mismatch',    // 家族好み未反映
      'cooking_time_exceeded',         // 調理時間超過
      'food_restriction_violation',    // 食材制限漏れ
      'budget_exceeded',               // 予算超過
      'ingredient_unavailable',        // 食材在庫不足
    ];

    // === テスト実行フェーズ ===
    invalidReasonPatterns.forEach((invalidReason) => {
      let classificationResult;
      let errorOccurred = false;
      let errorMessage = '';

      try {
        classificationResult = classifyRejectionReason(invalidReason);
      } catch (error) {
        errorOccurred = true;
        errorMessage = error instanceof Error ? error.message : String(error);
      }

      // === 検証フェーズ ===
      if (errorOccurred) {
        // (1) 明示的なエラーが発生した場合
        expect(errorMessage).toMatch(/カテゴリ|分類|理由|入力/);
        expect(errorMessage.length).toBeGreaterThan(0);
      } else {
        // (2) エラーが発生せず、結果が返された場合
        expect(classificationResult).toBeDefined();
        expect(classificationResult).toHaveProperty('category');
        expect(classificationResult).toHaveProperty('confidence');
        expect(classificationResult).toHaveProperty('isUnclassified');

        // 未分類またはエラーカテゴリとして分類されていることを確認
        if (classificationResult.isUnclassified === true) {
          expect(classificationResult.category).toBe('unclassified');
          expect(classificationResult.confidence).toBeLessThanOrEqual(0.3);
        } else if (classificationResult.category === 'error') {
          // エラーハンドリングのためのカテゴリ
          expect(classificationResult.confidence).toBe(0);
        } else {
          // 万が一有効カテゴリに分類された場合、信頼度は低めであるべき
          expect(validCategories.includes(classificationResult.category)).toBe(true);
          expect(classificationResult.confidence).toBeLessThan(0.5);
        }
      }
    });

    // === 正常系の検証：有効なカテゴリテキストは正確に分類されることを確認 ===
    const validReasonExamples = [
      { input: 'nutrition balance was too low', expectedCategory: 'nutritional_imbalance', minConfidence: 0.7 },
      { input: 'kids did not like the menu', expectedCategory: 'family_preference_mismatch', minConfidence: 0.7 },
      { input: 'took too long to cook', expectedCategory: 'cooking_time_exceeded', minConfidence: 0.7 },
      { input: 'salmon allergy not considered', expectedCategory: 'food_restriction_violation', minConfidence: 0.7 },
      { input: 'over budget by 2000 yen', expectedCategory: 'budget_exceeded', minConfidence: 0.7 },
      { input: 'tomato out of stock', expectedCategory: 'ingredient_unavailable', minConfidence: 0.7 },
    ];

    validReasonExamples.forEach(({ input, expectedCategory, minConfidence }) => {
      const result = classifyRejectionReason(input);
      expect(result).toBeDefined();
      expect(result.category).toBe(expectedCategory);
      expect(result.confidence).toBeGreaterThanOrEqual(minConfidence);
      expect(result.isUnclassified).toBe(false);
    });

    // === ログ検証（エラーハンドリング正常動作） ===
    // システムが停止することなく、エラーログに詳細情報が記録されていることを確認
    const logResult = classifyRejectionReason('');
    expect(logResult).toHaveProperty('rawInput');
    expect(logResult).toHaveProperty('timestamp');
    expect(typeof logResult.timestamp).toBe('string');
  });
});