import { integrateMenuGenerationRules } from "../../src/logic/it-1-1-1";

describe("季節パターン・割引率・販売期間の優先度ルール統合機能", () => {
  // SCEN-559: [error] 季節パターン・割引率・販売期間の優先度ルール統合機能 - 無効な割引率データが提示された場合、統合が拒否される
  test("割引率が無効な値の場合、統合処理が拒否され、エラーメッセージが表示される", () => {
    const seasonalPatterns = ["spring", "summer", "autumn", "winter"];
    const salesPeriodStart = "2024-04-01";
    const salesPeriodEnd = "2024-06-30";

    // Test Case 1: 負の割引率 (-10%)
    const invalidDiscountRateNegative = -10;
    expect(() =>
      integrateMenuGenerationRules({
        seasonalPatterns,
        discountRate: invalidDiscountRateNegative,
        salesPeriodStart,
        salesPeriodEnd,
      })
    ).toThrow(/割引率/);

    // Test Case 2: 100を超える割引率 (150%)
    const invalidDiscountRateExcessive = 150;
    expect(() =>
      integrateMenuGenerationRules({
        seasonalPatterns,
        discountRate: invalidDiscountRateExcessive,
        salesPeriodStart,
        salesPeriodEnd,
      })
    ).toThrow(/割引率/);

    // Test Case 3: null値
    const invalidDiscountRateNull = null;
    expect(() =>
      integrateMenuGenerationRules({
        seasonalPatterns,
        discountRate: invalidDiscountRateNull as any,
        salesPeriodStart,
        salesPeriodEnd,
      })
    ).toThrow(/割引率/);

    // Test Case 4: 文字列値
    const invalidDiscountRateString = "50%";
    expect(() =>
      integrateMenuGenerationRules({
        seasonalPatterns,
        discountRate: invalidDiscountRateString as any,
        salesPeriodStart,
        salesPeriodEnd,
      })
    ).toThrow(/割引率/);

    // Test Case 5: undefined値
    const invalidDiscountRateUndefined = undefined;
    expect(() =>
      integrateMenuGenerationRules({
        seasonalPatterns,
        discountRate: invalidDiscountRateUndefined as any,
        salesPeriodStart,
        salesPeriodEnd,
      })
    ).toThrow(/割引率/);

    // Test Case 6: 有効な割引率 (0～100の範囲内) - 成功ケース
    const validDiscountRateMin = 0;
    const result_min = integrateMenuGenerationRules({
      seasonalPatterns,
      discountRate: validDiscountRateMin,
      salesPeriodStart,
      salesPeriodEnd,
    });
    expect(result_min).toEqual({
      seasonalPatterns: ["spring", "summer", "autumn", "winter"],
      discountRate: 0,
      salesPeriodStart: "2024-04-01",
      salesPeriodEnd: "2024-06-30",
      status: "integrated",
      timestamp: expect.any(String),
    });

    // Test Case 7: 有効な割引率 (中間値) - 成功ケース
    const validDiscountRateMiddle = 50;
    const result_middle = integrateMenuGenerationRules({
      seasonalPatterns,
      discountRate: validDiscountRateMiddle,
      salesPeriodStart,
      salesPeriodEnd,
    });
    expect(result_middle).toEqual({
      seasonalPatterns: ["spring", "summer", "autumn", "winter"],
      discountRate: 50,
      salesPeriodStart: "2024-04-01",
      salesPeriodEnd: "2024-06-30",
      status: "integrated",
      timestamp: expect.any(String),
    });

    // Test Case 8: 有効な割引率 (最大値) - 成功ケース
    const validDiscountRateMax = 100;
    const result_max = integrateMenuGenerationRules({
      seasonalPatterns,
      discountRate: validDiscountRateMax,
      salesPeriodStart,
      salesPeriodEnd,
    });
    expect(result_max).toEqual({
      seasonalPatterns: ["spring", "summer", "autumn", "winter"],
      discountRate: 100,
      salesPeriodStart: "2024-04-01",
      salesPeriodEnd: "2024-06-30",
      status: "integrated",
      timestamp: expect.any(String),
    });

    // Test Case 9: 小数点を含む有効な割下率 - 成功ケース
    const validDiscountRateDecimal = 33.5;
    const result_decimal = integrateMenuGenerationRules({
      seasonalPatterns,
      discountRate: validDiscountRateDecimal,
      salesPeriodStart,
      salesPeriodEnd,
    });
    expect(result_decimal).toEqual({
      seasonalPatterns: ["spring", "summer", "autumn", "winter"],
      discountRate: 33.5,
      salesPeriodStart: "2024-04-01",
      salesPeriodEnd: "2024-06-30",
      status: "integrated",
      timestamp: expect.any(String),
    });
  });
});