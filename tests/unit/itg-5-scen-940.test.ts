import { classifyRejectionReasonsAndAggregate } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計', () => {
  // SCEN-940
  test('却下修正理由の自動カテゴリ分類と失敗パターン集計 - 理由文が正確にカテゴリに分類され集計される', () => {
    const rejectionReasonCategories = [
      {
        categoryId: 1,
        categoryName: '栄養バランス',
        keywords: ['栄養', 'バランス', '栄養価'],
      },
      {
        categoryId: 2,
        categoryName: '家族好み未反映',
        keywords: ['好み', '嫌い', '苦手', '食べない'],
      },
      {
        categoryId: 3,
        categoryName: '調理時間超過',
        keywords: ['時間', '忙しい', '手間', '簡単'],
      },
      {
        categoryId: 4,
        categoryName: '食材制限漏れ',
        keywords: ['アレルギー', '制限', '避けるべき'],
      },
      {
        categoryId: 5,
        categoryName: '予算超過',
        keywords: ['予算', '高い', '安い', 'コスト'],
      },
    ];

    const rejectionHistoryRecords = [
      {
        historyId: 1,
        mealPlanId: 101,
        reasonText: '子どもが嫌いな食材が含まれているので、別の献立にしてほしい',
        createdAt: new Date('2024-01-15T09:00:00Z'),
      },
      {
        historyId: 2,
        mealPlanId: 102,
        reasonText: 'この献立は栄養バランスが良くないと思います',
        createdAt: new Date('2024-01-15T10:15:00Z'),
      },
      {
        historyId: 3,
        mealPlanId: 103,
        reasonText: '仕事が忙しい日なので、調理時間が短い献立をお願いします',
        createdAt: new Date('2024-01-15T11:30:00Z'),
      },
      {
        historyId: 4,
        mealPlanId: 104,
        reasonText: '息子がアレルギーを持っている食材が入っているので変更してください',
        createdAt: new Date('2024-01-15T12:45:00Z'),
      },
      {
        historyId: 5,
        mealPlanId: 105,
        reasonText: '今月は予算が厳しいので、もう少し安い食材で構成された献立をお願いします',
        createdAt: new Date('2024-01-15T14:00:00Z'),
      },
      {
        historyId: 6,
        mealPlanId: 106,
        reasonText: 'この献立は主人の苦手な食材ばかりです。別の献立にしてください',
        createdAt: new Date('2024-01-15T15:20:00Z'),
      },
      {
        historyId: 7,
        mealPlanId: 107,
        reasonText: '調理に手間がかかり過ぎるので、もっと簡単な献立を提案してほしい',
        createdAt: new Date('2024-01-15T16:35:00Z'),
      },
      {
        historyId: 8,
        mealPlanId: 108,
        reasonText: '妻がこの食材で制限を受けているため避ける必要があります',
        createdAt: new Date('2024-01-15T17:50:00Z'),
      },
    ];

    const result = classifyRejectionReasonsAndAggregate(
      rejectionHistoryRecords,
      rejectionReasonCategories
    );

    expect(result.totalProcessedRecords).toBe(8);
    expect(result.totalClassifiedRecords).toBe(8);
    expect(result.classificationSuccessRate).toBe(100);

    expect(result.categoryAggregates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          categoryId: 1,
          categoryName: '栄養バランス',
          count: 1,
          records: expect.arrayContaining([
            expect.objectContaining({
              historyId: 2,
              mealPlanId: 102,
              reasonText:
                'この献立は栄養バランスが良くないと思います',
            }),
          ]),
        }),
        expect.objectContaining({
          categoryId: 2,
          categoryName: '家族好み未反映',
          count: 2,
          records: expect.arrayContaining([
            expect.objectContaining({
              historyId: 1,
              mealPlanId: 101,
            }),
            expect.objectContaining({
              historyId: 6,
              mealPlanId: 106,
            }),
          ]),
        }),
        expect.objectContaining({
          categoryId: 3,
          categoryName: '調理時間超過',
          count: 2,
          records: expect.arrayContaining([
            expect.objectContaining({
              historyId: 3,
              mealPlanId: 103,
            }),
            expect.objectContaining({
              historyId: 7,
              mealPlanId: 107,
            }),
          ]),
        }),
        expect.objectContaining({
          categoryId: 4,
          categoryName: '食材制限漏れ',
          count: 2,
          records: expect.arrayContaining([
            expect.objectContaining({
              historyId: 4,
              mealPlanId: 104,
            }),
            expect.objectContaining({
              historyId: 8,
              mealPlanId: 108,
            }),
          ]),
        }),
        expect.objectContaining({
          categoryId: 5,
          categoryName: '予算超過',
          count: 1,
          records: expect.arrayContaining([
            expect.objectContaining({
              historyId: 5,
              mealPlanId: 105,
            }),
          ]),
        }),
      ])
    );

    expect(result.unclassifiedRecords).toEqual([]);

    const totalAggregatedCount = result.categoryAggregates.reduce(
      (sum, agg) => sum + agg.count,
      0
    );
    expect(totalAggregatedCount).toBe(8);

    result.categoryAggregates.forEach((aggregate) => {
      expect(aggregate.records.length).toBe(aggregate.count);
      expect(aggregate.categoryId).toBeGreaterThan(0);
      expect(aggregate.categoryName).toBeTruthy();
    });
  });
});