import { validateMenuEvaluationData } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-537
  test("購買傾向レポートデータが不完全な場合にエラーが返される", () => {
    const incompleteDataMissingPurchaseDate = {
      purchase_date: null,
      product_category: "野菜",
      quantity: 5,
      unit_price: 100,
      satisfaction_score: 4,
    };

    expect(() =>
      validateMenuEvaluationData(incompleteDataMissingPurchaseDate)
    ).toThrow(/購買日時/);

    const incompleteDataEmptyCategory = {
      purchase_date: "2024-01-15T10:30:00Z",
      product_category: "",
      quantity: 5,
      unit_price: 100,
      satisfaction_score: 4,
    };

    expect(() =>
      validateMenuEvaluationData(incompleteDataEmptyCategory)
    ).toThrow(/商品カテゴリ/);

    const incompleteDataMissingQuantity = {
      purchase_date: "2024-01-15T10:30:00Z",
      product_category: "野菜",
      quantity: null,
      unit_price: 100,
      satisfaction_score: 4,
    };

    expect(() =>
      validateMenuEvaluationData(incompleteDataMissingQuantity)
    ).toThrow(/数量/);

    const incompleteDataInvalidSatisfaction = {
      purchase_date: "2024-01-15T10:30:00Z",
      product_category: "野菜",
      quantity: 5,
      unit_price: 100,
      satisfaction_score: 6,
    };

    expect(() =>
      validateMenuEvaluationData(incompleteDataInvalidSatisfaction)
    ).toThrow(/満足度/);

    const completeData = {
      purchase_date: "2024-01-15T10:30:00Z",
      product_category: "野菜",
      quantity: 5,
      unit_price: 100,
      satisfaction_score: 4,
    };

    const result = validateMenuEvaluationData(completeData);

    expect(result).toEqual({
      is_valid: true,
      error_message: null,
      validated_data: {
        purchase_date: "2024-01-15T10:30:00Z",
        product_category: "野菜",
        quantity: 5,
        unit_price: 100,
        satisfaction_score: 4,
      },
    });
  });
});