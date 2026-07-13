import { filterAnomalousData } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase Records & Monthly Food Cost Reduction Analysis - Anomalous Data Filtering', () => {
  // SCEN-439: [error] 異常値・欠損値の自動フィルタリング - 全データが異常値・欠損値である場合、フィルタリング後の分析対象データが空集合となり、適切なエラー通知が発行される
  test('should return empty dataset and error notification when all data is anomalous or missing', () => {
    const test_input_dataset = [
      {
        purchase_record_id: null,
        purchase_date: undefined,
        food_item_id: 'item_001',
        purchase_amount: -100,
        quantity: 0,
        unit_price: NaN,
      },
      {
        purchase_record_id: '',
        purchase_date: 'invalid-date',
        food_item_id: null,
        purchase_amount: 999999999999,
        quantity: -50,
        unit_price: undefined,
      },
      {
        purchase_record_id: 'PR_003',
        purchase_date: '2024-02-30',
        food_item_id: 'item_003',
        purchase_amount: null,
        quantity: null,
        unit_price: Infinity,
      },
      {
        purchase_record_id: undefined,
        purchase_date: null,
        food_item_id: undefined,
        purchase_amount: -0.5,
        quantity: undefined,
        unit_price: NaN,
      },
    ];

    const test_filter_config = {
      min_purchase_amount: 0,
      max_purchase_amount: 100000,
      valid_date_format: 'YYYY-MM-DD',
      min_quantity: 1,
      max_quantity: 1000,
      allowed_null_fields: [],
    };

    const test_result = filterAnomalousData(test_input_dataset, test_filter_config);

    expect(test_result.filtered_data).toEqual([]);
    expect(test_result.filtered_data.length).toBe(0);
    expect(test_result.error_notification).toBeDefined();
    expect(test_result.error_notification.message).toMatch(/有効なデータが存在しません/);
    expect(test_result.error_notification.message).toMatch(/異常値・欠損値/);
    expect(test_result.error_notification.severity).toBe('error');
    expect(test_result.error_notification.is_critical).toBe(true);
    expect(test_result.anomalous_record_count).toBe(4);
    expect(test_result.is_safe_state).toBe(true);
    expect(typeof test_result.timestamp).toBe('string');
  });
});