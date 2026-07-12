import { validateMealEvaluation } from "../../src/logic/it-1-br-1783670064270-1-1-1";

describe("食事評価入力バリデーション機能", () => {
  // SCEN-412
  test("完食度のみが未入力で他は入力されている場合、完食度の不備を指摘するエラーが表示される", () => {
    const input = {
      dishName: "肉じゃが",
      tasteRating: 4,
      nutritionRating: 5,
      completionRate: null,
    };

    expect(() => validateMealEvaluation(input)).toThrow(/完食度/);
  });
});