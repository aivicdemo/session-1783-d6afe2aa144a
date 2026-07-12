import { validateMealEvaluation } from "../../src/logic/it-1-br-1783670064270-1-1-1";

describe("食事評価入力バリデーション機能", () => {
  // SCEN-413: [error] すべての必須項目が未入力で送信された場合、複数項目の不備を指摘するエラーが表示される
  test("必須項目がすべて未入力の場合、複数のエラーメッセージを返す", () => {
    const emptyEvaluation = {
      dish_name: "",
      satisfaction_score: null,
      completion_rate: null,
      comment: "",
    };

    expect(() => validateMealEvaluation(emptyEvaluation)).toThrow(/料理名/);
  });

  test("評価スコアが未入力の場合、エラーメッセージを返す", () => {
    const missingScore = {
      dish_name: "カレーライス",
      satisfaction_score: null,
      completion_rate: 80,
      comment: "美味しかった",
    };

    expect(() => validateMealEvaluation(missingScore)).toThrow(/評価スコア/);
  });

  test("コメントが未入力の場合、エラーメッセージを返す", () => {
    const missingComment = {
      dish_name: "唐揚げ",
      satisfaction_score: 4,
      completion_rate: 100,
      comment: "",
    };

    expect(() => validateMealEvaluation(missingComment)).toThrow(/コメント/);
  });

  test("評価スコアが1～5の範囲外の場合、エラーメッセージを返す", () => {
    const outOfRangeScore = {
      dish_name: "味噌汁",
      satisfaction_score: 6,
      completion_rate: 90,
      comment: "塩辛かった",
    };

    expect(() => validateMealEvaluation(outOfRangeScore)).toThrow(/範囲/);
  });

  test("完食度が0～100の範囲外の場合、エラーメッセージを返す", () => {
    const outOfRangeCompletion = {
      dish_name: "野菜炒め",
      satisfaction_score: 3,
      completion_rate: 150,
      comment: "野菜が固かった",
    };

    expect(() => validateMealEvaluation(outOfRangeCompletion)).toThrow(/完食度/);
  });

  test("すべての必須項目が正常に入力された場合、バリデーション成功を返す", () => {
    const validEvaluation = {
      dish_name: "オムライス",
      satisfaction_score: 5,
      completion_rate: 100,
      comment: "子どもが完食した",
    };

    const result = validateMealEvaluation(validEvaluation);
    expect(result).toEqual({
      is_valid: true,
      errors: [],
    });
  });

  test("必須項目が複数不足している場合、複数のエラー情報を同時に返す", () => {
    const multipleErrors = {
      dish_name: "",
      satisfaction_score: null,
      completion_rate: null,
      comment: "",
    };

    try {
      validateMealEvaluation(multipleErrors);
      fail("例外がスローされるべき");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      const errorMessage = (error as Error).message;
      expect(errorMessage).toMatch(/料理名|評価スコア|コメント/);
    }
  });

  test("料理名のみ入力で他が未入力の場合、複数のエラーメッセージを返す", () => {
    const partialInput = {
      dish_name: "天ぷら",
      satisfaction_score: null,
      completion_rate: null,
      comment: "",
    };

    expect(() => validateMealEvaluation(partialInput)).toThrow(/評価スコア|コメント/);
  });
});