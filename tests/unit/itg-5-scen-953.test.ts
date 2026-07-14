import { classifyRejectionReasonCategory } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能", () => {
  // SCEN-953
  test("空文字列または null のテキストに対してエラーを返す", () => {
    // 空文字列のケース
    const resultEmpty = classifyRejectionReasonCategory("");
    expect(resultEmpty).toHaveProperty("error");
    expect(resultEmpty.error).toMatch(/理由/);

    // null のケース
    const resultNull = classifyRejectionReasonCategory(null);
    expect(resultNull).toHaveProperty("error");
    expect(resultNull.error).toMatch(/理由/);

    // 正常系: 有効な理由テキスト
    const resultValid = classifyRejectionReasonCategory("栄養バランスが悪い");
    expect(resultValid).toHaveProperty("category");
    expect(resultValid.category).toBe("栄養");
    expect(resultValid).not.toHaveProperty("error");
  });
});