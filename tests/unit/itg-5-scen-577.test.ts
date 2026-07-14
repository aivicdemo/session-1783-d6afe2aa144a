import { classifyRejectReasonText } from '../../src/logic/it-7-3-1';

describe('献立却下修正理由の自動カテゴリ分類機能', () => {
  // SCEN-577
  test('空のテキストまたはnull値が入力された場合、エラーが発生する', () => {
    // 空文字列入力でエラーが発生することを確認
    expect(() => classifyRejectReasonText('')).toThrow(/入力値/);

    // null値入力でエラーが発生することを確認
    expect(() => classifyRejectReasonText(null as any)).toThrow(/入力値/);

    // undefined値入力でエラーが発生することを確認
    expect(() => classifyRejectReasonText(undefined as any)).toThrow(/入力値/);
  });
});