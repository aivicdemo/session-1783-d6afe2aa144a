import { classifyRejectionReasons } from '../../src/logic/it-8-1-2-1';

describe('却下理由自動分類機能 - 不完全データの自動フラグ付けと除外', () => {
  // SCEN-294
  test('空文字列・null・undefined の理由テキストが不完全データフラグ付けされ、差別化軸検証から除外される', () => {
    // ====== Setup: テスト環境初期化 ======
    const rejectionReasonTestCases = [
      {
        menuId: 'menu_001',
        reasonText: '',
        expectedIncomplete: true,
        expectedExcluded: true,
      },
      {
        menuId: 'menu_002',
        reasonText: null as any,
        expectedIncomplete: true,
        expectedExcluded: true,
      },
      {
        menuId: 'menu_003',
        reasonText: undefined as any,
        expectedIncomplete: true,
        expectedExcluded: true,
      },
      {
        menuId: 'menu_004',
        reasonText: '調理時間が長すぎる',
        expectedIncomplete: false,
        expectedExcluded: false,
      },
    ];

    // ====== 空文字列の理由テキスト分類処理実行 ======
    const emptyStringResult = classifyRejectionReasons({
      menuId: rejectionReasonTestCases[0].menuId,
      reasonText: rejectionReasonTestCases[0].reasonText,
    });

    // 期待結果: 不完全データフラグが true で、差別化軸検証から除外される
    expect(emptyStringResult.isIncomplete).toBe(true);
    expect(emptyStringResult.category).toBe('INCOMPLETE_DATA');
    expect(emptyStringResult.shouldExcludeFromDifferentiationAnalysis).toBe(true);

    // ====== null 値の理由テキスト分類処理実行 ======
    const nullResult = classifyRejectionReasons({
      menuId: rejectionReasonTestCases[1].menuId,
      reasonText: rejectionReasonTestCases[1].reasonText,
    });

    // 期待結果: 不完全データフラグが true で、差別化軸検証から除外される
    expect(nullResult.isIncomplete).toBe(true);
    expect(nullResult.category).toBe('INCOMPLETE_DATA');
    expect(nullResult.shouldExcludeFromDifferentiationAnalysis).toBe(true);

    // ====== undefined の理由テキスト分類処理実行 ======
    const undefinedResult = classifyRejectionReasons({
      menuId: rejectionReasonTestCases[2].menuId,
      reasonText: rejectionReasonTestCases[2].reasonText,
    });

    // 期待結果: 不完全データフラグが true で、差別化軸検証から除外される
    expect(undefinedResult.isIncomplete).toBe(true);
    expect(undefinedResult.category).toBe('INCOMPLETE_DATA');
    expect(undefinedResult.shouldExcludeFromDifferentiationAnalysis).toBe(true);

    // ====== 正常な理由テキスト分類処理実行（対照） ======
    const validResult = classifyRejectionReasons({
      menuId: rejectionReasonTestCases[3].menuId,
      reasonText: rejectionReasonTestCases[3].reasonText,
    });

    // 期待結果: 不完全データフラグが false で、差別化軸検証に含まれる
    expect(validResult.isIncomplete).toBe(false);
    expect(validResult.shouldExcludeFromDifferentiationAnalysis).toBe(false);
    expect(validResult.category).not.toBe('INCOMPLETE_DATA');

    // ====== フラグ付けされたレコードが後続処理から除外される確認 ======
    const allResults = [emptyStringResult, nullResult, undefinedResult, validResult];
    const excludedRecords = allResults.filter(
      (r) => r.shouldExcludeFromDifferentiationAnalysis === true
    );
    const includedRecords = allResults.filter(
      (r) => r.shouldExcludeFromDifferentiationAnalysis === false
    );

    // 期待結果: 3 件の不完全データが除外対象、1 件が検証対象
    expect(excludedRecords).toHaveLength(3);
    expect(includedRecords).toHaveLength(1);

    // 除外対象はすべて INCOMPLETE_DATA カテゴリ
    excludedRecords.forEach((record) => {
      expect(record.category).toBe('INCOMPLETE_DATA');
      expect(record.isIncomplete).toBe(true);
    });

    // 検証対象は INCOMPLETE_DATA ではない
    includedRecords.forEach((record) => {
      expect(record.category).not.toBe('INCOMPLETE_DATA');
      expect(record.isIncomplete).toBe(false);
    });
  });
});