import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  recordFoodEvaluation,
  retrieveFoodEvaluationTimeSeries,
} from '../../src/logic/it-1-br-3-2-1';

describe('Purchase record and monthly food expense savings analysis aggregation', () => {
  // SCEN-342
  test('Food evaluation data time-series accumulation and management - family members submitted evaluation data is correctly accumulated in chronological order', () => {
    const evaluationA = {
      family_member_id: 'FM001',
      family_member_name: 'Family Member A',
      meal_date: '2024-01-15',
      meal_time: '2024-01-15T18:00:00Z',
      satisfaction_score: 8,
      completion_rate: 90,
      request_content: null,
      recorded_at: '2024-01-15T18:30:00Z',
    };

    const evaluationB = {
      family_member_id: 'FM002',
      family_member_name: 'Family Member B',
      meal_date: '2024-01-15',
      meal_time: '2024-01-15T18:00:00Z',
      satisfaction_score: 7,
      completion_rate: 100,
      request_content: 'low salt',
      recorded_at: '2024-01-15T18:35:00Z',
    };

    const evaluationC = {
      family_member_id: 'FM003',
      family_member_name: 'Family Member C',
      meal_date: '2024-01-15',
      meal_time: '2024-01-15T18:00:00Z',
      satisfaction_score: 9,
      completion_rate: 85,
      request_content: 'more volume',
      recorded_at: '2024-01-15T18:40:00Z',
    };

    const evaluationA_day2 = {
      family_member_id: 'FM001',
      family_member_name: 'Family Member A',
      meal_date: '2024-01-16',
      meal_time: '2024-01-16T18:00:00Z',
      satisfaction_score: 8,
      completion_rate: 95,
      request_content: null,
      recorded_at: '2024-01-16T18:32:00Z',
    };

    // Record evaluations
    const result_A = recordFoodEvaluation(evaluationA);
    expect(result_A).toEqual({
      success: true,
      evaluation_id: expect.any(String),
      family_member_id: 'FM001',
      recorded_at: '2024-01-15T18:30:00Z',
    });

    const result_B = recordFoodEvaluation(evaluationB);
    expect(result_B).toEqual({
      success: true,
      evaluation_id: expect.any(String),
      family_member_id: 'FM002',
      recorded_at: '2024-01-15T18:35:00Z',
    });

    const result_C = recordFoodEvaluation(evaluationC);
    expect(result_C).toEqual({
      success: true,
      evaluation_id: expect.any(String),
      family_member_id: 'FM003',
      recorded_at: '2024-01-15T18:40:00Z',
    });

    const result_A_day2 = recordFoodEvaluation(evaluationA_day2);
    expect(result_A_day2).toEqual({
      success: true,
      evaluation_id: expect.any(String),
      family_member_id: 'FM001',
      recorded_at: '2024-01-16T18:32:00Z',
    });

    // Retrieve time-series data
    const time_series_data = retrieveFoodEvaluationTimeSeries({
      start_date: '2024-01-15',
      end_date: '2024-01-16',
      order_by: 'recorded_at_asc',
    });

    // Verify time-series order
    expect(time_series_data).toEqual({
      total_records: 4,
      evaluations: [
        {
          evaluation_id: expect.any(String),
          family_member_id: 'FM001',
          family_member_name: 'Family Member A',
          meal_date: '2024-01-15',
          satisfaction_score: 8,
          completion_rate: 90,
          request_content: null,
          recorded_at: '2024-01-15T18:30:00Z',
        },
        {
          evaluation_id: expect.any(String),
          family_member_id: 'FM002',
          family_member_name: 'Family Member B',
          meal_date: '2024-01-15',
          satisfaction_score: 7,
          completion_rate: 100,
          request_content: 'low salt',
          recorded_at: '2024-01-15T18:35:00Z',
        },
        {
          evaluation_id: expect.any(String),
          family_member_id: 'FM003',
          family_member_name: 'Family Member C',
          meal_date: '2024-01-15',
          satisfaction_score: 9,
          completion_rate: 85,
          request_content: 'more volume',
          recorded_at: '2024-01-15T18:40:00Z',
        },
        {
          evaluation_id: expect.any(String),
          family_member_id: 'FM001',
          family_member_name: 'Family Member A',
          meal_date: '2024-01-16',
          satisfaction_score: 8,
          completion_rate: 95,
          request_content: null,
          recorded_at: '2024-01-16T18:32:00Z',
        },
      ],
    });

    // Verify each evaluation has sender info, timestamp, and content
    time_series_data.evaluations.forEach((eval_record: any) => {
      expect(eval_record.family_member_id).toBeDefined();
      expect(eval_record.family_member_name).toBeDefined();
      expect(eval_record.recorded_at).toBeDefined();
      expect(eval_record.satisfaction_score).toBeGreaterThanOrEqual(0);
      expect(eval_record.satisfaction_score).toBeLessThanOrEqual(10);
      expect(eval_record.completion_rate).toBeGreaterThanOrEqual(0);
      expect(eval_record.completion_rate).toBeLessThanOrEqual(100);
    });

    // Verify chronological order is maintained
    const timestamps = time_series_data.evaluations.map(
      (e: any) => new Date(e.recorded_at).getTime()
    );
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1]);
    }

    // Verify continuous accumulation across multiple days
    const day1_count = time_series_data.evaluations.filter(
      (e: any) => e.meal_date === '2024-01-15'
    ).length;
    const day2_count = time_series_data.evaluations.filter(
      (e: any) => e.meal_date === '2024-01-16'
    ).length;

    expect(day1_count).toBe(3);
    expect(day2_count).toBe(1);
    expect(day1_count + day2_count).toBe(4);
  });
});