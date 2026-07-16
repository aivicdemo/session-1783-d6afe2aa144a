import { classifyMealFeedbackReason } from '../../src/logic/it-8-1-2-1';

describe('献立却下理由の自動分類機能 - エラーハンドリング', () => {
  // SCEN-293
  test('定義されていないカテゴリの理由テキストがエラーハンドリングされる', () => {
    const invalidCategoryId = 'UNDEFINED_CATEGORY';
    const reasonText = '栄養バランスが悪い';

    const result = classifyMealFeedbackReason({
      reasonText,
      categoryId: invalidCategoryId,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe(true);
    expect(result.errorMessage).toMatch(/カテゴリが定義されていません/);
    expect(result.userMessage).toMatch(/入力されたカテゴリは認識できません/);
    expect(result.classified).toBe(false);
    expect(result.category).toBeNull();
  });

  test('nullカテゴリIDがエラーハンドリングされる', () => {
    const result = classifyMealFeedbackReason({
      reasonText: '調理時間が長すぎる',
      categoryId: null,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe(true);
    expect(result.errorMessage).toMatch(/カテゴリが定義されていません/);
    expect(result.userMessage).toMatch(/入力されたカテゴリは認識できません/);
    expect(result.systemStable).toBe(true);
  });

  test('空文字列カテゴリIDがエラーハンドリングされる', () => {
    const result = classifyMealFeedbackReason({
      reasonText: '家族の好みが反映されていない',
      categoryId: '',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe(true);
    expect(result.errorMessage).toMatch(/カテゴリが定義されていません/);
    expect(result.userMessage).toMatch(/入力されたカテゴリは認識できません/);
  });

  test('有効なカテゴリIDで正常に分類される', () => {
    const result = classifyMealFeedbackReason({
      reasonText: '栄養バランスが悪い',
      categoryId: 'NUTRITION_IMBALANCE',
    });

    expect(result.success).toBe(true);
    expect(result.error).toBe(false);
    expect(result.classified).toBe(true);
    expect(result.category).toBe('NUTRITION_IMBALANCE');
    expect(result.errorMessage).toBeNull();
    expect(result.userMessage).toBeNull();
  });

  test('複数の無効なカテゴリIDが連続入力されてもシステムが安定する', () => {
    const invalidIds = ['UNDEFINED_CATEGORY', null, '', 'INVALID_ID'];
    const results = invalidIds.map((categoryId) =>
      classifyMealFeedbackReason({
        reasonText: 'テスト理由テキスト',
        categoryId,
      })
    );

    results.forEach((result) => {
      expect(result.success).toBe(false);
      expect(result.error).toBe(true);
      expect(result.systemStable).toBe(true);
    });
  });
});