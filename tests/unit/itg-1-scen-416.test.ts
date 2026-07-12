import { validateSatisfactionScore } from "../../src/logic/it-1-br-1783670064270-1-1-1";

describe("献立提案後の家族成員による食事評価入力機能", () => {
  // SCEN-416: [error] 満足度スコア範囲検証機能 - 満足度スコアに6が入力された場合、範囲外警告が表示される
  test("満足度スコアが許容範囲を超える値6が入力された場合、範囲外警告がスローされる", () => {
    const inputScore = 6;
    expect(() => validateSatisfactionScore(inputScore)).toThrow(/範囲/);
  });

  test("満足度スコアが下限の0を入力した場合、検証に成功する", () => {
    const inputScore = 0;
    expect(validateSatisfactionScore(inputScore)).toBe(true);
  });

  test("満足度スコアが上限の5を入力した場合、検証に成功する", () => {
    const inputScore = 5;
    expect(validateSatisfactionScore(inputScore)).toBe(true);
  });

  test("満足度スコアが中間値の3を入力した場合、検証に成功する", () => {
    const inputScore = 3;
    expect(validateSatisfactionScore(inputScore)).toBe(true);
  });

  test("満足度スコアが負の値-1が入力された場合、範囲外警告がスローされる", () => {
    const inputScore = -1;
    expect(() => validateSatisfactionScore(inputScore)).toThrow(/範囲/);
  });

  test("満足度スコアが大きく超過する値10が入力された場合、範囲外警告がスローされる", () => {
    const inputScore = 10;
    expect(() => validateSatisfactionScore(inputScore)).toThrow(/範囲/);
  });

  test("満足度スコアが小数点を含む値3.5が入力された場合、検証に成功する", () => {
    const inputScore = 3.5;
    expect(validateSatisfactionScore(inputScore)).toBe(true);
  });

  test("満足度スコアが小数点を含む範囲外の値5.1が入力された場合、範囲外警告がスローされる", () => {
    const inputScore = 5.1;
    expect(() => validateSatisfactionScore(inputScore)).toThrow(/範囲/);
  });
});