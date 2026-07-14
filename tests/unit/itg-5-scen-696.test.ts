import { classifyMenuRejectionReason } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類", () => {
  // SCEN-696: [normal] 献立却下修正理由の自動カテゴリ分類
  test("should accurately classify menu rejection reasons into predefined categories with 95%+ precision", () => {
    // テストデータ: 複数の献立却下・修正理由サンプル
    const test_cases = [
      {
        input_reason: "タンパク質が足りないと思う",
        expected_category: "栄養バランス",
        category_id: 1,
      },
      {
        input_reason: "豚肉がない、牛肉で代用できない",
        expected_category: "食材不足",
        category_id: 2,
      },
      {
        input_reason: "調理に2時間かかるのは長すぎる",
        expected_category: "調理時間超過",
        category_id: 3,
      },
      {
        input_reason: "子どものピーナッツアレルギーがあるのに含まれている",
        expected_category: "アレルゲン含有",
        category_id: 4,
      },
      {
        input_reason: "予算5000円を超える食材構成は困る",
        expected_category: "コスト超過",
        category_id: 5,
      },
      {
        input_reason: "家族が嫌いな野菜ばかり",
        expected_category: "家族好み未反映",
        category_id: 6,
      },
      {
        input_reason: "栄養が不足していて、調理時間も長すぎる",
        expected_category: "栄養バランス",
        category_id: 1,
      },
      {
        input_reason: "冷蔵庫に鶏肉がないのに鶏肉料理は困る",
        expected_category: "食材不足",
        category_id: 2,
      },
    ];

    const total_test_count = test_cases.length;
    let successful_classifications = 0;
    const classification_results: Array<{
      input: string;
      assigned_category: string;
      expected_category: string;
      is_correct: boolean;
      confidence_score: number;
    }> = [];

    // 各サンプル理由を分類関数に入力
    for (const test_case of test_cases) {
      const classification_result = classifyMenuRejectionReason(
        test_case.input_reason
      );

      const is_correct =
        classification_result.category === test_case.expected_category;
      if (is_correct) {
        successful_classifications += 1;
      }

      classification_results.push({
        input: test_case.input_reason,
        assigned_category: classification_result.category,
        expected_category: test_case.expected_category,
        is_correct: is_correct,
        confidence_score: classification_result.confidence_score,
      });
    }

    // 分類精度メトリクスを計測
    const precision_rate = (successful_classifications / total_test_count) * 100;

    // 分類結果が事前に定義された正しいカテゴリに割り当てられているかを検証
    for (const result of classification_results) {
      expect(result.assigned_category).toBeDefined();
      expect(
        [
          "栄養バランス",
          "食材不足",
          "調理時間超過",
          "アレルゲン含有",
          "コスト超過",
          "家族好み未反映",
        ]
      ).toContain(result.assigned_category);
    }

    // 分類精度が95%以上であることを検証
    expect(precision_rate).toBeGreaterThanOrEqual(95);

    // 具体的な分類結果の検証
    const nutrition_case = classification_results.find(
      (r) => r.input === "タンパク質が足りないと思う"
    );
    expect(nutrition_case?.assigned_category).toBe("栄養バランス");
    expect(nutrition_case?.is_correct).toBe(true);
    expect(nutrition_case?.confidence_score).toBeGreaterThan(0.8);

    const ingredient_case = classification_results.find(
      (r) => r.input === "豚肉がない、牛肉で代用できない"
    );
    expect(ingredient_case?.assigned_category).toBe("食材不足");
    expect(ingredient_case?.is_correct).toBe(true);
    expect(ingredient_case?.confidence_score).toBeGreaterThan(0.8);

    const time_case = classification_results.find(
      (r) => r.input === "調理に2時間かかるのは長すぎる"
    );
    expect(time_case?.assigned_category).toBe("調理時間超過");
    expect(time_case?.is_correct).toBe(true);
    expect(time_case?.confidence_score).toBeGreaterThan(0.8);

    const allergen_case = classification_results.find(
      (r) =>
        r.input ===
        "子どものピーナッツアレルギーがあるのに含まれている"
    );
    expect(allergen_case?.assigned_category).toBe("アレルゲン含有");
    expect(allergen_case?.is_correct).toBe(true);
    expect(allergen_case?.confidence_score).toBeGreaterThan(0.8);

    const cost_case = classification_results.find(
      (r) => r.input === "予算5000円を超える食材構成は困る"
    );
    expect(cost_case?.assigned_category).toBe("コスト超過");
    expect(cost_case?.is_correct).toBe(true);
    expect(cost_case?.confidence_score).toBeGreaterThan(0.8);

    const preference_case = classification_results.find(
      (r) => r.input === "家族が嫌いな野菜ばかり"
    );
    expect(preference_case?.assigned_category).toBe("家族好み未反映");
    expect(preference_case?.is_correct).toBe(true);
    expect(preference_case?.confidence_score).toBeGreaterThan(0.7);

    // 曖昧な表現の分類検証（複合理由の場合は主たるカテゴリに分類）
    const ambiguous_case_1 = classification_results.find(
      (r) => r.input === "栄養が不足していて、調理時間も長すぎる"
    );
    expect(
      [
        "栄養バランス",
        "調理時間超過",
      ]
    ).toContain(ambiguous_case_1?.assigned_category);
    expect(ambiguous_case_1?.is_correct).toBe(true);

    const ambiguous_case_2 = classification_results.find(
      (r) => r.input === "冷蔵庫に鶏肉がないのに鶏肉料理は困る"
    );
    expect(ambiguous_case_2?.assigned_category).toBe("食材不足");
    expect(ambiguous_case_2?.is_correct).toBe(true);
    expect(ambiguous_case_2?.confidence_score).toBeGreaterThan(0.75);

    // 分類精度メトリクスの詳細検証
    expect(precision_rate).toBe(100);
    expect(successful_classifications).toBe(8);
    expect(total_test_count).toBe(8);

    // すべての分類結果に信頼度スコアが付与されていることを確認
    for (const result of classification_results) {
      expect(result.confidence_score).toBeGreaterThan(0);
      expect(result.confidence_score).toBeLessThanOrEqual(1);
    }
  });
});