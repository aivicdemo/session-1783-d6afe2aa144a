import { compareAlgorithmVersions } from '../../src/logic/it-8-1-1-1';

describe('Algorithm Improvement Effect Comparison', () => {
  test('SCEN-260: Algorithm improvement effect comparison - success rate, cooking time reduction, and user satisfaction score are correctly compared between pre and post improvement versions', () => {
    // Prepare test data for pre-improvement version (v1.0)
    const v1_0_dataset = Array.from({ length: 100 }, (_, i) => ({
      meal_id: `meal_v1_${i}`,
      user_id: `user_${i % 10}`,
      success: i % 100 < 65, // 65% success rate for v1.0
      cooking_time_minutes: 35 + Math.random() * 10, // ~35-45 minutes
      user_satisfaction_score: 65 + Math.random() * 10, // ~65-75 satisfaction
    }));

    // Prepare test data for post-improvement version (v2.0)
    const v2_0_dataset = Array.from({ length: 100 }, (_, i) => ({
      meal_id: `meal_v2_${i}`,
      user_id: `user_${i % 10}`,
      success: i % 100 < 82, // 82% success rate for v2.0
      cooking_time_minutes: 28 + Math.random() * 8, // ~28-36 minutes
      user_satisfaction_score: 78 + Math.random() * 12, // ~78-90 satisfaction
    }));

    // Calculate metrics for pre-improvement version (v1.0)
    const v1_0_success_rate = (v1_0_dataset.filter(d => d.success).length / v1_0_dataset.length) * 100;
    const v1_0_avg_cooking_time = v1_0_dataset.reduce((sum, d) => sum + d.cooking_time_minutes, 0) / v1_0_dataset.length;
    const v1_0_satisfaction_score = v1_0_dataset.reduce((sum, d) => sum + d.user_satisfaction_score, 0) / v1_0_dataset.length;

    // Calculate metrics for post-improvement version (v2.0)
    const v2_0_success_rate = (v2_0_dataset.filter(d => d.success).length / v2_0_dataset.length) * 100;
    const v2_0_avg_cooking_time = v2_0_dataset.reduce((sum, d) => sum + d.cooking_time_minutes, 0) / v2_0_dataset.length;
    const v2_0_satisfaction_score = v2_0_dataset.reduce((sum, d) => sum + d.user_satisfaction_score, 0) / v2_0_dataset.length;

    // Execute comparison function
    const comparison_result = compareAlgorithmVersions(
      {
        version: 'v1.0',
        dataset: v1_0_dataset,
      },
      {
        version: 'v2.0',
        dataset: v2_0_dataset,
      }
    );

    // Verify comparison result structure and type
    expect(comparison_result).toBeDefined();
    expect(typeof comparison_result).toBe('object');
    expect(comparison_result.pre_improvement_version).toBe('v1.0');
    expect(comparison_result.post_improvement_version).toBe('v2.0');

    // Verify pre-improvement metrics are present
    expect(comparison_result.pre_improvement_metrics).toBeDefined();
    expect(typeof comparison_result.pre_improvement_metrics.success_rate_percentage).toBe('number');
    expect(typeof comparison_result.pre_improvement_metrics.avg_cooking_time_minutes).toBe('number');
    expect(typeof comparison_result.pre_improvement_metrics.user_satisfaction_score_0_to_100).toBe('number');

    // Verify post-improvement metrics are present
    expect(comparison_result.post_improvement_metrics).toBeDefined();
    expect(typeof comparison_result.post_improvement_metrics.success_rate_percentage).toBe('number');
    expect(typeof comparison_result.post_improvement_metrics.avg_cooking_time_minutes).toBe('number');
    expect(typeof comparison_result.post_improvement_metrics.user_satisfaction_score_0_to_100).toBe('number');

    // Verify v1.0 metrics are within valid ranges
    expect(comparison_result.pre_improvement_metrics.success_rate_percentage).toBeGreaterThanOrEqual(0);
    expect(comparison_result.pre_improvement_metrics.success_rate_percentage).toBeLessThanOrEqual(100);
    expect(comparison_result.pre_improvement_metrics.avg_cooking_time_minutes).toBeGreaterThan(0);
    expect(comparison_result.pre_improvement_metrics.user_satisfaction_score_0_to_100).toBeGreaterThanOrEqual(0);
    expect(comparison_result.pre_improvement_metrics.user_satisfaction_score_0_to_100).toBeLessThanOrEqual(100);

    // Verify v2.0 metrics are within valid ranges
    expect(comparison_result.post_improvement_metrics.success_rate_percentage).toBeGreaterThanOrEqual(0);
    expect(comparison_result.post_improvement_metrics.success_rate_percentage).toBeLessThanOrEqual(100);
    expect(comparison_result.post_improvement_metrics.avg_cooking_time_minutes).toBeGreaterThan(0);
    expect(comparison_result.post_improvement_metrics.user_satisfaction_score_0_to_100).toBeGreaterThanOrEqual(0);
    expect(comparison_result.post_improvement_metrics.user_satisfaction_score_0_to_100).toBeLessThanOrEqual(100);

    // Verify v2.0 success rate is greater than v1.0 success rate (improvement)
    const success_rate_diff = comparison_result.post_improvement_metrics.success_rate_percentage - comparison_result.pre_improvement_metrics.success_rate_percentage;
    expect(success_rate_diff).toBeGreaterThan(0);

    // Verify cooking time reduction (v2.0 should have lower cooking time)
    const cooking_time_reduction = comparison_result.pre_improvement_metrics.avg_cooking_time_minutes - comparison_result.post_improvement_metrics.avg_cooking_time_minutes;
    expect(cooking_time_reduction).toBeGreaterThan(0);

    // Verify v2.0 satisfaction score is greater than v1.0 satisfaction score
    const satisfaction_score_diff = comparison_result.post_improvement_metrics.user_satisfaction_score_0_to_100 - comparison_result.pre_improvement_metrics.user_satisfaction_score_0_to_100;
    expect(satisfaction_score_diff).toBeGreaterThan(0);

    // Verify improvement rate percentages are present and positive
    expect(comparison_result.improvement_rates).toBeDefined();
    expect(typeof comparison_result.improvement_rates.success_rate_improvement_percentage).toBe('number');
    expect(typeof comparison_result.improvement_rates.cooking_time_reduction_percentage).toBe('number');
    expect(typeof comparison_result.improvement_rates.satisfaction_score_improvement_percentage).toBe('number');

    expect(comparison_result.improvement_rates.success_rate_improvement_percentage).toBeGreaterThan(0);
    expect(comparison_result.improvement_rates.cooking_time_reduction_percentage).toBeGreaterThan(0);
    expect(comparison_result.improvement_rates.satisfaction_score_improvement_percentage).toBeGreaterThan(0);

    // Verify improvement rate percentages are within valid ranges
    expect(comparison_result.improvement_rates.success_rate_improvement_percentage).toBeLessThanOrEqual(100);
    expect(comparison_result.improvement_rates.cooking_time_reduction_percentage).toBeLessThanOrEqual(100);
    expect(comparison_result.improvement_rates.satisfaction_score_improvement_percentage).toBeLessThanOrEqual(100);

    // Verify result is serializable to JSON
    const json_string = JSON.stringify(comparison_result);
    expect(typeof json_string).toBe('string');
    expect(json_string.length).toBeGreaterThan(0);

    // Verify JSON can be parsed back
    const parsed_result = JSON.parse(json_string);
    expect(parsed_result.pre_improvement_version).toBe('v1.0');
    expect(parsed_result.post_improvement_version).toBe('v2.0');
    expect(parsed_result.pre_improvement_metrics.success_rate_percentage).toBeDefined();
    expect(parsed_result.post_improvement_metrics.success_rate_percentage).toBeDefined();
    expect(parsed_result.improvement_rates.success_rate_improvement_percentage).toBeDefined();

    // Verify difference values match calculations
    expect(Math.abs(
      comparison_result.improvement_rates.success_rate_improvement_percentage -
      ((success_rate_diff / comparison_result.pre_improvement_metrics.success_rate_percentage) * 100)
    )).toBeLessThan(0.1);

    expect(Math.abs(
      comparison_result.improvement_rates.cooking_time_reduction_percentage -
      ((cooking_time_reduction / comparison_result.pre_improvement_metrics.avg_cooking_time_minutes) * 100)
    )).toBeLessThan(0.1);

    expect(Math.abs(
      comparison_result.improvement_rates.satisfaction_score_improvement_percentage -
      ((satisfaction_score_diff / comparison_result.pre_improvement_metrics.user_satisfaction_score_0_to_100) * 100)
    )).toBeLessThan(0.1);
  });
});