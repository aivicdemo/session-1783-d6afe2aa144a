import { detectConflictingConstraints } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-512: [error] 優先条件競合検証・調整機能 - 優先条件に空値が含まれる場合、妥当性検証がエラーを返す
  test("優先条件に空値が含まれる場合、妥当性検証がエラーを返す", () => {
    const conflictingConstraints = {
      nutritionBalance: 80,
      cookingTime: null,
      budget: 5000,
      dietaryRestriction: "gluten-free",
      allergyInfo: undefined,
    };

    expect(() => {
      detectConflictingConstraints(conflictingConstraints);
    }).toThrow(/優先条件に空値が含まれています/);
  });
});