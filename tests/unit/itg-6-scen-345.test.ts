import { extractFunctionUsageFrequency } from '../../src/logic/it-1-br-8-2-2-1';

describe('機能別使用頻度分析機能', () => {
  // SCEN-345
  test('使用頻度0の機能が正しく集計に含まれる', () => {
    const mockFunctionA = {
      functionId: 'func_001',
      functionName: '献立自動生成',
      functionCategory: 'core',
    };

    const mockFunctionB = {
      functionId: 'func_002',
      functionName: '栄養情報表示',
      functionCategory: 'analysis',
    };

    const mockFunctionC = {
      functionId: 'func_003',
      functionName: '食材検索',
      functionCategory: 'search',
    };

    const allFunctions = [mockFunctionA, mockFunctionB, mockFunctionC];

    const usageLogsUserA = [
      {
        logId: 'log_001',
        userId: 'user_001',
        functionId: 'func_001',
        timestamp: new Date('2024-01-15T09:00:00Z'),
        sessionDurationSeconds: 120,
        actionType: 'click',
      },
      {
        logId: 'log_002',
        userId: 'user_001',
        functionId: 'func_001',
        timestamp: new Date('2024-01-15T10:30:00Z'),
        sessionDurationSeconds: 180,
        actionType: 'click',
      },
      {
        logId: 'log_003',
        userId: 'user_001',
        functionId: 'func_002',
        timestamp: new Date('2024-01-15T11:15:00Z'),
        sessionDurationSeconds: 90,
        actionType: 'view',
      },
    ];

    const usageLogsUserB = [
      {
        logId: 'log_004',
        userId: 'user_002',
        functionId: 'func_001',
        timestamp: new Date('2024-01-16T08:00:00Z'),
        sessionDurationSeconds: 150,
        actionType: 'click',
      },
      {
        logId: 'log_005',
        userId: 'user_002',
        functionId: 'func_002',
        timestamp: new Date('2024-01-16T09:45:00Z'),
        sessionDurationSeconds: 200,
        actionType: 'view',
      },
    ];

    const allUsageLogs = [...usageLogsUserA, ...usageLogsUserB];

    const analysisResult = extractFunctionUsageFrequency({
      functions: allFunctions,
      usageLogs: allUsageLogs,
      analysisStartDate: new Date('2024-01-15T00:00:00Z'),
      analysisEndDate: new Date('2024-01-16T23:59:59Z'),
    });

    expect(analysisResult).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          functionId: 'func_001',
          functionName: '献立自動生成',
          usageCount: 3,
          usageFrequencyRank: 1,
          totalSessionDurationSeconds: 450,
          averageSessionDurationSeconds: 150,
          uniqueUserCount: 2,
        }),
        expect.objectContaining({
          functionId: 'func_002',
          functionName: '栄養情報表示',
          usageCount: 2,
          usageFrequencyRank: 2,
          totalSessionDurationSeconds: 290,
          averageSessionDurationSeconds: 145,
          uniqueUserCount: 2,
        }),
        expect.objectContaining({
          functionId: 'func_003',
          functionName: '食材検索',
          usageCount: 0,
          usageFrequencyRank: 3,
          totalSessionDurationSeconds: 0,
          averageSessionDurationSeconds: 0,
          uniqueUserCount: 0,
        }),
      ])
    );

    expect(analysisResult.length).toBe(3);

    const totalUsageCount = analysisResult.reduce(
      (sum, item) => sum + item.usageCount,
      0
    );
    expect(totalUsageCount).toBe(5);

    const zeroUsageFunction = analysisResult.find(
      (item) => item.functionId === 'func_003'
    );
    expect(zeroUsageFunction).toBeDefined();
    expect(zeroUsageFunction.usageCount).toBe(0);
    expect(zeroUsageFunction.uniqueUserCount).toBe(0);
  });
});