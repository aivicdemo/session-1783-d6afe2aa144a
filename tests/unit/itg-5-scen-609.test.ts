import { aggregateMonthlyFoodExpenseAndProposePriorities } from '../../src/logic/it-7-2-1';

describe('月次食費集計・次月優先条件提案機能 - 食事評価データ欠落時のNULL値処理', () => {
  // SCEN-609
  test('食事評価データの満足度スコアがNULLの場合、システムはエラーをスローせず、NULL値を適切に処理して月次食費集計と次月優先条件提案が正常に完了する', () => {
    const input = {
      userId: 'user-001',
      month: '2024-01',
      monthlyFoodExpenseRecords: [
        {
          recordId: 'expense-001',
          userId: 'user-001',
          month: '2024-01',
          totalAmount: 45000,
          budgetAmount: 50000,
          recordDate: '2024-01-31T23:59:59Z',
        },
      ],
      mealEvaluationRecords: [
        {
          evaluationId: 'eval-001',
          mealId: 'meal-001',
          userId: 'user-001',
          satisfactionScore: null,
          completionRate: 0.85,
          requestText: 'もっと野菜を',
          evaluationDate: '2024-01-15T18:00:00Z',
        },
        {
          evaluationId: 'eval-002',
          mealId: 'meal-002',
          userId: 'user-001',
          satisfactionScore: 4.2,
          completionRate: 0.95,
          requestText: '美味しかった',
          evaluationDate: '2024-01-22T18:00:00Z',
        },
      ],
      priorityCriteria: {
        budgetOptimizationWeight: 0.3,
        nutritionBalanceWeight: 0.4,
        userSatisfactionWeight: 0.3,
        defaultSatisfactionScore: 3.0,
      },
    };

    const result = aggregateMonthlyFoodExpenseAndProposePriorities(input);

    expect(result).toBeDefined();
    expect(result.monthlyExpenseSummary).toBeDefined();
    expect(result.monthlyExpenseSummary.totalAmount).toBe(45000);
    expect(result.monthlyExpenseSummary.budgetAmount).toBe(50000);
    expect(result.monthlyExpenseSummary.budgetSurplusOrDeficit).toBe(5000);
    expect(result.monthlyExpenseSummary.budgetSurplusRatePercent).toBe(10);

    expect(result.evaluationDataProcessing).toBeDefined();
    expect(result.evaluationDataProcessing.totalRecords).toBe(2);
    expect(result.evaluationDataProcessing.recordsWithNullSatisfaction).toBe(1);
    expect(result.evaluationDataProcessing.recordsProcessed).toBe(2);
    expect(result.evaluationDataProcessing.processingMethod).toBe('default_value_applied');

    expect(result.aggregatedSatisfactionScore).toBeDefined();
    expect(result.aggregatedSatisfactionScore).toBe(3.6);

    expect(result.nextMonthPriorityConditions).toBeDefined();
    expect(Array.isArray(result.nextMonthPriorityConditions)).toBe(true);
    expect(result.nextMonthPriorityConditions.length).toBeGreaterThan(0);

    const priorityCondition = result.nextMonthPriorityConditions[0];
    expect(priorityCondition.priorityType).toBeDefined();
    expect(['budget_optimization', 'nutrition_balance', 'user_satisfaction']).toContain(
      priorityCondition.priorityType
    );
    expect(priorityCondition.priorityScore).toBeGreaterThanOrEqual(0);
    expect(priorityCondition.priorityScore).toBeLessThanOrEqual(100);
    expect(priorityCondition.recommendedAction).toBeDefined();

    expect(result.processStatus).toBe('success');
    expect(result.errorOccurred).toBe(false);
    expect(result.errorMessage).toBeUndefined();
  });
});