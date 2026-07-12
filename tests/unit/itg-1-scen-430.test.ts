import { executeRegressionTest } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-430: [edge] 回帰テスト自動実行機能 - 過去1ヶ月分のデータが正確に境界値として抽出され、テスト対象に含まれる
  test('should extract past 30 days of meal data as regression test target with exact boundary dates', () => {
    const referenceDate = new Date('2024-02-15T12:00:00Z');
    const thirtyDaysAgo = new Date('2024-01-16T12:00:00Z');
    const today = new Date('2024-02-15T12:00:00Z');
    const dayBeforeBoundary = new Date('2024-01-15T23:59:59Z');
    const dayAfterToday = new Date('2024-02-16T00:00:00Z');

    const mealDataset = [
      {
        id: 'meal-001',
        userId: 'user-123',
        date: new Date('2024-01-15T10:00:00Z'),
        mealType: 'dinner',
        satisfactionScore: 4,
      },
      {
        id: 'meal-002',
        userId: 'user-123',
        date: new Date('2024-01-16T10:00:00Z'),
        mealType: 'dinner',
        satisfactionScore: 5,
      },
      {
        id: 'meal-003',
        userId: 'user-123',
        date: new Date('2024-01-20T18:00:00Z'),
        mealType: 'dinner',
        satisfactionScore: 4,
      },
      {
        id: 'meal-004',
        userId: 'user-123',
        date: new Date('2024-02-01T18:00:00Z'),
        mealType: 'dinner',
        satisfactionScore: 5,
      },
      {
        id: 'meal-005',
        userId: 'user-123',
        date: new Date('2024-02-15T18:00:00Z'),
        mealType: 'dinner',
        satisfactionScore: 3,
      },
      {
        id: 'meal-006',
        userId: 'user-123',
        date: new Date('2024-02-16T10:00:00Z'),
        mealType: 'dinner',
        satisfactionScore: 5,
      },
    ];

    const result = executeRegressionTest({
      referenceDate,
      mealDataset,
      regressionWindowDays: 30,
    });

    expect(result.testTargetDataCount).toBe(4);
    expect(result.extractedMealIds).toEqual([
      'meal-002',
      'meal-003',
      'meal-004',
      'meal-005',
    ]);
    expect(result.oldestIncludedDate).toEqual(thirtyDaysAgo);
    expect(result.latestIncludedDate).toEqual(today);
    expect(result.excludedBeforeBoundary).toEqual(['meal-001']);
    expect(result.excludedAfterToday).toEqual(['meal-006']);
    expect(result.boundaryDateMatch).toBe(true);
    expect(result.dataIntegrityValid).toBe(true);
  });
});