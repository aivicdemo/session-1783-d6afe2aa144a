import { fetchWeeklyMetrics } from '../../src/logic/it-7-2-1';

describe('献立生成の成功率・調理時間短縮度・ユーザー満足度スコアなどの行動指標を週次で自動集計し、アルゴリズム改善前後の効果差を定量比較するダッシュボード機能', () => {
  // SCEN-529: [normal] 献立生成要求処理 - 定期スケジュール発火時に制約条件が正常に取得される
  test('should fetch and validate all constraints on scheduled trigger, display on dashboard with no errors', async () => {
    const fetchMock = require('jest-fetch-mock');
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    const scheduledTime = new Date('2024-01-15T11:00:00Z');
    const constraints = {
      nutrition_min_calories: 1800,
      nutrition_max_calories: 2500,
      nutrition_min_protein_g: 50,
      nutrition_max_protein_g: 120,
      nutrition_min_carbs_g: 200,
      nutrition_max_carbs_g: 350,
      nutrition_min_fat_g: 40,
      nutrition_max_fat_g: 80,
      allergen_exclusions: ['peanut', 'shellfish', 'tree_nut'],
      food_category_restrictions: ['red_meat', 'processed_meat'],
      budget_max_yen: 2500,
      cooking_time_max_minutes: 45,
    };

    const metricsResponse = {
      week_start_date: '2024-01-08',
      week_end_date: '2024-01-14',
      meal_plan_success_rate: 0.88,
      cooking_time_reduction_rate: 0.15,
      user_satisfaction_score: 4.2,
      before_improvement_success_rate: 0.82,
      before_improvement_cooking_time_reduction_rate: 0.08,
      before_improvement_satisfaction_score: 3.9,
      success_rate_improvement_delta: 0.06,
      cooking_time_reduction_improvement_delta: 0.07,
      satisfaction_score_improvement_delta: 0.3,
      total_meal_plans_generated: 14,
      successful_meal_plans: 12,
      rejected_meal_plans: 2,
      average_cooking_time_minutes: 38,
      average_satisfaction_rating: 4.2,
    };

    fetchMock.mockResponseOnce(JSON.stringify(metricsResponse), { status: 200 });

    const result = await fetchWeeklyMetrics({
      user_id: 'user_001',
      scheduled_trigger_time: scheduledTime,
      constraints: constraints,
      week_start: new Date('2024-01-08'),
      week_end: new Date('2024-01-14'),
    });

    expect(result).toEqual({
      week_start_date: '2024-01-08',
      week_end_date: '2024-01-14',
      meal_plan_success_rate: 0.88,
      cooking_time_reduction_rate: 0.15,
      user_satisfaction_score: 4.2,
      before_improvement_success_rate: 0.82,
      before_improvement_cooking_time_reduction_rate: 0.08,
      before_improvement_satisfaction_score: 3.9,
      success_rate_improvement_delta: 0.06,
      cooking_time_reduction_improvement_delta: 0.07,
      satisfaction_score_improvement_delta: 0.3,
      total_meal_plans_generated: 14,
      successful_meal_plans: 12,
      rejected_meal_plans: 2,
      average_cooking_time_minutes: 38,
      average_satisfaction_rating: 4.2,
    });

    expect(result.meal_plan_success_rate).toBe(0.88);
    expect(result.cooking_time_reduction_rate).toBe(0.15);
    expect(result.user_satisfaction_score).toBe(4.2);

    expect(result.success_rate_improvement_delta).toBeCloseTo(0.06, 2);
    expect(result.cooking_time_reduction_improvement_delta).toBeCloseTo(0.07, 2);
    expect(result.satisfaction_score_improvement_delta).toBeCloseTo(0.3, 1);

    expect(result.total_meal_plans_generated).toBe(14);
    expect(result.successful_meal_plans).toBe(12);
    expect(result.rejected_meal_plans).toBe(2);

    expect(result.average_cooking_time_minutes).toBe(38);
    expect(result.average_satisfaction_rating).toBe(4.2);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('metrics');
  });
});