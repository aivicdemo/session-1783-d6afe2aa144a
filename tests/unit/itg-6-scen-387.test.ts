import { detectOutliersUsingTukeyMethod } from '../../src/logic/it-1-br-8-2-2-1';

describe('ユーザーペイン定量化データ品質検証機能 - Tukey法による外れ値検出', () => {
  // SCEN-387: Tukey法による外れ値検出が正確に機能し、複数データソースから異常値が漏れなく検出されること
  test('利用ログ・インタビューテキスト・行動指標から外れ値を正確に検出し除外対象を特定する', () => {
    // ===== 準備フェーズ =====
    // 利用ログデータサンプルセット（セッション数、操作回数、滞在時間）
    const usage_log_data = [
      { session_count: 5, operation_count: 20, dwell_time_sec: 180 },
      { session_count: 6, operation_count: 22, dwell_time_sec: 195 },
      { session_count: 7, operation_count: 25, dwell_time_sec: 210 },
      { session_count: 8, operation_count: 28, dwell_time_sec: 225 },
      { session_count: 9, operation_count: 32, dwell_time_sec: 240 },
      { session_count: 50, operation_count: 150, dwell_time_sec: 900 }, // 外れ値
    ];

    // インタビューテキストの感情スコア（-1.0～1.0）
    const interview_sentiment_scores = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, -0.95]; // -0.95 は外れ値

    // 行動指標（クリック率、離脱率、コンバージョン率 を 0～1 の範囲で表現）
    const behavior_metrics = [
      { click_rate: 0.15, exit_rate: 0.05, conversion_rate: 0.08 },
      { click_rate: 0.18, exit_rate: 0.06, conversion_rate: 0.09 },
      { click_rate: 0.20, exit_rate: 0.07, conversion_rate: 0.10 },
      { click_rate: 0.22, exit_rate: 0.08, conversion_rate: 0.11 },
      { click_rate: 0.25, exit_rate: 0.09, conversion_rate: 0.12 },
      { click_rate: 0.95, exit_rate: 0.95, conversion_rate: 0.98 }, // 外れ値
    ];

    // ===== 関数実行 =====
    const result = detectOutliersUsingTukeyMethod({
      usage_logs: usage_log_data,
      interview_sentiments: interview_sentiment_scores,
      behavior_metrics: behavior_metrics,
    });

    // ===== 利用ログの四分位計算検証 =====
    // session_count: [5, 6, 7, 8, 9, 50]
    // ソート済み: [5, 6, 7, 8, 9, 50]
    // Q1位置: (6+1) * 0.25 = 1.75 → Q1 = 5 + (6-5) * 0.75 = 5.75
    // Q3位置: (6+1) * 0.75 = 5.25 → Q3 = 9 + (50-9) * 0.25 = 9 + 10.25 = 19.25
    // IQR = 19.25 - 5.75 = 13.5
    // 下限 = 5.75 - 1.5 * 13.5 = 5.75 - 20.25 = -14.5
    // 上限 = 19.25 + 1.5 * 13.5 = 19.25 + 20.25 = 39.5
    // 外れ値: session_count=50 は 39.5 を超える → 外れ値判定

    // dwell_time_sec: [180, 195, 210, 225, 240, 900]
    // Q1 = 180 + (195-180) * 0.75 = 180 + 11.25 = 191.25
    // Q3 = 240 + (900-240) * 0.25 = 240 + 165 = 405
    // IQR = 405 - 191.25 = 213.75
    // 下限 = 191.25 - 1.5 * 213.75 = 191.25 - 320.625 = -129.375
    // 上限 = 405 + 1.5 * 213.75 = 405 + 320.625 = 725.625
    // 外れ値: dwell_time_sec=900 は 725.625 を超える → 外れ値判定

    expect(result.usage_logs_outlier_indices).toContain(5); // インデックス5（session_count=50）が外れ値
    expect(result.usage_logs_outlier_count).toBe(2); // session_count と dwell_time_sec で計2個の外れ値検出

    // ===== インタビューテキスト感情スコアの四分位計算検証 =====
    // [-0.95, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
    // ソート済み: [-0.95, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
    // Q1位置: (8+1) * 0.25 = 2.25 → Q1 = 0.2 + (0.3-0.2) * 0.25 = 0.2 + 0.025 = 0.225
    // Q3位置: (8+1) * 0.75 = 6.75 → Q3 = 0.6 + (0.7-0.6) * 0.75 = 0.6 + 0.075 = 0.675
    // IQR = 0.675 - 0.225 = 0.45
    // 下限 = 0.225 - 1.5 * 0.45 = 0.225 - 0.675 = -0.45
    // 上限 = 0.675 + 1.5 * 0.45 = 0.675 + 0.675 = 1.35
    // 外れ値: -0.95 は -0.45 未満 → 外れ値判定

    expect(result.interview_sentiments_outlier_indices).toContain(7); // インデックス7（-0.95）が外れ値
    expect(result.interview_sentiments_outlier_count).toBe(1);

    // ===== 行動指標の四分位計算検証 =====
    // click_rate: [0.15, 0.18, 0.20, 0.22, 0.25, 0.95]
    // Q1 = 0.15 + (0.18-0.15) * 0.75 = 0.15 + 0.0225 = 0.1725
    // Q3 = 0.25 + (0.95-0.25) * 0.25 = 0.25 + 0.175 = 0.425
    // IQR = 0.425 - 0.1725 = 0.2525
    // 下限 = 0.1725 - 1.5 * 0.2525 = 0.1725 - 0.37875 = -0.20625
    // 上限 = 0.425 + 1.5 * 0.2525 = 0.425 + 0.37875 = 0.80375
    // 外れ値: click_rate=0.95 は 0.80375 を超える → 外れ値判定

    expect(result.behavior_metrics_outlier_indices).toContain(5); // インデックス5（click_rate=0.95）が外れ値
    expect(result.behavior_metrics_outlier_count).toBe(3); // click_rate, exit_rate, conversion_rate で計3個の外れ値検出

    // ===== 各データソース間の外れ値検出結果の整合性確認 =====
    expect(result.total_outliers_detected).toBe(6); // 2 + 1 + 3 = 6個の外れ値
    expect(result.data_sources_with_outliers).toContain('usage_logs');
    expect(result.data_sources_with_outliers).toContain('interview_sentiments');
    expect(result.data_sources_with_outliers).toContain('behavior_metrics');
    expect(result.data_sources_with_outliers.length).toBe(3);

    // ===== 検出された外れ値が正規分布外の値であることを統計的に検証 =====
    // 外れ値の特性を確認：
    // - usage_logs の外れ値: session_count=50（極端に高い）
    // - interview_sentiments の外れ値: -0.95（極端に低い、データセット内での分布から大きく乖離）
    // - behavior_metrics の外れ値: click_rate=0.95, exit_rate=0.95, conversion_rate=0.98（すべて極端に高い）
    
    expect(result.outlier_validation_status).toBe('valid'); // 統計的妥当性を持つ
    expect(result.quartile_calculations).toBeDefined();

    // ===== 下限・上限の計算正確性検証 =====
    expect(result.quartile_calculations.usage_logs).toBeDefined();
    expect(result.quartile_calculations.usage_logs.session_count).toEqual({
      q1: 5.75,
      q3: 19.25,
      iqr: 13.5,
      lower_bound: -14.5,
      upper_bound: 39.5,
    });

    expect(result.quartile_calculations.usage_logs.dwell_time_sec).toEqual({
      q1: 191.25,
      q3: 405,
      iqr: 213.75,
      lower_bound: -129.375,
      upper_bound: 725.625,
    });

    expect(result.quartile_calculations.interview_sentiments).toEqual({
      q1: 0.225,
      q3: 0.675,
      iqr: 0.45,
      lower_bound: -0.45,
      upper_bound: 1.35,
    });

    expect(result.quartile_calculations.behavior_metrics.click_rate).toEqual({
      q1: 0.1725,
      q3: 0.425,
      iqr: 0.2525,
      lower_bound: -0.20625,
      upper_bound: 0.80375,
    });

    // ===== 複数データソース間での外れ値判定に矛盾がないことを確認 =====
    expect(result.inter_datasource_consistency).toBe(true); // 矛盾なし
    expect(result.excluded_record_indices).toEqual({
      usage_logs: [5],
      interview_sentiments: [7],
      behavior_metrics: [5],
    });

    // ===== データ品質フラグの確認 =====
    expect(result.data_quality_flag).toBe('quality_verified'); // データ品質検証済み
    expect(result.records_passed_quality_check).toBe(
      usage_log_data.length -
        result.usage_logs_outlier_count +
        interview_sentiment_scores.length -
        result.interview_sentiments_outlier_count +
        behavior_metrics.length -
        result.behavior_metrics_outlier_count
    );
  });
});