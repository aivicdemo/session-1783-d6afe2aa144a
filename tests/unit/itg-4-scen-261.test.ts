import { extractDemandForecastDataInUnifiedFormat } from "../../src/logic/it-2-br-6-3-2";

describe("需要予測データ統一フォーマット抽出機能", () => {
  // SCEN-261: [edge] 需要予測データ統一フォーマット抽出機能 - 指定期間にデータが存在しない場合に空配列を返す
  test("指定期間にデータが存在しない場合に空配列を返す", () => {
    const start_date = new Date("2024-01-01T00:00:00Z");
    const end_date = new Date("2024-01-31T23:59:59Z");
    const user_id = "user_001";

    const result = extractDemandForecastDataInUnifiedFormat({
      user_id,
      start_date,
      end_date,
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
    expect(result).toEqual([]);
  });
});