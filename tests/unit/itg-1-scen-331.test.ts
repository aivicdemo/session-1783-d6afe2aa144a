import { generateMealPlan } from "../../src/logic/it-1-1-1";

describe("献立生成要求処理 - 家族成員が0人の状態でのエラーハンドリング", () => {
  test("SCEN-331: 家族成員が0人の状態で献立生成要求されたときエラーが返される", () => {
    const userId = "user-001";
    const familyMembers: never[] = [];
    const constraints = {
      budget: 5000,
      cookingTimeMinutes: 60,
      allergies: [],
      dietaryRestrictions: [],
    };

    expect(() =>
      generateMealPlan({
        userId,
        familyMembers,
        constraints,
      })
    ).toThrow(/家族成員/);
  });
});