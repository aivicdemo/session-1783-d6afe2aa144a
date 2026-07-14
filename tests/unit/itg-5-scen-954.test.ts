import { aggregateFailurePatternsByWeek } from '../../src/logic/it-7-3-1';

describe('失敗パターン集計機能', () => {
  // SCEN-954: [normal] 失敗パターン集計機能 - カテゴリ分類済みの却下修正理由から週単位で失敗パターンの頻度集計を正しく実行する
  test('SCEN-954: カテゴリ分類済みの却下修正理由から週単位での失敗パターン頻度集計が正しく実行される', () => {
    // 【前提】カテゴリ分類済みの却下修正理由データが存在する
    const classified_rejection_reasons = [
      {
        reason_id: 'reason_001',
        user_id: 'user_001',
        rejection_datetime: new Date('2024-01-01T09:00:00Z'),
        category: 'nutrition',
        rejection_reason_text: 'タンパク質が不足している',
      },
      {
        reason_id: 'reason_002',
        user_id: 'user_001',
        rejection_datetime: new Date('2024-01-02T10:30:00Z'),
        category: 'nutrition',
        rejection_reason_text: '栄養バランスが悪い',
      },
      {
        reason_id: 'reason_003',
        user_id: 'user_002',
        rejection_datetime: new Date('2024-01-03T14:15:00Z'),
        category: 'family_preference',
        rejection_reason_text: '子どもが好きではない',
      },
      {
        reason_id: 'reason_004',
        user_id: 'user_001',
        rejection_datetime: new Date('2024-01-04T11:00:00Z'),
        category: 'cooking_time',
        rejection_reason_text: '調理時間が長すぎる',
      },
      {
        reason_id: 'reason_005',
        user_id: 'user_002',
        rejection_datetime: new Date('2024-01-05T08:45:00Z'),
        category: 'food_restriction',
        rejection_reason_text: 'アレルギー食材が含まれている',
      },
      {
        reason_id: 'reason_006',
        user_id: 'user_001',
        rejection_datetime: new Date('2024-01-06T16:20:00Z'),
        category: 'nutrition',
        rejection_reason_text: 'ビタミンが足りない',
      },
      {
        reason_id: 'reason_007',
        user_id: 'user_002',
        rejection_datetime: new Date('2024-01-07T12:00:00Z'),
        category: 'family_preference',
        rejection_reason_text: '配偶者のリクエストに対応していない',
      },
    ];

    // 【トリガー】集計対象の週単位の期間を指定: 2024-01-01 ～ 2024-01-07
    const week_start_date = new Date('2024-01-01T00:00:00Z');
    const week_end_date = new Date('2024-01-07T23:59:59Z');

    // 【実行】失敗パターンの頻度集計処理を実行
    const aggregation_result = aggregateFailurePatternsByWeek({
      classified_reasons: classified_rejection_reasons,
      week_start: week_start_date,
      week_end: week_end_date,
    });

    // 【検証1】集計結果が正しく返される
    expect(aggregation_result).toBeDefined();
    expect(aggregation_result.week_start).toEqual(week_start_date);
    expect(aggregation_result.week_end).toEqual(week_end_date);

    // 【検証2】各カテゴリ別の失敗パターン頻度が正確に集計されている
    // 期待値の計算（structured.formula に従う）:
    // nutrition: 3件（reason_001, reason_002, reason_006）
    // family_preference: 2件（reason_003, reason_007）
    // cooking_time: 1件（reason_004）
    // food_restriction: 1件（reason_005）
    expect(aggregation_result.category_frequency_distribution).toEqual({
      nutrition: 3,
      family_preference: 2,
      cooking_time: 1,
      food_restriction: 1,
    });

    // 【検証3】集計対象件数が正確に集計されている
    const total_count = Object.values(
      aggregation_result.category_frequency_distribution,
    ).reduce((sum, count) => sum + count, 0);
    expect(total_count).toBe(7);

    // 【検証4】集計結果の構造が正しい（集計対象外データが存在しないこと確認）
    expect(aggregation_result.total_aggregated_reasons).toBe(7);

    // 【検証5】複数週のデータでの集計一貫性確認
    // 次週: 2024-01-08 ～ 2024-01-14
    const next_week_classified_reasons = [
      {
        reason_id: 'reason_008',
        user_id: 'user_001',
        rejection_datetime: new Date('2024-01-08T09:00:00Z'),
        category: 'nutrition',
        rejection_reason_text: 'カロリーが高い',
      },
      {
        reason_id: 'reason_009',
        user_id: 'user_002',
        rejection_datetime: new Date('2024-01-10T13:30:00Z'),
        category: 'budget',
        rejection_reason_text: '食費予算を超過する',
      },
      {
        reason_id: 'reason_010',
        user_id: 'user_001',
        rejection_datetime: new Date('2024-01-12T10:15:00Z'),
        category: 'nutrition',
        rejection_reason_text: '食物繊維が不足',
      },
    ];

    const next_week_start = new Date('2024-01-08T00:00:00Z');
    const next_week_end = new Date('2024-01-14T23:59:59Z');

    const next_week_result = aggregateFailurePatternsByWeek({
      classified_reasons: next_week_classified_reasons,
      week_start: next_week_start,
      week_end: next_week_end,
    });

    // 次週の期待値: nutrition 2件, budget 1件
    expect(next_week_result.category_frequency_distribution).toEqual({
      nutrition: 2,
      budget: 1,
    });
    expect(next_week_result.total_aggregated_reasons).toBe(3);
    expect(next_week_result.week_start).toEqual(next_week_start);
    expect(next_week_result.week_end).toEqual(next_week_end);

    // 【検証6】集計結果のエクスポート形式が正しい
    expect(aggregation_result).toHaveProperty('export_csv_data');
    expect(aggregation_result.export_csv_data).toMatch(/nutrition,3/);
    expect(aggregation_result.export_csv_data).toMatch(/family_preference,2/);
    expect(aggregation_result.export_csv_data).toMatch(/cooking_time,1/);
    expect(aggregation_result.export_csv_data).toMatch(/food_restriction,1/);

    // 【検証7】CSVヘッダが含まれている
    expect(aggregation_result.export_csv_data).toMatch(/category,frequency/);

    // 【検証8】レポート形式のメタデータが含まれている
    expect(aggregation_result).toHaveProperty('report_metadata');
    expect(aggregation_result.report_metadata).toEqual(
      expect.objectContaining({
        generated_datetime: expect.any(Date),
        week_period: '2024-01-01~2024-01-07',
      }),
    );
  });
});