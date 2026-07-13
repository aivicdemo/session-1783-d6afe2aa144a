import { analyzeSeasonalTrendApproval } from "../../src/logic/it-1-br-2-1-1-1";

describe("季節変動・曜日別購買傾向承認判定機能", () => {
  // SCEN-558
  test("通常範囲内の購買傾向データが承認され、反映方針が正常に決定される", () => {
    const seasonalTrendData = {
      analysis_id: "trend_20240115_001",
      analysis_date: new Date("2024-01-15T11:00:00Z"),
      season: "winter",
      seasonal_demand_variance: 1.15,
      seasonal_variance_threshold_min: 0.8,
      seasonal_variance_threshold_max: 1.5,
      monday_demand_index: 0.92,
      tuesday_demand_index: 0.88,
      wednesday_demand_index: 0.85,
      thursday_demand_index: 0.89,
      friday_demand_index: 1.05,
      saturday_demand_index: 1.22,
      sunday_demand_index: 1.18,
      weekly_demand_threshold_min: 0.7,
      weekly_demand_threshold_max: 1.4,
      confidence_score: 0.87,
      confidence_threshold: 0.75,
      sample_count: 245,
      minimum_sample_count: 50,
      anomaly_detected: false,
      anomaly_threshold: 0.05,
    };

    const result = analyzeSeasonalTrendApproval(seasonalTrendData);

    expect(result.approval_status).toBe("approved");
    expect(result.seasonal_variance_status).toBe("within_normal_range");
    expect(result.weekly_pattern_status).toBe("within_normal_range");
    expect(result.confidence_status).toBe("acceptable");
    expect(result.sample_adequacy_status).toBe("adequate");
    expect(result.anomaly_status).toBe("no_anomaly");
    expect(result.overall_validation_score).toBe(0.91);
    expect(result.reflection_policy).toBe("immediate_implementation");
    expect(result.next_menu_proposal_priority).toEqual({
      seasonal_adjustment: "high",
      weekly_pattern_adjustment: "high",
      ingredient_availability_check: "medium",
      budget_optimization: "medium",
    });
    expect(result.implementation_timeline).toBe("immediate");
    expect(result.system_log_entry).toBeDefined();
    expect(result.system_log_entry.log_timestamp).toEqual(
      new Date("2024-01-15T11:00:00Z")
    );
    expect(result.system_log_entry.event_type).toBe(
      "seasonal_trend_approval_completed"
    );
    expect(result.system_log_entry.status).toBe("success");
    expect(result.system_log_entry.approval_decision).toBe("approved");
    expect(result.system_log_entry.reflection_policy_applied).toBe(
      "immediate_implementation"
    );
    expect(result.dashboard_display_status).toBe("visible");
    expect(result.next_proposal_generation_trigger).toBe(true);
    expect(result.proposal_generation_expected_start).toEqual(
      new Date("2024-01-15T12:00:00Z")
    );
  });
});