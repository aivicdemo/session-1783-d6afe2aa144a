import { classifyMealRejectReason } from '../../src/logic/it-1-br-1783670064270-1-1-1';

describe('献立却下理由の自動カテゴリ分類機能', () => {
  // SCEN-377
  test('空文字列またはNULLの入力に対して適切にエラーハンドリングする', () => {
    // 空文字列の場合
    expect(() => classifyMealRejectReason('')).toThrow(/テキスト/);

    // NULLの場合
    expect(() => classifyMealRejectReason(null as any)).toThrow(/テキスト/);

    // システムが例外から回復することを確認
    const validInput = '塩辛すぎる';
    const result = classifyMealRejectReason(validInput);
    expect(result).toBeDefined();
    expect(typeof result.category).toBe('string');
  });
});