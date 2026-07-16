import { evaluateDataTrustLevel } from "../../src/logic/it-8-1-2-1";

describe("Data Trust Level Evaluation - Contradiction Detection", () => {
  // SCEN-338: [normal] データ信頼度レベル判定機能 - 矛盾箇所が多いほど信頼度スコアが段階的に低下する
  test("should reduce trust score progressively as contradictions increase", () => {
    // Test data setup with 0 contradictions
    const dataset_0_contradictions = {
      interview_records: [
        {
          user_id: "u001",
          timestamp: "2024-01-15T10:00:00Z",
          pain_factor: "cooking_time",
          description: "30分以内に調理を完了したい",
        },
      ],
      app_logs: [
        {
          user_id: "u001",
          date: "2024-01-15",
          avg_cooking_time_minutes: 28,
          recipe_count: 5,
        },
      ],
      contradictions: [],
    };

    // Test data setup with 5 contradictions
    const dataset_5_contradictions = {
      interview_records: [
        {
          user_id: "u002",
          timestamp: "2024-01-15T10:00:00Z",
          pain_factor: "cooking_time",
          description: "30分以内に調理を完了したい",
        },
        {
          user_id: "u002",
          timestamp: "2024-01-16T14:30:00Z",
          pain_factor: "budget",
          description: "月3万円以内の食費",
        },
      ],
      app_logs: [
        {
          user_id: "u002",
          date: "2024-01-15",
          avg_cooking_time_minutes: 45,
          recipe_count: 3,
        },
        {
          user_id: "u002",
          date: "2024-01-16",
          monthly_expense: 45000,
          purchase_count: 15,
        },
      ],
      contradictions: [
        {
          type: "cooking_time_mismatch",
          severity: "medium",
        },
        {
          type: "budget_mismatch",
          severity: "high",
        },
        {
          type: "log_timestamp_gap",
          severity: "low",
        },
        {
          type: "recipe_count_anomaly",
          severity: "medium",
        },
        {
          type: "purchase_frequency_anomaly",
          severity: "low",
        },
      ],
    };

    // Test data setup with 10 contradictions
    const dataset_10_contradictions = {
      interview_records: [
        {
          user_id: "u003",
          timestamp: "2024-01-15T10:00:00Z",
          pain_factor: "food_restriction",
          description: "子どもの食物アレルギー対応が必須",
        },
      ],
      app_logs: [
        {
          user_id: "u003",
          date: "2024-01-15",
          restricted_recipes_used: 2,
          total_recipes: 20,
        },
      ],
      contradictions: [
        {
          type: "allergy_handling_mismatch",
          severity: "high",
        },
        {
          type: "recipe_selection_inconsistency",
          severity: "high",
        },
        {
          type: "ingredient_data_missing",
          severity: "medium",
        },
        {
          type: "log_data_incomplete",
          severity: "medium",
        },
        {
          type: "timestamp_out_of_range",
          severity: "low",
        },
        {
          type: "user_behavior_anomaly",
          severity: "high",
        },
        {
          type: "nutritional_value_mismatch",
          severity: "medium",
        },
        {
          type: "interview_data_vague",
          severity: "low",
        },
        {
          type: "log_entry_duplicate",
          severity: "low",
        },
        {
          type: "interview_log_date_gap",
          severity: "medium",
        },
      ],
    };

    // Test data setup with 15 contradictions
    const dataset_15_contradictions = {
      interview_records: [
        {
          user_id: "u004",
          timestamp: "2024-01-15T10:00:00Z",
          pain_factor: "budget",
          description: "月2万円以内で家族4人分の食事を用意",
        },
      ],
      app_logs: [
        {
          user_id: "u004",
          date: "2024-01-15",
          monthly_expense: 80000,
          family_size: 2,
        },
      ],
      contradictions: [
        {
          type: "budget_constraint_violation",
          severity: "high",
        },
        {
          type: "family_size_mismatch",
          severity: "high",
        },
        {
          type: "expense_data_anomaly",
          severity: "high",
        },
        {
          type: "interview_reality_gap",
          severity: "high",
        },
        {
          type: "log_value_out_of_bounds",
          severity: "medium",
        },
        {
          type: "data_entry_error",
          severity: "medium",
        },
        {
          type: "missing_required_field",
          severity: "medium",
        },
        {
          type: "inconsistent_unit",
          severity: "low",
        },
        {
          type: "temporal_inconsistency",
          severity: "medium",
        },
        {
          type: "categorical_data_conflict",
          severity: "low",
        },
        {
          type: "cross_field_contradiction_1",
          severity: "high",
        },
        {
          type: "cross_field_contradiction_2",
          severity: "medium",
        },
        {
          type: "statistical_outlier",
          severity: "low",
        },
        {
          type: "semantic_inconsistency",
          severity: "medium",
        },
        {
          type: "reference_data_mismatch",
          severity: "high",
        },
      ],
    };

    // Execute: Get trust scores for each dataset
    const score_0 = evaluateDataTrustLevel(dataset_0_contradictions);
    const score_5 = evaluateDataTrustLevel(dataset_5_contradictions);
    const score_10 = evaluateDataTrustLevel(dataset_10_contradictions);
    const score_15 = evaluateDataTrustLevel(dataset_15_contradictions);

    // Verify: Trust score at 0 contradictions is maximum (100)
    expect(score_0).toBe(100);

    // Verify: Progressive decrease - each score is lower than the previous
    expect(score_0).toBeGreaterThan(score_5);
    expect(score_5).toBeGreaterThan(score_10);
    expect(score_10).toBeGreaterThan(score_15);

    // Verify: Expected scores based on linear degradation formula
    // Formula: trust_score = 100 - (contradictions_count * degradation_rate)
    // Degradation rate: 100 / 20 = 5 points per contradiction
    expect(score_0).toBe(100);
    expect(score_5).toBe(75);
    expect(score_10).toBe(50);
    expect(score_15).toBe(25);

    // Verify: Decrement steps are uniform (each step = 25 points for 5 contradictions)
    const decrement_0_to_5 = score_0 - score_5;
    const decrement_5_to_10 = score_5 - score_10;
    const decrement_10_to_15 = score_10 - score_15;

    expect(decrement_0_to_5).toBe(25);
    expect(decrement_5_to_10).toBe(25);
    expect(decrement_10_to_15).toBe(25);

    // Verify: All scores are within valid range [0, 100]
    expect(score_0).toBeGreaterThanOrEqual(0);
    expect(score_0).toBeLessThanOrEqual(100);
    expect(score_5).toBeGreaterThanOrEqual(0);
    expect(score_5).toBeLessThanOrEqual(100);
    expect(score_10).toBeGreaterThanOrEqual(0);
    expect(score_10).toBeLessThanOrEqual(100);
    expect(score_15).toBeGreaterThanOrEqual(0);
    expect(score_15).toBeLessThanOrEqual(100);
  });
});