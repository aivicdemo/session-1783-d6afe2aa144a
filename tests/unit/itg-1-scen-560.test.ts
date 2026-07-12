import { integrateSeasonalPatternAndDiscountRules } from "../../src/logic/it-1-1-1";

describe("季節パターン・割引率・販売期間の優先度ルール統合機能", () => {
  // SCEN-560
  test("販売期間の開始日と終了日が同一の場合、正しく処理される", () => {
    const salePeriodDate = "2024-01-15";
    const ingredientInput = {
      ingredientId: "ING-001",
      ingredientName: "トマト",
      seasonalPattern: "winter",
      discountRate: 20,
      salePeriodStartDate: salePeriodDate,
      salePeriodEndDate: salePeriodDate,
    };

    const priorityRuleConfig = {
      priorityOrder: ["seasonalPattern", "discountRate", "salePeriod"],
      seasonalPatternWeight: 0.4,
      discountRateWeight: 0.35,
      salePeriodWeight: 0.25,
    };

    const result = integrateSeasonalPatternAndDiscountRules(
      ingredientInput,
      priorityRuleConfig
    );

    expect(result).toEqual({
      ingredientId: "ING-001",
      ingredientName: "トマト",
      seasonalPattern: "winter",
      discountRate: 20,
      salePeriodStartDate: "2024-01-15",
      salePeriodEndDate: "2024-01-15",
      isValidSalePeriod: true,
      priorityScore: 39,
      canBeIncludedInMenu: true,
      generationLogStatus: "processed_successfully",
      sameDatePeriodFlag: true,
    });

    expect(result.isValidSalePeriod).toBe(true);
    expect(result.canBeIncludedInMenu).toBe(true);
    expect(result.generationLogStatus).toBe("processed_successfully");
    expect(result.sameDatePeriodFlag).toBe(true);
    expect(result.priorityScore).toBeGreaterThanOrEqual(0);
    expect(result.priorityScore).toBeLessThanOrEqual(100);
  });
});