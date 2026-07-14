import { aggregateWeeklyMetrics } from '../../src/logic/it-7-2-1';

describe('Weekly Metrics Aggregation Dashboard', () => {
  // SCEN-656: [error] 複数制限条件の優先度処理機能 - 制限条件の優先度定義が未定義の場合にシステムが適切なエラーを返す
  test('should return structured error when constraint priority definition is undefined', () => {
    const constraintConditions = [
      {
        id: 'mem-limit',
        name: 'Memory Usage Limit',
        value: 1024,
        unit: 'MB',
        priorityRank: undefined,
      },
      {
        id: 'exec-time-limit',
        name: 'Execution Time Limit',
        value: 3600,
        unit: 'seconds',
        priorityRank: undefined,
      },
      {
        id: 'resource-limit',
        name: 'Resource Limit',
        value: 50,
        unit: 'percent',
        priorityRank: undefined,
      },
    ];

    const executionData = {
      weekStartDate: new Date('2024-01-08T00:00:00Z'),
      weekEndDate: new Date('2024-01-14T23:59:59Z'),
      constraints: constraintConditions,
      mealGenerationAttempts: 42,
      successfulGenerations: 38,
      userSatisfactionScores: [4.5, 4.2, 4.8, 4.1, 4.6],
      cookingTimeActual: [25, 30, 22, 28, 26],
      cookingTimeTarget: 30,
    };

    const errorResult = aggregateWeeklyMetrics(executionData);

    expect(errorResult).toHaveProperty('statusCode');
    expect([400, 404, 422, 500, 501, 502, 503]).toContain(errorResult.statusCode);

    expect(errorResult).toHaveProperty('message');
    expect(errorResult.message).toMatch(/優先度|priority/i);

    expect(errorResult).toHaveProperty('details');
    expect(typeof errorResult.details).toBe('string');
    expect(errorResult.details).toMatch(/未定義|定義|指定/i);

    expect(errorResult).toHaveProperty('invalidConstraintIds');
    expect(Array.isArray(errorResult.invalidConstraintIds)).toBe(true);
    expect(errorResult.invalidConstraintIds).toEqual(
      expect.arrayContaining(['mem-limit', 'exec-time-limit', 'resource-limit'])
    );

    expect(errorResult).toHaveProperty('timestamp');
    expect(typeof errorResult.timestamp).toBe('string');

    expect(errorResult).not.toHaveProperty('successRate');
    expect(errorResult).not.toHaveProperty('averageSatisfactionScore');
    expect(errorResult).not.toHaveProperty('cookingTimeReductionDegree');
  });
});