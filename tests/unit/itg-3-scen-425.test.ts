import { calculateMonthlyBudgetAnalysis } from '../../src/logic/it-1-br-3-2-1';

describe('月次食費最適化分析機能 - 予算超過時削減施策提示', () => {
  // SCEN-425
  test('予算超過時に複数の削減施策が優先度順に提示される', () => {
    // 入力: 当月の予算50,000円、実績食費65,000円（複数カテゴリに分散）
    const monthlyAnalysisInput = {
      user_id: 'user_001',
      budget_amount: 50000,
      actual_expenses: 65000,
      expense_breakdown: [
        {
          category: '外食',
          amount: 15000,
          reduction_potential: 5000,
        },
        {
          category: '食材',
          amount: 35000,
          reduction_potential: 7000,
        },
        {
          category: '中食',
          amount: 15000,
          reduction_potential: 3000,
        },
      ],
      analysis_date: '2024-01-31',
    };

    const result = calculateMonthlyBudgetAnalysis(monthlyAnalysisInput);

    // 予算超過が正しく検出される
    expect(result.is_over_budget).toBe(true);
    expect(result.overage_amount).toBe(15000);

    // 削減施策の一覧が表示される
    expect(Array.isArray(result.reduction_measures)).toBe(true);
    expect(result.reduction_measures.length).toBeGreaterThan(0);

    // 削減施策が優先度順（削減効果が高い順）に並んでいる
    expect(result.reduction_measures[0].priority_rank).toBe(1);
    expect(result.reduction_measures[0].category).toBe('食材');
    expect(result.reduction_measures[0].estimated_reduction).toBe(7000);

    expect(result.reduction_measures[1].priority_rank).toBe(2);
    expect(result.reduction_measures[1].category).toBe('外食');
    expect(result.reduction_measures[1].estimated_reduction).toBe(5000);

    expect(result.reduction_measures[2].priority_rank).toBe(3);
    expect(result.reduction_measures[2].category).toBe('中食');
    expect(result.reduction_measures[2].estimated_reduction).toBe(3000);

    // 各削減施策に推定削減額が記載される
    for (const measure of result.reduction_measures) {
      expect(typeof measure.estimated_reduction).toBe('number');
      expect(measure.estimated_reduction).toBeGreaterThan(0);
    }

    // 削減施策の合計で予算内に収まる
    const total_reduction = result.reduction_measures.reduce(
      (sum, measure) => sum + measure.estimated_reduction,
      0
    );
    expect(total_reduction).toBe(15000);
    expect(result.actual_expenses - total_reduction).toBe(result.budget_amount);

    // 分析結果が適切に返される
    expect(result.analysis_status).toBe('completed');
    expect(result.recommendation).toBe('施策を実行することで予算内に収めることが可能です');
  });
});