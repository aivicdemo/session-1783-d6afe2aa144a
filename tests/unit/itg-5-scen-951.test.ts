import { classifyRejectReasons } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類', () => {
  // SCEN-951
  test('複数の却下・修正理由を正しくカテゴリ分類する', () => {
    const input_text =
      '栄養バランスが悪い。子どもが野菜を食べない。調理に2時間かかった。予算が高すぎる。冷蔵庫に鶏肉がない。';

    const result = classifyRejectReasons(input_text);

    // カテゴリの検証: 栄養、家族好み、調理時間、予算、食材在庫が分類されたことを確認
    expect(result).toEqual(
      expect.objectContaining({
        categories: expect.any(Array),
        categoryCount: expect.any(Number),
        classifications: expect.any(Array),
      })
    );

    // 全カテゴリが含まれることを検証
    const categoryNames = result.categories.map((cat: any) => cat.category);
    expect(categoryNames).toContain('栄養');
    expect(categoryNames).toContain('好み');
    expect(categoryNames).toContain('調理時間');
    expect(categoryNames).toContain('予算');
    expect(categoryNames).toContain('食材在庫');

    // カテゴリ数が5であることを検証
    expect(result.categoryCount).toBe(5);

    // 栄養カテゴリの検証
    const nutrition_category = result.categories.find(
      (cat: any) => cat.category === '栄養'
    );
    expect(nutrition_category).toBeDefined();
    expect(nutrition_category.reasons).toContain('栄養バランスが悪い');
    expect(nutrition_category.count).toBe(1);

    // 好みカテゴリの検証
    const preference_category = result.categories.find(
      (cat: any) => cat.category === '好み'
    );
    expect(preference_category).toBeDefined();
    expect(preference_category.reasons).toContain('子どもが野菜を食べない');
    expect(preference_category.count).toBe(1);

    // 調理時間カテゴリの検証
    const cooking_time_category = result.categories.find(
      (cat: any) => cat.category === '調理時間'
    );
    expect(cooking_time_category).toBeDefined();
    expect(cooking_time_category.reasons).toContain('調理に2時間かかった');
    expect(cooking_time_category.count).toBe(1);

    // 予算カテゴリの検証
    const budget_category = result.categories.find(
      (cat: any) => cat.category === '予算'
    );
    expect(budget_category).toBeDefined();
    expect(budget_category.reasons).toContain('予算が高すぎる');
    expect(budget_category.count).toBe(1);

    // 食材在庫カテゴリの検証
    const ingredient_category = result.categories.find(
      (cat: any) => cat.category === '食材在庫'
    );
    expect(ingredient_category).toBeDefined();
    expect(ingredient_category.reasons).toContain('冷蔵庫に鶏肉がない');
    expect(ingredient_category.count).toBe(1);

    // 分類結果の個数が5であることを検証（すべての理由が分類されたこと）
    expect(result.classifications.length).toBe(5);

    // 分類結果に重複がないことを検証
    const classified_reasons = result.classifications.map(
      (cls: any) => cls.reason
    );
    const unique_reasons = new Set(classified_reasons);
    expect(unique_reasons.size).toBe(classified_reasons.length);

    // 各分類が有効なカテゴリに紐付けられていることを検証
    result.classifications.forEach((cls: any) => {
      const valid_categories = [
        '栄養',
        '好み',
        '調理時間',
        '予算',
        '食材在庫',
      ];
      expect(valid_categories).toContain(cls.category);
    });
  });
});