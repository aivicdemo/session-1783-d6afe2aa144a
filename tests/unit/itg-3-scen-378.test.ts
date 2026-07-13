import { aggregateWeeklyMenuGenerationReport } from '../../src/logic/it-1-br-3-2-1';

describe('Weekly Menu Generation Report Aggregation', () => {
  // SCEN-378
  test('should correctly calculate week-over-week metrics for menu generation success rate, cooking time reduction, and satisfaction score', () => {
    const previousWeekReport = {
      week_start_date: new Date('2024-01-08T00:00:00Z'),
      week_end_date: new Date('2024-01-14T23:59:59Z'),
      generation_success_rate: 0.85,
      average_cooking_time_minutes: 45,
      satisfaction_score: 4.2,
    };

    const currentWeekReport = {
      week_start_date: new Date('2024-01-15T00:00:00Z'),
      week_end_date: new Date('2024-01-21T23:59:59Z'),
      generation_success_rate: 0.92,
      average_cooking_time_minutes: 38,
      satisfaction_score: 4.5,
    };

    const result = aggregateWeeklyMenuGenerationReport(
      previousWeekReport,
      currentWeekReport
    );

    expect(result.success_rate_improvement).toBe(0.07);
    expect(result.cooking_time_reduction_minutes).toBe(7);
    expect(result.satisfaction_score_improvement).toBe(0.3);
    expect(result.current_week_success_rate).toBe(0.92);
    expect(result.current_week_average_cooking_time_minutes).toBe(38);
    expect(result.current_week_satisfaction_score).toBe(4.5);
    expect(result.aggregation_timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );
    expect(new Date(result.aggregation_timestamp)).toBeInstanceOf(Date);
    expect(
      new Date(result.aggregation_timestamp).getTime()
    ).toBeLessThanOrEqual(new Date().getTime());
  });
});