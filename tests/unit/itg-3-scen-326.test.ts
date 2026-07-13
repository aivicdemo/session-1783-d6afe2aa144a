import { detectInvalidAllergyInfo } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-326: [error] 制限条件の抵触献立検出機能 - 不正なアレルギー情報が入力された時にエラーが発生する
  test('不正なアレルギー情報入力に対して適切なエラーメッセージが表示され、入力値が拒否される', () => {
    // ハッピーパス: 正常なアレルギー情報
    const valid_allergen_input = {
      allergen_name: 'peanut',
      severity_level: 'high',
      user_id: 'USR001'
    };
    const valid_result = detectInvalidAllergyInfo(valid_allergen_input);
    expect(valid_result).toEqual({
      is_valid: true,
      error_message: null,
      error_log_entry: null
    });

    // エラーケース 1: XSS インジェクション（特殊文字 "<script>"）
    const xss_injection_input = {
      allergen_name: '<script>alert("xss")</script>',
      severity_level: 'high',
      user_id: 'USR001'
    };
    expect(() => detectInvalidAllergyInfo(xss_injection_input)).toThrow(/アレルギー名/);

    // エラーケース 2: 数値のみの入力
    const numeric_only_input = {
      allergen_name: '12345',
      severity_level: 'high',
      user_id: 'USR001'
    };
    expect(() => detectInvalidAllergyInfo(numeric_only_input)).toThrow(/アレルギー名/);

    // エラーケース 3: 空白文字のみ
    const whitespace_only_input = {
      allergen_name: '   ',
      severity_level: 'high',
      user_id: 'USR001'
    };
    expect(() => detectInvalidAllergyInfo(whitespace_only_input)).toThrow(/アレルギー名/);

    // エラーケース 4: null 値
    const null_value_input = {
      allergen_name: null,
      severity_level: 'high',
      user_id: 'USR001'
    } as any;
    expect(() => detectInvalidAllergyInfo(null_value_input)).toThrow(/アレルギー名/);

    // エラーケース 5: undefined 値
    const undefined_value_input = {
      allergen_name: undefined,
      severity_level: 'high',
      user_id: 'USR001'
    } as any;
    expect(() => detectInvalidAllergyInfo(undefined_value_input)).toThrow(/アレルギー名/);

    // エラーケース 6: 不正な重症度レベル
    const invalid_severity_input = {
      allergen_name: 'egg',
      severity_level: 'invalid_level',
      user_id: 'USR001'
    };
    expect(() => detectInvalidAllergyInfo(invalid_severity_input)).toThrow(/重症度/);

    // エラーケース 7: ユーザー ID が空文字
    const empty_user_id_input = {
      allergen_name: 'milk',
      severity_level: 'high',
      user_id: ''
    };
    expect(() => detectInvalidAllergyInfo(empty_user_id_input)).toThrow(/ユーザーID/);

    // エラーケース 8: SQL インジェクション形式
    const sql_injection_input = {
      allergen_name: "'; DROP TABLE allergies; --",
      severity_level: 'high',
      user_id: 'USR001'
    };
    expect(() => detectInvalidAllergyInfo(sql_injection_input)).toThrow(/アレルギー名/);

    // エラーケース 9: 許可されていない特殊文字
    const special_chars_input = {
      allergen_name: 'shellfish@#$%',
      severity_level: 'high',
      user_id: 'USR001'
    };
    expect(() => detectInvalidAllergyInfo(special_chars_input)).toThrow(/アレルギー名/);

    // エラーケース 10: 極度に長いアレルギー名（256文字以上）
    const long_allergen_name = 'a'.repeat(256);
    const excessive_length_input = {
      allergen_name: long_allergen_name,
      severity_level: 'high',
      user_id: 'USR001'
    };
    expect(() => detectInvalidAllergyInfo(excessive_length_input)).toThrow(/アレルギー名/);

    // 境界値: 最大許可長（255文字）
    const max_length_allergen_name = 'a'.repeat(255);
    const max_length_input = {
      allergen_name: max_length_allergen_name,
      severity_level: 'high',
      user_id: 'USR001'
    };
    const max_length_result = detectInvalidAllergyInfo(max_length_input);
    expect(max_length_result).toEqual({
      is_valid: true,
      error_message: null,
      error_log_entry: null
    });

    // 境界値: 最小許可長（1文字）
    const min_length_input = {
      allergen_name: 'a',
      severity_level: 'high',
      user_id: 'USR001'
    };
    const min_length_result = detectInvalidAllergyInfo(min_length_input);
    expect(min_length_result).toEqual({
      is_valid: true,
      error_message: null,
      error_log_entry: null
    });
  });
});