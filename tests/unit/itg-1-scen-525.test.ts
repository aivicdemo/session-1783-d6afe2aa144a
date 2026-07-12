import { determineAnalysisTiming } from '../../src/logic/it-2';

describe('家族成員の食事評価データの蓄積・管理機能', () => {
  // SCEN-525: [error] 分析タイミング判定機能 - 無効な日時形式が入力された場合にエラーが返される
  test('無効な日時形式が入力された場合にエラーが返される', () => {
    // 無効な日時形式: 月が13以上
    expect(() => determineAnalysisTiming('2024/13/45')).toThrow(/日時形式/);
  });

  test('無効な日時形式が入力された場合にエラーが返される - invalid-date', () => {
    // 無効な日時形式: 文字列
    expect(() => determineAnalysisTiming('invalid-date')).toThrow(/日時形式/);
  });

  test('無効な日時形式が入力された場合にエラーが返される - 12-31', () => {
    // 無効な日時形式: 年が不足
    expect(() => determineAnalysisTiming('12-31')).toThrow(/日時形式/);
  });

  test('有効な日時形式でタイミング判定が成功する', () => {
    // 有効な ISO8601 形式
    const result = determineAnalysisTiming('2024-01-15T09:00:00Z');
    expect(result).toEqual({
      isValid: true,
      timingType: 'weekly',
      nextExecutionTime: '2024-01-22T09:00:00Z'
    });
  });

  test('月次分析タイミングが正しく判定される', () => {
    // 月初の第1営業日を判定
    const result = determineAnalysisTiming('2024-02-01T09:00:00Z');
    expect(result).toEqual({
      isValid: true,
      timingType: 'monthly',
      nextExecutionTime: '2024-03-01T09:00:00Z'
    });
  });

  test('週次分析タイミングが正しく判定される', () => {
    // 毎週月曜日 09:00 を判定
    const result = determineAnalysisTiming('2024-01-22T09:00:00Z');
    expect(result).toEqual({
      isValid: true,
      timingType: 'weekly',
      nextExecutionTime: '2024-01-29T09:00:00Z'
    });
  });

  test('空文字列が入力された場合にエラーが返される', () => {
    expect(() => determineAnalysisTiming('')).toThrow(/日時形式/);
  });

  test('null が入力された場合にエラーが返される', () => {
    expect(() => determineAnalysisTiming(null as any)).toThrow(/日時形式/);
  });

  test('undefined が入力された場合にエラーが返される', () => {
    expect(() => determineAnalysisTiming(undefined as any)).toThrow(/日時形式/);
  });

  test('不完全な ISO8601 形式が入力された場合にエラーが返される', () => {
    // 時刻の一部が欠落
    expect(() => determineAnalysisTiming('2024-01-15T09:00')).toThrow(/日時形式/);
  });
});