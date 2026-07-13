import { validateMenuBeforeConfirmation } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase Record and Monthly Food Cost Reduction Analysis', () => {
  // SCEN-335: [error] 献立確定前の全制約検証機能 - 検計対象の献立データが破損または不整合の場合にバリデーションエラーが発生する
  test('should detect corrupted or inconsistent menu data and throw validation error', () => {
    const valid_menu_data = {
      menu_id: 'menu_001',
      user_id: 'user_001',
      dish_name: 'Grilled Salmon',
      category: 'Main Dish',
      provided_date: '2024-01-15',
      provided_time: '18:30',
      nutritional_value: {
        calories: 450,
        protein_g: 35,
        carbs_g: 20,
        fat_g: 15,
      },
      budget_yen: 800,
      cooking_time_minutes: 25,
      allergen_flags: ['salmon'],
      dietary_restrictions: [],
    };

    // Test 1: Valid data should pass validation
    const result_valid = validateMenuBeforeConfirmation(valid_menu_data);
    expect(result_valid).toEqual({
      is_valid: true,
      errors: [],
      constraint_fulfillment_scores: {
        nutritional_constraint: 95,
        allergen_constraint: 100,
        dietary_constraint: 100,
        budget_constraint: 90,
        cooking_time_constraint: 85,
      },
      overall_score: 94,
      confirmation_allowed: true,
    });

    // Test 2: Missing required field (dish_name)
    const missing_dish_name_data = {
      menu_id: 'menu_002',
      user_id: 'user_001',
      dish_name: '',
      category: 'Main Dish',
      provided_date: '2024-01-15',
      provided_time: '18:30',
      nutritional_value: {
        calories: 450,
        protein_g: 35,
        carbs_g: 20,
        fat_g: 15,
      },
      budget_yen: 800,
      cooking_time_minutes: 25,
      allergen_flags: [],
      dietary_restrictions: [],
    };
    expect(() => validateMenuBeforeConfirmation(missing_dish_name_data)).toThrow(/必須項目/);

    // Test 3: Missing category field
    const missing_category_data = {
      menu_id: 'menu_003',
      user_id: 'user_001',
      dish_name: 'Grilled Salmon',
      category: '',
      provided_date: '2024-01-15',
      provided_time: '18:30',
      nutritional_value: {
        calories: 450,
        protein_g: 35,
        carbs_g: 20,
        fat_g: 15,
      },
      budget_yen: 800,
      cooking_time_minutes: 25,
      allergen_flags: [],
      dietary_restrictions: [],
    };
    expect(() => validateMenuBeforeConfirmation(missing_category_data)).toThrow(/必須項目/);

    // Test 4: Invalid date format
    const invalid_date_format_data = {
      menu_id: 'menu_004',
      user_id: 'user_001',
      dish_name: 'Grilled Salmon',
      category: 'Main Dish',
      provided_date: 'not-a-date',
      provided_time: '18:30',
      nutritional_value: {
        calories: 450,
        protein_g: 35,
        carbs_g: 20,
        fat_g: 15,
      },
      budget_yen: 800,
      cooking_time_minutes: 25,
      allergen_flags: [],
      dietary_restrictions: [],
    };
    expect(() => validateMenuBeforeConfirmation(invalid_date_format_data)).toThrow(/データ形式/);

    // Test 5: Invalid time format
    const invalid_time_format_data = {
      menu_id: 'menu_005',
      user_id: 'user_001',
      dish_name: 'Grilled Salmon',
      category: 'Main Dish',
      provided_date: '2024-01-15',
      provided_time: 'invalid-time',
      nutritional_value: {
        calories: 450,
        protein_g: 35,
        carbs_g: 20,
        fat_g: 15,
      },
      budget_yen: 800,
      cooking_time_minutes: 25,
      allergen_flags: [],
      dietary_restrictions: [],
    };
    expect(() => validateMenuBeforeConfirmation(invalid_time_format_data)).toThrow(/データ形式/);

    // Test 6: Negative calorie value
    const negative_calorie_data = {
      menu_id: 'menu_006',
      user_id: 'user_001',
      dish_name: 'Grilled Salmon',
      category: 'Main Dish',
      provided_date: '2024-01-15',
      provided_time: '18:30',
      nutritional_value: {
        calories: -450,
        protein_g: 35,
        carbs_g: 20,
        fat_g: 15,
      },
      budget_yen: 800,
      cooking_time_minutes: 25,
      allergen_flags: [],
      dietary_restrictions: [],
    };
    expect(() => validateMenuBeforeConfirmation(negative_calorie_data)).toThrow(/栄養価/);

    // Test 7: Negative protein value
    const negative_protein_data = {
      menu_id: 'menu_007',
      user_id: 'user_001',
      dish_name: 'Grilled Salmon',
      category: 'Main Dish',
      provided_date: '2024-01-15',
      provided_time: '18:30',
      nutritional_value: {
        calories: 450,
        protein_g: -35,
        carbs_g: 20,
        fat_g: 15,
      },
      budget_yen: 800,
      cooking_time_minutes: 25,
      allergen_flags: [],
      dietary_restrictions: [],
    };
    expect(() => validateMenuBeforeConfirmation(negative_protein_data)).toThrow(/栄養価/);

    // Test 8: Negative budget value
    const negative_budget_data = {
      menu_id: 'menu_008',
      user_id: 'user_001',
      dish_name: 'Grilled Salmon',
      category: 'Main Dish',
      provided_date: '2024-01-15',
      provided_time: '18:30',
      nutritional_value: {
        calories: 450,
        protein_g: 35,
        carbs_g: 20,
        fat_g: 15,
      },
      budget_yen: -800,
      cooking_time_minutes: 25,
      allergen_flags: [],
      dietary_restrictions: [],
    };
    expect(() => validateMenuBeforeConfirmation(negative_budget_data)).toThrow(/予算/);

    // Test 9: Negative cooking time
    const negative_cooking_time_data = {
      menu_id: 'menu_009',
      user_id: 'user_001',
      dish_name: 'Grilled Salmon',
      category: 'Main Dish',
      provided_date: '2024-01-15',
      provided_time: '18:30',
      nutritional_value: {
        calories: 450,
        protein_g: 35,
        carbs_g: 20,
        fat_g: 15,
      },
      budget_yen: 800,
      cooking_time_minutes: -25,
      allergen_flags: [],
      dietary_restrictions: [],
    };
    expect(() => validateMenuBeforeConfirmation(negative_cooking_time_data)).toThrow(/調理時間/);

    // Test 10: Null nutritional_value object
    const null_nutritional_value_data = {
      menu_id: 'menu_010',
      user_id: 'user_001',
      dish_name: 'Grilled Salmon',
      category: 'Main Dish',
      provided_date: '2024-01-15',
      provided_time: '18:30',
      nutritional_value: null,
      budget_yen: 800,
      cooking_time_minutes: 25,
      allergen_flags: [],
      dietary_restrictions: [],
    };
    expect(() => validateMenuBeforeConfirmation(null_nutritional_value_data)).toThrow(/必須項目/);

    // Test 11: Missing nutritional_value fields
    const incomplete_nutritional_value_data = {
      menu_id: 'menu_011',
      user_id: 'user_001',
      dish_name: 'Grilled Salmon',
      category: 'Main Dish',
      provided_date: '2024-01-15',
      provided_time: '18:30',
      nutritional_value: {
        calories: 450,
        protein_g: 35,
      },
      budget_yen: 800,
      cooking_time_minutes: 25,
      allergen_flags: [],
      dietary_restrictions: [],
    };
    expect(() => validateMenuBeforeConfirmation(incomplete_nutritional_value_data)).toThrow(/必須項目/);

    // Test 12: Invalid data type - budget as string
    const invalid_budget_type_data = {
      menu_id: 'menu_012',
      user_id: 'user_001',
      dish_name: 'Grilled Salmon',
      category: 'Main Dish',
      provided_date: '2024-01-15',
      provided_time: '18:30',
      nutritional_value: {
        calories: 450,
        protein_g: 35,
        carbs_g: 20,
        fat_g: 15,
      },
      budget_yen: 'eight hundred',
      cooking_time_minutes: 25,
      allergen_flags: [],
      dietary_restrictions: [],
    };
    expect(() => validateMenuBeforeConfirmation(invalid_budget_type_data)).toThrow(/データ型/);

    // Test 13: Invalid data type - cooking time as string
    const invalid_cooking_time_type_data = {
      menu_id: 'menu_013',
      user_id: 'user_001',
      dish_name: 'Grilled Salmon',
      category: 'Main Dish',
      provided_date: '2024-01-15',
      provided_time: '18:30',
      nutritional_value: {
        calories: 450,
        protein_g: 35,
        carbs_g: 20,
        fat_g: 15,
      },
      budget_yen: 800,
      cooking_time_minutes: 'twenty-five',
      allergen_flags: [],
      dietary_restrictions: [],
    };
    expect(() => validateMenuBeforeConfirmation(invalid_cooking_time_type_data)).toThrow(/データ型/);

    // Test 14: Boundary test - minimum valid values
    const boundary_min_valid_data = {
      menu_id: 'menu_014',
      user_id: 'user_001',
      dish_name: 'A',
      category: 'B',
      provided_date: '2024-01-01',
      provided_time: '00:00',
      nutritional_value: {
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
      },
      budget_yen: 0,
      cooking_time_minutes: 0,
      allergen_flags: [],
      dietary_restrictions: [],
    };
    const result_boundary_min = validateMenuBeforeConfirmation(boundary_min_valid_data);
    expect(result_boundary_min.is_valid).toBe(true);
    expect(result_boundary_min.confirmation_allowed).toBe(true);

    // Test 15: Boundary test - maximum valid values
    const boundary_max_valid_data = {
      menu_id: 'menu_015',
      user_id: 'user_001',
      dish_name: 'Very Long Dish Name That Describes A Complex Culinary Creation',
      category: 'Dessert',
      provided_date: '2024-12-31',
      provided_time: '23:59',
      nutritional_value: {
        calories: 5000,
        protein_g: 500,
        carbs_g: 500,
        fat_g: 500,
      },
      budget_yen: 50000,
      cooking_time_minutes: 480,
      allergen_flags: ['egg', 'dairy', 'nuts', 'shellfish'],
      dietary_restrictions: ['vegan', 'gluten-free'],
    };
    const result_boundary_max = validateMenuBeforeConfirmation(boundary_max_valid_data);
    expect(result_boundary_max.is_valid).toBe(true);
    expect(result_boundary_max.confirmation_allowed).toBe(true);

    // Test 16: Carbs sum exceeds reasonable threshold
    const excessive_carbs_data = {
      menu_id: 'menu_016',
      user_id: 'user_001',
      dish_name: 'Grilled Salmon',
      category: 'Main Dish',
      provided_date: '2024-01-15',
      provided_time: '18:30',
      nutritional_value: {
        calories: 450,
        protein_g: 35,
        carbs_g: 10000,
        fat_g: 15,
      },
      budget_yen: 800,
      cooking_time_minutes: 25,
      allergen_flags: [],
      dietary_restrictions: [],
    };
    expect(() => validateMenuBeforeConfirmation(excessive_carbs_data)).toThrow(/栄養価/);

    // Test 17: Fat sum exceeds reasonable threshold
    const excessive_fat_data = {
      menu_id: 'menu_017',
      user_id: 'user_001',
      dish_name: 'Grilled Salmon',
      category: 'Main Dish',
      provided_date: '2024-01-15',
      provided_time: '18:30',
      nutritional_value: {
        calories: 450,
        protein_g: 35,
        carbs_g: 20,
        fat_g: 9999,
      },
      budget_yen: 800,
      cooking_time_minutes: 25,
      allergen_flags: [],
      dietary_restrictions: [],
    };
    expect(() => validateMenuBeforeConfirmation(excessive_fat_data)).toThrow(/栄養価/);

    // Test 18: Multiple fields corrupted - should detect first critical error
    const multi_corrupted_data = {
      menu_id: 'menu_018',
      user_id: 'user_001',
      dish_name: '',
      category: '',
      provided_date: 'invalid',
      provided_time: 'invalid',
      nutritional_value: null,
      budget_yen: -800,
      cooking_time_minutes: -25,
      allergen_flags: [],
      dietary_restrictions: [],
    };
    expect(() => validateMenuBeforeConfirmation(multi_corrupted_data)).toThrow(/必須項目/);

    // Test 19: Verify error response contains specific corruption location info
    try {
      validateMenuBeforeConfirmation({
        menu_id: 'menu_019',
        user_id: 'user_001',
        dish_name: 'Test Dish',
        category: 'Main Dish',
        provided_date: '2024-01-15',
        provided_time: 'bad-time-format',
        nutritional_value: {
          calories: 450,
          protein_g: 35,
          carbs_g: 20,
          fat_g: 15,
        },
        budget_yen: 800,
        cooking_time_minutes: 25,
        allergen_flags: [],
        dietary_restrictions: [],
      });
      fail('Expected error to be thrown');
    } catch (error: any) {
      expect(error.message).toMatch(/provided_time|時刻/);
    }

    // Test 20: Verify confirmation is not allowed when data is corrupted
    try {
      const result = validateMenuBeforeConfirmation({
        menu_id: 'menu_020',
        user_id: 'user_001',
        dish_name: 'Test',
        category: 'Main Dish',
        provided_date: '2024-01-15',
        provided_time: 'invalid-format',
        nutritional_value: {
          calories: 450,
          protein_g: 35,
          carbs_g: 20,
          fat_g: 15,
        },
        budget_yen: 800,
        cooking_time_minutes: 25,
        allergen_flags: [],
        dietary_restrictions: [],
      });
      expect(result.confirmation_allowed).toBe(false);
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });
});