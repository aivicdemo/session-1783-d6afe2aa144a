import { validateMenuChangeImplementation } from '../../src/logic/it-1-br-6-2-1-1';

describe('Rule Change Implementation Validation - Error Handling', () => {
  // SCEN-499
  test('should throw error when no historical menu data exists during validation', () => {
    const input_rule_id = 'RULE_20240115_001';
    const input_user_id = 'USER_12345';
    const input_past_menu_data = [];
    const input_nutrition_baseline = {
      protein_g: 50,
      carbs_g: 300,
      fat_g: 65,
      calcium_mg: 600,
      iron_mg: 8,
    };
    const input_season_pattern = {
      start_month: 1,
      end_month: 3,
      ingredient_names: ['spinach', 'kale', 'broccoli'],
    };
    const input_discount_threshold = 0.15;
    const input_sales_period = {
      start_date: '2024-01-15',
      end_date: '2024-01-31',
    };

    expect(() =>
      validateMenuChangeImplementation({
        rule_id: input_rule_id,
        user_id: input_user_id,
        past_menu_data: input_past_menu_data,
        nutrition_baseline: input_nutrition_baseline,
        season_pattern: input_season_pattern,
        discount_threshold: input_discount_threshold,
        sales_period: input_sales_period,
      })
    ).toThrow(/過去献立データ/);
  });

  test('should successfully validate when historical menu data exists', () => {
    const input_rule_id = 'RULE_20240115_002';
    const input_user_id = 'USER_12346';
    const input_past_menu_data = [
      {
        menu_id: 'MENU_2024_001',
        date: '2024-01-08',
        dishes: [
          {
            dish_id: 'DISH_001',
            dish_name: 'grilled_salmon',
            ingredients: [
              { ingredient_id: 'ING_001', ingredient_name: 'salmon', quantity_g: 150 },
              { ingredient_id: 'ING_002', ingredient_name: 'lemon', quantity_g: 30 },
            ],
            nutrition: { protein_g: 35, carbs_g: 5, fat_g: 15, calcium_mg: 50, iron_mg: 1.2 },
            allergy_info: [],
            dietary_restriction: [],
            cooking_time_minutes: 20,
            cost_jpy: 1200,
          },
          {
            dish_id: 'DISH_002',
            dish_name: 'spinach_salad',
            ingredients: [
              { ingredient_id: 'ING_003', ingredient_name: 'spinach', quantity_g: 100 },
              { ingredient_id: 'ING_004', ingredient_name: 'olive_oil', quantity_g: 15 },
            ],
            nutrition: { protein_g: 3, carbs_g: 8, fat_g: 8, calcium_mg: 150, iron_mg: 2.1 },
            allergy_info: [],
            dietary_restriction: [],
            cooking_time_minutes: 10,
            cost_jpy: 350,
          },
        ],
        family_satisfaction_score: 8.5,
        family_completion_rate: 0.95,
      },
      {
        menu_id: 'MENU_2024_002',
        date: '2024-01-09',
        dishes: [
          {
            dish_id: 'DISH_003',
            dish_name: 'chicken_rice_bowl',
            ingredients: [
              { ingredient_id: 'ING_005', ingredient_name: 'chicken_breast', quantity_g: 120 },
              { ingredient_id: 'ING_006', ingredient_name: 'white_rice', quantity_g: 150 },
            ],
            nutrition: { protein_g: 32, carbs_g: 60, fat_g: 8, calcium_mg: 30, iron_mg: 1.5 },
            allergy_info: [],
            dietary_restriction: [],
            cooking_time_minutes: 25,
            cost_jpy: 850,
          },
        ],
        family_satisfaction_score: 7.8,
        family_completion_rate: 0.92,
      },
    ];
    const input_nutrition_baseline = {
      protein_g: 50,
      carbs_g: 300,
      fat_g: 65,
      calcium_mg: 600,
      iron_mg: 8,
    };
    const input_season_pattern = {
      start_month: 1,
      end_month: 3,
      ingredient_names: ['spinach', 'kale', 'broccoli'],
    };
    const input_discount_threshold = 0.15;
    const input_sales_period = {
      start_date: '2024-01-15',
      end_date: '2024-01-31',
    };

    const result = validateMenuChangeImplementation({
      rule_id: input_rule_id,
      user_id: input_user_id,
      past_menu_data: input_past_menu_data,
      nutrition_baseline: input_nutrition_baseline,
      season_pattern: input_season_pattern,
      discount_threshold: input_discount_threshold,
      sales_period: input_sales_period,
    });

    expect(result).toHaveProperty('validation_status');
    expect(result.validation_status).toBe('success');
    expect(result).toHaveProperty('menu_count_analyzed');
    expect(result.menu_count_analyzed).toBe(2);
    expect(result).toHaveProperty('data_quality_score');
    expect(typeof result.data_quality_score).toBe('number');
    expect(result.data_quality_score).toBeGreaterThanOrEqual(0);
    expect(result.data_quality_score).toBeLessThanOrEqual(100);
    expect(result).toHaveProperty('nutrition_consistency_check');
    expect(typeof result.nutrition_consistency_check).toBe('boolean');
    expect(result).toHaveProperty('dietary_restriction_conflicts');
    expect(Array.isArray(result.dietary_restriction_conflicts)).toBe(true);
    expect(result).toHaveProperty('rule_change_compatibility');
    expect(typeof result.rule_change_compatibility).toBe('boolean');
  });

  test('should detect nutrition consistency issues when rule conflicts with baseline', () => {
    const input_rule_id = 'RULE_20240115_003';
    const input_user_id = 'USER_12347';
    const input_past_menu_data = [
      {
        menu_id: 'MENU_2024_003',
        date: '2024-01-10',
        dishes: [
          {
            dish_id: 'DISH_004',
            dish_name: 'vegetable_tempura',
            ingredients: [
              { ingredient_id: 'ING_007', ingredient_name: 'broccoli', quantity_g: 120 },
              { ingredient_id: 'ING_008', ingredient_name: 'shrimp', quantity_g: 100 },
            ],
            nutrition: { protein_g: 28, carbs_g: 45, fat_g: 22, calcium_mg: 120, iron_mg: 3.2 },
            allergy_info: ['shrimp'],
            dietary_restriction: [],
            cooking_time_minutes: 30,
            cost_jpy: 1500,
          },
        ],
        family_satisfaction_score: 6.5,
        family_completion_rate: 0.75,
      },
    ];
    const input_nutrition_baseline = {
      protein_g: 50,
      carbs_g: 300,
      fat_g: 65,
      calcium_mg: 600,
      iron_mg: 8,
    };
    const input_season_pattern = {
      start_month: 4,
      end_month: 6,
      ingredient_names: ['shrimp', 'clam', 'squid'],
    };
    const input_discount_threshold = 0.15;
    const input_sales_period = {
      start_date: '2024-04-01',
      end_date: '2024-04-30',
    };

    const result = validateMenuChangeImplementation({
      rule_id: input_rule_id,
      user_id: input_user_id,
      past_menu_data: input_past_menu_data,
      nutrition_baseline: input_nutrition_baseline,
      season_pattern: input_season_pattern,
      discount_threshold: input_discount_threshold,
      sales_period: input_sales_period,
    });

    expect(result.validation_status).toBe('warning');
    expect(result.menu_count_analyzed).toBe(1);
    expect(Array.isArray(result.dietary_restriction_conflicts)).toBe(true);
    expect(result.dietary_restriction_conflicts.length).toBeGreaterThan(0);
    expect(result.dietary_restriction_conflicts[0]).toHaveProperty('conflict_type');
    expect(result.dietary_restriction_conflicts[0]).toHaveProperty('affected_menu_id');
    expect(result.dietary_restriction_conflicts[0].affected_menu_id).toBe('MENU_2024_003');
  });

  test('should handle edge case with single menu record validation', () => {
    const input_rule_id = 'RULE_20240115_004';
    const input_user_id = 'USER_12348';
    const input_past_menu_data = [
      {
        menu_id: 'MENU_2024_004',
        date: '2024-01-11',
        dishes: [
          {
            dish_id: 'DISH_005',
            dish_name: 'tofu_miso_soup',
            ingredients: [
              { ingredient_id: 'ING_009', ingredient_name: 'tofu', quantity_g: 200 },
              { ingredient_id: 'ING_010', ingredient_name: 'miso', quantity_g: 20 },
            ],
            nutrition: { protein_g: 18, carbs_g: 12, fat_g: 9, calcium_mg: 300, iron_mg: 2.5 },
            allergy_info: [],
            dietary_restriction: ['vegetarian'],
            cooking_time_minutes: 15,
            cost_jpy: 450,
          },
        ],
        family_satisfaction_score: 8.2,
        family_completion_rate: 0.98,
      },
    ];
    const input_nutrition_baseline = {
      protein_g: 50,
      carbs_g: 300,
      fat_g: 65,
      calcium_mg: 600,
      iron_mg: 8,
    };
    const input_season_pattern = {
      start_month: 1,
      end_month: 12,
      ingredient_names: ['tofu', 'miso', 'seaweed'],
    };
    const input_discount_threshold = 0.2;
    const input_sales_period = {
      start_date: '2024-01-15',
      end_date: '2024-02-14',
    };

    const result = validateMenuChangeImplementation({
      rule_id: input_rule_id,
      user_id: input_user_id,
      past_menu_data: input_past_menu_data,
      nutrition_baseline: input_nutrition_baseline,
      season_pattern: input_season_pattern,
      discount_threshold: input_discount_threshold,
      sales_period: input_sales_period,
    });

    expect(result.menu_count_analyzed).toBe(1);
    expect(result.validation_status).toBe('success');
    expect(result.data_quality_score).toBeGreaterThan(0);
    expect(result.nutrition_consistency_check).toBe(true);
  });

  test('should validate discount threshold constraint in rule change', () => {
    const input_rule_id = 'RULE_20240115_005';
    const input_user_id = 'USER_12349';
    const input_past_menu_data = [
      {
        menu_id: 'MENU_2024_005',
        date: '2024-01-12',
        dishes: [
          {
            dish_id: 'DISH_006',
            dish_name: 'beef_stew',
            ingredients: [
              { ingredient_id: 'ING_011', ingredient_name: 'beef', quantity_g: 200 },
              { ingredient_id: 'ING_012', ingredient_name: 'potato', quantity_g: 150 },
            ],
            nutrition: { protein_g: 42, carbs_g: 35, fat_g: 28, calcium_mg: 40, iron_mg: 4.2 },
            allergy_info: [],
            dietary_restriction: [],
            cooking_time_minutes: 45,
            cost_jpy: 2100,
          },
        ],
        family_satisfaction_score: 9.0,
        family_completion_rate: 1.0,
      },
    ];
    const input_nutrition_baseline = {
      protein_g: 50,
      carbs_g: 300,
      fat_g: 65,
      calcium_mg: 600,
      iron_mg: 8,
    };
    const input_season_pattern = {
      start_month: 10,
      end_month: 3,
      ingredient_names: ['beef', 'potato', 'carrot'],
    };
    const input_discount_threshold = 0.25;
    const input_sales_period = {
      start_date: '2024-01-20',
      end_date: '2024-02-20',
    };

    const result = validateMenuChangeImplementation({
      rule_id: input_rule_id,
      user_id: input_user_id,
      past_menu_data: input_past_menu_data,
      nutrition_baseline: input_nutrition_baseline,
      season_pattern: input_season_pattern,
      discount_threshold: input_discount_threshold,
      sales_period: input_sales_period,
    });

    expect(result).toHaveProperty('discount_threshold_validation');
    expect(typeof result.discount_threshold_validation).toBe('boolean');
    expect(result.rule_change_compatibility).toBe(true);
  });
});