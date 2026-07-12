import { classifyMealRejectReason } from "../../src/logic/it-1-br-1783670064270-1-1-1";

describe("献立却下理由の自動カテゴリ分類機能", () => {
  // SCEN-375
  test("献立却下・修正理由のテキストが事前定義カテゴリに正確に自動分類される", () => {
    // ハッピーパス: 複数の却下・修正理由を入力し、各々が正しいカテゴリに分類されることを検証

    // テストケース 1: 栄養バランスに関する却下理由
    const nutritionRejectResult = classifyMealRejectReason({
      reasonText: "栄養バランスが悪い",
      userId: "user_001",
      mealId: "meal_20240115_001",
      timestamp: "2024-01-15T12:30:00Z",
    });

    expect(nutritionRejectResult.category).toBe("栄養バランス");
    expect(nutritionRejectResult.confidenceScore).toBeGreaterThanOrEqual(0.95);
    expect(nutritionRejectResult.isClassified).toBe(true);
    expect(nutritionRejectResult.reasonText).toBe("栄養バランスが悪い");
    expect(nutritionRejectResult.userId).toBe("user_001");
    expect(nutritionRejectResult.mealId).toBe("meal_20240115_001");
    expect(typeof nutritionRejectResult.timestamp).toBe("string");

    // テストケース 2: 予算に関する却下理由
    const budgetRejectResult = classifyMealRejectReason({
      reasonText: "予算を超えている",
      userId: "user_001",
      mealId: "meal_20240115_002",
      timestamp: "2024-01-15T13:00:00Z",
    });

    expect(budgetRejectResult.category).toBe("予算");
    expect(budgetRejectResult.confidenceScore).toBeGreaterThanOrEqual(0.95);
    expect(budgetRejectResult.isClassified).toBe(true);
    expect(budgetRejectResult.reasonText).toBe("予算を超えている");

    // テストケース 3: 材料入手可能性に関する修正理由
    const ingredientRejectResult = classifyMealRejectReason({
      reasonText: "材料が入手困難",
      userId: "user_001",
      mealId: "meal_20240115_003",
      timestamp: "2024-01-15T13:30:00Z",
    });

    expect(ingredientRejectResult.category).toBe("材料入手可能性");
    expect(ingredientRejectResult.confidenceScore).toBeGreaterThanOrEqual(0.95);
    expect(ingredientRejectResult.isClassified).toBe(true);
    expect(ingredientRejectResult.reasonText).toBe("材料が入手困難");

    // 分類精度の総合確認: 全テストケースが95%以上の精度で分類されていることを検証
    const allResults = [
      nutritionRejectResult,
      budgetRejectResult,
      ingredientRejectResult,
    ];

    const classificationAccuracy =
      allResults.filter((result) => result.confidenceScore >= 0.95).length /
      allResults.length;

    expect(classificationAccuracy).toBeGreaterThanOrEqual(0.95);

    // 誤分類または未分類のテキストが存在しないことを確認
    allResults.forEach((result) => {
      expect(result.isClassified).toBe(true);
      expect(result.category).toBeTruthy();
      expect(result.category.length).toBeGreaterThan(0);
    });

    // 分類結果が管理画面用データモデルとして正しく構造化されていることを確認
    allResults.forEach((result) => {
      expect(result).toHaveProperty("category");
      expect(result).toHaveProperty("reasonText");
      expect(result).toHaveProperty("confidenceScore");
      expect(result).toHaveProperty("isClassified");
      expect(result).toHaveProperty("userId");
      expect(result).toHaveProperty("mealId");
      expect(result).toHaveProperty("timestamp");
      expect(typeof result.category).toBe("string");
      expect(typeof result.confidenceScore).toBe("number");
      expect(typeof result.isClassified).toBe("boolean");
    });

    // 信頼度スコアが 0～1 の範囲内であることを確認
    allResults.forEach((result) => {
      expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(result.confidenceScore).toBeLessThanOrEqual(1);
    });
  });
});