import { generateLogExtractionSpec } from "../../src/logic/it-2";

describe("家族成員の食事評価データの蓄積・管理機能", () => {
  // SCEN-651: [edge] ログ抽出仕様書生成機能 - 抽出対象期間が1日の場合でも正しく仕様書が生成される
  test("抽出対象期間が1日（同一日付）の場合、エラーなく正しくログ抽出仕様書が生成される", () => {
    const startDate = new Date("2024-01-15T00:00:00Z");
    const endDate = new Date("2024-01-15T23:59:59Z");
    const requiredMetrics = [
      "献立生成成功率",
      "調理時間短縮度",
      "ユーザー満足度スコア",
      "制約条件入力パターン",
      "離脱ポイント",
    ];

    const result = generateLogExtractionSpec({
      extractStartDateTime: startDate,
      extractEndDateTime: endDate,
      requiredMetrics: requiredMetrics,
    });

    expect(result).toBeDefined();
    expect(result.extractStartDateTime).toEqual(startDate);
    expect(result.extractEndDateTime).toEqual(endDate);
    expect(result.extractionPeriodDays).toBe(1);
    expect(result.requiredMetrics).toEqual(requiredMetrics);
    expect(result.requiredMetrics.length).toBe(5);
    expect(result.specificationGenerated).toBe(true);
    expect(result.startTimeOfDay).toBe("00:00:00");
    expect(result.endTimeOfDay).toBe("23:59:59");
    expect(result.dataRangeInclusivity).toBe("full");
  });
});