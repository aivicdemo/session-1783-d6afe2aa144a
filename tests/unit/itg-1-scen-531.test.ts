import { determineNeedForDemandForecastImprovement } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-531
  test("需要予測精度改善判定機能 - 予測値と実績値の乖離率が閾値を超過した場合に改善実施と判定される", () => {
    const predictedMeals = 100;
    const actualMeals = 150;
    const threshold = 20;

    const divergenceRate = ((actualMeals - predictedMeals) / predictedMeals) * 100;
    expect(divergenceRate).toBe(50);

    const result = determineNeedForDemandForecastImprovement({
      predictedMeals,
      actualMeals,
      threshold,
    });

    expect(result.needsImprovement).toBe(true);
    expect(result.divergenceRate).toBe(50);
    expect(result.exceedsThreshold).toBe(true);
    expect(result.recordedAt).toBeDefined();
    expect(typeof result.recordedAt).toBe("string");
  });
});