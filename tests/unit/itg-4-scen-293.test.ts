import {
  validateFactorScores,
} from "../../src/logic/it-3-br-6-3-3";

describe("予測精度低下要因の可視化ダッシュボード", () => {
  // SCEN-293: [error] 改善提案書生成時の要因別スコアリング - 入力されたスコアが数値型でない場合にバリデーションエラーが発生する
  test("要因別スコアリングで非数値入力時にバリデーションエラーを投げる", () => {
    const invalidInputs = [
      { factors: [{ id: "f1", name: "気象", score: "abc" }] },
      { factors: [{ id: "f2", name: "イベント", score: "!@#" }] },
      { factors: [{ id: "f3", name: "競合施策", score: "" }] },
      { factors: [{ id: "f4", name: "その他", score: null }] },
      { factors: [{ id: "f5", name: "要因1", score: undefined }] },
    ];

    invalidInputs.forEach((input) => {
      expect(() => validateFactorScores(input)).toThrow(/スコア/);
    });
  });

  test("要因別スコアリングで正常な数値入力時に検証に成功する", () => {
    const validInput = {
      factors: [
        { id: "f1", name: "気象", score: 85 },
        { id: "f2", name: "イベント", score: 72 },
        { id: "f3", name: "競合施策", score: 65 },
      ],
    };

    const result = validateFactorScores(validInput);
    expect(result).toEqual({
      isValid: true,
      factors: [
        { id: "f1", name: "気象", score: 85 },
        { id: "f2", name: "イベント", score: 72 },
        { id: "f3", name: "競合施策", score: 65 },
      ],
    });
  });

  test("要因別スコアリングで境界値（0と100）を正常に処理する", () => {
    const boundaryInput = {
      factors: [
        { id: "f1", name: "要因1", score: 0 },
        { id: "f2", name: "要因2", score: 100 },
        { id: "f3", name: "要因3", score: 50 },
      ],
    };

    const result = validateFactorScores(boundaryInput);
    expect(result).toEqual({
      isValid: true,
      factors: [
        { id: "f1", name: "要因1", score: 0 },
        { id: "f2", name: "要因2", score: 100 },
        { id: "f3", name: "要因3", score: 50 },
      ],
    });
  });

  test("要因別スコアリングで小数値を正常に処理する", () => {
    const decimalInput = {
      factors: [
        { id: "f1", name: "気象", score: 85.5 },
        { id: "f2", name: "イベント", score: 72.3 },
      ],
    };

    const result = validateFactorScores(decimalInput);
    expect(result).toEqual({
      isValid: true,
      factors: [
        { id: "f1", name: "気象", score: 85.5 },
        { id: "f2", name: "イベント", score: 72.3 },
      ],
    });
  });

  test("要因別スコアリングで複合的な無効入力を検出する", () => {
    const mixedInvalidInput = {
      factors: [
        { id: "f1", name: "気象", score: 85 },
        { id: "f2", name: "イベント", score: "invalid" },
        { id: "f3", name: "競合施策", score: 65 },
      ],
    };

    expect(() => validateFactorScores(mixedInvalidInput)).toThrow(/スコア/);
  });
});