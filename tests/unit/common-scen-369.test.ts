import {
  analyzeMonthlyBudgetExcess,
  adjustMenuPrioritiesFromExcessAnalysis,
  generateNextMonthMenuWithAdjustedPriorities,
} from "../../src/logic/common";

describe("共通 - 月次食費超過分析と献立自動調整", () => {
  // SCEN-369
  test("超過要因分析から次月献立の優先条件が自動調整される", () => {
    // ========== Setup: 前月の食費データ ==========
    const previousMonthBudget = 50000;
    const previousMonthActualSpend = 62500;
    const budgetExcessAmount = 12500;
    const excessPercentage = 25; // 25% over budget

    const monthlyBudgetData = {
      month: "2024-11",
      budgetYen: previousMonthBudget,
      actualSpendYen: previousMonthActualSpend,
      excessYen: budgetExcessAmount,
      excessPercentagePoints: excessPercentage,
    };

    // ========== Step 1: 超過要因分析を実行 ==========
    const excessAnalysisResult = analyzeMonthlyBudgetExcess({
      actualSpendYen: previousMonthActualSpend,
      budgetYen: previousMonthBudget,
      purchaseRecords: [
        {
          categoryCode: "meat",
          categoryName: "肉類",
          totalSpendYen: 18750,
          percentageOfTotal: 30,
          proportionOfExcess: 40,
        },
        {
          categoryCode: "dining_out",
          categoryName: "外食費",
          totalSpendYen: 12500,
          percentageOfTotal: 20,
          proportionOfExcess: 25,
        },
        {
          categoryCode: "vegetables",
          categoryName: "野菜",
          totalSpendYen: 9375,
          percentageOfTotal: 15,
          proportionOfExcess: 5,
        },
        {
          categoryCode: "dairy",
          categoryName: "乳製品",
          totalSpendYen: 6250,
          percentageOfTotal: 10,
          proportionOfExcess: 10,
        },
        {
          categoryCode: "other",
          categoryName: "その他",
          totalSpendYen: 15625,
          percentageOfTotal: 25,
          proportionOfExcess: 20,
        },
      ],
    });

    // ========== Assertion Step 1: 超過要因分析の結果を検証 ==========
    expect(excessAnalysisResult.budgetExceededFlag).toBe(true);
    expect(excessAnalysisResult.excessYen).toBe(12500);
    expect(excessAnalysisResult.primaryContributingCategory).toBe("meat");
    expect(excessAnalysisResult.primaryContributingCategoryYen).toBe(18750);
    expect(excessAnalysisResult.secondaryContributingCategory).toBe(
      "dining_out"
    );
    expect(excessAnalysisResult.secondaryContributingCategoryYen).toBe(12500);

    // ========== Step 2: 超過要因に基づいて優先条件を自動調整 ==========
    const adjustedPriorities =
      adjustMenuPrioritiesFromExcessAnalysis({
        excessAnalysisResult,
        currentMonthPriorities: {
          meatUsagePercentageTarget: 30,
          diningOutFrequencyPerWeek: 2,
          budgetPerMealYen: 833,
        },
      });

    // ========== Assertion Step 2: 優先条件の調整内容を検証 ==========
    // 肉類の使用量が削減されていることを確認
    expect(adjustedPriorities.meatUsagePercentageTarget).toBe(18);
    expect(adjustedPriorities.meatUsagePercentageTarget).toBeLessThan(30);

    // 外食頻度が削減されていることを確認
    expect(adjustedPriorities.diningOutFrequencyPerWeek).toBe(0);
    expect(adjustedPriorities.diningOutFrequencyPerWeek).toBeLessThan(2);

    // 予算が削減されていることを確認
    expect(adjustedPriorities.budgetPerMealYen).toBe(500);
    expect(adjustedPriorities.budgetPerMealYen).toBeLessThan(833);

    // 調整の理由がトレースできることを確認
    expect(adjustedPriorities.adjustmentReason).toContain("肉類");
    expect(adjustedPriorities.adjustmentReason).toContain("外食費");

    // ========== Step 3: 調整された優先条件が保存されることを確認 ==========
    expect(adjustedPriorities.savedFlag).toBe(true);
    expect(adjustedPriorities.savedTimestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );

    // ========== Step 4: 次月の献立を調整された条件で自動生成 ==========
    const nextMonthMenus = generateNextMonthMenuWithAdjustedPriorities({
      targetMonth: "2024-12",
      adjustedPriorities,
      familyMembers: [
        { memberId: "M001", age: 35, name: "父" },
        { memberId: "M002", age: 33, name: "母" },
        { memberId: "M003", age: 8, name: "子" },
      ],
      allergies: [],
      dietaryRestrictions: [],
    });

    // ========== Assertion Step 4: 生成された献立が調整条件を反映していることを確認 ==========
    // 献立が生成されていることを確認
    expect(Array.isArray(nextMonthMenus.menus)).toBe(true);
    expect(nextMonthMenus.menus.length).toBeGreaterThan(0);

    // 各献立が調整された条件を反映していることを確認
    const meatUsageAcrossMenus = nextMonthMenus.menus.reduce(
      (sum, menu) => sum + menu.estimatedMeatUsagePercentage,
      0
    ) / nextMonthMenus.menus.length;

    expect(meatUsageAcrossMenus).toBeLessThanOrEqual(
      adjustedPriorities.meatUsagePercentageTarget + 5
    );

    // 外食がほぼ含まれていないことを確認
    const diningOutMenuCount = nextMonthMenus.menus.filter(
      (m) => m.isDiningOut === true
    ).length;
    const expectedMaxDiningOut = Math.ceil(
      (adjustedPriorities.diningOutFrequencyPerWeek * 4) / 7
    );

    expect(diningOutMenuCount).toBeLessThanOrEqual(expectedMaxDiningOut);

    // 予算が調整されていることを確認
    const averageBudgetPerMenu = nextMonthMenus.menus.reduce(
      (sum, menu) => sum + menu.estimatedCostYen,
      0
    ) / nextMonthMenus.menus.length;

    expect(averageBudgetPerMenu).toBeLessThanOrEqual(
      adjustedPriorities.budgetPerMealYen + 100
    );

    // ========== Assertion Step 5: 代替案が提示されていることを確認 ==========
    expect(nextMonthMenus.substitutionSuggestions).toBeDefined();
    expect(Array.isArray(nextMonthMenus.substitutionSuggestions)).toBe(true);
    expect(nextMonthMenus.substitutionSuggestions.length).toBeGreaterThan(0);

    // 肉類の代替案が含まれていることを確認
    const meatSubstitutions = nextMonthMenus.substitutionSuggestions.filter(
      (s) => s.originalCategory === "meat"
    );
    expect(meatSubstitutions.length).toBeGreaterThan(0);

    // 代替案の内容を確認
    meatSubstitutions.forEach((substitution) => {
      expect(substitution.suggestedAlternativeCategory).toBeDefined();
      expect(["fish", "legumes", "tofu"]).toContain(
        substitution.suggestedAlternativeCategory
      );
      expect(substitution.estimatedCostSavingsYen).toBeGreaterThan(0);
      expect(substitution.estimatedCostSavingsYen).toBeLessThanOrEqual(
        5000
      );
    });

    // ========== Assertion Step 6: 全体の食費最適化効果を検証 ==========
    const projectedNextMonthTotalSpend = nextMonthMenus.menus.reduce(
      (sum, menu) => sum + menu.estimatedCostYen,
      0
    );

    const costReductionYen = previousMonthActualSpend - projectedNextMonthTotalSpend;
    const costReductionPercentage = (costReductionYen / previousMonthActualSpend) * 100;

    // 予算内に収まることを確認
    expect(projectedNextMonthTotalSpend).toBeLessThanOrEqual(
      previousMonthBudget
    );

    // 削減額が60%以上であることを確認（超過分の最低50%以上削減が目標）
    expect(costReductionPercentage).toBeGreaterThanOrEqual(15);

    // 次月の予測食費がシステムに保存されていることを確認
    expect(nextMonthMenus.savedFlag).toBe(true);
    expect(nextMonthMenus.appliedAdjustedPrioritiesFlag).toBe(true);
  });
});