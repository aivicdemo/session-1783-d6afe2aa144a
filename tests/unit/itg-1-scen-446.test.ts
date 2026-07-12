import { compareAlgorithmImprovementQuantitatively } from '../../src/logic/it-1-1-1';

describe('アルゴリズム改善効果の定量比較機能', () => {
  // SCEN-446: [error] 改善前後のデータが1週間未満の場合は集計対象外と判定される
  test('改善前後のデータが1週間未満の場合、集計対象外と判定される', () => {
    const beforeAlgorithmStart = new Date('2024-01-01T09:00:00Z');
    const beforeAlgorithmEnd = new Date('2024-01-03T17:00:00Z');
    const afterAlgorithmStart = new Date('2024-01-04T09:00:00Z');
    const afterAlgorithmEnd = new Date('2024-01-06T17:00:00Z');

    const beforeData = [
      {
        mealGenerationId: 'gen_001',
        timestamp: new Date('2024-01-01T10:00:00Z'),
        satisfactionScore: 4.2,
        completionRate: 0.95,
        rejectionRate: 0.05,
        cookingTimeMinutes: 35,
        algorithmVersion: 'v1.0'
      },
      {
        mealGenerationId: 'gen_002',
        timestamp: new Date('2024-01-02T11:00:00Z'),
        satisfactionScore: 3.8,
        completionRate: 0.88,
        rejectionRate: 0.12,
        cookingTimeMinutes: 40,
        algorithmVersion: 'v1.0'
      },
      {
        mealGenerationId: 'gen_003',
        timestamp: new Date('2024-01-03T09:30:00Z'),
        satisfactionScore: 4.5,
        completionRate: 0.92,
        rejectionRate: 0.08,
        cookingTimeMinutes: 32,
        algorithmVersion: 'v1.0'
      }
    ];

    const afterData = [
      {
        mealGenerationId: 'gen_004',
        timestamp: new Date('2024-01-04T10:00:00Z'),
        satisfactionScore: 4.6,
        completionRate: 0.96,
        rejectionRate: 0.04,
        cookingTimeMinutes: 28,
        algorithmVersion: 'v2.0'
      },
      {
        mealGenerationId: 'gen_005',
        timestamp: new Date('2024-01-05T11:00:00Z'),
        satisfactionScore: 4.3,
        completionRate: 0.94,
        rejectionRate: 0.06,
        cookingTimeMinutes: 30,
        algorithmVersion: 'v2.0'
      },
      {
        mealGenerationId: 'gen_006',
        timestamp: new Date('2024-01-06T09:30:00Z'),
        satisfactionScore: 4.7,
        completionRate: 0.97,
        rejectionRate: 0.03,
        cookingTimeMinutes: 26,
        algorithmVersion: 'v2.0'
      }
    ];

    const result = compareAlgorithmImprovementQuantitatively({
      beforeAlgorithmDataSet: beforeData,
      afterAlgorithmDataSet: afterData,
      beforePeriodStartDate: beforeAlgorithmStart,
      beforePeriodEndDate: beforeAlgorithmEnd,
      afterPeriodStartDate: afterAlgorithmStart,
      afterPeriodEndDate: afterAlgorithmEnd,
      minimumDataRequirementDays: 7
    });

    expect(result.isAggregatable).toBe(false);
    expect(result.errorMessage).toMatch(/データ期間が不足しています/);
    expect(result.errorMessage).toMatch(/1週間以上のデータが必要/);
    expect(result.aggregatedComparison).toBeUndefined();
    expect(result.dataCollectionDaysBefore).toBe(3);
    expect(result.dataCollectionDaysAfter).toBe(3);
  });
});