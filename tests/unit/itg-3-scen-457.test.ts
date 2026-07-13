import { analyzeNutritionDeficiencyFactors } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase Records & Monthly Food Cost Reduction Analysis', () => {
  // SCEN-457
  test('should return detailed error message when analysis data is insufficient', () => {
    const analysis_period_days = 30;
    const required_data_days = 90;
    const current_data_days = 30;
    const data_sufficiency_threshold_percent = 50;
    const actual_data_sufficiency_percent = (current_data_days / required_data_days) * 100;

    const request = {
      user_id: 'user_12345',
      analysis_period_days: analysis_period_days,
      start_date: new Date('2024-10-01T00:00:00Z'),
      end_date: new Date('2024-10-31T23:59:59Z'),
      data_type: 'purchase_records',
    };

    expect(() => analyzeNutritionDeficiencyFactors(request)).toThrow(/不足/);

    try {
      analyzeNutritionDeficiencyFactors(request);
    } catch (error: any) {
      expect(error.message).toContain('分析に必要なデータが不足しています');
      expect(error.message).toContain('最低でも過去90日間のデータが必要です');
      expect(error.message).toContain('現在のデータ保有期間は30日間です');
      expect(error.code).toBe('ERR_INSUFFICIENT_DATA_457');
      expect(error.required_days).toBe(required_data_days);
      expect(error.actual_days).toBe(current_data_days);
      expect(error.sufficiency_percent).toBe(actual_data_sufficiency_percent);
      expect(actual_data_sufficiency_percent).toBeLessThan(data_sufficiency_threshold_percent);
    }
  });
});