import { classifyFailurePatterns } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-590
  test('失敗パターン分類・優先度判定機能 - 失敗パターンデータが空または不完全な場合、エラーハンドリングが適切に実行される', () => {
    // ケース1: 失敗パターンデータが空のオブジェクト({})の場合
    expect(() => classifyFailurePatterns({})).toThrow(/patternId/);

    // ケース2: 必須フィールド(severity)を欠いた不完全なデータの場合
    expect(() =>
      classifyFailurePatterns({
        patternId: 'pattern-001'
      })
    ).toThrow(/severity/);

    // ケース3: nullが入力された場合
    expect(() => classifyFailurePatterns(null as any)).toThrow(/null|undefined|存在/);

    // ケース4: undefinedが入力された場合
    expect(() => classifyFailurePatterns(undefined as any)).toThrow(/null|undefined|存在/);

    // ケース5: 複数の必須フィールドを欠いた不完全なデータの場合
    expect(() =>
      classifyFailurePatterns({
        patternId: 'pattern-002',
        category: 'nutritionBalance'
      })
    ).toThrow(/severity/);

    // ケース6: severityが無効な値（文字列ではなく数値）の場合
    expect(() =>
      classifyFailurePatterns({
        patternId: 'pattern-003',
        severity: 'invalid_severity',
        category: 'nutritionBalance',
        frequency: 5
      })
    ).toThrow(/severity/);

    // ケース7: categoryが不正な値の場合
    expect(() =>
      classifyFailurePatterns({
        patternId: 'pattern-004',
        severity: 'high',
        category: 'invalid_category',
        frequency: 5
      })
    ).toThrow(/category/);

    // ケース8: frequencyが負の数の場合
    expect(() =>
      classifyFailurePatterns({
        patternId: 'pattern-005',
        severity: 'high',
        category: 'nutritionBalance',
        frequency: -1
      })
    ).toThrow(/frequency/);

    // ケース9: 空配列が入力された場合
    expect(() => classifyFailurePatterns([] as any)).toThrow(/patternId/);

    // ケース10: 正常なデータを入力した場合は成功することを確認
    const validResult = classifyFailurePatterns({
      patternId: 'pattern-006',
      severity: 'high',
      category: 'nutritionBalance',
      frequency: 8,
      impact: 'significant'
    });

    expect(validResult).toBeDefined();
    expect(validResult.classified).toBe(true);
    expect(validResult.priority).toBeDefined();
  });
});