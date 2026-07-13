import { analyzeFeatureUsagePattern } from "../../src/logic/it-1";

describe("月次食費実績の超過要因分析機能", () => {
  test("SCEN-384: 機能別使用パターン分析機能 - 機能別の使用頻度・離脱ポイント・競合差別化根拠が定量化される", () => {
    // Setup: 過去3ヶ月間のユーザー利用ログデータ
    const analysis_period_start = new Date("2024-01-01T00:00:00Z");
    const analysis_period_end = new Date("2024-03-31T23:59:59Z");
    const user_id = "user_12345";
    const segment_type = "busy_couple";

    const user_log_records = [
      {
        log_id: "log_001",
        user_id: "user_12345",
        feature_name: "meal_planning",
        action_type: "access",
        step_sequence: 1,
        timestamp: new Date("2024-01-15T10:00:00Z"),
      },
      {
        log_id: "log_002",
        user_id: "user_12345",
        feature_name: "meal_planning",
        action_type: "constraint_input",
        step_sequence: 2,
        timestamp: new Date("2024-01-15T10:05:00Z"),
      },
      {
        log_id: "log_003",
        user_id: "user_12345",
        feature_name: "meal_planning",
        action_type: "generation_request",
        step_sequence: 3,
        timestamp: new Date("2024-01-15T10:10:00Z"),
      },
      {
        log_id: "log_004",
        user_id: "user_12345",
        feature_name: "meal_planning",
        action_type: "result_view",
        step_sequence: 4,
        timestamp: new Date("2024-01-15T10:15:00Z"),
      },
      {
        log_id: "log_005",
        user_id: "user_12345",
        feature_name: "meal_planning",
        action_type: "confirm",
        step_sequence: 5,
        timestamp: new Date("2024-01-15T10:20:00Z"),
      },
      {
        log_id: "log_006",
        user_id: "user_12345",
        feature_name: "budget_dashboard",
        action_type: "access",
        step_sequence: 1,
        timestamp: new Date("2024-01-20T14:00:00Z"),
      },
      {
        log_id: "log_007",
        user_id: "user_12345",
        feature_name: "budget_dashboard",
        action_type: "view_monthly_summary",
        step_sequence: 2,
        timestamp: new Date("2024-01-20T14:05:00Z"),
      },
      {
        log_id: "log_008",
        user_id: "user_12345",
        feature_name: "budget_dashboard",
        action_type: "view_category_breakdown",
        step_sequence: 3,
        timestamp: new Date("2024-01-20T14:10:00Z"),
      },
      {
        log_id: "log_009",
        user_id: "user_12345",
        feature_name: "shopping_list",
        action_type: "access",
        step_sequence: 1,
        timestamp: new Date("2024-02-05T09:00:00Z"),
      },
      {
        log_id: "log_010",
        user_id: "user_12345",
        feature_name: "shopping_list",
        action_type: "view_items",
        step_sequence: 2,
        timestamp: new Date("2024-02-05T09:03:00Z"),
      },
      {
        log_id: "log_011",
        user_id: "user_12345",
        feature_name: "shopping_list",
        action_type: "abandon",
        step_sequence: 2,
        timestamp: new Date("2024-02-05T09:05:00Z"),
      },
      {
        log_id: "log_012",
        user_id: "user_12345",
        feature_name: "nutrition_dashboard",
        action_type: "access",
        step_sequence: 1,
        timestamp: new Date("2024-02-15T11:00:00Z"),
      },
      {
        log_id: "log_013",
        user_id: "user_12345",
        feature_name: "nutrition_dashboard",
        action_type: "view_intake_summary",
        step_sequence: 2,
        timestamp: new Date("2024-02-15T11:05:00Z"),
      },
      {
        log_id: "log_014",
        user_id: "user_12345",
        feature_name: "nutrition_dashboard",
        action_type: "view_detailed_report",
        step_sequence: 3,
        timestamp: new Date("2024-02-15T11:10:00Z"),
      },
      {
        log_id: "log_015",
        user_id: "user_12345",
        feature_name: "nutrition_dashboard",
        action_type: "export_report",
        step_sequence: 4,
        timestamp: new Date("2024-02-15T11:15:00Z"),
      },
      {
        log_id: "log_016",
        user_id: "user_12345",
        feature_name: "meal_planning",
        action_type: "access",
        step_sequence: 1,
        timestamp: new Date("2024-02-25T10:00:00Z"),
      },
      {
        log_id: "log_017",
        user_id: "user_12345",
        feature_name: "meal_planning",
        action_type: "constraint_input",
        step_sequence: 2,
        timestamp: new Date("2024-02-25T10:05:00Z"),
      },
      {
        log_id: "log_018",
        user_id: "user_12345",
        feature_name: "meal_planning",
        action_type: "generation_request",
        step_sequence: 3,
        timestamp: new Date("2024-02-25T10:10:00Z"),
      },
      {
        log_id: "log_019",
        user_id: "user_12345",
        feature_name: "meal_planning",
        action_type: "result_view",
        step_sequence: 4,
        timestamp: new Date("2024-02-25T10:15:00Z"),
      },
      {
        log_id: "log_020",
        user_id: "user_12345",
        feature_name: "meal_planning",
        action_type: "confirm",
        step_sequence: 5,
        timestamp: new Date("2024-02-25T10:20:00Z"),
      },
      {
        log_id: "log_021",
        user_id: "user_12345",
        feature_name: "budget_dashboard",
        action_type: "access",
        step_sequence: 1,
        timestamp: new Date("2024-03-10T14:00:00Z"),
      },
      {
        log_id: "log_022",
        user_id: "user_12345",
        feature_name: "budget_dashboard",
        action_type: "view_monthly_summary",
        step_sequence: 2,
        timestamp: new Date("2024-03-10T14:05:00Z"),
      },
      {
        log_id: "log_023",
        user_id: "user_12345",
        feature_name: "budget_dashboard",
        action_type: "view_category_breakdown",
        step_sequence: 3,
        timestamp: new Date("2024-03-10T14:10:00Z"),
      },
      {
        log_id: "log_024",
        user_id: "user_12345",
        feature_name: "budget_dashboard",
        action_type: "complete",
        step_sequence: 4,
        timestamp: new Date("2024-03-10T14:15:00Z"),
      },
    ];

    const competitive_feature_definitions = [
      {
        feature_id: "feat_meal_planning",
        feature_name: "meal_planning",
        is_proprietary: true,
        competitive_advantage_score: 9.2,
        unique_capability_description: "AI-driven multi-constraint meal planning with family preferences learning",
      },
      {
        feature_id: "feat_budget_dashboard",
        feature_name: "budget_dashboard",
        is_proprietary: false,
        competitive_advantage_score: 6.5,
        unique_capability_description: "Basic budget tracking and category breakdown",
      },
      {
        feature_id: "feat_shopping_list",
        feature_name: "shopping_list",
        is_proprietary: true,
        competitive_advantage_score: 7.8,
        unique_capability_description: "Smart shopping list with price optimization and store availability",
      },
      {
        feature_id: "feat_nutrition_dashboard",
        feature_name: "nutrition_dashboard",
        is_proprietary: true,
        competitive_advantage_score: 8.6,
        unique_capability_description: "Nutritionist-supervised daily intake tracking and balance analysis",
      },
    ];

    const analysis_input = {
      user_id: user_id,
      period_start: analysis_period_start,
      period_end: analysis_period_end,
      user_segment: segment_type,
      usage_logs: user_log_records,
      competitive_feature_definitions: competitive_feature_definitions,
    };

    // Execute
    const result = analyzeFeatureUsagePattern(analysis_input);

    // Assert: 機能別使用頻度が数値で表示
    expect(result).toHaveProperty("feature_usage_frequency");
    expect(Array.isArray(result.feature_usage_frequency)).toBe(true);

    const meal_planning_freq = result.feature_usage_frequency.find(
      (f) => f.feature_name === "meal_planning"
    );
    expect(meal_planning_freq).toBeDefined();
    expect(meal_planning_freq.access_count).toBe(2);
    expect(meal_planning_freq.total_sessions).toBe(2);
    expect(meal_planning_freq.completion_count).toBe(2);
    expect(meal_planning_freq.usage_rate_percent).toBe(100);

    const budget_freq = result.feature_usage_frequency.find(
      (f) => f.feature_name === "budget_dashboard"
    );
    expect(budget_freq).toBeDefined();
    expect(budget_freq.access_count).toBe(3);
    expect(budget_freq.total_sessions).toBe(3);
    expect(budget_freq.completion_count).toBe(1);
    expect(budget_freq.usage_rate_percent).toBeCloseTo(33.33, 1);

    const shopping_list_freq = result.feature_usage_frequency.find(
      (f) => f.feature_name === "shopping_list"
    );
    expect(shopping_list_freq).toBeDefined();
    expect(shopping_list_freq.access_count).toBe(1);
    expect(shopping_list_freq.total_sessions).toBe(1);
    expect(shopping_list_freq.completion_count).toBe(0);
    expect(shopping_list_freq.usage_rate_percent).toBe(0);

    const nutrition_freq = result.feature_usage_frequency.find(
      (f) => f.feature_name === "nutrition_dashboard"
    );
    expect(nutrition_freq).toBeDefined();
    expect(nutrition_freq.access_count).toBe(1);
    expect(nutrition_freq.total_sessions).toBe(1);
    expect(nutrition_freq.completion_count).toBe(1);
    expect(nutrition_freq.usage_rate_percent).toBe(100);

    // Assert: 機能別離脱ポイント（段階別の定量的データ）
    expect(result).toHaveProperty("feature_abandonment_analysis");
    expect(Array.isArray(result.feature_abandonment_analysis)).toBe(true);

    const shopping_list_abandonment = result.feature_abandonment_analysis.find(
      (a) => a.feature_name === "shopping_list"
    );
    expect(shopping_list_abandonment).toBeDefined();
    expect(shopping_list_abandonment.abandonment_count).toBe(1);
    expect(shopping_list_abandonment.abandonment_rate_percent).toBe(100);
    expect(shopping_list_abandonment.abandonment_step_distribution).toEqual({
      step_1_access: 0,
      step_2_view_items: 1,
      step_3_modification: 0,
      step_4_export_or_complete: 0,
    });

    const meal_planning_abandonment = result.feature_abandonment_analysis.find(
      (a) => a.feature_name === "meal_planning"
    );
    expect(meal_planning_abandonment).toBeDefined();
    expect(meal_planning_abandonment.abandonment_count).toBe(0);
    expect(meal_planning_abandonment.abandonment_rate_percent).toBe(0);

    const budget_dashboard_abandonment = result.feature_abandonment_analysis.find(
      (a) => a.feature_name === "budget_dashboard"
    );
    expect(budget_dashboard_abandonment).toBeDefined();
    expect(budget_dashboard_abandonment.abandonment_count).toBe(2);
    expect(budget_dashboard_abandonment.abandonment_rate_percent).toBeCloseTo(66.67, 1);

    // Assert: 競合差別化根拠（定量的指標）
    expect(result).toHaveProperty("competitive_differentiation_basis");
    expect(result.competitive_differentiation_basis).toHaveProperty("proprietary_features_analysis");

    const proprietary_analysis = result.competitive_differentiation_basis.proprietary_features_analysis;
    expect(Array.isArray(proprietary_analysis)).toBe(true);

    const meal_planning_competitive = proprietary_analysis.find(
      (p) => p.feature_name === "meal_planning"
    );
    expect(meal_planning_competitive).toBeDefined();
    expect(meal_planning_competitive.is_proprietary).toBe(true);
    expect(meal_planning_competitive.competitive_advantage_score).toBe(9.2);
    expect(meal_planning_competitive.usage_frequency_rank).toBe(1);
    expect(meal_planning_competitive.user_completion_rate_percent).toBe(100);
    expect(meal_planning_competitive.satisfaction_indicator).toBe("high");

    const shopping_list_competitive = proprietary_analysis.find(
      (p) => p.feature_name === "shopping_list"
    );
    expect(shopping_list_competitive).toBeDefined();
    expect(shopping_list_competitive.is_proprietary).toBe(true);
    expect(shopping_list_competitive.competitive_advantage_score).toBe(7.8);
    expect(shopping_list_competitive.usage_frequency_rank).toBe(3);
    expect(shopping_list_competitive.user_completion_rate_percent).toBe(0);
    expect(shopping_list_competitive.satisfaction_indicator).toBe("low");

    // Assert: 分析結果の完全性チェック
    expect(result).toHaveProperty("analysis_metadata");
    expect(result.analysis_metadata.analysis_period_start).toEqual(analysis_period_start);
    expect(result.analysis_metadata.analysis_period_end).toEqual(analysis_period_end);
    expect(result.analysis_metadata.total_logs_processed).toBe(24);
    expect(result.analysis_metadata.total_sessions_analyzed).toBe(6);
    expect(result.analysis_metadata.unique_features_tracked).toBe(4);

    // Assert: レポートエクスポートデータの正確性
    expect(result).toHaveProperty("exportable_report_data");
    const report_data = result.exportable_report_data;
    expect(report_data).toHaveProperty("report_generated_timestamp");
    expect(report_data).toHaveProperty("usage_frequency_table");
    expect(report_data).toHaveProperty("abandonment_analysis_table");
    expect(report_data).toHaveProperty("competitive_analysis_table");

    expect(Array.isArray(report_data.usage_frequency_table)).toBe(true);
    expect(report_data.usage_frequency_table.length).toBe(4);

    expect(Array.isArray(report_data.abandonment_analysis_table)).toBe(true);
    expect(report_data.abandonment_analysis_table.length).toBe(4);

    expect(Array.isArray(report_data.competitive_analysis_table)).toBe(true);
    expect(report_data.competitive_analysis_table.length).toBe(4);

    // Assert: フィルタリング機能サポート確認
    expect(result).toHaveProperty("filterable_dimensions");
    expect(result.filterable_dimensions).toContain("feature_name");
    expect(result.filterable_dimensions).toContain("time_period");
    expect(result.filterable_dimensions).toContain("user_segment");
  });
});