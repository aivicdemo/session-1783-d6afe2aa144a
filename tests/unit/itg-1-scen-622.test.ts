import { validateMealRejectReason } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-622
  test('献立却下・修正理由の入力検証 - 必須項目チェック: 理由テキストが1文字の場合にチェック通過する', () => {
    const reasonText = 'a';
    const result = validateMealRejectReason(reasonText);

    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBe('');
    expect(result.isSubmittable).toBe(true);
  });
});