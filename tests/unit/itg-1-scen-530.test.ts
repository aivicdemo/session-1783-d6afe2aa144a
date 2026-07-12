import { calculateDemandForecastImprovementDecision } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-530: [normal] 需要予測精度改善判定機能 - 予測値と実績値の乖離率が閾値以下の場合に改善見送りと判定される
  test('予測値100食、実績値98食、閾値5%の場合、乖離率2%で改善見送りと判定される', () => {
    const forecastQuantity = 100;
    const actualQuantity = 98;
    const improvementThreshold = 5;

    const result = calculateDemandForecastImprovementDecision({
      forecastQuantity,
      actualQuantity,
      improvementThreshold,
    });

    expect(result.deviationRate).toBe(2);
    expect(result.decision).toBe('改善見送り');
    expect(result.isWithinThreshold).toBe(true);
  });
});