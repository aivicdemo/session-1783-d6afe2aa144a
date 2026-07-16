import { evaluateFailurePatternRootCause } from "../../src/logic/it-8-1-1-1";

describe("ユーザーインタビュー記録と利用ログから食材制限・調理時間制限・予算制約の発生頻度と影響度を自動抽出・分類し、優先度マトリクスを生成・可視化する機能", () => {
  // SCEN-249
  test("栄養士による失敗パターン根本原因評価・承認 - 栄養士の評価コメントが空の場合、必須項目としてエラーが返される", () => {
    const failure_pattern_id = "fp_20240115_001";
    const nutritionist_id = "nt_20240115_001";
    const evaluation_level = "high";
    const root_cause_category = "nutritional_imbalance";
    const evaluation_comment = "";
    const approval_status = "pending";

    expect(() =>
      evaluateFailurePatternRootCause({
        failure_pattern_id,
        nutritionist_id,
        evaluation_level,
        root_cause_category,
        evaluation_comment,
        approval_status,
      })
    ).toThrow(/評価コメント/);
  });
});