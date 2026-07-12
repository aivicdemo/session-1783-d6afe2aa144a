import { evaluateAlgorithmImprovement } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-436: [edge] アルゴリズム改善度判定機能 - 改善度が最小閾値と正確に等しい場合、判定結果をエッジケースとして正確に返す
  test('改善度が最小閾値と正確に等しい場合、判定結果が境界値ケースとして正確に返されること', () => {
    const minimumThreshold = 0.5;
    const improvementScore = 0.5;
    const previousSatisfactionScore = 75;
    const currentSatisfactionScore = 87;
    const previousCompletionRate = 0.82;
    const currentCompletionRate = 0.88;
    const previousRejectionRate = 0.12;
    const currentRejectionRate = 0.08;
    const previousCookingTimeSavings = 0.65;
    const currentCookingTimeSavings = 0.72;

    const result = evaluateAlgorithmImprovement({
      minimumThreshold,
      improvementScore,
      previousSatisfactionScore,
      currentSatisfactionScore,
      previousCompletionRate,
      currentCompletionRate,
      previousRejectionRate,
      currentRejectionRate,
      previousCookingTimeSavings,
      currentCookingTimeSavings,
    });

    expect(result.status).toBe('BOUNDARY_CASE_PASS');
    expect(result.message).toBe('改善度が最小閾値と正確に等しい境界値ケースです。判定は合格です。');
    expect(result.judgmentResult).toBe(true);
    expect(result.improvementDegree).toBe(0.5);
    expect(result.satisfactionImprovement).toBe(12);
    expect(result.completionRateImprovement).toBe(0.06);
    expect(result.rejectionRateImprovement).toBe(-0.04);
    expect(result.cookingTimeSavingsImprovement).toBe(0.07);
    expect(result.meetsMinimumThreshold).toBe(true);
    expect(typeof result.detailedMetrics).toBe('object');
    expect(result.detailedMetrics.comparisonBasis).toBe('improvement_score_equals_minimum_threshold');
  });
});