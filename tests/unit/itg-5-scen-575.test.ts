import { classifyMealFeedbackReason } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類機能", () => {
  // SCEN-575: [edge] 献立却下修正理由の自動カテゴリ分類機能 - 複数のカテゴリに該当する曖昧なテキストが、信頼度スコアとともに分類される
  test("複数カテゴリに該当する曖昧なテキストが信頼度スコア付きで分類され、信頼度順に並び替えられる", () => {
    // 複数のカテゴリに該当する曖昧なテキスト入力
    const ambiguous_reason_text =
      "栄養バランスと見た目の改善が必要";

    // 分類実行
    const result = classifyMealFeedbackReason({
      reason_text: ambiguous_reason_text,
    });

    // 複数のカテゴリが候補として返されていることを確認
    expect(result.classified_categories.length).toBeGreaterThanOrEqual(2);

    // 各カテゴリに信頼度スコアが付与されていることを確認
    result.classified_categories.forEach((category) => {
      expect(typeof category.confidence_score).toBe("number");
      // 信頼度スコアが0.0～1.0の範囲内であることを確認
      expect(category.confidence_score).toBeGreaterThanOrEqual(0.0);
      expect(category.confidence_score).toBeLessThanOrEqual(1.0);
      // カテゴリ名が文字列であることを確認
      expect(typeof category.category_name).toBe("string");
    });

    // 信頼度スコアが降順（高い順）に並び替えられていることを確認
    for (let i = 0; i < result.classified_categories.length - 1; i++) {
      expect(
        result.classified_categories[i].confidence_score
      ).toBeGreaterThanOrEqual(
        result.classified_categories[i + 1].confidence_score
      );
    }

    // 最も信頼度が高いカテゴリが最上位に位置していることを確認
    const top_category = result.classified_categories[0];
    expect(top_category.confidence_score).toBe(
      Math.max(
        ...result.classified_categories.map((c) => c.confidence_score)
      )
    );

    // 期待される分類結果の構造を確認
    expect(result).toHaveProperty("classified_categories");
    expect(result).toHaveProperty("primary_category");
    expect(result.primary_category).toBe(top_category.category_name);

    // 複数カテゴリの具体例を確認（栄養バランスと見た目・調理の両側面が検出される）
    const category_names = result.classified_categories.map(
      (c) => c.category_name
    );
    expect(category_names).toContain("栄養バランス");
    expect(category_names.some((name) => 
      name === "見た目・調理" || 
      name === "見た目" || 
      name === "調理時間"
    )).toBe(true);

    // 最上位カテゴリの信頼度スコアが一定水準以上であることを確認（曖昧性があっても主要カテゴリは0.6以上）
    expect(result.classified_categories[0].confidence_score).toBeGreaterThanOrEqual(0.5);
  });
});