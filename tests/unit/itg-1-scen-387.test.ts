import { analyzeDeviationAndGenerateProposals } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-387: [edge] 需要予測精度の乖離分析機能 - 予測値と実績値が完全に一致した場合、乖離度がゼロと計算され改善提案は生成されない
  test('予測値と実績値が完全に一致する場合、乖離度はゼロで改善提案は生成されない', () => {
    const predictedMenuCount = 14;
    const actualMenuCount = 14;
    const predictedNutritionCalories = 2100;
    const actualNutritionCalories = 2100;
    const predictedCookingTimeMinutes = 45;
    const actualCookingTimeMinutes = 45;
    const predictedBudgetYen = 5000;
    const actualBudgetYen = 5000;

    const result = analyzeDeviationAndGenerateProposals({
      predictedMenuCount,
      actualMenuCount,
      predictedNutritionCalories,
      actualNutritionCalories,
      predictedCookingTimeMinutes,
      actualCookingTimeMinutes,
      predictedBudgetYen,
      actualBudgetYen,
      analysisStartDate: '2024-01-15',
      analysisEndDate: '2024-01-21',
    });

    expect(result.deviationDegreeMenu).toBe(0.0);
    expect(result.deviationDegreeNutrition).toBe(0.0);
    expect(result.deviationDegreeCookingTime).toBe(0.0);
    expect(result.deviationDegreeBudget).toBe(0.0);
    expect(result.proposalCount).toBe(0);
    expect(result.proposals).toEqual([]);
    expect(result.processingStatus).toBe('completed');
    expect(result.errorOccurred).toBe(false);
  });
});