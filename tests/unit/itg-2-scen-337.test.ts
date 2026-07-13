import { rankMenuCandidatesByConstraints } from "../../src/logic/it-1-br-2-1-1-1";

describe("栄養摂取推移分析ダッシュボード - 複数制約条件下での献立候補ランキング", () => {
  // SCEN-337
  test("予算上限が0円の場合、エラーメッセージが表示される", () => {
    const constraints = {
      nutritionTargets: {
        calories: { min: 1800, max: 2200 },
        protein: { min: 50, max: 100 },
        fat: { min: 50, max: 80 },
        carbohydrates: { min: 200, max: 300 },
      },
      foodRestrictions: ["eggplant", "shellfish"],
      budgetLimit: 0,
      cookingTimeLimit: 60,
    };

    expect(() => rankMenuCandidatesByConstraints(constraints)).toThrow(/予算上限/);
  });
});