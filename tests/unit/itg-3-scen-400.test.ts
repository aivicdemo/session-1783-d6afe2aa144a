import { analyzeMonthlyFoodExpenseExcess } from '../../src/logic/it-1-br-6-2-1-1';

describe('Food Expense Analysis - Price Data Connectivity Failure', () => {
  // SCEN-400
  test('should skip unit price variance analysis when price data fails to sync from distributor', async () => {
    const analysisInput = {
      user_id: 'user_001',
      analysis_period_start: '2024-01-01',
      analysis_period_end: '2024-01-31',
      price_data_sync_enabled: false,
      price_data_sync_status: 'connection_failed',
    };

    const result = await analyzeMonthlyFoodExpenseExcess(analysisInput);

    // Assert: Unit price variance section skipped
    expect(result.unit_price_variance_analysis).toEqual({
      skipped: true,
      skip_reason: 'price_data_sync_failed',
      status_message: 'データ連携エラーのためスキップされました',
    });

    // Assert: Other analysis sections are present and valid
    expect(result.food_item_breakdown).toBeDefined();
    expect(result.food_item_breakdown.total_excess_amount).toBe(5250);
    expect(result.food_item_breakdown.items).toContainEqual({
      item_id: 'item_beef_001',
      item_name: '和牛',
      purchase_count: 2,
      total_spent: 3500,
      category: 'meat',
    });

    // Assert: Store utilization analysis present
    expect(result.store_utilization_analysis).toBeDefined();
    expect(result.store_utilization_analysis.stores).toContainEqual({
      store_id: 'store_super_001',
      store_name: 'スーパーA',
      total_spent: 8750,
      visit_count: 5,
    });

    // Assert: Error log entry recorded
    expect(result.error_log).toBeDefined();
    expect(result.error_log).toContainEqual({
      error_code: 'price_data_sync_failed',
      error_timestamp: '2024-01-31T23:59:59Z',
      severity: 'warning',
      message: '価格データ連携失敗',
    });

    // Assert: Notification message displayed
    expect(result.notification).toEqual({
      message: '購入単価変動の分析がスキップされました。価格データの連携に失敗したため、その他の分析結果を参考にしてください。',
      type: 'warning',
      dismissible: true,
    });

    // Assert: Overall analysis completion status
    expect(result.analysis_completion_status).toBe('partial_success');
    expect(result.analysis_completion_percentage).toBe(85);
  });
});