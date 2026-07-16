import { analyzeFailurePatterns } from '../../src/logic/it-8-1-1-1';

describe('失敗パターン分析機能 - 空データ入力時の堅牢性', () => {
  // SCEN-286
  test('理由集計データが空の場合でも処理が失敗せずに空の失敗パターンを返す', () => {
    // ===== テスト1: 空オブジェクト入力 =====
    const emptyObjectResult = analyzeFailurePatterns({});

    // 処理がエラーを発生させていないことを確認（実行に成功している）
    expect(emptyObjectResult).toBeDefined();

    // 戻り値として失敗パターンデータ構造が返されていることを確認
    expect(emptyObjectResult).toHaveProperty('failedPatterns');
    expect(emptyObjectResult).toHaveProperty('totalCount');
    expect(emptyObjectResult).toHaveProperty('analysisTimestamp');

    // 戻り値のfailedPatterns配列が空配列であることを確認
    expect(emptyObjectResult.failedPatterns).toEqual([]);
    expect(Array.isArray(emptyObjectResult.failedPatterns)).toBe(true);

    // totalCountが0であることを確認
    expect(emptyObjectResult.totalCount).toBe(0);

    // ===== テスト2: null入力 =====
    const nullResult = analyzeFailurePatterns(null);

    // 処理がエラーを発生させていないことを確認
    expect(nullResult).toBeDefined();

    // 戻り値として失敗パターンデータ構造が返されていることを確認
    expect(nullResult).toHaveProperty('failedPatterns');
    expect(nullResult).toHaveProperty('totalCount');
    expect(nullResult).toHaveProperty('analysisTimestamp');

    // 戻り値のfailedPatterns配列が空配列であることを確認
    expect(nullResult.failedPatterns).toEqual([]);

    // totalCountが0であることを確認
    expect(nullResult.totalCount).toBe(0);

    // ===== テスト3: undefined入力 =====
    const undefinedResult = analyzeFailurePatterns(undefined);

    // 処理がエラーを発生させていないことを確認
    expect(undefinedResult).toBeDefined();

    // 戻り値として失敗パターンデータ構造が返されていることを確認
    expect(undefinedResult).toHaveProperty('failedPatterns');
    expect(undefinedResult).toHaveProperty('totalCount');

    // 戻り値のfailedPatterns配列が空配列であることを確認
    expect(undefinedResult.failedPatterns).toEqual([]);

    // totalCountが0であることを確認
    expect(undefinedResult.totalCount).toBe(0);

    // ===== テスト4: 正常系データとの対比 =====
    const validInput = {
      '栄養バランス不適切': 15,
      '家族好み未反映': 8,
      '調理時間超過': 12,
    };

    const validResult = analyzeFailurePatterns(validInput);

    // 正常系では空ではなくパターンが返されることを確認
    expect(validResult.failedPatterns.length).toBeGreaterThan(0);
    expect(validResult.totalCount).toBe(35);

    // 空データ入力の結果と異なることを確認
    expect(emptyObjectResult.failedPatterns.length).not.toBe(validResult.failedPatterns.length);
  });
});