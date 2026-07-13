import { classifyPainFactorsFromUserInput } from "../../src/logic/it-1-br-2-1-1-1";

describe("ペイン要因自動分類機能 - 不正な入力形式のエラー処理", () => {
  // SCEN-387
  test("離脱データまたは入力パターンが不正な形式の場合にエラーが返却される", () => {
    // 境界値テスト: 空文字列
    expect(() =>
      classifyPainFactorsFromUserInput({
        churn_data: "",
        input_pattern: "valid_pattern_001",
      })
    ).toThrow(/離脱データ/);

    // 境界値テスト: null値（離脱データ）
    expect(() =>
      classifyPainFactorsFromUserInput({
        churn_data: null as any,
        input_pattern: "valid_pattern_001",
      })
    ).toThrow(/離脱データ/);

    // 境界値テスト: undefined（離脱データ）
    expect(() =>
      classifyPainFactorsFromUserInput({
        churn_data: undefined as any,
        input_pattern: "valid_pattern_001",
      })
    ).toThrow(/離脱データ/);

    // 境界値テスト: 特殊文字のみ
    expect(() =>
      classifyPainFactorsFromUserInput({
        churn_data: "!@#$%^&*()",
        input_pattern: "valid_pattern_001",
      })
    ).toThrow(/形式/);

    // 境界値テスト: 空文字列（入力パターン）
    expect(() =>
      classifyPainFactorsFromUserInput({
        churn_data: "departure_step_checkout",
        input_pattern: "",
      })
    ).toThrow(/入力パターン/);

    // 境界値テスト: null値（入力パターン）
    expect(() =>
      classifyPainFactorsFromUserInput({
        churn_data: "departure_step_checkout",
        input_pattern: null as any,
      })
    ).toThrow(/入力パターン/);

    // 境界値テスト: undefined（入力パターン）
    expect(() =>
      classifyPainFactorsFromUserInput({
        churn_data: "departure_step_checkout",
        input_pattern: undefined as any,
      })
    ).toThrow(/入力パターン/);

    // 型エラーテスト: 数値を文字列フィールドに入力
    expect(() =>
      classifyPainFactorsFromUserInput({
        churn_data: 12345 as any,
        input_pattern: "valid_pattern_001",
      })
    ).toThrow(/型/);

    // 型エラーテスト: オブジェクトを文字列フィールドに入力
    expect(() =>
      classifyPainFactorsFromUserInput({
        churn_data: { data: "test" } as any,
        input_pattern: "valid_pattern_001",
      })
    ).toThrow(/型/);

    // 型エラーテスト: 配列を文字列フィールドに入力
    expect(() =>
      classifyPainFactorsFromUserInput({
        churn_data: ["departure", "step"] as any,
        input_pattern: "valid_pattern_001",
      })
    ).toThrow(/型/);

    // 成功パス: 正規の形式で入力された場合
    const result = classifyPainFactorsFromUserInput({
      churn_data: "departure_step_payment_confirmation",
      input_pattern: "budget_constraint_pattern",
    });

    expect(result).toHaveProperty("pain_category");
    expect(result).toHaveProperty("priority_score");
    expect(result).toHaveProperty("classification_confidence");
    expect(typeof result.pain_category).toBe("string");
    expect(typeof result.priority_score).toBe("number");
    expect(result.priority_score).toBeGreaterThanOrEqual(0);
    expect(result.priority_score).toBeLessThanOrEqual(100);
    expect(typeof result.classification_confidence).toBe("number");
    expect(result.classification_confidence).toBeGreaterThanOrEqual(0);
    expect(result.classification_confidence).toBeLessThanOrEqual(1);
  });
});