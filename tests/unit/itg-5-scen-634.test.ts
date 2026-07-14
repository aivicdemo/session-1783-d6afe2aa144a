import { calculateAlgorithmImprovementComparison } from "../../src/logic/it-7-2-1";

describe("献立生成アルゴリズムの改善効果定量比較", () => {
  test("SCEN-634: 改善前のベースラインデータが存在しない場合、比較計算がエラー処理される", () => {
    // ベースラインデータなし、改善後データのみの入力
    const improvementAfterMetrics = {
      successRate: 85,
      cookingTimeReduction: 12.5,
      userSatisfactionScore: 4.2,
    };

    const baselineMetrics = null;

    // ベースラインデータが存在しない場合のエラーハンドリング
    expect(() =>
      calculateAlgorithmImprovementComparison({
        baseline: baselineMetrics,
        improvement: improvementAfterMetrics,
        algorithmVersionId: "algo-v2-missing-baseline",
      })
    ).toThrow(/ベースラインデータ/);
  });
});