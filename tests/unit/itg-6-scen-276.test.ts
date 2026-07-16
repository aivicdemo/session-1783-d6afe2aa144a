import { validateAndAnalyzeUserPainData } from '../../src/logic/it-1-br-8-2-2-1';

describe('アプリ内ログからの機能別使用頻度・離脱ポイント自動抽出・分析機能', () => {
  // SCEN-276
  test('全データレコードが欠損値・異常値である場合に分析不可エラーが発生する', () => {
    const invalidDataset = [
      {
        userId: null,
        featureId: undefined,
        usageCount: null,
        dropoffRate: '不正な値',
        timestamp: '',
      },
      {
        userId: undefined,
        featureId: null,
        usageCount: -999,
        dropoffRate: null,
        timestamp: 'invalid-date',
      },
      {
        userId: '',
        featureId: '',
        usageCount: NaN,
        dropoffRate: undefined,
        timestamp: null,
      },
      {
        userId: null,
        featureId: undefined,
        usageCount: null,
        dropoffRate: null,
        timestamp: undefined,
      },
    ];

    expect(() => validateAndAnalyzeUserPainData(invalidDataset)).toThrow(
      /有効なデータ不足/
    );
  });
});