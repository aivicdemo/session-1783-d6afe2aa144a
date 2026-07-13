import { filterAnomalousAndMissingData } from '../../src/logic/it-1-br-3-2-1';

describe('Automatic filtering of anomalous and missing values', () => {
  // SCEN-437
  test('should detect and filter anomalous and missing values from shopping list, nutrition analysis, and food expense records, passing only valid data to next stage', () => {
    const input_shopping_list = [
      { product_name: 'Tomato', quantity: 3, unit_price: 150 }, // valid
      { product_name: 'Carrot', quantity: -2, unit_price: 80 }, // anomaly: negative quantity
      { product_name: '', quantity: 1, unit_price: 200 }, // missing: empty product_name
      { product_name: 'Potato', quantity: 1000000, unit_price: 50 }, // anomaly: extreme quantity
      { product_name: 'Onion', quantity: 2, unit_price: -30 }, // anomaly: negative price
    ];

    const input_nutrition_analysis = [
      { nutrient_name: 'Protein', calorie_value: 450 }, // valid
      { nutrient_name: 'Fat', calorie_value: -100 }, // anomaly: negative calorie
      { nutrient_name: '', calorie_value: 300 }, // missing: empty nutrient_name
      { nutrient_name: 'Carbohydrate', calorie_value: 99999 }, // anomaly: out of range
    ];

    const input_food_expense_records = [
      { record_date: '2024-01-15', expense_category: 'Grocery', amount: 5000 }, // valid
      { record_date: '2024-13-40', expense_category: 'Grocery', amount: 3000 }, // anomaly: invalid date format
      { record_date: '2024-01-16', expense_category: '', amount: 2000 }, // missing: empty category
      { record_date: '2024-01-17', expense_category: 'Dining', amount: -1500 }, // anomaly: negative amount
    ];

    const result = filterAnomalousAndMissingData({
      shopping_list: input_shopping_list,
      nutrition_analysis: input_nutrition_analysis,
      food_expense_records: input_food_expense_records,
    });

    expect(result.filtered_shopping_list).toEqual([
      { product_name: 'Tomato', quantity: 3, unit_price: 150 },
    ]);

    expect(result.filtered_nutrition_analysis).toEqual([
      { nutrient_name: 'Protein', calorie_value: 450 },
    ]);

    expect(result.filtered_food_expense_records).toEqual([
      { record_date: '2024-01-15', expense_category: 'Grocery', amount: 5000 },
    ]);

    expect(result.anomalies_detected).toEqual({
      shopping_list_anomalies: [
        { index: 1, reason: 'negative_quantity', data: { product_name: 'Carrot', quantity: -2, unit_price: 80 } },
        { index: 3, reason: 'extreme_quantity', data: { product_name: 'Potato', quantity: 1000000, unit_price: 50 } },
        { index: 4, reason: 'negative_price', data: { product_name: 'Onion', quantity: 2, unit_price: -30 } },
      ],
      nutrition_analysis_anomalies: [
        { index: 1, reason: 'negative_calorie', data: { nutrient_name: 'Fat', calorie_value: -100 } },
        { index: 3, reason: 'out_of_range_calorie', data: { nutrient_name: 'Carbohydrate', calorie_value: 99999 } },
      ],
      food_expense_anomalies: [
        { index: 1, reason: 'invalid_date_format', data: { record_date: '2024-13-40', expense_category: 'Grocery', amount: 3000 } },
        { index: 3, reason: 'negative_amount', data: { record_date: '2024-01-17', expense_category: 'Dining', amount: -1500 } },
      ],
    });

    expect(result.missing_values_detected).toEqual({
      shopping_list_missing: [
        { index: 2, field: 'product_name', data: { product_name: '', quantity: 1, unit_price: 200 } },
      ],
      nutrition_analysis_missing: [
        { index: 2, field: 'nutrient_name', data: { nutrient_name: '', calorie_value: 300 } },
      ],
      food_expense_missing: [
        { index: 2, field: 'expense_category', data: { record_date: '2024-01-16', expense_category: '', amount: 2000 } },
      ],
    });

    expect(result.filter_status).toBe('completed');
    expect(result.valid_data_count).toBe(3);
    expect(result.total_input_count).toBe(12);
    expect(result.filtered_out_count).toBe(9);
  });
});