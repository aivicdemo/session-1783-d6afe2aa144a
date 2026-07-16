import { validateImprovementPriorityScore } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログからのペイン要因抽出・優先度マトリクス生成', () => {
  // SCEN-250: [edge] 栄養士による失敗パターン根本原因評価・承認 - 改善優先度スコアが0～10の範囲外の場合、バリデーションエラーが発生する
  test('改善優先度スコアの範囲バリデーション - 負数・11以上・非数値でエラー発生、0～10で正常処理', () => {
    // ===== 負の値 (-1) でバリデーションエラーが発生することを確認 =====
    expect(() => {
      validateImprovementPriorityScore(-1);
    }).toThrow(/改善優先度スコア/);

    // ===== 範囲外の値 (11) でバリデーションエラーが発生することを確認 =====
    expect(() => {
      validateImprovementPriorityScore(11);
    }).toThrow(/改善優先度スコア/);

    // ===== 非数値 ('abc') でバリデーションエラーが発生することを確認 =====
    expect(() => {
      validateImprovementPriorityScore('abc' as any);
    }).toThrow(/改善優先度スコア/);

    // ===== 境界値 0 は正常に処理される =====
    const result_zero = validateImprovementPriorityScore(0);
    expect(result_zero.isValid).toBe(true);
    expect(result_zero.score).toBe(0);
    expect(result_zero.errorMessage).toBeUndefined();

    // ===== 境界値 10 は正常に処理される =====
    const result_ten = validateImprovementPriorityScore(10);
    expect(result_ten.isValid).toBe(true);
    expect(result_ten.score).toBe(10);
    expect(result_ten.errorMessage).toBeUndefined();

    // ===== 範囲内の整数値 (5) は正常に処理される =====
    const result_five = validateImprovementPriorityScore(5);
    expect(result_five.isValid).toBe(true);
    expect(result_five.score).toBe(5);
    expect(result_five.errorMessage).toBeUndefined();

    // ===== 範囲内の小数値 (7.5) は正常に処理される =====
    const result_decimal = validateImprovementPriorityScore(7.5);
    expect(result_decimal.isValid).toBe(true);
    expect(result_decimal.score).toBe(7.5);
    expect(result_decimal.errorMessage).toBeUndefined();

    // ===== 境界外の小数値 (10.1) でバリデーションエラーが発生することを確認 =====
    expect(() => {
      validateImprovementPriorityScore(10.1);
    }).toThrow(/改善優先度スコア/);

    // ===== null でバリデーションエラーが発生することを確認 =====
    expect(() => {
      validateImprovementPriorityScore(null as any);
    }).toThrow(/改善優先度スコア/);
  });
});