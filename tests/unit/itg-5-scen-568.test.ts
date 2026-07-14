import { calculateMonthlyFoodExpenseExcessAnalysis } from '../../src/logic/it-7-2-1';

describe('月次食費超過要因分析機能', () => {
  // SCEN-568: [edge] 月次食費超過要因分析機能 - 食費実績が予算上限ちょうどの場合、超過要因分析が実行されない
  test('食費実績が予算上限ちょうどの場合、超過要因分析が実行されず、分析結果データが生成されない', () => {
    const input = {
      userId: 'user-001',
      monthYear: '2024-01',
      budgetLimit: 50000,
      actualExpense: 50000,
      expenseBreakdown: [
        { category: '生鮮食品', amount: 20000 },
        { category: '加工食品', amount: 15000 },
        { category: '調味料', amount: 10000 },
        { category: 'その他', amount: 5000 },
      ],
    };

    const result = calculateMonthlyFoodExpenseExcessAnalysis(input);

    // 超過額が0円であることを検証
    expect(result.excessAmount).toBe(0);

    // 超過フラグがfalseであることを検証
    expect(result.isExceeded).toBe(false);

    // 分析実行フラグがfalseであることを検証
    expect(result.analysisExecuted).toBe(false);

    // 分析結果データが生成されないことを検証
    expect(result.analysisResult).toBeNull();

    // 警告フラグがfalseであることを検証
    expect(result.showAlert).toBe(false);

    // 分析理由メッセージがnullまたは空文字列であることを検証
    expect(result.analysisReason).toBeNull();

    // 超過率が0%であることを検証
    expect(result.excessPercentage).toBe(0);
  });
});