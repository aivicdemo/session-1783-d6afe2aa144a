import { validateRejectReasonInput } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-620
  test('献立却下・修正理由の入力検証 - 必須項目チェック: 理由テキストが空文字列の場合にチェック失敗エラーが発生する', () => {
    const emptyReason = '';

    expect(() => {
      validateRejectReasonInput(emptyReason);
    }).toThrow(/必須項目/);
  });
});