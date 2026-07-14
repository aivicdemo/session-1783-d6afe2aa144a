import { classifyAndAggregateWeeklyFailurePatterns } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計', () => {
  // SCEN-943: カテゴリ別の失敗パターン発生頻度が集計され、週次集計結果に降順でソートされて保存される
  test('カテゴリ別の失敗パターン発生頻度が正確に集計され、発生頻度の降順でソートされた状態で週次集計結果として保存される', () => {
    // テストデータ: 複数のカテゴリに分類された却下修正理由
    const rejectionReasons = [
      {
        id: 1,
        userId: 'user_001',
        menus_id: 'menu_001',
        reason_text: '栄養バランスが偏っている',
        category: '栄養',
        timestamp: new Date('2024-01-08T10:00:00Z'),
      },
      {
        id: 2,
        userId: 'user_001',
        menus_id: 'menu_002',
        reason_text: '栄養が不足している',
        category: '栄養',
        timestamp: new Date('2024-01-08T11:00:00Z'),
      },
      {
        id: 3,
        userId: 'user_001',
        menus_id: 'menu_003',
        reason_text: '栄養が多すぎる',
        category: '栄養',
        timestamp: new Date('2024-01-08T12:00:00Z'),
      },
      {
        id: 4,
        userId: 'user_001',
        menus_id: 'menu_004',
        reason_text: '子どもが好まない',
        category: '好み',
        timestamp: new Date('2024-01-08T13:00:00Z'),
      },
      {
        id: 5,
        userId: 'user_001',
        menus_id: 'menu_005',
        reason_text: '妻が好まない',
        category: '好み',
        timestamp: new Date('2024-01-08T14:00:00Z'),
      },
      {
        id: 6,
        userId: 'user_001',
        menus_id: 'menu_006',
        reason_text: '調理時間が長い',
        category: '調理時間',
        timestamp: new Date('2024-01-08T15:00:00Z'),
      },
      {
        id: 7,
        userId: 'user_001',
        menus_id: 'menu_007',
        reason_text: '予算を超過している',
        category: '予算',
        timestamp: new Date('2024-01-08T16:00:00Z'),
      },
      {
        id: 8,
        userId: 'user_001',
        menus_id: 'menu_008',
        reason_text: '食材が在庫にない',
        category: '食材在庫',
        timestamp: new Date('2024-01-08T17:00:00Z'),
      },
      {
        id: 9,
        userId: 'user_001',
        menus_id: 'menu_009',
        reason_text: '食材が在庫にない',
        category: '食材在庫',
        timestamp: new Date('2024-01-08T18:00:00Z'),
      },
    ];

    // 集計期間: 2024年1月8日～1月14日（週次）
    const aggregationPeriodStart = new Date('2024-01-08T00:00:00Z');
    const aggregationPeriodEnd = new Date('2024-01-14T23:59:59Z');

    // 失敗パターン集計機能を実行
    const result = classifyAndAggregateWeeklyFailurePatterns(
      rejectionReasons,
      aggregationPeriodStart,
      aggregationPeriodEnd
    );

    // 期待される集計結果（発生頻度の降順）
    // 食材在庫: 2件、栄養: 3件、好み: 2件、調理時間: 1件、予算: 1件
    // 降順: 栄養(3) → 食材在庫(2) → 好み(2) → 調理時間(1) → 予算(1)
    // 同じ頻度の場合はカテゴリ名の辞書順
    const expectedResult = {
      weekStart: new Date('2024-01-08T00:00:00Z'),
      weekEnd: new Date('2024-01-14T23:59:59Z'),
      aggregatedPatterns: [
        {
          category: '栄養',
          frequency: 3,
          patterns: ['栄養バランスが偏っている', '栄養が不足している', '栄養が多すぎる'],
        },
        {
          category: '食材在庫',
          frequency: 2,
          patterns: ['食材が在庫にない'],
        },
        {
          category: '好み',
          frequency: 2,
          patterns: ['子どもが好まない', '妻が好まない'],
        },
        {
          category: '調理時間',
          frequency: 1,
          patterns: ['調理時間が長い'],
        },
        {
          category: '予算',
          frequency: 1,
          patterns: ['予算を超過している'],
        },
      ],
      totalFailureCount: 9,
    };

    // 集計結果がカテゴリ別に分類されていることを確認
    expect(result.aggregatedPatterns).toHaveLength(5);

    // 各カテゴリ内の失敗パターン発生頻度が正確に集計されていることを検証
    expect(result.aggregatedPatterns[0].category).toBe('栄養');
    expect(result.aggregatedPatterns[0].frequency).toBe(3);
    expect(result.aggregatedPatterns[0].patterns).toEqual([
      '栄養バランスが偏っている',
      '栄養が不足している',
      '栄養が多すぎる',
    ]);

    expect(result.aggregatedPatterns[1].category).toBe('食材在庫');
    expect(result.aggregatedPatterns[1].frequency).toBe(2);
    expect(result.aggregatedPatterns[1].patterns).toEqual(['食材が在庫にない']);

    expect(result.aggregatedPatterns[2].category).toBe('好み');
    expect(result.aggregatedPatterns[2].frequency).toBe(2);
    expect(result.aggregatedPatterns[2].patterns).toEqual(['子どもが好まない', '妻が好まない']);

    expect(result.aggregatedPatterns[3].category).toBe('調理時間');
    expect(result.aggregatedPatterns[3].frequency).toBe(1);
    expect(result.aggregatedPatterns[3].patterns).toEqual(['調理時間が長い']);

    expect(result.aggregatedPatterns[4].category).toBe('予算');
    expect(result.aggregatedPatterns[4].frequency).toBe(1);
    expect(result.aggregatedPatterns[4].patterns).toEqual(['予算を超過している']);

    // 集計結果が発生頻度の降順でソートされていることを確認
    expect(result.aggregatedPatterns[0].frequency).toBe(3);
    expect(result.aggregatedPatterns[1].frequency).toBe(2);
    expect(result.aggregatedPatterns[2].frequency).toBe(2);
    expect(result.aggregatedPatterns[3].frequency).toBe(1);
    expect(result.aggregatedPatterns[4].frequency).toBe(1);

    // ソート後の降順が維持されていることを確認
    for (let i = 0; i < result.aggregatedPatterns.length - 1; i++) {
      expect(result.aggregatedPatterns[i].frequency).toBeGreaterThanOrEqual(
        result.aggregatedPatterns[i + 1].frequency
      );
    }

    // 集計結果が週次集計結果として正常に構成されていることを確認
    expect(result.weekStart).toEqual(new Date('2024-01-08T00:00:00Z'));
    expect(result.weekEnd).toEqual(new Date('2024-01-14T23:59:59Z'));
    expect(result.totalFailureCount).toBe(9);

    // 完全な期待値との一致を確認
    expect(result).toEqual(expectedResult);
  });
});