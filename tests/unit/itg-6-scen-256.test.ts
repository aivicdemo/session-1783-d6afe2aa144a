import { analyzeMenuGenerationSuccessRateImprovement } from '../../src/logic/it-1-br-8-2-2-1';

describe('献立生成成功率の改善効果定量比較・優先度決定', () => {
  // SCEN-256
  test('改善後成功率が最小閾値未満の場合、改善が不十分として判定され次の改善サイクルへの移行が提示される', () => {
    const baselineSuccessRate = 70;
    const minimumThreshold = 75;
    const improvedSuccessRate = 72;
    const totalMenusGenerated = 100;
    const successfulMenusAfter = Math.round(totalMenusGenerated * (improvedSuccessRate / 100));

    const result = analyzeMenuGenerationSuccessRateImprovement({
      baselineSuccessRate,
      improvedSuccessRate,
      minimumThreshold,
      totalMenusGenerated,
      successfulMenusAfter,
    });

    expect(result.isImprovementSufficient).toBe(false);
    expect(result.currentSuccessRate).toBe(72);
    expect(result.minimumRequiredRate).toBe(75);
    expect(result.rateGap).toBe(-3);
    expect(result.improvementMessage).toMatch(/不十分/);
    expect(result.nextActionRecommended).toBe('next_improvement_cycle');
    expect(result.shouldPresentNextCycleOption).toBe(true);
    expect(result.warningLevel).toBe('warning');
    expect(result.priorityReviewRequired).toBe(true);
  });
});