import { analyzeMonthlyBudgetOverage } from '../../src/logic/common';

describe('共通 - 月次食費超過分析', () => {
  // SCEN-370
  test('食費実績がNULLまたは不正な値の場合、超過分析が適切にエラーハンドリングされる', () => {
    // ケース1: 食費実績がNULLの場合
    const nullActualExpenseData = {
      monthlyBudgetId: 'budget_001',
      budgetAmount: 50000,
      actualExpense: null,
    };
    expect(() => analyzeMonthlyBudgetOverage(nullActualExpenseData)).toThrow(/食費実績/);

    // ケース2: 食費実績が負の数値の場合
    const negativeActualExpenseData = {
      monthlyBudgetId: 'budget_001',
      budgetAmount: 50000,
      actualExpense: -10000,
    };
    expect(() => analyzeMonthlyBudgetOverage(negativeActualExpenseData)).toThrow(/食費実績/);

    // ケース3: 食費実績が文字列の場合
    const stringActualExpenseData = {
      monthlyBudgetId: 'budget_001',
      budgetAmount: 50000,
      actualExpense: 'invalid_value' as any,
    };
    expect(() => analyzeMonthlyBudgetOverage(stringActualExpenseData)).toThrow(/食費実績/);

    // ケース4: 食費実績がundefinedの場合
    const undefinedActualExpenseData = {
      monthlyBudgetId: 'budget_001',
      budgetAmount: 50000,
      actualExpense: undefined,
    };
    expect(() => analyzeMonthlyBudgetOverage(undefinedActualExpenseData)).toThrow(/食費実績/);

    // ケース5: 食費実績が浮動小数点数の場合（正常系）
    const validActualExpenseData = {
      monthlyBudgetId: 'budget_001',
      budgetAmount: 50000,
      actualExpense: 55000.5,
    };
    const result = analyzeMonthlyBudgetOverage(validActualExpenseData);
    expect(result).toEqual({
      monthlyBudgetId: 'budget_001',
      overageAmount: 5000.5,
      overagePercentage: 10.001,
      isOverage: true,
    });

    // ケース6: 食費実績がゼロの場合（正常系）
    const zeroActualExpenseData = {
      monthlyBudgetId: 'budget_002',
      budgetAmount: 50000,
      actualExpense: 0,
    };
    const resultZero = analyzeMonthlyBudgetOverage(zeroActualExpenseData);
    expect(resultZero).toEqual({
      monthlyBudgetId: 'budget_002',
      overageAmount: -50000,
      overagePercentage: -100,
      isOverage: false,
    });

    // ケース7: 食費実績が予算内の場合（正常系）
    const withinBudgetData = {
      monthlyBudgetId: 'budget_003',
      budgetAmount: 50000,
      actualExpense: 45000,
    };
    const resultWithinBudget = analyzeMonthlyBudgetOverage(withinBudgetData);
    expect(resultWithinBudget).toEqual({
      monthlyBudgetId: 'budget_003',
      overageAmount: -5000,
      overagePercentage: -10,
      isOverage: false,
    });
  });
});