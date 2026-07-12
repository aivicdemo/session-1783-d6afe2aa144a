import { analyzeMonthlyCostExcess } from '../../src/logic/it-2';

describe('月次食費実績と超過要因分析', () => {
  // SCEN-499
  test('食費が予算以内の場合、超過要因分析は実行されず、適切なステータスが返される', () => {
    const monthlyBudget = 10000;
    const purchaseRecords = [
      { category: '野菜', amount: 1000 },
      { category: '肉類', amount: 2000 },
      { category: '調味料', amount: 500 },
      { category: 'その他', amount: 1500 },
    ];
    const totalExpense = 5000;

    const result = analyzeMonthlyCostExcess({
      monthlyBudget,
      purchaseRecords,
      totalExpense,
    });

    expect(result.status).toBe('WITHIN_BUDGET');
    expect(result.excessFactorAnalysis).toEqual([]);
    expect(result.remainingBudget).toBe(5000);
    expect(result.isExceeded).toBe(false);
  });
});