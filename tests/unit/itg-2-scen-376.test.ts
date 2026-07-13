import { describe, test, expect, beforeEach } from '@jest/globals';
import { aggregateWeeklyMetrics } from '../../src/logic/it-1-br-2-1-1-1';

describe('Weekly Dashboard Aggregation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-376
  test('should correctly aggregate weekly metrics and calculate week-over-week changes', () => {
    const current_week_start = new Date('2024-01-15T00:00:00Z');
    const current_week_end = new Date('2024-01-21T23:59:59Z');
    const previous_week_start = new Date('2024-01-08T00:00:00Z');
    const previous_week_end = new Date('2024-01-14T23:59:59Z');

    const user_id = 'user_123';
    const family_id = 'family_456';

    const previous_week_data = {
      period_start: previous_week_start,
      period_end: previous_week_end,
      success_rate: 75.5,
      cooking_time_reduction: 12.3,
      satisfaction_score: 8.2
    };

    const current_week_data = {
      period_start: current_week_start,
      period_end: current_week_end,
      success_rate: 82.4,
      cooking_time_reduction: 18.7,
      satisfaction_score: 8.9
    };

    const input = {
      user_id,
      family_id,
      current_week_start,
      current_week_end,
      previous_week_start,
      previous_week_end,
      current_week_metrics: current_week_data,
      previous_week_metrics: previous_week_data
    };

    const result = aggregateWeeklyMetrics(input);

    expect(result).toEqual({
      user_id,
      family_id,
      current_week: {
        period_start: current_week_start,
        period_end: current_week_end,
        success_rate: 82.4,
        cooking_time_reduction: 18.7,
        satisfaction_score: 8.9
      },
      previous_week: {
        period_start: previous_week_start,
        period_end: previous_week_end,
        success_rate: 75.5,
        cooking_time_reduction: 12.3,
        satisfaction_score: 8.2
      },
      week_over_week: {
        success_rate_change: 6.9,
        success_rate_change_percent: 9.14,
        success_rate_direction: 'up',
        cooking_time_reduction_change: 6.4,
        cooking_time_reduction_change_percent: 52.03,
        cooking_time_reduction_direction: 'up',
        satisfaction_score_change: 0.7,
        satisfaction_score_change_percent: 8.54,
        satisfaction_score_direction: 'up'
      },
      aggregation_timestamp: expect.any(String)
    });

    expect(result.week_over_week.success_rate_change).toBe(6.9);
    expect(result.week_over_week.success_rate_change_percent).toBeCloseTo(9.14, 2);
    expect(result.week_over_week.cooking_time_reduction_change).toBe(6.4);
    expect(result.week_over_week.cooking_time_reduction_change_percent).toBeCloseTo(52.03, 2);
    expect(result.week_over_week.satisfaction_score_change).toBe(0.7);
    expect(result.week_over_week.satisfaction_score_change_percent).toBeCloseTo(8.54, 2);

    expect(result.week_over_week.success_rate_direction).toBe('up');
    expect(result.week_over_week.cooking_time_reduction_direction).toBe('up');
    expect(result.week_over_week.satisfaction_score_direction).toBe('up');
  });

  test('should handle downward metric changes correctly', () => {
    const current_week_start = new Date('2024-01-22T00:00:00Z');
    const current_week_end = new Date('2024-01-28T23:59:59Z');
    const previous_week_start = new Date('2024-01-15T00:00:00Z');
    const previous_week_end = new Date('2024-01-21T23:59:59Z');

    const user_id = 'user_789';
    const family_id = 'family_101';

    const previous_week_data = {
      period_start: previous_week_start,
      period_end: previous_week_end,
      success_rate: 88.0,
      cooking_time_reduction: 25.5,
      satisfaction_score: 9.1
    };

    const current_week_data = {
      period_start: current_week_start,
      period_end: current_week_end,
      success_rate: 81.2,
      cooking_time_reduction: 19.8,
      satisfaction_score: 8.3
    };

    const input = {
      user_id,
      family_id,
      current_week_start,
      current_week_end,
      previous_week_start,
      previous_week_end,
      current_week_metrics: current_week_data,
      previous_week_metrics: previous_week_data
    };

    const result = aggregateWeeklyMetrics(input);

    expect(result.week_over_week.success_rate_change).toBe(-6.8);
    expect(result.week_over_week.success_rate_direction).toBe('down');
    expect(result.week_over_week.cooking_time_reduction_change).toBe(-5.7);
    expect(result.week_over_week.cooking_time_reduction_direction).toBe('down');
    expect(result.week_over_week.satisfaction_score_change).toBe(-0.8);
    expect(result.week_over_week.satisfaction_score_direction).toBe('down');
  });

  test('should throw error when previous week metrics are missing', () => {
    const current_week_start = new Date('2024-01-15T00:00:00Z');
    const current_week_end = new Date('2024-01-21T23:59:59Z');
    const previous_week_start = new Date('2024-01-08T00:00:00Z');
    const previous_week_end = new Date('2024-01-14T23:59:59Z');

    const input = {
      user_id: 'user_123',
      family_id: 'family_456',
      current_week_start,
      current_week_end,
      previous_week_start,
      previous_week_end,
      current_week_metrics: {
        period_start: current_week_start,
        period_end: current_week_end,
        success_rate: 82.4,
        cooking_time_reduction: 18.7,
        satisfaction_score: 8.9
      },
      previous_week_metrics: null
    };

    expect(() => aggregateWeeklyMetrics(input as any)).toThrow(/前週/);
  });

  test('should throw error when current week metrics are missing', () => {
    const current_week_start = new Date('2024-01-15T00:00:00Z');
    const current_week_end = new Date('2024-01-21T23:59:59Z');
    const previous_week_start = new Date('2024-01-08T00:00:00Z');
    const previous_week_end = new Date('2024-01-14T23:59:59Z');

    const input = {
      user_id: 'user_123',
      family_id: 'family_456',
      current_week_start,
      current_week_end,
      previous_week_start,
      previous_week_end,
      current_week_metrics: null,
      previous_week_metrics: {
        period_start: previous_week_start,
        period_end: previous_week_end,
        success_rate: 75.5,
        cooking_time_reduction: 12.3,
        satisfaction_score: 8.2
      }
    };

    expect(() => aggregateWeeklyMetrics(input as any)).toThrow(/当週/);
  });

  test('should handle zero previous week metrics for percentage calculation', () => {
    const current_week_start = new Date('2024-01-15T00:00:00Z');
    const current_week_end = new Date('2024-01-21T23:59:59Z');
    const previous_week_start = new Date('2024-01-08T00:00:00Z');
    const previous_week_end = new Date('2024-01-14T23:59:59Z');

    const user_id = 'user_999';
    const family_id = 'family_202';

    const previous_week_data = {
      period_start: previous_week_start,
      period_end: previous_week_end,
      success_rate: 0.0,
      cooking_time_reduction: 0.0,
      satisfaction_score: 0.0
    };

    const current_week_data = {
      period_start: current_week_start,
      period_end: current_week_end,
      success_rate: 45.0,
      cooking_time_reduction: 15.5,
      satisfaction_score: 7.2
    };

    const input = {
      user_id,
      family_id,
      current_week_start,
      current_week_end,
      previous_week_start,
      previous_week_end,
      current_week_metrics: current_week_data,
      previous_week_metrics: previous_week_data
    };

    const result = aggregateWeeklyMetrics(input);

    expect(result.week_over_week.success_rate_change).toBe(45.0);
    expect(result.week_over_week.success_rate_direction).toBe('up');
  });

  test('should correctly calculate percentage changes with decimal precision', () => {
    const current_week_start = new Date('2024-02-05T00:00:00Z');
    const current_week_end = new Date('2024-02-11T23:59:59Z');
    const previous_week_start = new Date('2024-01-29T00:00:00Z');
    const previous_week_end = new Date('2024-02-04T23:59:59Z');

    const user_id = 'user_555';
    const family_id = 'family_666';

    const previous_week_data = {
      period_start: previous_week_start,
      period_end: previous_week_end,
      success_rate: 73.33,
      cooking_time_reduction: 14.25,
      satisfaction_score: 7.85
    };

    const current_week_data = {
      period_start: current_week_start,
      period_end: current_week_end,
      success_rate: 79.41,
      cooking_time_reduction: 16.92,
      satisfaction_score: 8.33
    };

    const input = {
      user_id,
      family_id,
      current_week_start,
      current_week_end,
      previous_week_start,
      previous_week_end,
      current_week_metrics: current_week_data,
      previous_week_metrics: previous_week_data
    };

    const result = aggregateWeeklyMetrics(input);

    expect(result.week_over_week.success_rate_change).toBeCloseTo(6.08, 2);
    expect(result.week_over_week.success_rate_change_percent).toBeCloseTo(8.29, 2);
    expect(result.week_over_week.cooking_time_reduction_change).toBeCloseTo(2.67, 2);
    expect(result.week_over_week.cooking_time_reduction_change_percent).toBeCloseTo(18.77, 2);
    expect(result.week_over_week.satisfaction_score_change).toBeCloseTo(0.48, 2);
    expect(result.week_over_week.satisfaction_score_change_percent).toBeCloseTo(6.11, 2);
  });
});