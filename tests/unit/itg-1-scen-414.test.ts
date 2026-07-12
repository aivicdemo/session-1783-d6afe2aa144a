import { validateSatisfactionScore } from '../../src/logic/it-1-br-1783670064270-1-1-1';

describe('家族成員の食事評価入力 - 満足度スコア範囲検証', () => {
  // SCEN-414
  test('満足度スコアが1～5の範囲内（3）の場合、バリデーション成功となりエラーメッセージが表示されない', () => {
    const input_score = 3;
    const result = validateSatisfactionScore(input_score);

    expect(result.is_valid).toBe(true);
    expect(result.error_message).toBe('');
    expect(result.input_value).toBe(3);
  });

  test('満足度スコアが範囲外（0）の場合、バリデーション失敗となり満足度に関するエラーメッセージが表示される', () => {
    const input_score = 0;
    expect(() => validateSatisfactionScore(input_score)).toThrow(/満足度/);
  });

  test('満足度スコアが範囲外（6）の場合、バリデーション失敗となり満足度に関するエラーメッセージが表示される', () => {
    const input_score = 6;
    expect(() => validateSatisfactionScore(input_score)).toThrow(/満足度/);
  });

  test('満足度スコアが整数でない場合、バリデーション失敗となり満足度に関するエラーメッセージが表示される', () => {
    const input_score = 3.5;
    expect(() => validateSatisfactionScore(input_score)).toThrow(/満足度/);
  });

  test('満足度スコアが1（範囲の下限）の場合、バリデーション成功となる', () => {
    const input_score = 1;
    const result = validateSatisfactionScore(input_score);

    expect(result.is_valid).toBe(true);
    expect(result.error_message).toBe('');
    expect(result.input_value).toBe(1);
  });

  test('満足度スコアが5（範囲の上限）の場合、バリデーション成功となる', () => {
    const input_score = 5;
    const result = validateSatisfactionScore(input_score);

    expect(result.is_valid).toBe(true);
    expect(result.error_message).toBe('');
    expect(result.input_value).toBe(5);
  });

  test('満足度スコアがnullの場合、バリデーション失敗となり満足度に関するエラーメッセージが表示される', () => {
    const input_score = null as any;
    expect(() => validateSatisfactionScore(input_score)).toThrow(/満足度/);
  });

  test('満足度スコアが負数（-1）の場合、バリデーション失敗となり満足度に関するエラーメッセージが表示される', () => {
    const input_score = -1;
    expect(() => validateSatisfactionScore(input_score)).toThrow(/満足度/);
  });
});