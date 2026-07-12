import { classifyInterviewRecord } from '../../src/logic/it-1-br-1783670064270-1-1-1';

describe('インタビュー内容自動分類機能', () => {
  // SCEN-647
  test('記録データが空または形式不正の場合に分類エラーが発生する', () => {
    // 空文字列入力時のエラー検証
    expect(() => classifyInterviewRecord('')).toThrow(/記録データ/);

    // JSON形式不正入力時のエラー検証
    expect(() => classifyInterviewRecord('{invalid json}')).toThrow(/形式/);

    // nullまたはundefinedに相当する場合のエラー検証
    expect(() => classifyInterviewRecord(null as any)).toThrow(/記録データ/);

    // 空白のみの入力時のエラー検証
    expect(() => classifyInterviewRecord('   ')).toThrow(/記録データ/);

    // 有効なJSON形式の入力時は正常に分類されることを確認
    const validInput = JSON.stringify({
      content: '調理時間が長すぎて忙しい時は対応できない',
      timestamp: '2024-01-15T10:30:00Z'
    });
    const result = classifyInterviewRecord(validInput);
    expect(result).toBeDefined();
    expect(result.category).toBeDefined();
    expect(result.isClassified).toBe(true);
  });
});