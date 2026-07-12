import { validateSatisfactionScore } from '../../src/logic/it-1-br-1783670064270-1-1-1';

describe('満足度スコア範囲検証機能', () => {
  // SCEN-415: [error] 満足度スコア範囲検証機能 - 満足度スコアに0が入力された場合、範囲外警告が表示される
  test('満足度スコアが0のとき、範囲外エラーをスロー', () => {
    expect(() => validateSatisfactionScore(0)).toThrow(/満足度スコア/);
  });

  test('満足度スコアが1のとき、正常に通過', () => {
    expect(validateSatisfactionScore(1)).toEqual({
      isValid: true,
      score: 1,
      errorMessage: null,
    });
  });

  test('満足度スコアが5のとき、正常に通過', () => {
    expect(validateSatisfactionScore(5)).toEqual({
      isValid: true,
      score: 5,
      errorMessage: null,
    });
  });

  test('満足度スコアが6のとき、範囲外エラーをスロー', () => {
    expect(() => validateSatisfactionScore(6)).toThrow(/満足度スコア/);
  });

  test('満足度スコアが負数のとき、範囲外エラーをスロー', () => {
    expect(() => validateSatisfactionScore(-1)).toThrow(/満足度スコア/);
  });

  test('満足度スコアが小数のとき、範囲外エラーをスロー', () => {
    expect(() => validateSatisfactionScore(2.5)).toThrow(/満足度スコア/);
  });

  test('満足度スコアが3のとき、正常に通過', () => {
    expect(validateSatisfactionScore(3)).toEqual({
      isValid: true,
      score: 3,
      errorMessage: null,
    });
  });
});