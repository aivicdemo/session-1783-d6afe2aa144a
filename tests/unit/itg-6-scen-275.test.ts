import {
  validateDataQuality,
  applyAnomalyCorrection,
  getAnalysisResult,
} from "../../src/logic/it-1-br-8-2-2-1";

describe("機能別使用頻度・離脱ポイント自動抽出・分析機能 - データ品質検証", () => {
  test("SCEN-275: 異常値の補正ルールが適切に適用され補正後の値が分析に使用される", () => {
    // ========== 【準備】テストデータ準備: 既知の異常値を含むデータセット ==========
    const raw_usage_logs = [
      {
        user_id: "user_001",
        feature_name: "menu_generation",
        usage_frequency: 45,
        cooking_time_minutes: 25,
      },
      {
        user_id: "user_002",
        feature_name: "menu_generation",
        usage_frequency: 12,
        cooking_time_minutes: 999, // 異常値: 極端に高い
      },
      {
        user_id: "user_003",
        feature_name: "nutrition_analysis",
        usage_frequency: 38,
        cooking_time_minutes: 22,
      },
      {
        user_id: "user_004",
        feature_name: "nutrition_analysis",
        usage_frequency: -5, // 異常値: 負の値
        cooking_time_minutes: 18,
      },
      {
        user_id: "user_005",
        feature_name: "budget_tracking",
        usage_frequency: 22,
        cooking_time_minutes: 20,
      },
      {
        user_id: "user_006",
        feature_name: "budget_tracking",
        usage_frequency: 31,
        cooking_time_minutes: 15,
      },
    ];

    // ========== 【STEP 1】データ品質検証機能でルール有効化 ==========
    const validation_result = validateDataQuality(raw_usage_logs, {
      enable_anomaly_detection: true,
      enable_traceability: true,
    });

    // 検証フェーズ: 異常値が検出されたことを確認
    expect(validation_result.validation_status).toBe("detected");
    expect(validation_result.anomaly_count).toBe(2); // user_002の999分、user_004の-5
    expect(validation_result.detected_anomalies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          user_id: "user_002",
          field: "cooking_time_minutes",
          original_value: 999,
          anomaly_type: "outlier_high",
        }),
        expect.objectContaining({
          user_id: "user_004",
          field: "usage_frequency",
          original_value: -5,
          anomaly_type: "invalid_negative",
        }),
      ])
    );

    // ========== 【STEP 2 & 3】異常値補正ルール設定 ==========
    const correction_config = {
      rules: [
        {
          field: "cooking_time_minutes",
          rule_type: "iqr_based_outlier",
          params: { lower_percentile: 25, upper_percentile: 75 },
        },
        {
          field: "usage_frequency",
          rule_type: "min_threshold",
          params: { minimum_value: 0 },
        },
      ],
      fallback_strategy: "mean_imputation",
    };

    // ========== 【STEP 4】異常値補正処理の実行 ==========
    const corrected_dataset = applyAnomalyCorrection(
      raw_usage_logs,
      correction_config
    );

    // ========== 【STEP 5】補正処理のログ確認 ==========
    expect(corrected_dataset.correction_log).toBeDefined();
    expect(corrected_dataset.correction_log).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          user_id: "user_002",
          field: "cooking_time_minutes",
          original_value: 999,
          rule_applied: "iqr_based_outlier",
          corrected_value: 25, // 平均値補정による補正後
        }),
        expect.objectContaining({
          user_id: "user_004",
          field: "usage_frequency",
          original_value: -5,
          rule_applied: "min_threshold",
          corrected_value: 0, // 最小値補正
        }),
      ])
    );

    // ========== 【STEP 6】補正後のデータセット取得 ==========
    const corrected_data = corrected_dataset.data;

    // 補正確認: user_002のcooking_time_minutes が999から25に補正されたことを確認
    const corrected_user_002 = corrected_data.find(
      (record) => record.user_id === "user_002"
    );
    expect(corrected_user_002.cooking_time_minutes).toBe(25);
    expect(corrected_user_002.usage_frequency).toBe(12); // 異常値なし

    // 補正確認: user_004のusage_frequency が-5から0に補正されたことを確認
    const corrected_user_004 = corrected_data.find(
      (record) => record.user_id === "user_004"
    );
    expect(corrected_user_004.usage_frequency).toBe(0);
    expect(corrected_user_004.cooking_time_minutes).toBe(22); // 異常値なし

    // ========== 【STEP 7】補正後データが分析機能に渡されたことを確認 ==========
    const analysis_result = getAnalysisResult(corrected_dataset, {
      group_by: "feature_name",
      metrics: ["mean_usage_frequency", "mean_cooking_time", "record_count"],
    });

    expect(analysis_result.used_dataset_id).toBe(corrected_dataset.dataset_id);
    expect(analysis_result.data_quality_status).toBe("corrected");

    // ========== 【STEP 8】分析結果に補正後の値が反映されていることを検証 ==========
    // feature_name="nutrition_analysis"のグループ分析結果
    const nutrition_group = analysis_result.analysis_groups.find(
      (g) => g.feature_name === "nutrition_analysis"
    );

    // user_004のusage_frequencyが-5→0に補正されたため、平均値は(38+0)/2=19
    expect(nutrition_group.mean_usage_frequency).toBe(19);
    expect(nutrition_group.record_count).toBe(2);

    // feature_name="menu_generation"のグループ分析結果
    const menu_group = analysis_result.analysis_groups.find(
      (g) => g.feature_name === "menu_generation"
    );

    // user_002のcooking_timeが999→25に補正されたため、平均値は(25+25)/2=25
    expect(menu_group.mean_cooking_time).toBe(25);
    expect(menu_group.record_count).toBe(2);

    // ========== 【STEP 9】元データと補正後データの比較 ==========
    // 元のraw_dataとcorrected_dataを比較
    expect(corrected_dataset.data.length).toBe(raw_usage_logs.length);

    // 異常値があった2レコードのみ値が変わっていることを確認
    const unchanged_user_001 = corrected_data.find(
      (r) => r.user_id === "user_001"
    );
    expect(unchanged_user_001).toEqual(
      expect.objectContaining({
        usage_frequency: 45,
        cooking_time_minutes: 25,
      })
    );

    const unchanged_user_005 = corrected_data.find(
      (r) => r.user_id === "user_005"
    );
    expect(unchanged_user_005).toEqual(
      expect.objectContaining({
        usage_frequency: 22,
        cooking_time_minutes: 20,
      })
    );

    // ========== 【STEP 10】複数ルール適用時の動作検証 ==========
    const multi_rule_config = {
      rules: [
        {
          field: "cooking_time_minutes",
          rule_type: "iqr_based_outlier",
          params: { lower_percentile: 25, upper_percentile: 75 },
        },
        {
          field: "usage_frequency",
          rule_type: "min_threshold",
          params: { minimum_value: 0 },
        },
        {
          field: "usage_frequency",
          rule_type: "max_threshold",
          params: { maximum_value: 50 },
        },
      ],
      fallback_strategy: "mean_imputation",
    };

    const multi_corrected = applyAnomalyCorrection(
      raw_usage_logs,
      multi_rule_config
    );

    // 複数ルール適用時も期待通りに補正されることを確認
    expect(multi_corrected.correction_log.length).toBeGreaterThanOrEqual(2);

    // すべてのusage_frequencyが0以上50以下の範囲内にあることを確認
    multi_corrected.data.forEach((record) => {
      expect(record.usage_frequency).toBeGreaterThanOrEqual(0);
      expect(record.usage_frequency).toBeLessThanOrEqual(50);
    });

    // トレーサビリティ: 補正前後の値が記録されていることを確認
    expect(multi_corrected.correction_log).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          user_id: expect.any(String),
          field: expect.any(String),
          original_value: expect.any(Number),
          corrected_value: expect.any(Number),
          rule_applied: expect.any(String),
          timestamp: expect.any(String),
        }),
      ])
    );

    // ========== 【最終検証】補正結果の統計的妥当性 ==========
    // 補正後データセットの統計情報取得
    const corrected_stats = {
      mean_usage_frequency:
        corrected_data.reduce((sum, r) => sum + r.usage_frequency, 0) /
        corrected_data.length,
      mean_cooking_time:
        corrected_data.reduce((sum, r) => sum + r.cooking_time_minutes, 0) /
        corrected_data.length,
    };

    // 補正後の平均usage_frequency: (45+12+38+0+22+31)/6 = 148/6 ≈ 24.67
    expect(corrected_stats.mean_usage_frequency).toBeCloseTo(24.67, 1);

    // 補正後の平均cooking_time: (25+25+22+18+20+15)/6 = 125/6 ≈ 20.83
    expect(corrected_stats.mean_cooking_time).toBeCloseTo(20.83, 1);

    // 補正のトレーサビリティ確認
    expect(corrected_dataset.traceability_enabled).toBe(true);
    expect(corrected_dataset.correction_timestamp).toBeDefined();
  });
});