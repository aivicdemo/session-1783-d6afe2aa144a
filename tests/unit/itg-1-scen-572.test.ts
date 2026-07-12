import { calculateSeasonalPriorityScore } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-572
  test("季節食材・割引商品の優先度スコア計算 - 不正な季節パターンコードが入力された場合、エラーが発生する", () => {
    // 空文字列を入力した場合
    expect(() => {
      calculateSeasonalPriorityScore({
        seasonalPatternCode: "",
        discountRate: 15,
        inventoryLevel: 80,
      });
    }).toThrow(/季節パターンコード/);

    // null を入力した場合
    expect(() => {
      calculateSeasonalPriorityScore({
        seasonalPatternCode: null as any,
        discountRate: 15,
        inventoryLevel: 80,
      });
    }).toThrow(/季節パターンコード/);

    // undefined を入力した場合
    expect(() => {
      calculateSeasonalPriorityScore({
        seasonalPatternCode: undefined as any,
        discountRate: 15,
        inventoryLevel: 80,
      });
    }).toThrow(/季節パターンコード/);

    // 記号のみを入力した場合
    expect(() => {
      calculateSeasonalPriorityScore({
        seasonalPatternCode: "!!!",
        discountRate: 15,
        inventoryLevel: 80,
      });
    }).toThrow(/季節パターンコード/);

    // 範囲外の数値を入力した場合
    expect(() => {
      calculateSeasonalPriorityScore({
        seasonalPatternCode: "999",
        discountRate: 15,
        inventoryLevel: 80,
      });
    }).toThrow(/季節パターンコード/);

    // 正常な季節パターンコード（例：S001）を入力した場合はスコア計算が実行される
    const result = calculateSeasonalPriorityScore({
      seasonalPatternCode: "S001",
      discountRate: 15,
      inventoryLevel: 80,
    });
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});