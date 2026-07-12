import { compareAlgorithmImprovementEffects } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-605
  test("改善前後のバージョンデータが存在しない場合にエラーハンドリングされる", () => {
    const beforeVersionId = "v1.0.0";
    const afterVersionId = "v2.0.0";

    const inputData = {
      beforeVersionId,
      afterVersionId,
      beforeVersionMetrics: null,
      afterVersionMetrics: null,
    };

    expect(() => {
      compareAlgorithmImprovementEffects(inputData);
    }).toThrow(/バージョンデータ/);
  });
});