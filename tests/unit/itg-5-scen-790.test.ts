import { detectPredictionAccuracyDecline } from '../../src/logic/it-7-2-1';

describe('Weekly Aggregation and Algorithm Improvement Effect Comparison Dashboard - Prediction Accuracy Decline Detection', () => {
  // SCEN-790
  test('should skip previous month comparison and execute error handling when previous month data is missing', () => {
    const current_month_accuracy_data = {
      accuracy_rate: 0.75,
      deviation_degree: 0.15,
      category_wise_errors: [
        { category_id: 'CAT_001', error_rate: 0.12 },
        { category_id: 'CAT_002', error_rate: 0.18 }
      ],
      measurement_date: new Date('2024-02-15T10:00:00Z'),
      measurement_month: '2024-02'
    };

    const previous_month_data = null;

    const result = detectPredictionAccuracyDecline(
      current_month_accuracy_data,
      previous_month_data
    );

    expect(result).toEqual({
      comparison_executed: false,
      previous_month_comparison_skipped: true,
      error_code: 'ERR_NO_PREVIOUS_MONTH_DATA',
      error_message: '前月データが利用できません',
      current_month_data: current_month_accuracy_data,
      previous_month_data: null,
      accuracy_decline_detected: false,
      comparison_result: null,
      status: 'error_handled'
    });

    expect(result.error_code).toBe('ERR_NO_PREVIOUS_MONTH_DATA');
    expect(result.previous_month_comparison_skipped).toBe(true);
    expect(result.comparison_executed).toBe(false);
    expect(result.accuracy_decline_detected).toBe(false);
  });
});