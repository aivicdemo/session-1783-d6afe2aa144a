import { classifyMenuRejectionReason } from '../../src/logic/it-1-br-3-2-1';

describe('献立却下・修正理由のテキスト自動分類機能', () => {
  // SCEN-363
  test('却下理由テキストが空文字列またはnullのとき、エラーハンドリングが動作する', () => {
    // Empty string test
    expect(() => {
      classifyMenuRejectionReason('');
    }).toThrow(/却下理由/);

    // Null test
    expect(() => {
      classifyMenuRejectionReason(null as any);
    }).toThrow(/却下理由/);

    // Additional: undefined test to ensure comprehensive error handling
    expect(() => {
      classifyMenuRejectionReason(undefined as any);
    }).toThrow(/却下理由/);
  });
});