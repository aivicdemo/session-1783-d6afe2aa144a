import { categorizeAndAggregateMenuRejectReasons } from '../../src/logic/it-7-3-1';

describe('失敗パターン集計 - カテゴリ別の却下・修正理由を集計し失敗パターンを特定する', () => {
  // SCEN-700
  test('カテゴリ別に却下・修正理由が正しく集計され、失敗パターンが特定される', () => {
    const input_reject_records = [
      {
        id: 1,
        user_id: 101,
        menu_id: 1001,
        reason_text: '栄養バランスが悪い',
        reason_type: 'reject',
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        id: 2,
        user_id: 101,
        menu_id: 1002,
        reason_text: '栄養バランスが偏りすぎている',
        reason_type: 'reject',
        timestamp: '2024-01-15T11:00:00Z',
      },
      {
        id: 3,
        user_id: 102,
        menu_id: 1003,
        reason_text: '家族の好みが反映されていない',
        reason_type: 'reject',
        timestamp: '2024-01-15T12:00:00Z',
      },
      {
        id: 4,
        user_id: 102,
        menu_id: 1004,
        reason_text: '調理時間が長すぎる',
        reason_type: 'modification',
        timestamp: '2024-01-15T13:00:00Z',
      },
      {
        id: 5,
        user_id: 103,
        menu_id: 1005,
        reason_text: '調理時間を30分以内に短縮してほしい',
        reason_type: 'modification',
        timestamp: '2024-01-15T14:00:00Z',
      },
      {
        id: 6,
        user_id: 103,
        menu_id: 1006,
        reason_text: '食材制限を確認してほしい',
        reason_type: 'modification',
        timestamp: '2024-01-15T15:00:00Z',
      },
      {
        id: 7,
        user_id: 101,
        menu_id: 1007,
        reason_text: '栄養素が不足している',
        reason_type: 'reject',
        timestamp: '2024-01-15T16:00:00Z',
      },
      {
        id: 8,
        user_id: 104,
        menu_id: 1008,
        reason_text: '予算を超過している',
        reason_type: 'reject',
        timestamp: '2024-01-15T17:00:00Z',
      },
    ];

    const selected_categories = [
      'nutritionBalance',
      'familyPreference',
      'cookingTime',
      'foodRestriction',
      'budget',
    ];

    const result = categorizeAndAggregateMenuRejectReasons(
      input_reject_records,
      selected_categories
    );

    // カテゴリ別集計の検証
    expect(result.category_summary).toBeDefined();
    expect(result.category_summary.length).toBeGreaterThan(0);

    // nutritionBalance カテゴリの検証
    const nutrition_balance_category = result.category_summary.find(
      (cat) => cat.category === 'nutritionBalance'
    );
    expect(nutrition_balance_category).toBeDefined();
    expect(nutrition_balance_category!.reject_count).toBe(3);
    expect(nutrition_balance_category!.modification_count).toBe(0);
    expect(nutrition_balance_category!.total_count).toBe(3);

    // familyPreference カテゴリの検証
    const family_preference_category = result.category_summary.find(
      (cat) => cat.category === 'familyPreference'
    );
    expect(family_preference_category).toBeDefined();
    expect(family_preference_category!.reject_count).toBe(1);
    expect(family_preference_category!.modification_count).toBe(0);
    expect(family_preference_category!.total_count).toBe(1);

    // cookingTime カテゴリの検証
    const cooking_time_category = result.category_summary.find(
      (cat) => cat.category === 'cookingTime'
    );
    expect(cooking_time_category).toBeDefined();
    expect(cooking_time_category!.reject_count).toBe(0);
    expect(cooking_time_category!.modification_count).toBe(2);
    expect(cooking_time_category!.total_count).toBe(2);

    // foodRestriction カテゴリの検証
    const food_restriction_category = result.category_summary.find(
      (cat) => cat.category === 'foodRestriction'
    );
    expect(food_restriction_category).toBeDefined();
    expect(food_restriction_category!.reject_count).toBe(0);
    expect(food_restriction_category!.modification_count).toBe(1);
    expect(food_restriction_category!.total_count).toBe(1);

    // budget カテゴリの検証
    const budget_category = result.category_summary.find(
      (cat) => cat.category === 'budget'
    );
    expect(budget_category).toBeDefined();
    expect(budget_category!.reject_count).toBe(1);
    expect(budget_category!.modification_count).toBe(0);
    expect(budget_category!.total_count).toBe(1);

    // ランク付けされていることを検証（合計件数の多い順）
    const sorted_categories = result.category_summary.sort(
      (a, b) => b.total_count - a.total_count
    );
    expect(sorted_categories[0].category).toBe('nutritionBalance');
    expect(sorted_categories[0].total_count).toBe(3);
    expect(sorted_categories[1].category).toBe('cookingTime');
    expect(sorted_categories[1].total_count).toBe(2);

    // 失敗パターンの詳細情報が含まれていることを検証
    expect(result.failure_patterns).toBeDefined();
    expect(result.failure_patterns.length).toBeGreaterThan(0);

    // 各カテゴリの失敗パターンにサンプルテキストが含まれていることを検証
    const nutrition_failure_patterns = result.failure_patterns.filter(
      (fp) => fp.category === 'nutritionBalance'
    );
    expect(nutrition_failure_patterns.length).toBe(3);
    expect(nutrition_failure_patterns.some((fp) =>
      fp.sample_reasons.some((sr) => sr.includes('栄養バランス'))
    )).toBe(true);

    // エクスポート対応データ形式の検証
    expect(result.export_data).toBeDefined();
    expect(result.export_data.headers).toEqual([
      'category',
      'reject_count',
      'modification_count',
      'total_count',
      'percentage_of_total',
    ]);

    const total_all_records = result.category_summary.reduce(
      (sum, cat) => sum + cat.total_count,
      0
    );
    expect(total_all_records).toBe(8);

    // パーセンテージの計算検証
    result.export_data.rows.forEach((row) => {
      const category_data = result.category_summary.find(
        (cat) => cat.category === row.category
      );
      if (category_data) {
        const expected_percentage = Math.round(
          (category_data.total_count / total_all_records) * 10000
        ) / 100;
        expect(row.percentage_of_total).toBe(expected_percentage);
      }
    });

    // エクスポート行数の検証（重複なし）
    expect(result.export_data.rows.length).toBe(5);

    // レコードの整合性検証
    expect(result.data_integrity_check).toBeDefined();
    expect(result.data_integrity_check.total_input_records).toBe(8);
    expect(result.data_integrity_check.categorized_records).toBe(8);
    expect(result.data_integrity_check.uncategorized_records).toBe(0);
    expect(result.data_integrity_check.has_duplicates).toBe(false);
  });

  test('エラー処理 - 無効なカテゴリが指定された場合', () => {
    const input_reject_records = [
      {
        id: 1,
        user_id: 101,
        menu_id: 1001,
        reason_text: '栄養バランスが悪い',
        reason_type: 'reject' as const,
        timestamp: '2024-01-15T10:30:00Z',
      },
    ];

    const invalid_categories = ['invalid_category'];

    expect(() => {
      categorizeAndAggregateMenuRejectReasons(
        input_reject_records,
        invalid_categories
      );
    }).toThrow(/カテゴリ/);
  });

  test('エラー処理 - 空のレコードが渡された場合', () => {
    const empty_records: Array<{
      id: number;
      user_id: number;
      menu_id: number;
      reason_text: string;
      reason_type: 'reject' | 'modification';
      timestamp: string;
    }> = [];

    const selected_categories = ['nutritionBalance', 'familyPreference'];

    expect(() => {
      categorizeAndAggregateMenuRejectReasons(empty_records, selected_categories);
    }).toThrow(/レコード/);
  });

  test('エラー処理 - 空のカテゴリリストが指定された場合', () => {
    const input_reject_records = [
      {
        id: 1,
        user_id: 101,
        menu_id: 1001,
        reason_text: '栄養バランスが悪い',
        reason_type: 'reject' as const,
        timestamp: '2024-01-15T10:30:00Z',
      },
    ];

    const empty_categories: string[] = [];

    expect(() => {
      categorizeAndAggregateMenuRejectReasons(
        input_reject_records,
        empty_categories
      );
    }).toThrow(/カテゴリ/);
  });
});