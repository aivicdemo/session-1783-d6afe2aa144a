import { detectPredictionAccuracyDecline, analyzePredictionAccuracyRootCauses } from "../../src/logic/it-7-2-1";

describe("Prediction Accuracy Decline Detection and Root Cause Analysis", () => {
  test("SCEN-787: detect accuracy decline of 10% or more and extract multiple root causes with importance scores", () => {
    // Setup: Previous month accuracy 85%, current month accuracy 76.5% (8.5% decline, meets 10% threshold when considering acceptable margin)
    // Actual threshold: 85% * 0.90 = 76.5% (10% decline detection)
    const previous_month_accuracy = 85;
    const current_month_accuracy = 76.5;
    const accuracy_decline_threshold_percent = 10;

    // Calculate expected decline
    const expected_decline_percent = ((previous_month_accuracy - current_month_accuracy) / previous_month_accuracy) * 100;

    // Test 1: Detect accuracy decline
    const decline_detection_input = {
      previous_month_accuracy,
      current_month_accuracy,
      accuracy_decline_threshold_percent,
    };

    const decline_detection_result = detectPredictionAccuracyDecline(decline_detection_input);

    // Verify decline is detected
    expect(decline_detection_result.is_decline_detected).toBe(true);
    expect(decline_detection_result.decline_percent).toBe(expected_decline_percent);
    expect(decline_detection_result.meets_alert_threshold).toBe(true);

    // Test 2: Analyze root causes
    const root_cause_analysis_input = {
      previous_month_accuracy,
      current_month_accuracy,
      model_data_quality_score: 0.72,
      feature_completeness_rate: 0.68,
      input_data_anomaly_count: 124,
      model_drift_indicator: 0.85,
      seasonal_factor_impact: 0.45,
      external_data_relevance_score: 0.60,
    };

    const root_cause_analysis_result = analyzePredictionAccuracyRootCauses(root_cause_analysis_input);

    // Verify multiple root causes are extracted (minimum 2)
    expect(root_cause_analysis_result.root_causes.length).toBeGreaterThanOrEqual(2);

    // Verify each root cause has required fields
    root_cause_analysis_result.root_causes.forEach((cause) => {
      expect(cause).toHaveProperty("cause_name");
      expect(cause).toHaveProperty("importance_score");
      expect(cause).toHaveProperty("impact_degree");
      expect(cause).toHaveProperty("occurrence_count");

      // Validate importance score range (0-100)
      expect(cause.importance_score).toBeGreaterThanOrEqual(0);
      expect(cause.importance_score).toBeLessThanOrEqual(100);

      // Validate impact degree is a valid percentage
      expect(cause.impact_degree).toBeGreaterThanOrEqual(0);
      expect(cause.impact_degree).toBeLessThanOrEqual(100);

      // Validate occurrence count is positive
      expect(cause.occurrence_count).toBeGreaterThan(0);
    });

    // Verify root causes are sorted by importance score (descending)
    for (let i = 0; i < root_cause_analysis_result.root_causes.length - 1; i++) {
      expect(root_cause_analysis_result.root_causes[i].importance_score).toBeGreaterThanOrEqual(
        root_cause_analysis_result.root_causes[i + 1].importance_score
      );
    }

    // Test 3: Verify expected root causes are identified (input data anomaly, model drift, feature completeness)
    const root_cause_names = root_cause_analysis_result.root_causes.map((c) => c.cause_name);

    expect(root_cause_names.length).toBeGreaterThanOrEqual(2);

    // Validate that high-impact causes are present based on input metrics
    // Model drift indicator is 0.85 (high), so model drift should be a root cause
    // Input data anomaly count is 124, so data anomaly should be a root cause
    const has_high_priority_cause = root_cause_names.some((name) =>
      /model drift|data anomaly|feature|completeness/i.test(name)
    );
    expect(has_high_priority_cause).toBe(true);

    // Test 4: Verify summary statistics
    expect(root_cause_analysis_result).toHaveProperty("total_impact_percent");
    expect(root_cause_analysis_result.total_impact_percent).toBeGreaterThan(0);
    expect(root_cause_analysis_result.total_impact_percent).toBeLessThanOrEqual(100);

    expect(root_cause_analysis_result).toHaveProperty("primary_root_cause");
    expect(root_cause_analysis_result.primary_root_cause).toBeDefined();
    expect(root_cause_analysis_result.primary_root_cause.importance_score).toBe(
      root_cause_analysis_result.root_causes[0].importance_score
    );

    // Test 5: Verify detail information is provided
    root_cause_analysis_result.root_causes.forEach((cause) => {
      expect(cause.cause_name).toBeTruthy();
      expect(typeof cause.cause_name).toBe("string");
      expect(typeof cause.importance_score).toBe("number");
      expect(typeof cause.impact_degree).toBe("number");
      expect(typeof cause.occurrence_count).toBe("number");
    });

    // Test 6: Error case - accuracy improvement (no decline)
    const no_decline_input = {
      previous_month_accuracy: 75,
      current_month_accuracy: 85,
      accuracy_decline_threshold_percent: 10,
    };

    const no_decline_result = detectPredictionAccuracyDecline(no_decline_input);
    expect(no_decline_result.is_decline_detected).toBe(false);
    expect(no_decline_result.meets_alert_threshold).toBe(false);

    // Test 7: Error case - insufficient decline (below threshold)
    const insufficient_decline_input = {
      previous_month_accuracy: 85,
      current_month_accuracy: 80.5,
      accuracy_decline_threshold_percent: 10,
    };

    const insufficient_decline_result = detectPredictionAccuracyDecline(insufficient_decline_input);
    // 85 to 80.5 = 5.88% decline, below 10% threshold
    expect(insufficient_decline_result.meets_alert_threshold).toBe(false);

    // Test 8: Boundary case - exactly 10% decline
    const boundary_decline_input = {
      previous_month_accuracy: 100,
      current_month_accuracy: 90,
      accuracy_decline_threshold_percent: 10,
    };

    const boundary_decline_result = detectPredictionAccuracyDecline(boundary_decline_input);
    expect(boundary_decline_result.is_decline_detected).toBe(true);
    expect(boundary_decline_result.meets_alert_threshold).toBe(true);
    expect(boundary_decline_result.decline_percent).toBe(10);

    // Test 9: High decline case - 25% drop
    const high_decline_input = {
      previous_month_accuracy: 80,
      current_month_accuracy: 60,
      accuracy_decline_threshold_percent: 10,
    };

    const high_decline_result = detectPredictionAccuracyDecline(high_decline_input);
    expect(high_decline_result.is_decline_detected).toBe(true);
    expect(high_decline_result.meets_alert_threshold).toBe(true);
    expect(high_decline_result.decline_percent).toBe(25);

    // Analyze root causes for high decline scenario
    const high_decline_analysis = analyzePredictionAccuracyRootCauses({
      previous_month_accuracy: 80,
      current_month_accuracy: 60,
      model_data_quality_score: 0.45,
      feature_completeness_rate: 0.30,
      input_data_anomaly_count: 450,
      model_drift_indicator: 0.95,
      seasonal_factor_impact: 0.75,
      external_data_relevance_score: 0.25,
    });

    expect(high_decline_analysis.root_causes.length).toBeGreaterThanOrEqual(2);
    expect(high_decline_analysis.total_impact_percent).toBeGreaterThan(0);

    // Primary cause should have highest importance score
    const first_cause_score = high_decline_analysis.root_causes[0].importance_score;
    const second_cause_score = high_decline_analysis.root_causes[1].importance_score;
    expect(first_cause_score).toBeGreaterThanOrEqual(second_cause_score);
  });
});