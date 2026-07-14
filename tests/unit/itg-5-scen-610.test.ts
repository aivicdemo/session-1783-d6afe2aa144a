import { calculateMonthlyFoodExpenseSummary, calculateReductionRate, generateNextMonthPriorityProposal } from '../../src/logic/it-7-2-1';

describe('月次食費集計・次月優先条件提案機能', () => {
  // SCEN-610: [edge] 月次食費集計・次月優先条件提案機能 - 予算を超過した場合、削減率がマイナス値として正しく計算される
  test('予算を超過した場合、削減率がマイナス値として正確に計算され、次月優先条件提案に反映される', () => {
    // テストデータ: 当月の食費合計が予算を超過するシナリオ
    // 予算: 10,000円、実績: 12,000円
    const monthlyBudget = 10000;
    const actualExpense = 12000;
    const userId = 'user_001';
    const year = 2024;
    const month = 1;

    // 月次食費集計機能を実行
    const monthlySummary = calculateMonthlyFoodExpenseSummary({
      userId: userId,
      year: year,
      month: month,
      budgetAmount: monthlyBudget,
      actualAmount: actualExpense,
    });

    // 月次集計結果の検証: 実績額が正確に記録される
    expect(monthlySummary.actualExpense).toBe(12000);
    expect(monthlySummary.budgetAmount).toBe(10000);

    // 削減率計算ロジックを呼び出す
    // 計算式: (予算 - 実績) / 予算 = (10,000 - 12,000) / 10,000 = -2,000 / 10,000 = -0.2
    const reductionRate = calculateReductionRate({
      budgetAmount: monthlyBudget,
      actualExpense: actualExpense,
    });

    // 削減率がマイナス値として正確に計算されていることを確認
    expect(reductionRate).toBe(-0.2); // -20%

    // マイナス削減率に基づいて次月優先条件提案ロジックが実行される
    const nextMonthProposal = generateNextMonthPriorityProposal({
      userId: userId,
      currentReductionRate: reductionRate,
      currentBudgetAmount: monthlyBudget,
      currentActualExpense: actualExpense,
    });

    // 提案内容が「予算超過」であり、削減が必要な旨の推奨が表示されていることを確認
    expect(nextMonthProposal.proposalType).toBe('budget_exceeded');
    expect(nextMonthProposal.recommendedAction).toBe('cost_reduction_required');
    expect(nextMonthProposal.excessAmount).toBe(2000); // 12,000 - 10,000 = 2,000円の超過
    expect(nextMonthProposal.reductionRatePercentage).toBe(-20); // -20% を百分率で表示
    expect(nextMonthProposal.suggestedReductionTarget).toBe(2000); // 次月は 2,000 円以上の削減が必要
    expect(nextMonthProposal.priority).toBe('high'); // 超過時は優先度を高に設定
  });
});