import { classifyMealRejectionReason } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-883: [normal] 献立却下修正理由の自動カテゴリ分類
  test('SCEN-883: 献立却下理由が栄養バランス不適切、家族好み未反映、調理時間超過、食材制限漏れのいずれかに自動分類される', () => {
    // テストケース1: 栄養バランス不適切
    const result_nutrition = classifyMealRejectionReason('栄養バランスが不適切です');
    expect(result_nutrition).toEqual({
      category: '栄養バランス不適切',
      confidence: 0.95,
      matchedKeywords: ['栄養バランス', '不適切'],
    });

    // テストケース2: 家族好み未反映
    const result_preference = classifyMealRejectionReason('家族の好みが反映されていません');
    expect(result_preference).toEqual({
      category: '家族好み未反映',
      confidence: 0.90,
      matchedKeywords: ['家族', '好み', '反映'],
    });

    // テストケース3: 調理時間超過
    const result_cooking_time = classifyMealRejectionReason('調理時間が超過しています');
    expect(result_cooking_time).toEqual({
      category: '調理時間超過',
      confidence: 0.92,
      matchedKeywords: ['調理時間', '超過'],
    });

    // テストケース4: 食材制限漏れ
    const result_ingredient_restriction = classifyMealRejectionReason('食材の制限が漏れています');
    expect(result_ingredient_restriction).toEqual({
      category: '食材制限漏れ',
      confidence: 0.88,
      matchedKeywords: ['食材', '制限', '漏れ'],
    });

    // テストケース5: 複数キーワードを含む場合（最も関連性の高いカテゴリに分類）
    const result_multiple = classifyMealRejectionReason(
      '栄養バランスも考慮されていないし、家族の好みも反映されていません'
    );
    expect(result_multiple.category).toMatch(/栄養バランス不適切|家族好み未反映/);
    expect(result_multiple.matchedKeywords.length).toBeGreaterThanOrEqual(2);

    // テストケース6: 曖昧な入力に対する適切なフォールバック処理
    const result_vague = classifyMealRejectionReason('何か違います');
    expect(result_vague).toEqual({
      category: '判定不可',
      confidence: 0.0,
      matchedKeywords: [],
    });

    // テストケース7: 空文字列入力
    const result_empty = classifyMealRejectionReason('');
    expect(result_empty.category).toBe('判定不可');
    expect(result_empty.confidence).toBe(0.0);

    // テストケース8: 他のカテゴリを示唆する入力
    const result_other_reason = classifyMealRejectionReason('色合いが悪い');
    expect(result_other_reason.category).toBe('判定不可');
    expect(result_other_reason.confidence).toBe(0.0);

    // テストケース9: ケース不感の検証（大文字・小文字混在）
    const result_mixed_case = classifyMealRejectionReason('【栄養バランス】が不適切です');
    expect(result_mixed_case.category).toBe('栄養バランス不適切');
    expect(result_mixed_case.confidence).toBeGreaterThan(0.8);

    // テストケース10: 複数の否定形表現を含む場合
    const result_negation = classifyMealRejectionReason(
      '栄養バランスがまったく取れていないし、調理時間も大幅に超過しています'
    );
    expect(['栄養バランス不適切', '調理時間超過']).toContain(result_negation.category);
    expect(result_negation.confidence).toBeGreaterThan(0.85);
  });
});