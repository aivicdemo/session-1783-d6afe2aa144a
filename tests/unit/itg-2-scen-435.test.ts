import { analyzeMonthlyExpenseExcess } from '../../src/logic/it-1-br-2-1-1-1';

describe('月次食費実績と栄養摂取状況の分析・家計方針調整 - 食費超過要因分析', () => {
  // SCEN-435: [error] 食費超過要因分析機能 - 食費実績データが月次集計されていない場合、分析処理がエラーで中断される
  test('月次集計されていない食費実績データに対する分析処理はエラーで中断される', () => {
    const userId = 'user-001';
    const targetMonth = '2024-01';
    const expenseRecords = [
      {
        id: 'expense-001',
        userId: userId,
        date: '2024-01-05',
        amount: 5000,
        category: '野菜',
        aggregatedFlag: false, // 月次集計フラグがfalse（集計されていない）
      },
      {
        id: 'expense-002',
        userId: userId,
        date: '2024-01-10',
        amount: 3000,
        category: '肉類',
        aggregatedFlag: false, // 月次集計フラグがfalse（集計されていない）
      },
    ];

    // 月次集計されていないデータで分析処理を実行するとエラーが発生する
    expect(() =>
      analyzeMonthlyExpenseExcess({
        userId: userId,
        targetMonth: targetMonth,
        expenseRecords: expenseRecords,
      })
    ).toThrow(/月次集計/);
  });

  // 月次集計済みのデータを持つ場合、正常に分析が完了する（正常系）
  test('月次集計済みの食費実績データに対する分析処理は正常に完了する', () => {
    const userId = 'user-002';
    const targetMonth = '2024-02';
    const monthlyBudget = 50000;
    const expenseRecords = [
      {
        id: 'expense-003',
        userId: userId,
        date: '2024-02-01',
        amount: 8000,
        category: '野菜',
        aggregatedFlag: true, // 月次集計済み
      },
      {
        id: 'expense-004',
        userId: userId,
        date: '2024-02-05',
        amount: 12000,
        category: '肉類',
        aggregatedFlag: true, // 月次集計済み
      },
      {
        id: 'expense-005',
        userId: userId,
        date: '2024-02-10',
        amount: 7000,
        category: '魚類',
        aggregatedFlag: true, // 月次集計済み
      },
      {
        id: 'expense-006',
        userId: userId,
        date: '2024-02-15',
        amount: 15000,
        category: '加工食品',
        aggregatedFlag: true, // 月次集計済み
      },
    ];

    const result = analyzeMonthlyExpenseExcess({
      userId: userId,
      targetMonth: targetMonth,
      monthlyBudget: monthlyBudget,
      expenseRecords: expenseRecords,
    });

    // 総食費 = 8000 + 12000 + 7000 + 15000 = 42000
    // 予算 = 50000
    // 超過フラグ = false（42000 < 50000）
    // 超過額 = 0（超過していない）
    expect(result).toEqual({
      userId: userId,
      targetMonth: targetMonth,
      totalExpense: 42000,
      monthlyBudget: monthlyBudget,
      excessAmount: 0,
      isExceeded: false,
      categoryBreakdown: {
        野菜: 8000,
        肉類: 12000,
        魚類: 7000,
        加工食品: 15000,
      },
      unitPriceVariationAnalysis: {
        averageUnitPrice: expect.any(Number),
        priceChangePercentage: expect.any(Number),
      },
    });

    expect(result.totalExpense).toBe(42000);
    expect(result.isExceeded).toBe(false);
    expect(result.excessAmount).toBe(0);
  });

  // 月次集計済みで、かつ予算超過している場合、超過要因が正しく分析される
  test('月次集計済みで予算超過している場合、超過要因が正しく分析される', () => {
    const userId = 'user-003';
    const targetMonth = '2024-03';
    const monthlyBudget = 50000;
    const expenseRecords = [
      {
        id: 'expense-007',
        userId: userId,
        date: '2024-03-01',
        amount: 15000,
        category: '野菜',
        aggregatedFlag: true,
      },
      {
        id: 'expense-008',
        userId: userId,
        date: '2024-03-05',
        amount: 18000,
        category: '肉類',
        aggregatedFlag: true,
      },
      {
        id: 'expense-009',
        userId: userId,
        date: '2024-03-10',
        amount: 12000,
        category: '魚類',
        aggregatedFlag: true,
      },
      {
        id: 'expense-010',
        userId: userId,
        date: '2024-03-15',
        amount: 10000,
        category: '加工食品',
        aggregatedFlag: true,
      },
    ];

    const result = analyzeMonthlyExpenseExcess({
      userId: userId,
      targetMonth: targetMonth,
      monthlyBudget: monthlyBudget,
      expenseRecords: expenseRecords,
    });

    // 総食費 = 15000 + 18000 + 12000 + 10000 = 55000
    // 予算 = 50000
    // 超過額 = 5000
    // 超過フラグ = true
    expect(result.totalExpense).toBe(55000);
    expect(result.isExceeded).toBe(true);
    expect(result.excessAmount).toBe(5000);
    expect(result.categoryBreakdown).toEqual({
      野菜: 15000,
      肉類: 18000,
      魚類: 12000,
      加工食品: 10000,
    });
  });

  // 混在データ（集計済みと未集計）がある場合、エラーが発生する
  test('集計済みと未集計が混在する場合、エラーが発生する', () => {
    const userId = 'user-004';
    const targetMonth = '2024-04';
    const expenseRecords = [
      {
        id: 'expense-011',
        userId: userId,
        date: '2024-04-01',
        amount: 5000,
        category: '野菜',
        aggregatedFlag: true, // 集計済み
      },
      {
        id: 'expense-012',
        userId: userId,
        date: '2024-04-05',
        amount: 3000,
        category: '肉類',
        aggregatedFlag: false, // 未集計（混在）
      },
    ];

    expect(() =>
      analyzeMonthlyExpenseExcess({
        userId: userId,
        targetMonth: targetMonth,
        expenseRecords: expenseRecords,
      })
    ).toThrow(/月次集計/);
  });

  // 対象月にデータが存在しない場合、エラーが発生する
  test('対象月にデータが存在しない場合、エラーが発生する', () => {
    const userId = 'user-005';
    const targetMonth = '2024-05';
    const expenseRecords: Array<{
      id: string;
      userId: string;
      date: string;
      amount: number;
      category: string;
      aggregatedFlag: boolean;
    }> = [];

    expect(() =>
      analyzeMonthlyExpenseExcess({
        userId: userId,
        targetMonth: targetMonth,
        expenseRecords: expenseRecords,
      })
    ).toThrow(/月次集計/);
  });
});