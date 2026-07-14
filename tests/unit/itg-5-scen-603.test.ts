import { classifyAndAggregateRejectionReasons } from '../../src/logic/it-7-3-1';

describe('献立却下修正理由の自動分類・集計機能', () => {
  // SCEN-603
  test('複数の理由カテゴリが同一の却下記録に適用される境界ケースで、正しく分類・重複計上できる', () => {
    // テストデータ: 複数カテゴリが同時に適用された却下記録
    const rejectionRecords = [
      {
        record_id: 'rejection_001',
        user_id: 'user_001',
        rejected_date: '2024-01-15T10:30:00Z',
        reason_text: '栄養バランスが不適切でコストも高い。季節性も考慮されていない。',
        reason_categories: ['栄養バランス', 'コスト', '季節性'],
      },
      {
        record_id: 'rejection_002',
        user_id: 'user_001',
        rejected_date: '2024-01-15T11:00:00Z',
        reason_text: '調理時間が長すぎる。',
        reason_categories: ['調理時間'],
      },
      {
        record_id: 'rejection_003',
        user_id: 'user_002',
        rejected_date: '2024-01-15T11:30:00Z',
        reason_text: '家族の好みに合わない。在庫にない食材が含まれている。',
        reason_categories: ['家族好み', '食材在庫'],
      },
    ];

    // 自動分類・集計機能を実行
    const result = classifyAndAggregateRejectionReasons(rejectionRecords);

    // 各カテゴリが個別に認識・抽出されたか確認
    expect(result.classified_records).toHaveLength(3);
    expect(result.classified_records[0].record_id).toBe('rejection_001');
    expect(result.classified_records[0].reason_categories).toEqual(['栄養バランス', 'コスト', '季節性']);
    expect(result.classified_records[1].reason_categories).toEqual(['調理時間']);
    expect(result.classified_records[2].reason_categories).toEqual(['家族好み', '食材在庫']);

    // 集計結果で複数カテゴリが適用された記録が各カテゴリの集計値に重複計上されていることを確認
    const aggregation = result.category_aggregation;
    expect(aggregation['栄養バランス']).toBe(1);
    expect(aggregation['コスト']).toBe(1);
    expect(aggregation['季節性']).toBe(1);
    expect(aggregation['調理時間']).toBe(1);
    expect(aggregation['家族好み']).toBe(1);
    expect(aggregation['食材在庫']).toBe(1);

    // 重複計上された各カテゴリの計上回数が正確に1回ずつカウントされていることを検証
    const total_count_per_category = Object.values(aggregation).reduce((sum: number, count: number) => sum + count, 0);
    expect(total_count_per_category).toBe(6); // 3カテゴリ（複数）+ 1カテゴリ（単一）+ 2カテゴリ（複数）

    // ダッシュボード表示で複数カテゴリ適用時の表現が正しく反映されていることを確認
    const dashboard_display = result.dashboard_display;
    expect(dashboard_display).toHaveLength(6); // 全カテゴリの表示行数
    const nutrition_row = dashboard_display.find((row: any) => row.category === '栄養バランス');
    expect(nutrition_row).toBeDefined();
    expect(nutrition_row.count).toBe(1);
    expect(nutrition_row.display_label).toContain('栄養バランス');

    const cost_row = dashboard_display.find((row: any) => row.category === 'コスト');
    expect(cost_row).toBeDefined();
    expect(cost_row.count).toBe(1);

    const seasonality_row = dashboard_display.find((row: any) => row.category === '季節性');
    expect(seasonality_row).toBeDefined();
    expect(seasonality_row.count).toBe(1);

    // 他の単一カテゴリ記録との集計合計が正しく算出されていることを確認
    const single_category_total = aggregation['調理時間'] + aggregation['家族好み'] + aggregation['食材在庫'];
    expect(single_category_total).toBe(3);

    // 全体集計の整合性を検証: 複数カテゴリ記録の合計 + 単一カテゴリ記録の合計
    const multi_category_count = 3; // rejection_001 で 3 カテゴリ
    const multi_category_record_count = 2; // rejection_001 と rejection_003 が複数カテゴリ
    const single_category_record_count = 1; // rejection_002 が単一カテゴリ
    const total_record_count = multi_category_record_count + single_category_record_count;
    expect(total_record_count).toBe(3);

    // 集計値の総和: 複数カテゴリ記録 3 + 単一カテゴリ記録 3 = 6
    const grand_total = Object.values(aggregation).reduce((sum: number, count: number) => sum + count, 0);
    expect(grand_total).toBe(6);

    // 複数カテゴリが適用された記録の マーク確認
    const multi_category_flagged = result.classified_records.filter((rec: any) => rec.reason_categories.length > 1);
    expect(multi_category_flagged).toHaveLength(2); // rejection_001 と rejection_003
    expect(multi_category_flagged[0].is_multi_category).toBe(true);
    expect(multi_category_flagged[1].is_multi_category).toBe(true);

    // 単一カテゴリ記録のマーク確認
    const single_category_flagged = result.classified_records.filter((rec: any) => rec.reason_categories.length === 1);
    expect(single_category_flagged).toHaveLength(1); // rejection_002
    expect(single_category_flagged[0].is_multi_category).toBe(false);
  });
});