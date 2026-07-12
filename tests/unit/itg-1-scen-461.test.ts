import { validateDietaryRestriction } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-461: [error] 食事制限条件の入力妥当性判定機能 - 空文字列の食事制限条件は不妥当と判定される
  test("空文字列の食事制限条件は不妥当と判定されエラーが発生する", () => {
    const restrictionCondition = "";

    expect(() => {
      validateDietaryRestriction(restrictionCondition);
    }).toThrow(/食事制限条件/);
  });
});