import { generateMealPlan } from "../../src/logic/it-1-br-3-2-1";

describe("Purchase Records and Monthly Food Cost Reduction Analysis", () => {
  // SCEN-317
  test("should throw error when family constraints are not registered before meal plan generation", () => {
    const user_id = "user_001";
    const family_members = [];
    const allergies = [];
    const dietary_restrictions = [];

    expect(() =>
      generateMealPlan({
        user_id,
        family_members,
        allergies,
        dietary_restrictions,
      })
    ).toThrow(/家族の制約条件が登録されていません/);
  });
});