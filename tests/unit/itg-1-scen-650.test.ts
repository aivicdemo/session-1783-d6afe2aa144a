import { generateLogExtractionSpecification } from "../../src/logic/it-2";

describe("家族成員の食事評価データの蓄積・管理機能", () => {
  // SCEN-650
  test("ログ抽出仕様書生成機能 - 抽出対象期間の開始日が終了日より後の場合にバリデーションエラーが発生する", () => {
    const startDate = "2024-12-31";
    const endDate = "2024-12-01";

    expect(() =>
      generateLogExtractionSpecification({
        startDate,
        endDate,
        requiredMetrics: [
          "献立生成成功率",
          "調理時間短縮度",
          "ユーザー満足度スコア",
          "制約条件入力パターン",
          "離脱ポイント",
        ],
      })
    ).toThrow(/開始日は終了日以前の日付を指定してください/);
  });
});