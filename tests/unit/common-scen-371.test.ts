import { analyzeMonthlyFoodExpenseOverage } from '../../src/logic/common';

describe('共通', () => {
  // SCEN-371
  test('月次食費超過分析機能 - 食費実績が予算上限と同額の場合、超過と判定されず分析対象外となる', () => {
    const budget_limit = 10000;
    const actual_expense = 10000;
    const analysis_month = '2024-01';
    const user_id = 'user_001';

    const result = analyzeMonthlyFoodExpenseOverage({
      user_id,
      analysis_month,
      budget_limit,
      actual_expense,
    });

    expect(result.is_exceeded).toBe(false);
    expect(result.overage_amount).toBe(0);
    expect(result.overage_rate).toBe(0);
    expect(result.is_analysis_target).toBe(false);
  });
});