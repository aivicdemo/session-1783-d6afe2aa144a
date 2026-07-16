import { validateMarketAnalysisInput } from '../../src/logic/it-1-br-8-2-2-1';

describe('市場分析実施判定機能 - 入力データ検証', () => {
  test('SCEN-302: 判定条件の入力データが不正な場合にエラーが発生する', () => {
    // 不正なデータセット: 空文字列
    expect(() => {
      validateMarketAnalysisInput({
        quarterStartDate: '',
        analysisType: 'market',
        requiredSampleSize: 50,
      });
    }).toThrow(/日付/);

    // 不正なデータセット: null値
    expect(() => {
      validateMarketAnalysisInput({
        quarterStartDate: null as any,
        analysisType: 'market',
        requiredSampleSize: 50,
      });
    }).toThrow(/日付/);

    // 不正なデータセット: undefined
    expect(() => {
      validateMarketAnalysisInput({
        quarterStartDate: undefined as any,
        analysisType: 'market',
        requiredSampleSize: 50,
      });
    }).toThrow(/日付/);

    // 不正なデータセット: 負の数値（サンプル数）
    expect(() => {
      validateMarketAnalysisInput({
        quarterStartDate: '2024-Q1',
        analysisType: 'market',
        requiredSampleSize: -50,
      });
    }).toThrow(/サンプル数/);

    // 不正なデータセット: 空文字列（分析タイプ）
    expect(() => {
      validateMarketAnalysisInput({
        quarterStartDate: '2024-Q1',
        analysisType: '',
        requiredSampleSize: 50,
      });
    }).toThrow(/分析タイプ/);

    // 正常系: すべての入力が妥当な場合
    const result = validateMarketAnalysisInput({
      quarterStartDate: '2024-Q1',
      analysisType: 'market',
      requiredSampleSize: 50,
    });
    expect(result).toEqual({
      isValid: true,
      quarterStartDate: '2024-Q1',
      analysisType: 'market',
      requiredSampleSize: 50,
    });

    // 境界値テスト: サンプル数が0の場合
    expect(() => {
      validateMarketAnalysisInput({
        quarterStartDate: '2024-Q1',
        analysisType: 'market',
        requiredSampleSize: 0,
      });
    }).toThrow(/サンプル数/);

    // 境界値テスト: サンプル数が正の最小値1の場合
    const resultMinValid = validateMarketAnalysisInput({
      quarterStartDate: '2024-Q1',
      analysisType: 'market',
      requiredSampleSize: 1,
    });
    expect(resultMinValid.isValid).toBe(true);
    expect(resultMinValid.requiredSampleSize).toBe(1);
  });
});