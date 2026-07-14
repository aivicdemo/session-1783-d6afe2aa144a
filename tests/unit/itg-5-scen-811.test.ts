import { aggregateWeeklyFailurePatterns } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-811: [edge] 失敗パターン週次集計機能 - 集計対象期間内に該当するデータが存在しない場合、ゼロ件の集計結果が返される
  test('集計対象期間内にデータが存在しない場合、ゼロ件の集計結果が返される', async () => {
    // Setup: 集計対象期間を「過去7日間」に設定
    const aggregation_end_date = new Date('2024-01-22T23:59:59Z');
    const aggregation_start_date = new Date('2024-01-16T00:00:00Z');
    const aggregation_period_days = 7;

    // 空のデータセットで集計関数を呼び出す
    const result = await aggregateWeeklyFailurePatterns({
      aggregation_start_date,
      aggregation_end_date,
      aggregation_period_days,
      failure_records: [],
    });

    // Verify: レスポンスのステータスコードが200であることを確認
    expect(result.status_code).toBe(200);

    // Verify: 集計結果オブジェクトが返却されていることを確認
    expect(result).toHaveProperty('aggregation_result');
    expect(result.aggregation_result).toBeDefined();

    // Verify: 集計件数が0件であることを確認
    expect(result.aggregation_result.total_count).toBe(0);

    // Verify: カテゴリ別内訳が空配列であることを確認
    expect(result.aggregation_result.category_breakdown).toEqual([]);

    // Verify: エラー種別別集計が空配列であることを確認
    expect(result.aggregation_result.error_type_breakdown).toEqual([]);

    // Verify: 詳細集計結果が空配列であることを確認
    expect(result.aggregation_result.detailed_results).toEqual([]);

    // Verify: タイムスタンプが正常に含まれていることを確認
    expect(result.aggregation_result.aggregation_timestamp).toBe('2024-01-22T23:59:59Z');

    // Verify: 対象期間メタデータが正常に含まれていることを確認
    expect(result.aggregation_result.aggregation_period).toEqual({
      start_date: '2024-01-16T00:00:00Z',
      end_date: '2024-01-22T23:59:59Z',
      period_days: 7,
    });

    // Verify: ゼロ件の集計データ構造が完全であることを確認
    expect(result.aggregation_result).toEqual({
      total_count: 0,
      category_breakdown: [],
      error_type_breakdown: [],
      detailed_results: [],
      aggregation_timestamp: '2024-01-22T23:59:59Z',
      aggregation_period: {
        start_date: '2024-01-16T00:00:00Z',
        end_date: '2024-01-22T23:59:59Z',
        period_days: 7,
      },
    });
  });
});