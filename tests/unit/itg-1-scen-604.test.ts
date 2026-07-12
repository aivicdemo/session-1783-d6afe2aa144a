import { compareAlgorithmVersions } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-604
  test('[normal] アルゴリズム改善効果比較 - 改善前後のバージョンで成功率・調理時間短縮度・ユーザー満足度スコアが正常に数値比較される', () => {
    const v1Results = {
      successRate: 70,
      avgCookingTimeMinutes: 45,
      avgUserSatisfactionScore: 3.5,
      totalTrials: 10,
    };

    const v2Results = {
      successRate: 85,
      avgCookingTimeMinutes: 32,
      avgUserSatisfactionScore: 4.2,
      totalTrials: 10,
    };

    const comparisonResult = compareAlgorithmVersions(v1Results, v2Results);

    expect(comparisonResult.successRateImprovement).toBe(15);
    expect(comparisonResult.successRateImprovementPercent).toBe(21.43);

    expect(comparisonResult.cookingTimeReductionMinutes).toBe(13);
    expect(comparisonResult.cookingTimeReductionPercent).toBe(28.89);

    expect(comparisonResult.satisfactionScoreDifference).toBe(0.7);

    expect(typeof comparisonResult.successRateImprovement).toBe('number');
    expect(typeof comparisonResult.successRateImprovementPercent).toBe('number');
    expect(typeof comparisonResult.cookingTimeReductionMinutes).toBe('number');
    expect(typeof comparisonResult.cookingTimeReductionPercent).toBe('number');
    expect(typeof comparisonResult.satisfactionScoreDifference).toBe('number');

    expect(comparisonResult).toHaveProperty('successRateImprovement');
    expect(comparisonResult).toHaveProperty('successRateImprovementPercent');
    expect(comparisonResult).toHaveProperty('cookingTimeReductionMinutes');
    expect(comparisonResult).toHaveProperty('cookingTimeReductionPercent');
    expect(comparisonResult).toHaveProperty('satisfactionScoreDifference');

    expect(comparisonResult.successRateImprovement).toBeGreaterThanOrEqual(0);
    expect(comparisonResult.cookingTimeReductionMinutes).toBeGreaterThanOrEqual(0);
    expect(comparisonResult.satisfactionScoreDifference).toBeGreaterThanOrEqual(0);

    expect(v1Results.totalTrials).toBe(10);
    expect(v2Results.totalTrials).toBe(10);
    expect(v1Results.avgUserSatisfactionScore).toBeLessThan(v2Results.avgUserSatisfactionScore);
    expect(v1Results.avgCookingTimeMinutes).toBeGreaterThan(v2Results.avgCookingTimeMinutes);
    expect(v1Results.successRate).toBeLessThan(v2Results.successRate);
  });
});