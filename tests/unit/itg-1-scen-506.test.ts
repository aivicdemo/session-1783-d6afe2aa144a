import { determineMenuPriorityConditions } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-506
  test("[normal] 月次分析ダッシュボード・献立優先条件決定機能 - 食費超過なく栄養基準を満たす場合、優先条件の判定結果が正常に決定される", () => {
    const monthlyBudget = 10000;
    const accumulatedExpense = 9500;
    const remainingBudget = monthlyBudget - accumulatedExpense;

    const nutritionStandards = {
      protein: { target: 50, actual: 52 },
      vitamin: { target: 100, actual: 105 },
      mineral: { target: 80, actual: 85 },
    };

    const allNutritionMet = Object.values(nutritionStandards).every(
      (item) => item.actual >= item.target
    );

    const input = {
      monthlyBudget,
      accumulatedExpense,
      nutritionStandards,
      budgetExceeded: accumulatedExpense > monthlyBudget,
      allNutritionStandardsMet: allNutritionMet,
    };

    const result = determineMenuPriorityConditions(input);

    expect(result).toEqual({
      remainingBudget: 500,
      budgetStatus: "within_budget",
      nutritionStatus: "all_standards_met",
      judgmentStatus: "conditions_satisfied",
      priorityCondition: "balanced",
      recommendedMenuPriority: "standard",
    });

    expect(result.remainingBudget).toBe(500);
    expect(result.budgetStatus).toBe("within_budget");
    expect(result.nutritionStatus).toBe("all_standards_met");
    expect(result.judgmentStatus).toBe("conditions_satisfied");
  });
});