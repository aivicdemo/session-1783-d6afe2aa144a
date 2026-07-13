import { extractPrecisionDeclineFactor } from "../../src/logic/it-1-br-6-2-1";

describe("需要予測精度検証ダッシュボード：予測値と実績値の照合・乖離分析機能", () => {
  // SCEN-264: [normal] 需要予測精度低下検出・主要因抽出 - 特定カテゴリの乖離度が閾値を超えた場合、カテゴリ別の精度低下要因を分離抽出する
  test("should detect precision decline when category divergence exceeds threshold and extract primary factors", () => {
    const divergence_threshold = 0.15; // 15% threshold
    const food_category_divergence = 0.2; // 20% divergence for food category
    const apparel_category_divergence = 0.1; // 10% divergence for apparel category
    const electronics_category_divergence = 0.08; // 8% divergence for electronics category

    const forecast_data = [
      {
        category_id: 1,
        category_name: "食品",
        predicted_demand: 1000,
        actual_demand: 800,
        divergence_rate: food_category_divergence,
        month: "2024-01",
      },
      {
        category_id: 2,
        category_name: "衣類",
        predicted_demand: 500,
        actual_demand: 450,
        divergence_rate: apparel_category_divergence,
        month: "2024-01",
      },
      {
        category_id: 3,
        category_name: "電子機器",
        predicted_demand: 300,
        actual_demand: 276,
        divergence_rate: electronics_category_divergence,
        month: "2024-01",
      },
    ];

    const result = extractPrecisionDeclineFactor({
      forecast_categories: forecast_data,
      threshold: divergence_threshold,
      analysis_period: "2024-01",
    });

    // Verify that food category is detected as precision decline target
    expect(result.detected_categories).toHaveLength(1);
    expect(result.detected_categories[0]).toEqual({
      category_id: 1,
      category_name: "食品",
      divergence_rate: 0.2,
      threshold_exceeded_by: 0.05, // 0.2 - 0.15 = 0.05
      status: "precision_declined",
    });

    // Verify that other categories are NOT in precision decline detection
    expect(result.excluded_categories).toHaveLength(2);
    expect(result.excluded_categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category_id: 2,
          category_name: "衣類",
          divergence_rate: 0.1,
          status: "normal",
        }),
        expect.objectContaining({
          category_id: 3,
          category_name: "電子機器",
          divergence_rate: 0.08,
          status: "normal",
        }),
      ])
    );

    // Verify primary factors extracted for food category only
    expect(result.primary_factors).toHaveLength(1);
    expect(result.primary_factors[0]).toEqual({
      category_id: 1,
      category_name: "食品",
      factors: expect.arrayContaining([
        expect.objectContaining({
          factor_type: "seasonal_trend",
          factor_description: "季節トレンドの変化",
          impact_score: expect.any(Number),
          priority: expect.any(Number),
        }),
        expect.objectContaining({
          factor_type: "supply_chain_delay",
          factor_description: "供給チェーン遅延",
          impact_score: expect.any(Number),
          priority: expect.any(Number),
        }),
        expect.objectContaining({
          factor_type: "external_event",
          factor_description: "外部イベント影響",
          impact_score: expect.any(Number),
          priority: expect.any(Number),
        }),
        expect.objectContaining({
          factor_type: "model_parameter_drift",
          factor_description: "モデルパラメータドリフト",
          impact_score: expect.any(Number),
          priority: expect.any(Number),
        }),
      ]),
    });

    // Verify that detected_timestamp is recorded in logs
    expect(result.detection_timestamp).toBeDefined();
    expect(typeof result.detection_timestamp).toBe("string");

    // Verify log record
    expect(result.log_record).toBeDefined();
    expect(result.log_record).toEqual({
      event_type: "precision_decline_detected",
      detected_categories_count: 1,
      analysis_period: "2024-01",
      threshold_value: 0.15,
      detected_at: result.detection_timestamp,
      analysis_status: "completed",
    });

    // Verify that summary correctly reflects the analysis result
    expect(result.summary).toEqual({
      total_categories: 3,
      declined_categories_count: 1,
      normal_categories_count: 2,
      overall_status: "precision_decline_detected",
    });
  });
});