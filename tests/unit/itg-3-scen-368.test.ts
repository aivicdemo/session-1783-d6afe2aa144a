import { optimizeMealWithInventory } from '../../src/logic/it-1-br-6-2-1-1';

describe('食材流通業者・スーパーの在庫・価格データ連携インターフェース', () => {
  // SCEN-368: [edge] 流通業者在庫・価格データ連携による献立最適化機能 - 在庫がゼロ件または全食材が欠品状態のとき、代替献立案の提示が正常に動作する
  test('should handle zero inventory or all-items-out-of-stock state gracefully and return alternative meal plans', async () => {
    const fetchMock = require('jest-fetch-mock');
    fetchMock.resetMocks();

    const user_id = 'usr_001';
    const family_id = 'fam_001';
    const meal_generation_request_id = 'req_20240115_001';
    const preferred_budget_yen = 3000;
    const preferred_cooking_time_minutes = 45;
    const target_nutrition_calories = 2000;
    const target_nutrition_protein_g = 75;
    const allergen_exclusion_list = ['えび', 'かに'];
    const dietary_restriction_list = ['グルテンフリー'];
    const max_response_time_ms = 5000;

    // Case 1: Zero inventory records from all distributors
    fetchMock.mockResponseOnce(
      JSON.stringify({
        distributor_id: 'dist_001',
        inventory_records: [],
        last_sync_at: '2024-01-15T10:00:00Z',
      }),
      { status: 200 }
    );

    fetchMock.mockResponseOnce(
      JSON.stringify({
        distributor_id: 'dist_002',
        inventory_records: [],
        last_sync_at: '2024-01-15T10:00:00Z',
      }),
      { status: 200 }
    );

    const start_time_ms = Date.now();

    const result_case_1 = await optimizeMealWithInventory({
      user_id,
      family_id,
      meal_generation_request_id,
      preferred_budget_yen,
      preferred_cooking_time_minutes,
      target_nutrition_calories,
      target_nutrition_protein_g,
      allergen_exclusion_list,
      dietary_restriction_list,
      distributor_ids: ['dist_001', 'dist_002'],
    });

    const response_time_ms = Date.now() - start_time_ms;

    // Assertion 1: Alternative meal plan or notification message is provided
    expect(result_case_1).toHaveProperty('alternative_meal_plan_provided');
    expect(result_case_1.alternative_meal_plan_provided).toBe(true);

    // Assertion 2: Message is clear about unavailable ingredients
    expect(result_case_1).toHaveProperty('status_message');
    expect(result_case_1.status_message).toMatch(/利用可能な食材|代替献立|在庫不足/);

    // Assertion 3: No system exception occurred
    expect(result_case_1).toHaveProperty('system_error_occurred');
    expect(result_case_1.system_error_occurred).toBe(false);

    // Assertion 4: Warning log is output
    expect(result_case_1).toHaveProperty('warning_logs');
    expect(Array.isArray(result_case_1.warning_logs)).toBe(true);
    expect(result_case_1.warning_logs.length).toBeGreaterThan(0);
    expect(result_case_1.warning_logs[0]).toMatch(/在庫ゼロ|在庫不足|欠品/);

    // Assertion 5: Response time is within SLA limit
    expect(response_time_ms).toBeLessThanOrEqual(max_response_time_ms);

    // Assertion 6: Next action suggestions are provided
    expect(result_case_1).toHaveProperty('suggested_next_actions');
    expect(Array.isArray(result_case_1.suggested_next_actions)).toBe(true);
    expect(result_case_1.suggested_next_actions.length).toBeGreaterThan(0);

    // Case 2: All food items in inventory are out-of-stock
    fetchMock.resetMocks();

    fetchMock.mockResponseOnce(
      JSON.stringify({
        distributor_id: 'dist_001',
        inventory_records: [
          {
            food_item_id: 'item_001',
            food_item_name: 'トマト',
            available_quantity: 0,
            unit: '個',
            expiration_date: '2024-01-20T23:59:59Z',
          },
          {
            food_item_id: 'item_002',
            food_item_name: 'レタス',
            available_quantity: 0,
            unit: 'g',
            expiration_date: '2024-01-18T23:59:59Z',
          },
        ],
        last_sync_at: '2024-01-15T10:30:00Z',
      }),
      { status: 200 }
    );

    fetchMock.mockResponseOnce(
      JSON.stringify({
        distributor_id: 'dist_002',
        inventory_records: [
          {
            food_item_id: 'item_003',
            food_item_name: 'ニンジン',
            available_quantity: 0,
            unit: 'kg',
            expiration_date: '2024-01-22T23:59:59Z',
          },
        ],
        last_sync_at: '2024-01-15T10:30:00Z',
      }),
      { status: 200 }
    );

    const start_time_ms_case2 = Date.now();

    const result_case_2 = await optimizeMealWithInventory({
      user_id,
      family_id,
      meal_generation_request_id: `${meal_generation_request_id}_case2`,
      preferred_budget_yen,
      preferred_cooking_time_minutes,
      target_nutrition_calories,
      target_nutrition_protein_g,
      allergen_exclusion_list,
      dietary_restriction_list,
      distributor_ids: ['dist_001', 'dist_002'],
    });

    const response_time_ms_case2 = Date.now() - start_time_ms_case2;

    // Assertion 7: Alternative meal plan is provided for out-of-stock case
    expect(result_case_2).toHaveProperty('alternative_meal_plan_provided');
    expect(result_case_2.alternative_meal_plan_provided).toBe(true);

    // Assertion 8: Status message indicates stock unavailability
    expect(result_case_2).toHaveProperty('status_message');
    expect(result_case_2.status_message).toMatch(/全食材欠品|利用可能な食材がありません/);

    // Assertion 9: No exception in out-of-stock scenario
    expect(result_case_2).toHaveProperty('system_error_occurred');
    expect(result_case_2.system_error_occurred).toBe(false);

    // Assertion 10: Warning log contains out-of-stock details
    expect(result_case_2).toHaveProperty('warning_logs');
    expect(result_case_2.warning_logs.length).toBeGreaterThan(0);
    expect(result_case_2.warning_logs.some((log: string) => log.match(/欠品|在庫ゼロ/))).toBe(true);

    // Assertion 11: Response time is within acceptable range for out-of-stock case
    expect(response_time_ms_case2).toBeLessThanOrEqual(max_response_time_ms);

    // Assertion 12: Next action suggestions provided for out-of-stock case
    expect(result_case_2).toHaveProperty('suggested_next_actions');
    expect(result_case_2.suggested_next_actions.length).toBeGreaterThan(0);
    expect(result_case_2.suggested_next_actions.some((action: string) => action.match(/条件変更|食材登録|代替食材/))).toBe(true);

    // Assertion 13: Generated meal plan exists in response
    expect(result_case_2).toHaveProperty('generated_meal_plan');
    expect(result_case_2.generated_meal_plan).toBeDefined();

    // Assertion 14: Generated meal plan contains valid meal data
    expect(result_case_2.generated_meal_plan).toHaveProperty('meal_id');
    expect(result_case_2.generated_meal_plan.meal_id).toMatch(/^meal_/);

    // Assertion 15: Budget is respected in alternative plan
    if (result_case_2.generated_meal_plan.estimated_cost_yen !== null) {
      expect(result_case_2.generated_meal_plan.estimated_cost_yen).toBeLessThanOrEqual(preferred_budget_yen);
    }

    // Assertion 16: Cooking time is within preference
    if (result_case_2.generated_meal_plan.estimated_cooking_time_minutes !== null) {
      expect(result_case_2.generated_meal_plan.estimated_cooking_time_minutes).toBeLessThanOrEqual(
        preferred_cooking_time_minutes
      );
    }

    // Assertion 17: Allergen exclusion is respected
    expect(result_case_2.generated_meal_plan).toHaveProperty('allergen_compliance_verified');
    expect(result_case_2.generated_meal_plan.allergen_compliance_verified).toBe(true);

    // Assertion 18: Dietary restriction is respected
    expect(result_case_2.generated_meal_plan).toHaveProperty('dietary_restriction_compliance_verified');
    expect(result_case_2.generated_meal_plan.dietary_restriction_compliance_verified).toBe(true);

    // Assertion 19: Log timestamp is recorded
    expect(result_case_2).toHaveProperty('processed_at');
    expect(result_case_2.processed_at).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/);

    // Assertion 20: Request correlation ID is preserved
    expect(result_case_2).toHaveProperty('meal_generation_request_id');
    expect(result_case_2.meal_generation_request_id).toBe(`${meal_generation_request_id}_case2`);
  });
});