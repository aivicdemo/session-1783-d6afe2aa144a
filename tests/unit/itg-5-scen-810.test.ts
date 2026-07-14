import { aggregateWeeklyFailurePatterns } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の分類と失敗パターン特定 - 失敗パターン週次集計機能', () => {
  // SCEN-810: [normal] 失敗パターン週次集計機能 - 分類された却下修正理由から週単位で失敗パターンが集計され、パターン別の発生件数・割合が算出される
  test('should aggregate weekly failure patterns with accurate counts and percentages across multiple weeks', () => {
    // テストデータ: 複数の却下修正理由が分類されたレコード（異なる週のデータを含める）
    const classifiedRecords = [
      // 2024年第1週（1月1日-7日）のデータ
      {
        record_id: 1,
        rejection_date: new Date('2024-01-02T10:00:00Z'),
        classified_category: '栄養バランス',
        week_number: 1,
        year: 2024,
      },
      {
        record_id: 2,
        rejection_date: new Date('2024-01-03T14:30:00Z'),
        classified_category: '栄養バランス',
        week_number: 1,
        year: 2024,
      },
      {
        record_id: 3,
        rejection_date: new Date('2024-01-04T09:15:00Z'),
        classified_category: '家族好み未反映',
        week_number: 1,
        year: 2024,
      },
      {
        record_id: 4,
        rejection_date: new Date('2024-01-05T16:45:00Z'),
        classified_category: '調理時間超過',
        week_number: 1,
        year: 2024,
      },
      // 2024年第2週（1月8日-14日）のデータ
      {
        record_id: 5,
        rejection_date: new Date('2024-01-08T11:00:00Z'),
        classified_category: '栄養バランス',
        week_number: 2,
        year: 2024,
      },
      {
        record_id: 6,
        rejection_date: new Date('2024-01-09T13:20:00Z'),
        classified_category: '食材制限漏れ',
        week_number: 2,
        year: 2024,
      },
      {
        record_id: 7,
        rejection_date: new Date('2024-01-10T10:45:00Z'),
        classified_category: '食材制限漏れ',
        week_number: 2,
        year: 2024,
      },
      {
        record_id: 8,
        rejection_date: new Date('2024-01-11T15:30:00Z'),
        classified_category: '家族好み未反映',
        week_number: 2,
        year: 2024,
      },
      // 2024年第3週（1月15日-21日）のデータ
      {
        record_id: 9,
        rejection_date: new Date('2024-01-15T09:00:00Z'),
        classified_category: '栄養バランス',
        week_number: 3,
        year: 2024,
      },
      {
        record_id: 10,
        rejection_date: new Date('2024-01-16T12:15:00Z'),
        classified_category: '栄養バランス',
        week_number: 3,
        year: 2024,
      },
      {
        record_id: 11,
        rejection_date: new Date('2024-01-17T14:00:00Z'),
        classified_category: '調理時間超過',
        week_number: 3,
        year: 2024,
      },
      {
        record_id: 12,
        rejection_date: new Date('2024-01-18T16:30:00Z'),
        classified_category: '調理時間超過',
        week_number: 3,
        year: 2024,
      },
    ];

    // 2024年第1週のデータを集計
    const week1_result = aggregateWeeklyFailurePatterns(classifiedRecords, 1, 2024);

    // Week1の集計結果を検証
    // 第1週：栄養バランス 2件、家族好み未反映 1件、調理時間超過 1件（合計4件）
    expect(week1_result.week_number).toBe(1);
    expect(week1_result.year).toBe(2024);
    expect(week1_result.total_records).toBe(4);

    // パターン別の集計
    expect(week1_result.patterns).toEqual(
      expect.arrayContaining([
        {
          pattern: '栄養バランス',
          count: 2,
          percentage: 50,
        },
        {
          pattern: '家族好み未反映',
          count: 1,
          percentage: 25,
        },
        {
          pattern: '調理時間超過',
          count: 1,
          percentage: 25,
        },
      ]),
    );

    // 割合の合計が100%になることを確認
    const week1_total_percentage = week1_result.patterns.reduce(
      (sum, p) => sum + p.percentage,
      0,
    );
    expect(week1_total_percentage).toBe(100);

    // 2024年第2週のデータを集計
    const week2_result = aggregateWeeklyFailurePatterns(classifiedRecords, 2, 2024);

    // Week2の集計結果を検証
    // 第2週：栄養バランス 1件、食材制限漏れ 2件、家族好み未反映 1件（合計4件）
    expect(week2_result.week_number).toBe(2);
    expect(week2_result.year).toBe(2024);
    expect(week2_result.total_records).toBe(4);

    expect(week2_result.patterns).toEqual(
      expect.arrayContaining([
        {
          pattern: '栄養バランス',
          count: 1,
          percentage: 25,
        },
        {
          pattern: '食材制限漏れ',
          count: 2,
          percentage: 50,
        },
        {
          pattern: '家族好み未反映',
          count: 1,
          percentage: 25,
        },
      ]),
    );

    // 割合の合計が100%になることを確認
    const week2_total_percentage = week2_result.patterns.reduce(
      (sum, p) => sum + p.percentage,
      0,
    );
    expect(week2_total_percentage).toBe(100);

    // 2024年第3週のデータを集計
    const week3_result = aggregateWeeklyFailurePatterns(classifiedRecords, 3, 2024);

    // Week3の集計結果を検証
    // 第3週：栄養バランス 2件、調理時間超過 2件（合計4件）
    expect(week3_result.week_number).toBe(3);
    expect(week3_result.year).toBe(2024);
    expect(week3_result.total_records).toBe(4);

    expect(week3_result.patterns).toEqual(
      expect.arrayContaining([
        {
          pattern: '栄養バランス',
          count: 2,
          percentage: 50,
        },
        {
          pattern: '調理時間超過',
          count: 2,
          percentage: 50,
        },
      ]),
    );

    // 割合の合計が100%になることを確認
    const week3_total_percentage = week3_result.patterns.reduce(
      (sum, p) => sum + p.percentage,
      0,
    );
    expect(week3_total_percentage).toBe(100);

    // 複数週のデータが存在する場合、週ごとに独立して正確に集計されていることを確認
    expect(week1_result.total_records).toBe(4);
    expect(week2_result.total_records).toBe(4);
    expect(week3_result.total_records).toBe(4);

    // 各週のパターン分布が異なることを確認（独立して集計されていることの証拠）
    expect(week1_result.patterns).not.toEqual(week2_result.patterns);
    expect(week2_result.patterns).not.toEqual(week3_result.patterns);
  });
});