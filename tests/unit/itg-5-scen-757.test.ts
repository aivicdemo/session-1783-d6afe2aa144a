import { calculateSeasonalTrendApproval } from '../../src/logic/it-7-2-1';

describe('購買傾向承認判定機能', () => {
  // SCEN-757: [normal] 購買傾向承認判定機能 - 季節変動・曜日別購買傾向データから承認判定が実行され反映方針が決定される
  test('季節変動・曜日別購買傾向データから承認判定が実行され反映方針が決定される', () => {
    const seasonal_trend_data = {
      spring_purchase_rate: 0.22,
      summer_purchase_rate: 0.18,
      autumn_purchase_rate: 0.35,
      winter_purchase_rate: 0.25,
      spring_avg_basket_size: 2800,
      summer_avg_basket_size: 2200,
      autumn_avg_basket_size: 3100,
      winter_avg_basket_size: 3400,
    };

    const weekday_trend_data = {
      monday_purchase_rate: 0.15,
      tuesday_purchase_rate: 0.12,
      wednesday_purchase_rate: 0.11,
      thursday_purchase_rate: 0.14,
      friday_purchase_rate: 0.18,
      saturday_purchase_rate: 0.20,
      sunday_purchase_rate: 0.10,
      monday_avg_basket_size: 3000,
      tuesday_avg_basket_size: 2600,
      wednesday_avg_basket_size: 2500,
      thursday_avg_basket_size: 2900,
      friday_avg_basket_size: 3200,
      saturday_avg_basket_size: 3400,
      sunday_avg_basket_size: 2200,
    };

    const input = {
      seasonal_data: seasonal_trend_data,
      weekday_data: weekday_trend_data,
      approval_threshold_score: 0.75,
      sample_size: 1000,
      analysis_period_days: 90,
    };

    const result = calculateSeasonalTrendApproval(input);

    expect(result).toEqual({
      approval_status: 'APPROVED',
      overall_score: 0.82,
      seasonal_score: 0.85,
      weekday_score: 0.79,
      dominant_season: 'autumn',
      seasonal_peak_purchase_rate: 0.35,
      seasonal_peak_basket_size: 3100,
      dominant_weekday: 'saturday',
      weekday_peak_purchase_rate: 0.20,
      weekday_peak_basket_size: 3400,
      reflection_policy_details: {
        implementation_priority: 1,
        target_algorithm_version: 'v2.3.1',
        seasonal_adjustment_enabled: true,
        weekday_adjustment_enabled: true,
        autumn_menu_emphasis_ratio: 0.40,
        weekend_inventory_boost_ratio: 0.15,
        recommended_deployment_date: '2024-02-15T09:00:00Z',
        estimated_impact_on_satisfaction_score: 0.12,
        estimated_impact_on_cost_reduction_percent: 8.5,
      },
      quality_metrics: {
        data_completeness_percent: 100,
        statistical_significance_level: 0.95,
        confidence_interval_margin: 0.03,
      },
      next_review_date: '2024-05-15T09:00:00Z',
    });

    expect(result.approval_status).toBe('APPROVED');
    expect(result.overall_score).toBeGreaterThanOrEqual(input.approval_threshold_score);
    expect(result.seasonal_score).toBeGreaterThan(0);
    expect(result.seasonal_score).toBeLessThanOrEqual(1);
    expect(result.weekday_score).toBeGreaterThan(0);
    expect(result.weekday_score).toBeLessThanOrEqual(1);
    expect(result.reflection_policy_details.seasonal_adjustment_enabled).toBe(true);
    expect(result.reflection_policy_details.weekday_adjustment_enabled).toBe(true);
    expect(result.quality_metrics.data_completeness_percent).toBe(100);
  });
});