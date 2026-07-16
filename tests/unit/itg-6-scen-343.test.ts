import { analyzeMenuGenerationDropoffPoints } from '../../src/logic/it-1-br-8-2-2-1';

describe('献立生成フロー離脱ポイント分析機能', () => {
  // SCEN-343
  test('ログデータが空またはnullの場合にエラーが発生する', () => {
    // ケース1: ログデータがnullの場合
    expect(() => {
      analyzeMenuGenerationDropoffPoints(null);
    }).toThrow(/ログデータが無効です/);

    // ケース2: ログデータが空配列の場合
    expect(() => {
      analyzeMenuGenerationDropoffPoints([]);
    }).toThrow(/ログデータが空です/);

    // ケース3: ログデータが空オブジェクトの場合
    expect(() => {
      analyzeMenuGenerationDropoffPoints({});
    }).toThrow(/必須フィールドが不足しています/);

    // ケース4: ログデータが空文字列の場合
    expect(() => {
      analyzeMenuGenerationDropoffPoints('');
    }).toThrow(/ログデータが無効です/);

    // ケース5: ログデータが空のオブジェクト配列の場合
    expect(() => {
      analyzeMenuGenerationDropoffPoints([{}]);
    }).toThrow(/必須フィールドが不足しています/);

    // ケース6: ログデータが undefined の場合
    expect(() => {
      analyzeMenuGenerationDropoffPoints(undefined);
    }).toThrow(/ログデータが無効です/);
  });
});