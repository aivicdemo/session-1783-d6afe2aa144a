import { aggregateWeeklyMetrics } from '../../src/logic/it-7-2-1';

describe('it-7-2-1: 週次定量指標集計機能', () => {
  // SCEN-854
  test('献立生成成功率・調理時間短縮度・ユーザー満足度スコアが正常に集計される', () => {
    const now = new Date('2024-01-22T09:00:00Z');
    const sevenDaysAgo = new Date('2024-01-15T09:00:00Z');

    const mealGenerationLogs = [
      {
        user_id: 'user_001',
        generated_at: new Date('2024-01-15T10:00:00Z'),
        status: 'success',
        recommended_cooking_time_minutes: 30,
        actual_cooking_time_minutes: 25,
      },
      {
        user_id: 'user_001',
        generated_at: new Date('2024-01-16T11:00:00Z'),
        status: 'success',
        recommended_cooking_time_minutes: 40,
        actual_cooking_time_minutes: 32,
      },
      {
        user_id: 'user_001',
        generated_at: new Date('2024-01-17T12:00:00Z'),
        status: 'failed',
        recommended_cooking_time_minutes: 35,
        actual_cooking_time_minutes: null,
      },
      {
        user_id: 'user_002',
        generated_at: new Date('2024-01-18T13:00:00Z'),
        status: 'success',
        recommended_cooking_time_minutes: 25,
        actual_cooking_time_minutes: 20,
      },
      {
        user_id: 'user_002',
        generated_at: new Date('2024-01-19T14:00:00Z'),
        status: 'success',
        recommended_cooking_time_minutes: 45,
        actual_cooking_time_minutes: 36,
      },
    ];

    const satisfactionScores = [
      { user_id: 'user_001', score: 5, recorded_at: new Date('2024-01-15T20:00:00Z') },
      { user_id: 'user_001', score: 4, recorded_at: new Date('2024-01-16T20:00:00Z') },
      { user_id: 'user_002', score: 5, recorded_at: new Date('2024-01-18T20:00:00Z') },
      { user_id: 'user_002', score: 4, recorded_at: new Date('2024-01-19T20:00:00Z') },
    ];

    const result = aggregateWeeklyMetrics({
      start_date: sevenDaysAgo,
      end_date: now,
      meal_generation_logs: mealGenerationLogs,
      satisfaction_scores: satisfactionScores,
    });

    expect(result).toBeDefined();
    expect(typeof result.success_rate).toBe('number');
    expect(typeof result.cooking_time_reduction_rate).toBe('number');
    expect(typeof result.user_satisfaction_score).toBe('number');

    expect(result.success_rate).toBe(80);
    expect(result.cooking_time_reduction_rate).toBeCloseTo(18.18, 1);
    expect(result.user_satisfaction_score).toBeCloseTo(4.5, 1);

    expect(result.success_rate).toBeGreaterThanOrEqual(0);
    expect(result.success_rate).toBeLessThanOrEqual(100);

    expect(result.cooking_time_reduction_rate).toBeGreaterThanOrEqual(0);
    expect(result.cooking_time_reduction_rate).toBeLessThanOrEqual(100);

    expect(result.user_satisfaction_score).toBeGreaterThanOrEqual(1);
    expect(result.user_satisfaction_score).toBeLessThanOrEqual(5);

    expect(result.total_attempts).toBe(5);
    expect(result.successful_attempts).toBe(4);
    expect(result.total_time_saved_minutes).toBeCloseTo(12, 1);
    expect(result.satisfaction_sample_size).toBe(4);
  });
});