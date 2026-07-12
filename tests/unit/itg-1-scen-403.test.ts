import { detectNonstandardInputPatterns } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-403: [error] ペイン分析・優先度マトリクス生成機能 - 入力パターンが標準化されていない場合、分類不可エラーが正しく検出される
  test('入力パターンが標準化されていない形式の場合、分類不可エラーが正しく発生し、詳細な原因情報とアプリケーション状態が適切に保持される', () => {
    // ハッピーパス: 標準化されたデータは通過
    const standardizedInput = {
      restrictionType: 'アレルギー',
      ingredient: 'ピーナッツ',
      severity: '重度',
      appliedDate: '2024-01-15',
    };
    const standardResult = detectNonstandardInputPatterns(standardizedInput);
    expect(standardResult).toEqual({
      isStandardized: true,
      errors: [],
      status: 'valid',
    });

    // エラーケース1: 全角・半角混在
    const mixedWidthInput = {
      restrictionType: 'ａｌｌｅｒｇｙ', // 全角英数字
      ingredient: 'ピーナッツ',
      severity: '重度',
      appliedDate: '2024-01-15',
    };
    const mixedWidthResult = detectNonstandardInputPatterns(mixedWidthInput);
    expect(mixedWidthResult.isStandardized).toBe(false);
    expect(mixedWidthResult.errors.length).toBeGreaterThan(0);
    expect(mixedWidthResult.errors[0]).toMatch(/全角半角混在/);
    expect(mixedWidthResult.status).toBe('invalid');

    // エラーケース2: 予期しない区切り文字
    const invalidDelimiterInput = {
      restrictionType: 'アレルギー｜食事制限', // パイプ区切り
      ingredient: 'ピーナッツ',
      severity: '重度',
      appliedDate: '2024-01-15',
    };
    const invalidDelimiterResult = detectNonstandardInputPatterns(invalidDelimiterInput);
    expect(invalidDelimiterResult.isStandardized).toBe(false);
    expect(invalidDelimiterResult.errors.length).toBeGreaterThan(0);
    expect(invalidDelimiterResult.errors[0]).toMatch(/区切り文字/);
    expect(invalidDelimiterResult.status).toBe('invalid');

    // エラーケース3: 改行コード不統一
    const inconsistentNewlineInput = {
      restrictionType: 'アレルギー\r\n食事制限', // Windows改行とUnix改行混在
      ingredient: 'ピーナッツ',
      severity: '重度',
      appliedDate: '2024-01-15',
    };
    const inconsistentNewlineResult = detectNonstandardInputPatterns(inconsistentNewlineInput);
    expect(inconsistentNewlineResult.isStandardized).toBe(false);
    expect(inconsistentNewlineResult.errors.length).toBeGreaterThan(0);
    expect(inconsistentNewlineResult.errors[0]).toMatch(/改行コード/);
    expect(inconsistentNewlineResult.status).toBe('invalid');

    // エラーケース4: 空白スペースの不統一
    const inconsistentSpaceInput = {
      restrictionType: 'アレルギー　食事制限', // 全角スペースと半角スペース混在
      ingredient: 'ピーナッツ',
      severity: '重度',
      appliedDate: '2024-01-15',
    };
    const inconsistentSpaceResult = detectNonstandardInputPatterns(inconsistentSpaceInput);
    expect(inconsistentSpaceResult.isStandardized).toBe(false);
    expect(inconsistentSpaceResult.errors.length).toBeGreaterThan(0);
    expect(inconsistentSpaceResult.errors[0]).toMatch(/スペース/);
    expect(inconsistentSpaceResult.status).toBe('invalid');

    // エラーケース5: 複数の非標準要素が混在
    const multipleErrorsInput = {
      restrictionType: 'ａｌｌｅｒｇｙ｜食事制限\r\n', // 全角、パイプ、改行混在
      ingredient: 'ピーナッツ',
      severity: '重度',
      appliedDate: '2024-01-15',
    };
    const multipleErrorsResult = detectNonstandardInputPatterns(multipleErrorsInput);
    expect(multipleErrorsResult.isStandardized).toBe(false);
    expect(multipleErrorsResult.errors.length).toBeGreaterThanOrEqual(2);
    expect(multipleErrorsResult.status).toBe('invalid');
    expect(multipleErrorsResult.errors.some((err: string) => err.match(/全角半角混在/))).toBe(true);
    expect(multipleErrorsResult.errors.some((err: string) => err.match(/区切り文字/))).toBe(true);

    // 異常値テスト: nullまたはundefinedが渡された場合
    expect(() => detectNonstandardInputPatterns(null as any)).toThrow(/入力値/);
    expect(() => detectNonstandardInputPatterns(undefined as any)).toThrow(/入力値/);

    // 異常値テスト: 必須フィールドが不足している場合
    const missingFieldInput = {
      restrictionType: 'アレルギー',
      ingredient: 'ピーナッツ',
      // severityとappliedDateが欠落
    };
    expect(() => detectNonstandardInputPatterns(missingFieldInput as any)).toThrow(/必須フィールド/);

    // アプリケーション状態が保持されることを確認
    const applicationStateResult = detectNonstandardInputPatterns(mixedWidthInput);
    expect(applicationStateResult).toHaveProperty('status');
    expect(applicationStateResult).toHaveProperty('isStandardized');
    expect(applicationStateResult).toHaveProperty('errors');
    expect(applicationStateResult.status).not.toBe('crashed');
  });
});