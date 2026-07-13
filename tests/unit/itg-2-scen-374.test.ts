import { analyzeCorrelationWithMissingData } from '../../src/logic/it-1-br-2-1-1-1';

describe('栄養摂取推移分析と外部データ相関分析 - 外部データ完全欠損期間の処理', () => {
  // SCEN-374: [edge] 外部データ相関分析による予測精度低下要因特定 - 外部データが完全に欠損している期間における相関分析が適切に処理される
  test('外部データが完全に欠損している期間で相関分析が正常にエラー処理を行い、欠損を予測精度低下要因として記録する', () => {
    const start_date = new Date('2024-01-01T00:00:00Z');
    const end_date = new Date('2024-01-31T23:59:59Z');
    const missing_start = new Date('2024-01-10T00:00:00Z');
    const missing_end = new Date('2024-01-20T23:59:59Z');

    // 栄養摂取データ: 1月1日～1月31日（完全）
    const nutrition_data = [
      {
        date: '2024-01-05',
        calorie_intake: 2100,
        protein_g: 65,
        fat_g: 72,
        carb_g: 280,
      },
      {
        date: '2024-01-15',
        calorie_intake: 2050,
        protein_g: 63,
        fat_g: 70,
        carb_g: 275,
      },
      {
        date: '2024-01-25',
        calorie_intake: 2150,
        protein_g: 68,
        fat_g: 75,
        carb_g: 285,
      },
    ];

    // 外部データ: 1月1日～1月9日と1月21日～1月31日のみ（1月10日～1月20日完全欠損）
    const external_data = [
      {
        date: '2024-01-05',
        temperature_celsius: 12.5,
        humidity_percent: 65,
        event_type: 'normal',
      },
      {
        date: '2024-01-25',
        temperature_celsius: 15.2,
        humidity_percent: 72,
        event_type: 'normal',
      },
    ];

    const result = analyzeCorrelationWithMissingData({
      nutrition_records: nutrition_data,
      external_records: external_data,
      analysis_start: start_date,
      analysis_end: end_date,
      missing_period_start: missing_start,
      missing_period_end: missing_end,
    });

    // 1. 外部データ欠損期間が正しく検出されている
    expect(result.missing_period_detected).toBe(true);
    expect(result.missing_start_date).toEqual(missing_start);
    expect(result.missing_end_date).toEqual(missing_end);

    // 2. 欠損期間の日数が正しく計算されている（1月10日～1月20日 = 11日）
    expect(result.missing_days_count).toBe(11);

    // 3. 欠損期間をスキップして相関分析が実行される
    expect(result.correlation_analysis_executed).toBe(true);

    // 4. 欠損期間外のデータペアで相関が計算される
    // 有効なデータペア：1月5日と1月25日のペアのみ（1月15日は外部データが無い）
    expect(result.valid_data_pairs_count).toBe(1);

    // 5. 相関分析結果が返却される
    expect(result.correlation_coefficient).toBeCloseTo(0.99, 1);
    expect(result.p_value).toBeLessThan(0.05);

    // 6. 欠損期間の記録がNULLで返却される
    expect(result.correlation_by_period).toEqual([
      {
        period: '2024-01-01_to_2024-01-09',
        correlation: 0.95,
        status: 'analyzed',
      },
      {
        period: '2024-01-10_to_2024-01-20',
        correlation: null,
        status: 'skipped_missing_external_data',
      },
      {
        period: '2024-01-21_to_2024-01-31',
        correlation: 0.98,
        status: 'analyzed',
      },
    ]);

    // 7. 予測精度低下要因が『外部データ欠損』として記録される
    expect(result.precision_degradation_factors).toContainEqual({
      factor_type: 'external_data_missing',
      factor_description: '気象データ欠損',
      affected_period_start: missing_start,
      affected_period_end: missing_end,
      affected_days: 11,
      severity: 'high',
      priority_score: 85,
    });

    // 8. ユーザー通知メッセージが生成されている
    expect(result.user_notification_message).toBeDefined();
    expect(result.user_notification_message).toContain('外部データ欠損');
    expect(result.user_notification_message).toContain('2024-01-10');
    expect(result.user_notification_message).toContain('2024-01-20');

    // 9. ダッシュボード表示用のマーキングが含まれている
    expect(result.dashboard_marking).toEqual({
      missing_period_highlighted: true,
      highlight_color: 'warning_yellow',
      display_text: '外部データ欠損期間',
      tooltip: '気象・イベント情報が利用不可のため、相関分析がスキップされた期間です。',
    });

    // 10. 他の正常期間のデータ分析は継続して実行されている
    expect(result.normal_period_analysis_completed).toBe(true);
    expect(result.periods_analyzed_count).toBe(2);
    expect(result.periods_skipped_count).toBe(1);

    // 11. 分析の信頼性スコアが低下している（欠損の影響）
    expect(result.analysis_reliability_score).toBe(72);
    expect(result.reliability_score_reason).toContain('外部データ欠損');

    // 12. エラーが発生していないことを確認（例外的な欠損処理が成功）
    expect(result.error_occurred).toBe(false);
    expect(result.error_message).toBeNull();

    // 13. メタデータが正しく記録されている
    expect(result.metadata).toEqual({
      analysis_timestamp: expect.any(String),
      total_days_analyzed: 31,
      nutrition_records_count: 3,
      external_records_available: 2,
      external_records_missing: 1,
      analysis_status: 'completed_with_missing_data',
    });
  });
});