import { generateWeeklyReport } from "../../src/logic/it-2";

describe("Weekly Report Generation - Effect Difference Normalization (SCEN-394)", () => {
  test("should normalize effect difference to 0-100% range across all cases", () => {
    // SCEN-394: Edge case - Weekly report effect difference normalized to 0-100% range

    // Case 1: Effect difference = 0% (no improvement)
    // Previous week success rate: 80%, Current week success rate: 80%
    // Expected normalized effect: 0%
    const input_case1 = {
      previous_week_success_rate: 80,
      current_week_success_rate: 80,
      previous_week_cooking_time_shortening_rate: 60,
      current_week_cooking_time_shortening_rate: 60,
      previous_week_satisfaction_score: 75,
      current_week_satisfaction_score: 75,
      report_period_start: new Date("2024-01-08"),
      report_period_end: new Date("2024-01-14"),
    };

    const result_case1 = generateWeeklyReport(input_case1);
    expect(result_case1.normalized_effect_difference_percent).toBe(0);
    expect(result_case1.success_rate_change_percent).toBe(0);

    // Case 2: Effect difference = 100% (maximum improvement from 0)
    // Previous week success rate: 0%, Current week success rate: 100%
    // Expected normalized effect: 100%
    const input_case2 = {
      previous_week_success_rate: 0,
      current_week_success_rate: 100,
      previous_week_cooking_time_shortening_rate: 0,
      current_week_cooking_time_shortening_rate: 100,
      previous_week_satisfaction_score: 0,
      current_week_satisfaction_score: 100,
      report_period_start: new Date("2024-01-15"),
      report_period_end: new Date("2024-01-21"),
    };

    const result_case2 = generateWeeklyReport(input_case2);
    expect(result_case2.normalized_effect_difference_percent).toBe(100);
    expect(result_case2.success_rate_change_percent).toBe(100);

    // Case 3: Effect difference = 50% (midpoint improvement)
    // Previous week success rate: 50%, Current week success rate: 100%
    // Expected normalized effect: 50%
    const input_case3 = {
      previous_week_success_rate: 50,
      current_week_success_rate: 100,
      previous_week_cooking_time_shortening_rate: 30,
      current_week_cooking_time_shortening_rate: 80,
      previous_week_satisfaction_score: 50,
      current_week_satisfaction_score: 100,
      report_period_start: new Date("2024-01-22"),
      report_period_end: new Date("2024-01-28"),
    };

    const result_case3 = generateWeeklyReport(input_case3);
    expect(result_case3.normalized_effect_difference_percent).toBe(50);

    // Case 4: Edge case - Negative improvement (degradation) should normalize to 0%
    // Previous week success rate: 100%, Current week success rate: 50%
    // Degradation should be clamped to minimum normalized value of 0%
    const input_case4 = {
      previous_week_success_rate: 100,
      current_week_success_rate: 50,
      previous_week_cooking_time_shortening_rate: 100,
      current_week_cooking_time_shortening_rate: 50,
      previous_week_satisfaction_score: 100,
      current_week_satisfaction_score: 50,
      report_period_start: new Date("2024-02-05"),
      report_period_end: new Date("2024-02-11"),
    };

    const result_case4 = generateWeeklyReport(input_case4);
    expect(result_case4.normalized_effect_difference_percent).toBeGreaterThanOrEqual(0);
    expect(result_case4.normalized_effect_difference_percent).toBeLessThanOrEqual(100);

    // Case 5: Edge case - Extreme overshoot (value > 100 before normalization)
    // Should normalize to maximum of 100%
    // Previous week: minimal performance, Current week: extreme improvement
    const input_case5 = {
      previous_week_success_rate: 0,
      current_week_success_rate: 95,
      previous_week_cooking_time_shortening_rate: 5,
      current_week_cooking_time_shortening_rate: 95,
      previous_week_satisfaction_score: 10,
      current_week_satisfaction_score: 95,
      report_period_start: new Date("2024-02-12"),
      report_period_end: new Date("2024-02-18"),
    };

    const result_case5 = generateWeeklyReport(input_case5);
    expect(result_case5.normalized_effect_difference_percent).toBeLessThanOrEqual(100);
    expect(result_case5.normalized_effect_difference_percent).toBeGreaterThanOrEqual(0);

    // Verify all results are within valid range
    [result_case1, result_case2, result_case3, result_case4, result_case5].forEach(
      (result) => {
        expect(result.normalized_effect_difference_percent).toBeGreaterThanOrEqual(0);
        expect(result.normalized_effect_difference_percent).toBeLessThanOrEqual(100);
        expect(typeof result.normalized_effect_difference_percent).toBe("number");
      }
    );

    // Verify cooking time shortening and satisfaction scores are also normalized
    expect(result_case2.cooking_time_shortening_change_percent).toBe(100);
    expect(result_case2.satisfaction_score_change_percent).toBe(100);

    expect(result_case3.cooking_time_shortening_change_percent).toBe(50);
    expect(result_case3.satisfaction_score_change_percent).toBe(50);
  });
});