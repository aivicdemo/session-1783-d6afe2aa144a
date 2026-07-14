import { classifyRejectionReason } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-566: 献立却下修正理由の自動カテゴリ分類機能 - 空文字列または無効な却下理由が入力された場合、バリデーションエラーが返される
  test('空文字列または無効な却下理由が入力された場合、バリデーションエラーが返される', () => {
    // 空文字列入力のテスト
    expect(() => classifyRejectionReason('')).toThrow(/却下理由/);

    // null 入力のテスト
    expect(() => classifyRejectionReason(null as any)).toThrow(/却下理由/);

    // undefined 入力のテスト
    expect(() => classifyRejectionReason(undefined as any)).toThrow(/却下理由/);

    // 特殊記号のみの入力のテスト
    expect(() => classifyRejectionReason('!@#$%^&*()')).toThrow(/入力形式/);

    // 空白のみの入力のテスト
    expect(() => classifyRejectionReason('   ')).toThrow(/却下理由/);

    // 正常な入力でエラーが発生しないことを確認
    const result = classifyRejectionReason('栄養バランスが不適切です');
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
    expect(result.category).toBeDefined();
  });
});