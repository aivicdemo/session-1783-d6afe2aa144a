import {
  aggregateRejectionPatterns,
} from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-626: [normal] 失敗パターン集計機能 - 複数週の却下修正理由が集計され、週別・理由カテゴリ別の失敗パターンが統計集計される
  test('複数週にわたる却下修正理由データが週別・理由カテゴリ別に正しく統計集計される', () => {
    // テストデータ: 3週間以上にわたる却下修正理由
    const rejectionRecords = [
      // Week 1 (2024-01-08 ~ 2024-01-14)
      {
        id: 'rec_001',
        user_id: 'user_001',
        menu_id: 'menu_001',
        rejection_reason: '栄養バランスが悪い',
        reason_category: '栄養バランス',
        rejection_date: '2024-01-10T10:00:00Z',
        week_start: '2024-01-08',
      },
      {
        id: 'rec_002',
        user_id: 'user_001',
        menu_id: 'menu_002',
        rejection_reason: '家族の好みに合わない',
        reason_category: '家族好み未反映',
        rejection_date: '2024-01-12T14:30:00Z',
        week_start: '2024-01-08',
      },
      {
        id: 'rec_003',
        user_id: 'user_002',
        menu_id: 'menu_003',
        rejection_reason: '栄養が不足している',
        reason_category: '栄養バランス',
        rejection_date: '2024-01-13T09:15:00Z',
        week_start: '2024-01-08',
      },

      // Week 2 (2024-01-15 ~ 2024-01-21)
      {
        id: 'rec_004',
        user_id: 'user_001',
        menu_id: 'menu_004',
        rejection_reason: '調理に1時間以上かかる',
        reason_category: '調理時間超過',
        rejection_date: '2024-01-15T16:45:00Z',
        week_start: '2024-01-15',
      },
      {
        id: 'rec_005',
        user_id: 'user_001',
        menu_id: 'menu_005',
        rejection_reason: 'アレルギー食材が含まれている',
        reason_category: '食材制限漏れ',
        rejection_date: '2024-01-17T11:20:00Z',
        week_start: '2024-01-15',
      },
      {
        id: 'rec_006',
        user_id: 'user_002',
        menu_id: 'menu_006',
        rejection_reason: '家族の好みに合わない',
        reason_category: '家族好み未反映',
        rejection_date: '2024-01-18T13:00:00Z',
        week_start: '2024-01-15',
      },
      {
        id: 'rec_007',
        user_id: 'user_003',
        menu_id: 'menu_007',
        rejection_reason: '栄養バランスが悪い',
        reason_category: '栄養バランス',
        rejection_date: '2024-01-20T10:30:00Z',
        week_start: '2024-01-15',
      },

      // Week 3 (2024-01-22 ~ 2024-01-28)
      {
        id: 'rec_008',
        user_id: 'user_001',
        menu_id: 'menu_008',
        rejection_reason: '予算を超える',
        reason_category: '予算超過',
        rejection_date: '2024-01-22T12:15:00Z',
        week_start: '2024-01-22',
      },
      {
        id: 'rec_009',
        user_id: 'user_002',
        menu_id: 'menu_009',
        rejection_reason: '食材が在庫にない',
        reason_category: '食材制限漏れ',
        rejection_date: '2024-01-24T15:45:00Z',
        week_start: '2024-01-22',
      },
      {
        id: 'rec_010',
        user_id: 'user_001',
        menu_id: 'menu_010',
        rejection_reason: 'アレルギー対応がない',
        reason_category: '食材制限漏れ',
        rejection_date: '2024-01-26T09:50:00Z',
        week_start: '2024-01-22',
      },
      {
        id: 'rec_011',
        user_id: 'user_003',
        menu_id: 'menu_011',
        rejection_reason: '調理時間が長すぎる',
        reason_category: '調理時間超過',
        rejection_date: '2024-01-27T14:20:00Z',
        week_start: '2024-01-22',
      },
    ];

    // 実行
    const aggregationResult = aggregateRejectionPatterns(rejectionRecords);

    // ========== ASSERTION 1: 週別集計が正しく計算されているか ==========
    // Week 1 (2024-01-08): 3件
    // Week 2 (2024-01-15): 4件
    // Week 3 (2024-01-22): 4件
    expect(aggregationResult.byWeek).toEqual({
      '2024-01-08': 3,
      '2024-01-15': 4,
      '2024-01-22': 4,
    });

    // ========== ASSERTION 2: 理由カテゴリ別集計が正しく計算されているか ==========
    // 栄養バランス: 3件 (rec_001, rec_003, rec_007)
    // 家族好み未反映: 2件 (rec_002, rec_006)
    // 調理時間超過: 2件 (rec_004, rec_011)
    // 食材制限漏れ: 3件 (rec_005, rec_009, rec_010)
    // 予算超過: 1件 (rec_008)
    expect(aggregationResult.byCategoryTotal).toEqual({
      '栄養バランス': 3,
      '家族好み未反映': 2,
      '調理時間超過': 2,
      '食材制限漏れ': 3,
      '予算超過': 1,
    });

    // ========== ASSERTION 3: 週別・理由カテゴリ別のクロス集計が正しく集計されているか ==========
    expect(aggregationResult.crossTabulation).toEqual({
      '2024-01-08': {
        '栄養バランス': 2,         // rec_001, rec_003
        '家族好み未反映': 1,       // rec_002
        '調理時間超過': 0,
        '食材制限漏れ': 0,
        '予算超過': 0,
      },
      '2024-01-15': {
        '栄養バランス': 1,         // rec_007
        '家族好み未反映': 1,       // rec_006
        '調理時間超過': 1,         // rec_004
        '食材制限漏れ': 1,         // rec_005
        '予算超過': 0,
      },
      '2024-01-22': {
        '栄養バランス': 0,
        '家族好み未反映': 0,
        '調理時間超過': 1,         // rec_011
        '食材制限漏れ': 2,         // rec_009, rec_010
        '予算超過': 1,             // rec_008
      },
    });

    // ========== ASSERTION 4: クロス集計結果の合計が元データの総件数と一致 ==========
    let crossTabTotal = 0;
    for (const weekData of Object.values(aggregationResult.crossTabulation)) {
      for (const count of Object.values(weekData)) {
        crossTabTotal += count as number;
      }
    }
    expect(crossTabTotal).toBe(11);
    expect(crossTabTotal).toBe(rejectionRecords.length);

    // ========== ASSERTION 5: 理由カテゴリ別合計の合計が総件数と一致 ==========
    const categoryTotalSum = Object.values(
      aggregationResult.byCategoryTotal
    ).reduce((acc: number, count: number) => acc + count, 0);
    expect(categoryTotalSum).toBe(11);
    expect(categoryTotalSum).toBe(rejectionRecords.length);

    // ========== ASSERTION 6: 週別合計の合計が総件数と一致 ==========
    const weekTotalSum = Object.values(aggregationResult.byWeek).reduce(
      (acc: number, count: number) => acc + count,
      0
    );
    expect(weekTotalSum).toBe(11);
    expect(weekTotalSum).toBe(rejectionRecords.length);

    // ========== ASSERTION 7: ダッシュボード表示用集計結果が正しく生成 ==========
    expect(aggregationResult.dashboardMetrics).toEqual({
      total_rejections: 11,
      week_count: 3,
      category_count: 5,
      top_category: {
        category: '栄養バランス',
        count: 3,
      },
      top_week: {
        week: '2024-01-15',
        count: 4,
      },
      average_rejections_per_week: 11 / 3,
    });

    // ========== ASSERTION 8: 集計結果の構造が完全性要件を満たす ==========
    expect(aggregationResult).toHaveProperty('byWeek');
    expect(aggregationResult).toHaveProperty('byCategoryTotal');
    expect(aggregationResult).toHaveProperty('crossTabulation');
    expect(aggregationResult).toHaveProperty('dashboardMetrics');

    // ========== ASSERTION 9: 各キーが文字列型で存在 ==========
    expect(typeof aggregationResult.byWeek).toBe('object');
    expect(typeof aggregationResult.byCategoryTotal).toBe('object');
    expect(typeof aggregationResult.crossTabulation).toBe('object');
    expect(typeof aggregationResult.dashboardMetrics).toBe('object');

    // ========== ASSERTION 10: ダッシュボード平均値が正しく計算される ==========
    expect(aggregationResult.dashboardMetrics.average_rejections_per_week).toBeCloseTo(
      3.6667,
      4
    );
  });
});