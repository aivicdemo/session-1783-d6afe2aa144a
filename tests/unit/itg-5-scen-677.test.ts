import { aggregateFailurePatterns } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-677
  test('全件が同一カテゴリに属する境界値ケースで、カテゴリ別発生率が100%として正確に計算される', () => {
    const mockFailureRecords = [
      {
        recordId: '001',
        category: 'NetworkError',
        timestamp: new Date('2024-01-15T10:00:00Z'),
        userId: 'user001'
      },
      {
        recordId: '002',
        category: 'NetworkError',
        timestamp: new Date('2024-01-15T10:05:00Z'),
        userId: 'user001'
      },
      {
        recordId: '003',
        category: 'NetworkError',
        timestamp: new Date('2024-01-15T10:10:00Z'),
        userId: 'user001'
      },
      {
        recordId: '004',
        category: 'NetworkError',
        timestamp: new Date('2024-01-15T10:15:00Z'),
        userId: 'user002'
      },
      {
        recordId: '005',
        category: 'NetworkError',
        timestamp: new Date('2024-01-15T10:20:00Z'),
        userId: 'user002'
      },
      {
        recordId: '006',
        category: 'NetworkError',
        timestamp: new Date('2024-01-15T10:25:00Z'),
        userId: 'user002'
      },
      {
        recordId: '007',
        category: 'NetworkError',
        timestamp: new Date('2024-01-15T10:30:00Z'),
        userId: 'user003'
      },
      {
        recordId: '008',
        category: 'NetworkError',
        timestamp: new Date('2024-01-15T10:35:00Z'),
        userId: 'user003'
      },
      {
        recordId: '009',
        category: 'NetworkError',
        timestamp: new Date('2024-01-15T10:40:00Z'),
        userId: 'user003'
      },
      {
        recordId: '010',
        category: 'NetworkError',
        timestamp: new Date('2024-01-15T10:45:00Z'),
        userId: 'user004'
      }
    ];

    const result = aggregateFailurePatterns({
      failureRecords: mockFailureRecords,
      analysisStartDate: new Date('2024-01-15T00:00:00Z'),
      analysisEndDate: new Date('2024-01-15T23:59:59Z')
    });

    expect(result.categoryAggregation).toEqual({
      NetworkError: {
        occurrenceCount: 10,
        occurrenceRate: 100.0
      },
      NutritionImbalance: {
        occurrenceCount: 0,
        occurrenceRate: 0
      },
      FamilyPreferenceNotReflected: {
        occurrenceCount: 0,
        occurrenceRate: 0
      },
      CookingTimeExceeded: {
        occurrenceCount: 0,
        occurrenceRate: 0
      },
      FoodRestrictionMissed: {
        occurrenceCount: 0,
        occurrenceRate: 0
      },
      BudgetExceeded: {
        occurrenceCount: 0,
        occurrenceRate: 0
      },
      InventoryInsufficient: {
        occurrenceCount: 0,
        occurrenceRate: 0
      },
      Other: {
        occurrenceCount: 0,
        occurrenceRate: 0
      }
    });

    const totalRate =
      result.categoryAggregation.NetworkError.occurrenceRate +
      result.categoryAggregation.NutritionImbalance.occurrenceRate +
      result.categoryAggregation.FamilyPreferenceNotReflected.occurrenceRate +
      result.categoryAggregation.CookingTimeExceeded.occurrenceRate +
      result.categoryAggregation.FoodRestrictionMissed.occurrenceRate +
      result.categoryAggregation.BudgetExceeded.occurrenceRate +
      result.categoryAggregation.InventoryInsufficient.occurrenceRate +
      result.categoryAggregation.Other.occurrenceRate;

    expect(totalRate).toBe(100.0);
    expect(result.totalFailureCount).toBe(10);
    expect(result.uniqueCategoryCount).toBe(1);
  });
});