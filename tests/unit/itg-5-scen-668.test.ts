import { aggregateWeeklyBehaviorMetrics } from '../../src/logic/it-7-2-1';

describe('Weekly Behavior Metrics Aggregation - Boundary Value Test', () => {
  test('SCEN-668: week_boundary_timestamps_correctly_aggregated', () => {
    // Target week: 2024-01-08 (Monday) to 2024-01-14 (Sunday)
    const weekStartDate = new Date('2024-01-08T00:00:00Z');
    const weekEndDate = new Date('2024-01-14T23:59:59Z');

    // Records on week boundary
    const recordOnMondayStart = {
      user_id: 'user_001',
      action_timestamp: new Date('2024-01-08T00:00:00Z'),
      action_type: 'menu_generated',
      success_flag: true,
      satisfaction_score: 85,
      cooking_time_minutes: 35,
    };

    const recordOnSundayEnd = {
      user_id: 'user_001',
      action_timestamp: new Date('2024-01-14T23:59:59Z'),
      action_type: 'menu_confirmed',
      success_flag: true,
      satisfaction_score: 90,
      cooking_time_minutes: 30,
    };

    // Records outside week boundary
    const recordBeforePreviousSunday = {
      user_id: 'user_001',
      action_timestamp: new Date('2024-01-07T23:59:59Z'),
      action_type: 'menu_generated',
      success_flag: true,
      satisfaction_score: 80,
      cooking_time_minutes: 40,
    };

    const recordAfterNextMonday = {
      user_id: 'user_001',
      action_timestamp: new Date('2024-01-15T00:00:00Z'),
      action_type: 'menu_generated',
      success_flag: true,
      satisfaction_score: 88,
      cooking_time_minutes: 32,
    };

    // Additional records within week boundaries
    const recordMidweekWednesday = {
      user_id: 'user_001',
      action_timestamp: new Date('2024-01-10T14:30:00Z'),
      action_type: 'menu_rejected',
      success_flag: false,
      satisfaction_score: 50,
      cooking_time_minutes: 60,
    };

    const recordMidweekThursday = {
      user_id: 'user_001',
      action_timestamp: new Date('2024-01-11T10:15:00Z'),
      action_type: 'menu_modified',
      success_flag: true,
      satisfaction_score: 78,
      cooking_time_minutes: 45,
    };

    // Prepare input data with all records (boundary and non-boundary)
    const allRecords = [
      recordBeforePreviousSunday,
      recordOnMondayStart,
      recordMidweekWednesday,
      recordMidweekThursday,
      recordOnSundayEnd,
      recordAfterNextMonday,
    ];

    // Execute aggregation function
    const aggregationResult = aggregateWeeklyBehaviorMetrics({
      records: allRecords,
      week_start_date: weekStartDate,
      week_end_date: weekEndDate,
    });

    // Verify that boundary records are included
    expect(aggregationResult.included_record_count).toBe(4);
    expect(aggregationResult.excluded_record_count).toBe(2);

    // Verify exact aggregated metrics
    const expectedSuccessRate =
      (3 / 4) * 100; // 3 successful out of 4 included records
    expect(aggregationResult.success_rate_percentage).toBe(75);

    const expectedAvgSatisfaction =
      (85 + 50 + 78 + 90) / 4; // Average of all 4 included records
    expect(aggregationResult.average_satisfaction_score).toBeCloseTo(75.75, 2);

    const expectedAvgCookingTime =
      (35 + 60 + 45 + 30) / 4; // Average cooking time of 4 included records
    expect(aggregationResult.average_cooking_time_minutes).toBeCloseTo(42.5, 2);

    // Verify record inclusion/exclusion details
    expect(aggregationResult.included_timestamps).toEqual([
      new Date('2024-01-08T00:00:00Z'),
      new Date('2024-01-10T14:30:00Z'),
      new Date('2024-01-11T10:15:00Z'),
      new Date('2024-01-14T23:59:59Z'),
    ]);

    expect(aggregationResult.excluded_timestamps).toEqual([
      new Date('2024-01-07T23:59:59Z'),
      new Date('2024-01-15T00:00:00Z'),
    ]);

    // Verify no duplicates
    expect(
      new Set(aggregationResult.included_timestamps).size ===
        aggregationResult.included_timestamps.length
    ).toBe(true);

    // Verify aggregation period correctness
    expect(aggregationResult.aggregation_period_start).toEqual(weekStartDate);
    expect(aggregationResult.aggregation_period_end).toEqual(weekEndDate);

    // Multi-week verification: test with data spanning 3 weeks
    const week1Start = new Date('2024-01-01T00:00:00Z');
    const week1End = new Date('2024-01-07T23:59:59Z');
    const week2Start = new Date('2024-01-08T00:00:00Z');
    const week2End = new Date('2024-01-14T23:59:59Z');
    const week3Start = new Date('2024-01-15T00:00:00Z');
    const week3End = new Date('2024-01-21T23:59:59Z');

    const multiWeekRecords = [
      {
        user_id: 'user_002',
        action_timestamp: new Date('2024-01-01T00:00:00Z'),
        action_type: 'menu_generated',
        success_flag: true,
        satisfaction_score: 82,
        cooking_time_minutes: 38,
      },
      {
        user_id: 'user_002',
        action_timestamp: new Date('2024-01-07T23:59:59Z'),
        action_type: 'menu_confirmed',
        success_flag: true,
        satisfaction_score: 88,
        cooking_time_minutes: 32,
      },
      {
        user_id: 'user_002',
        action_timestamp: new Date('2024-01-08T00:00:00Z'),
        action_type: 'menu_generated',
        success_flag: true,
        satisfaction_score: 85,
        cooking_time_minutes: 35,
      },
      {
        user_id: 'user_002',
        action_timestamp: new Date('2024-01-14T23:59:59Z'),
        action_type: 'menu_confirmed',
        success_flag: true,
        satisfaction_score: 90,
        cooking_time_minutes: 30,
      },
      {
        user_id: 'user_002',
        action_timestamp: new Date('2024-01-15T00:00:00Z'),
        action_type: 'menu_generated',
        success_flag: true,
        satisfaction_score: 87,
        cooking_time_minutes: 33,
      },
      {
        user_id: 'user_002',
        action_timestamp: new Date('2024-01-21T23:59:59Z'),
        action_type: 'menu_confirmed',
        success_flag: true,
        satisfaction_score: 91,
        cooking_time_minutes: 28,
      },
    ];

    // Verify Week 2 aggregation from multi-week data
    const week2Result = aggregateWeeklyBehaviorMetrics({
      records: multiWeekRecords,
      week_start_date: week2Start,
      week_end_date: week2End,
    });

    expect(week2Result.included_record_count).toBe(2); // Only records on 2024-01-08 and 2024-01-14
    expect(week2Result.excluded_record_count).toBe(4);
    expect(week2Result.average_satisfaction_score).toBeCloseTo(87.5, 2);
    expect(week2Result.average_cooking_time_minutes).toBeCloseTo(32.5, 2);

    // Verify Week 1 aggregation
    const week1Result = aggregateWeeklyBehaviorMetrics({
      records: multiWeekRecords,
      week_start_date: week1Start,
      week_end_date: week1End,
    });

    expect(week1Result.included_record_count).toBe(2); // Only records on 2024-01-01 and 2024-01-07
    expect(week1Result.excluded_record_count).toBe(4);

    // Verify Week 3 aggregation
    const week3Result = aggregateWeeklyBehaviorMetrics({
      records: multiWeekRecords,
      week_start_date: week3Start,
      week_end_date: week3End,
    });

    expect(week3Result.included_record_count).toBe(2); // Only records on 2024-01-15 and 2024-01-21
    expect(week3Result.excluded_record_count).toBe(4);
  });
});