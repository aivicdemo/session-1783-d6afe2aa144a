import { analyzeExcessSpendingFactors } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase Record and Monthly Food Expense Reduction Analysis', () => {
  // SCEN-401
  test('should return empty analysis result when monthly expense equals budget exactly', () => {
    const budget_amount = 10000;
    const actual_expense = 10000;
    const expense_breakdown = [
      { category: '野菜', amount: 3000 },
      { category: '肉', amount: 4000 },
      { category: '調味料', amount: 3000 },
    ];

    const result = analyzeExcessSpendingFactors({
      budget_amount,
      actual_expense,
      expense_breakdown,
    });

    expect(result.excess_amount).toBe(0);
    expect(result.excess_factors).toEqual([]);
    expect(result.excess_rate).toBe(0);
    expect(result.analysis_status).toBe('NO_EXCESS');
  });
});