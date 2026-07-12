import { validateAndApplySalesPeriodRule } from "../../src/logic/it-1-1-1";

describe("季節パターン・割引率・販売期間の優先度ルール統合機能", () => {
  // SCEN-558: [normal] 販売期間（キャンペーン期間）がルール仕様書に正しく反映される
  test("販売期間外および期間内のクエリで割引率と季節パターンが正しく適用される", () => {
    const ruleSalesPromotionPeriod = {
      promotion_id: "PROMO_2024_JAN",
      season_pattern: "winter",
      discount_rate: 20,
      sales_period_start: new Date("2024-01-01T00:00:00Z"),
      sales_period_end: new Date("2024-01-31T23:59:59Z"),
    };

    const queryDateOutside = new Date("2024-02-05T10:00:00Z");
    const queryDateInside = new Date("2024-01-15T10:00:00Z");

    const mealDataOutside = {
      meal_id: "MEAL_001",
      query_date: queryDateOutside,
      ingredients: [
        {
          ingredient_id: "ING_CARROT",
          base_price: 100,
          is_seasonal: true,
        },
      ],
    };

    const mealDataInside = {
      meal_id: "MEAL_002",
      query_date: queryDateInside,
      ingredients: [
        {
          ingredient_id: "ING_TOMATO",
          base_price: 150,
          is_seasonal: true,
        },
      ],
    };

    const resultOutside = validateAndApplySalesPeriodRule(
      mealDataOutside,
      ruleSalesPromotionPeriod
    );
    const resultInside = validateAndApplySalesPeriodRule(
      mealDataInside,
      ruleSalesPromotionPeriod
    );

    expect(resultOutside.applied_discount_rate).toBe(0);
    expect(resultOutside.season_pattern_applied).toBe(null);
    expect(resultOutside.is_within_sales_period).toBe(false);

    expect(resultInside.applied_discount_rate).toBe(20);
    expect(resultInside.season_pattern_applied).toBe("winter");
    expect(resultInside.is_within_sales_period).toBe(true);

    const expectedPriceOutside = 100;
    const expectedPriceInside = 150 * (1 - 20 / 100);

    expect(resultOutside.adjusted_ingredient_price).toBe(expectedPriceOutside);
    expect(resultInside.adjusted_ingredient_price).toBe(expectedPriceInside);

    expect(resultOutside.rule_specification).toEqual({
      promotion_id: "PROMO_2024_JAN",
      season_pattern: "winter",
      discount_rate: 20,
      sales_period_start: "2024-01-01T00:00:00Z",
      sales_period_end: "2024-01-31T23:59:59Z",
    });

    expect(resultInside.rule_specification).toEqual({
      promotion_id: "PROMO_2024_JAN",
      season_pattern: "winter",
      discount_rate: 20,
      sales_period_start: "2024-01-01T00:00:00Z",
      sales_period_end: "2024-01-31T23:59:59Z",
    });

    expect(resultOutside.is_valid_rule).toBe(true);
    expect(resultInside.is_valid_rule).toBe(true);
  });
});