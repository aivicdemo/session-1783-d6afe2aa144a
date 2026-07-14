import { filterAnomalousAndMissingValues } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの成功・失敗パターン分析と改善提案 - 異常値・欠損値フィルタリング', () => {
  // SCEN-766
  test('入力データが null または空配列の場合、エラーが記録され処理がスキップされる', () => {
    const errorLogs: Array<{ timestamp: string; message: string; inputValue: unknown }> = [];

    // テスト1: null を入力した場合
    const resultWithNull = filterAnomalousAndMissingValues(null, errorLogs);

    expect(resultWithNull).toBeNull();
    expect(errorLogs.length).toBe(1);
    expect(errorLogs[0].message).toMatch(/入力値/);
    expect(errorLogs[0].inputValue).toBeNull();

    // テスト2: 空配列を入力した場合
    errorLogs.length = 0;
    const resultWithEmptyArray = filterAnomalousAndMissingValues([], errorLogs);

    expect(resultWithEmptyArray).toEqual([]);
    expect(errorLogs.length).toBe(1);
    expect(errorLogs[0].message).toMatch(/入力値/);
    expect(errorLogs[0].inputValue).toEqual([]);

    // テスト3: 正常なデータと異常値を混在させた入力
    errorLogs.length = 0;
    const mixedData = [
      {
        userId: 'user_001',
        successRate: 85.5,
        adjustedCookingTime: 35,
        satisfactionScore: 4.2,
      },
      {
        userId: 'user_002',
        successRate: null,
        adjustedCookingTime: 40,
        satisfactionScore: 3.8,
      },
      {
        userId: 'user_003',
        successRate: 92.0,
        adjustedCookingTime: NaN,
        satisfactionScore: 4.5,
      },
    ];
    const filteredData = filterAnomalousAndMissingValues(mixedData, errorLogs);

    expect(filteredData.length).toBe(1);
    expect(filteredData[0].userId).toBe('user_001');
    expect(filteredData[0].successRate).toBe(85.5);
    expect(filteredData[0].adjustedCookingTime).toBe(35);
    expect(filteredData[0].satisfactionScore).toBe(4.2);
    expect(errorLogs.length).toBe(2);
    expect(errorLogs.some((log) => log.message.includes('null'))).toBe(true);
    expect(errorLogs.some((log) => log.message.includes('NaN'))).toBe(true);
  });
});