import { aggregateWeeklyFailurePatterns } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-831
  test('失敗パターン集計機能 - カテゴリ分類された却下・修正理由が週次で集計され、失敗パターンの出現頻度が正確に計算される', () => {
    const weekStartDate = new Date('2024-01-15T00:00:00Z');
    const weekEndDate = new Date('2024-01-21T23:59:59Z');

    const rejectionReasons = [
      {
        id: 'reason_001',
        userId: 'user_101',
        mealPlanId: 'plan_001',
        category: '栄養バランス',
        reasonText: '炭水化物が多すぎる',
        createdAt: new Date('2024-01-15T10:30:00Z'),
      },
      {
        id: 'reason_002',
        userId: 'user_101',
        mealPlanId: 'plan_002',
        category: '栄養バランス',
        reasonText: 'タンパク質が不足している',
        createdAt: new Date('2024-01-16T14:15:00Z'),
      },
      {
        id: 'reason_003',
        userId: 'user_102',
        mealPlanId: 'plan_003',
        category: '家族好み未反映',
        reasonText: '子どもが嫌いな野菜が入っている',
        createdAt: new Date('2024-01-17T09:45:00Z'),
      },
      {
        id: 'reason_004',
        userId: 'user_101',
        mealPlanId: 'plan_004',
        category: '調理時間超過',
        reasonText: '仕込み時間が60分以上かかる',
        createdAt: new Date('2024-01-18T16:20:00Z'),
      },
      {
        id: 'reason_005',
        userId: 'user_102',
        mealPlanId: 'plan_005',
        category: '栄養バランス',
        reasonText: 'ビタミンCが足りない',
        createdAt: new Date('2024-01-19T11:05:00Z'),
      },
      {
        id: 'reason_006',
        userId: 'user_103',
        mealPlanId: 'plan_006',
        category: '食材制限漏れ',
        reasonText: 'アレルギー品目が含まれていない',
        createdAt: new Date('2024-01-20T13:30:00Z'),
      },
      {
        id: 'reason_007',
        userId: 'user_101',
        mealPlanId: 'plan_007',
        category: '家族好み未反映',
        reasonText: 'リクエストが反映されていない',
        createdAt: new Date('2024-01-21T08:15:00Z'),
      },
    ];

    const result = aggregateWeeklyFailurePatterns({
      rejectionReasons,
      weekStartDate,
      weekEndDate,
    });

    expect(result.weekStartDate).toEqual(weekStartDate);
    expect(result.weekEndDate).toEqual(weekEndDate);
    expect(result.totalRecords).toBe(7);
    expect(result.categorySummary).toEqual({
      栄養バランス: 3,
      家族好み未反映: 2,
      調理時間超過: 1,
      食材制限漏れ: 1,
    });
    expect(result.categoryPercentages).toEqual({
      栄養バランス: 42.857142857142854,
      家族好み未反映: 28.571428571428568,
      調理時間超過: 14.285714285714286,
      食材制限漏れ: 14.285714285714286,
    });
    expect(result.userDistribution).toEqual({
      user_101: 4,
      user_102: 2,
      user_103: 1,
    });
    expect(Array.isArray(result.detailedRecords)).toBe(true);
    expect(result.detailedRecords.length).toBe(7);
    expect(result.detailedRecords[0]).toEqual({
      id: 'reason_001',
      userId: 'user_101',
      mealPlanId: 'plan_001',
      category: '栄養バランス',
      reasonText: '炭水化物が多すぎる',
      createdAt: new Date('2024-01-15T10:30:00Z'),
    });
    expect(result.detailedRecords[6]).toEqual({
      id: 'reason_007',
      userId: 'user_101',
      mealPlanId: 'plan_007',
      category: '家族好み未反映',
      reasonText: 'リクエストが反映されていない',
      createdAt: new Date('2024-01-21T08:15:00Z'),
    });

    const topFailurePattern = Object.entries(result.categorySummary).reduce(
      (prev, [category, count]) => (count > prev.count ? { category, count } : prev),
      { category: '', count: 0 }
    );
    expect(topFailurePattern.category).toBe('栄養バランス');
    expect(topFailurePattern.count).toBe(3);
  });
});