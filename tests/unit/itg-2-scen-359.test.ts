import { classifyMenuRejectionReason } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能", () => {
  test("SCEN-359: [edge] 献立却下・修正理由の自動カテゴリ分類 - 複数のカテゴリに該当する曖昧なテキストが最適なカテゴリに分類される", () => {
    const testCases = [
      {
        input: "塩分が多く、栄養バランスが悪い",
        expectedCategory: "nutrition_imbalance",
        expectedConfidenceScore: 0.92,
      },
      {
        input: "調理に時間がかかりすぎて、家族が不満そう",
        expectedCategory: "cooking_time_excessive",
        expectedConfidenceScore: 0.88,
      },
      {
        input: "子どもが嫌いな野菜ばかりで、完食できなかった",
        expectedCategory: "family_preference_mismatch",
        expectedConfidenceScore: 0.95,
      },
      {
        input: "冷蔵庫に小麦粉がなくて、代替食材の代用が難しい",
        expectedCategory: "ingredient_availability_issue",
        expectedConfidenceScore: 0.89,
      },
      {
        input: "月末で予算が残っていないのに、高い食材が多い",
        expectedCategory: "budget_constraint_violation",
        expectedConfidenceScore: 0.91,
      },
    ];

    const classificationResults = testCases.map((testCase) => {
      const result = classifyMenuRejectionReason(testCase.input);
      return result;
    });

    // Validate classification accuracy for first test case
    expect(classificationResults[0].category).toBe("nutrition_imbalance");
    expect(classificationResults[0].confidenceScore).toBe(0.92);
    expect(classificationResults[0].alternativeCategories.length).toBeGreaterThanOrEqual(1);

    // Validate classification accuracy for second test case
    expect(classificationResults[1].category).toBe("cooking_time_excessive");
    expect(classificationResults[1].confidenceScore).toBe(0.88);

    // Validate classification accuracy for third test case
    expect(classificationResults[2].category).toBe("family_preference_mismatch");
    expect(classificationResults[2].confidenceScore).toBe(0.95);

    // Validate classification accuracy for fourth test case
    expect(classificationResults[3].category).toBe("ingredient_availability_issue");
    expect(classificationResults[3].confidenceScore).toBe(0.89);

    // Validate classification accuracy for fifth test case
    expect(classificationResults[4].category).toBe("budget_constraint_violation");
    expect(classificationResults[4].confidenceScore).toBe(0.91);

    // Validate that all results have valid structure
    classificationResults.forEach((result) => {
      expect(result).toHaveProperty("category");
      expect(result).toHaveProperty("confidenceScore");
      expect(result).toHaveProperty("alternativeCategories");
      expect(result).toHaveProperty("timestamp");
      expect(result.confidenceScore).toBeGreaterThanOrEqual(0.85);
      expect(result.confidenceScore).toBeLessThanOrEqual(1.0);
      expect(Array.isArray(result.alternativeCategories)).toBe(true);
    });

    // Validate overall classification accuracy >= 95%
    const accurateClassifications = classificationResults.filter(
      (result) => result.confidenceScore >= 0.85
    ).length;
    const accuracyRate = (accurateClassifications / classificationResults.length) * 100;
    expect(accuracyRate).toBeGreaterThanOrEqual(95);

    // Validate that ambiguity is resolved for all test cases
    classificationResults.forEach((result) => {
      expect(result.category).toBeTruthy();
      expect(result.category.length).toBeGreaterThan(0);
    });

    // Validate that intended rejection reason categories are correctly identified
    const categoryMappings = {
      nutrition_imbalance: "栄養バランス不適切",
      cooking_time_excessive: "調理時間超過",
      family_preference_mismatch: "家族好み未反映",
      ingredient_availability_issue: "食材制限漏れ",
      budget_constraint_violation: "予算超過",
    };

    classificationResults.forEach((result, index) => {
      expect(categoryMappings).toHaveProperty(result.category);
    });
  });

  test("SCEN-359: [error] 献立却下・修正理由の自動カテゴリ分類 - 空のテキストが入力された場合", () => {
    expect(() => classifyMenuRejectionReason("")).toThrow(/入力値/);
  });

  test("SCEN-359: [error] 献立却下・修正理由の自動カテゴリ分類 - nullが入力された場合", () => {
    expect(() => classifyMenuRejectionReason(null as any)).toThrow(/値が必須/);
  });

  test("SCEN-359: [error] 献立却下・修正理由の自動カテゴリ分類 - 非常に短いテキストが入力された場合", () => {
    expect(() => classifyMenuRejectionReason("abc")).toThrow(/テキスト長/);
  });
});