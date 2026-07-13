import { evaluateShoppingListApproval } from "../../src/logic/it-1-br-6-2-1";

describe("需要予測精度検証ダッシュボード：予測値と実績値の照合・乖離分析機能", () => {
  // SCEN-228: [error] 買い物リスト承認却下判定機能 - 修正理由が空白の却下判定はエラーとなる
  test("修正理由が空白の却下判定でバリデーションエラーが発生し、買い物リストのステータスが変更されないこと", () => {
    const shopping_list_id = "SL-2024-001";
    const user_id = "USR-001";
    const approval_status = "rejected";
    const revision_reason = "";
    const current_status_before = "pending";

    expect(() =>
      evaluateShoppingListApproval({
        shopping_list_id,
        user_id,
        approval_status,
        revision_reason,
        current_status_before,
      })
    ).toThrow(/修正理由/);
  });
});