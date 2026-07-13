import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fetchMock from 'jest-fetch-mock';
import { analyzeMonthlyFoodExpenseExcess } from '../../src/logic/it-1-br-3-2-1';

fetchMock.enableMocks();

describe('Purchase Record and Monthly Food Expense Analysis', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-412
  test('should return empty dashboard state when no meal record and purchase record exist for selected month', async () => {
    const user_id = 'user_001';
    const target_year = 2024;
    const target_month = 3;

    const mockEmptyMealRecords = {
      data: [],
      count: 0,
    };

    const mockEmptyPurchaseRecords = {
      data: [],
      count: 0,
    };

    const mockEmptyExpenseOverageAnalysis = {
      dashboard_id: 'dashboard_20240301_user_001',
      user_id: user_id,
      target_year: target_year,
      target_month: target_month,
      meal_records: [],
      purchase_records: [],
      budget_limit: 0,
      actual_expense: 0,
      overage_amount: 0,
      overage_rate: 0,
      overage_factor_analysis: [],
      food_category_breakdown: [],
      unit_price_variance: [],
      graphs: {
        category_chart: null,
        unit_price_chart: null,
        timeline_chart: null,
      },
      status: 'no_data',
      message: 'No meal records and purchase records available for the selected month',
      http_status: 200,
      generated_at: '2024-03-31T23:59:59Z',
    };

    fetchMock.mockResponseOnce(
      JSON.stringify({
        meal_records: mockEmptyMealRecords,
      }),
      { status: 200 }
    );

    fetchMock.mockResponseOnce(
      JSON.stringify({
        purchase_records: mockEmptyPurchaseRecords,
      }),
      { status: 200 }
    );

    fetchMock.mockResponseOnce(
      JSON.stringify(mockEmptyExpenseOverageAnalysis),
      { status: 200 }
    );

    const result = await analyzeMonthlyFoodExpenseExcess({
      user_id: user_id,
      target_year: target_year,
      target_month: target_month,
    });

    expect(result.user_id).toBe(user_id);
    expect(result.target_year).toBe(2024);
    expect(result.target_month).toBe(3);
    expect(result.status).toBe('no_data');
    expect(result.meal_records.length).toBe(0);
    expect(result.purchase_records.length).toBe(0);
    expect(result.actual_expense).toBe(0);
    expect(result.overage_amount).toBe(0);
    expect(result.overage_rate).toBe(0);
    expect(result.overage_factor_analysis.length).toBe(0);
    expect(result.food_category_breakdown.length).toBe(0);
    expect(result.unit_price_variance.length).toBe(0);
    expect(result.graphs.category_chart).toBeNull();
    expect(result.graphs.unit_price_chart).toBeNull();
    expect(result.graphs.timeline_chart).toBeNull();
    expect(result.message).toBe(
      'No meal records and purchase records available for the selected month'
    );
    expect(result.http_status).toBe(200);
  });
});