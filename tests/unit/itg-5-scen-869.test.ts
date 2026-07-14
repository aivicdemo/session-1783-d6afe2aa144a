import { generateImprovementReport } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能", () => {
  // SCEN-869
  test("改善提案レポート生成機能 - 改善前後の定量指標からレポート必須項目と可視化形式に従ったレポートが正常に生成される", () => {
    // テストデータ: 改善前後の定量指標を準備
    const metricsBeforeImprovement = {
      success_rate: 72.5,
      avg_cooking_time: 45.3,
      user_satisfaction_score: 3.2,
      processing_time_ms: 2850,
      memory_usage_mb: 156.8,
    };

    const metricsAfterImprovement = {
      success_rate: 81.2,
      avg_cooking_time: 38.7,
      user_satisfaction_score: 3.8,
      processing_time_ms: 1950,
      memory_usage_mb: 112.4,
    };

    // 改善提案レポート生成関数を実行
    const report = generateImprovementReport({
      title: "献立生成アルゴリズム改善提案レポート",
      improvement_id: "IMP-2024-Q1-001",
      metrics_before: metricsBeforeImprovement,
      metrics_after: metricsAfterImprovement,
      recommendation: "栄養バランスロジックと家族嗜好学習の統合強化を推奨",
      visualization_format: {
        graph_type: "bar_chart",
        axis_label_x: "指標項目",
        axis_label_y: "スコア値",
        legend_enabled: true,
      },
    });

    // レポートオブジェクトが存在することを確認
    expect(report).toBeDefined();
    expect(typeof report).toBe("object");

    // レポートに必須項目が全て含まれていることを検証
    expect(report).toHaveProperty("title");
    expect(report).toHaveProperty("improvement_id");
    expect(report).toHaveProperty("metrics_before");
    expect(report).toHaveProperty("metrics_after");
    expect(report).toHaveProperty("improvement_rates");
    expect(report).toHaveProperty("recommendation");
    expect(report).toHaveProperty("visualization_config");

    // 各必須項目のデータ型を確認
    expect(typeof report.title).toBe("string");
    expect(typeof report.improvement_id).toBe("string");
    expect(typeof report.metrics_before).toBe("object");
    expect(typeof report.metrics_after).toBe("object");
    expect(typeof report.improvement_rates).toBe("object");
    expect(typeof report.recommendation).toBe("string");
    expect(typeof report.visualization_config).toBe("object");

    // タイトルと改善IDの値を確認
    expect(report.title).toBe("献立生成アルゴリズム改善提案レポート");
    expect(report.improvement_id).toBe("IMP-2024-Q1-001");

    // 改善前後の指標値が正しく格納されているか確認
    expect(report.metrics_before.success_rate).toBe(72.5);
    expect(report.metrics_before.avg_cooking_time).toBe(45.3);
    expect(report.metrics_before.user_satisfaction_score).toBe(3.2);
    expect(report.metrics_before.processing_time_ms).toBe(2850);
    expect(report.metrics_before.memory_usage_mb).toBe(156.8);

    expect(report.metrics_after.success_rate).toBe(81.2);
    expect(report.metrics_after.avg_cooking_time).toBe(38.7);
    expect(report.metrics_after.user_satisfaction_score).toBe(3.8);
    expect(report.metrics_after.processing_time_ms).toBe(1950);
    expect(report.metrics_after.memory_usage_mb).toBe(112.4);

    // 改善率の計算を検証: (改善前値 - 改善後値) / 改善前値 × 100
    // success_rate: (72.5 - 81.2) / 72.5 × 100 = -12.0 (負数は改善)
    const expectedSuccessRateImprovement =
      ((metricsBeforeImprovement.success_rate -
        metricsAfterImprovement.success_rate) /
        metricsBeforeImprovement.success_rate) *
      100;
    expect(report.improvement_rates.success_rate).toBeCloseTo(
      expectedSuccessRateImprovement,
      1
    );

    // avg_cooking_time: (45.3 - 38.7) / 45.3 × 100 = 14.57
    const expectedCookingTimeImprovement =
      ((metricsBeforeImprovement.avg_cooking_time -
        metricsAfterImprovement.avg_cooking_time) /
        metricsBeforeImprovement.avg_cooking_time) *
      100;
    expect(report.improvement_rates.avg_cooking_time).toBeCloseTo(
      expectedCookingTimeImprovement,
      1
    );

    // user_satisfaction_score: (3.2 - 3.8) / 3.2 × 100 = -18.75
    const expectedSatisfactionImprovement =
      ((metricsBeforeImprovement.user_satisfaction_score -
        metricsAfterImprovement.user_satisfaction_score) /
        metricsBeforeImprovement.user_satisfaction_score) *
      100;
    expect(report.improvement_rates.user_satisfaction_score).toBeCloseTo(
      expectedSatisfactionImprovement,
      1
    );

    // processing_time_ms: (2850 - 1950) / 2850 × 100 = 31.58
    const expectedProcessingTimeImprovement =
      ((metricsBeforeImprovement.processing_time_ms -
        metricsAfterImprovement.processing_time_ms) /
        metricsBeforeImprovement.processing_time_ms) *
      100;
    expect(report.improvement_rates.processing_time_ms).toBeCloseTo(
      expectedProcessingTimeImprovement,
      1
    );

    // memory_usage_mb: (156.8 - 112.4) / 156.8 × 100 = 28.38
    const expectedMemoryImprovement =
      ((metricsBeforeImprovement.memory_usage_mb -
        metricsAfterImprovement.memory_usage_mb) /
        metricsBeforeImprovement.memory_usage_mb) *
      100;
    expect(report.improvement_rates.memory_usage_mb).toBeCloseTo(
      expectedMemoryImprovement,
      1
    );

    // 推奨事項が正しく格納されていることを確認
    expect(report.recommendation).toBe(
      "栄養バランスロジックと家族嗜好学習の統合強化を推奨"
    );

    // 可視化形式の設定が正しく適用されていることを確認
    expect(report.visualization_config).toHaveProperty("graph_type");
    expect(report.visualization_config).toHaveProperty("axis_label_x");
    expect(report.visualization_config).toHaveProperty("axis_label_y");
    expect(report.visualization_config).toHaveProperty("legend_enabled");

    expect(report.visualization_config.graph_type).toBe("bar_chart");
    expect(report.visualization_config.axis_label_x).toBe("指標項目");
    expect(report.visualization_config.axis_label_y).toBe("スコア値");
    expect(report.visualization_config.legend_enabled).toBe(true);

    // JSON構造が仕様に準拠していることを確認（シリアライズ可能性）
    const serialized = JSON.stringify(report);
    expect(serialized).toBeDefined();
    expect(typeof serialized).toBe("string");
    expect(serialized.length).toBeGreaterThan(0);

    // レポートが再度パースできることを確認（スキーマ整合性）
    const reparsed = JSON.parse(serialized);
    expect(reparsed.title).toBe(report.title);
    expect(reparsed.improvement_id).toBe(report.improvement_id);
    expect(reparsed.metrics_before.success_rate).toBe(
      report.metrics_before.success_rate
    );
    expect(reparsed.metrics_after.success_rate).toBe(
      report.metrics_after.success_rate
    );
  });
});