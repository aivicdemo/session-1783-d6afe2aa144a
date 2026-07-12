import { validateMenuRejectionReason } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-621
  test('献立却下・修正理由の入力検証 - 必須項目チェック: 理由テキストが空白のみで構成されている場合', () => {
    const emptyReason = '   ';
    const tabReason = '\t\t';
    const newlineReason = '\n\n';
    const mixedWhitespaceReason = '  \t  \n  ';

    expect(() => validateMenuRejectionReason(emptyReason)).toThrow(/理由テキスト/);
    expect(() => validateMenuRejectionReason(tabReason)).toThrow(/理由テキスト/);
    expect(() => validateMenuRejectionReason(newlineReason)).toThrow(/理由テキスト/);
    expect(() => validateMenuRejectionReason(mixedWhitespaceReason)).toThrow(/理由テキスト/);
  });

  test('献立却下・修正理由の入力検証 - 必須項目チェック: 空文字列の場合', () => {
    const emptyString = '';

    expect(() => validateMenuRejectionReason(emptyString)).toThrow(/理由テキスト/);
  });

  test('献立却下・修正理由の入力検証 - 正常系: 有効なテキストが入力された場合', () => {
    const validReason = '栄養バランスが不適切です';
    const resultValid = validateMenuRejectionReason(validReason);

    expect(resultValid).toEqual({
      isValid: true,
      reason: '栄養バランスが不適切です',
      normalizedReason: '栄養バランスが不適切です'
    });
  });

  test('献立却下・修正理由の入力検証 - 正常系: 前後の空白を含むテキストは正規化されて処理される', () => {
    const reasonWithWhitespace = '  調理時間が長すぎます  ';
    const resultTrimmed = validateMenuRejectionReason(reasonWithWhitespace);

    expect(resultTrimmed).toEqual({
      isValid: true,
      reason: '調理時間が長すぎます',
      normalizedReason: '調理時間が長すぎます'
    });
  });
});