import { validateRuleSpecificationForApproval } from "../../src/logic/it-1-1-1";

describe("在庫・価格情報のリアルタイム連携と優先度ルール定義", () => {
  // SCEN-576: [error] ルール仕様承認フロー自動進行 - 必須フィールド（季節パターン、割引率閾値、販売期間）が未入力のルール仕様書では承認フローが開始されない
  test("SCEN-576: 必須フィールド未入力時に承認フロー開始でエラーを発生させる", () => {
    // 前提: 献立自動生成アプリにログイン済みで、ルール仕様管理画面にアクセス可能な状態
    // 発生条件: 季節パターン、割引率閾値、販売期間のいずれかを空白のまま残し、承認フロー開始ボタンをクリック

    // ケース 1: 季節パターン (seasonal_pattern) が空白
    const ruleSpec_missingSeasonal = {
      rule_spec_id: "RULE-001",
      seasonal_pattern: "", // 必須フィールド: 空白
      discount_rate_threshold: 15,
      sales_period_start: "2024-01-01",
      sales_period_end: "2024-03-31",
      approval_status: "draft",
    };

    expect(() =>
      validateRuleSpecificationForApproval(ruleSpec_missingSeasonal)
    ).toThrow(/季節パターン/);

    // ケース 2: 割引率閾値 (discount_rate_threshold) が未定義
    const ruleSpec_missingDiscount = {
      rule_spec_id: "RULE-002",
      seasonal_pattern: "春野菜",
      discount_rate_threshold: null, // 必須フィールド: null
      sales_period_start: "2024-01-01",
      sales_period_end: "2024-03-31",
      approval_status: "draft",
    };

    expect(() =>
      validateRuleSpecificationForApproval(ruleSpec_missingDiscount)
    ).toThrow(/割引率/);

    // ケース 3: 販売期間 (sales_period) が空白
    const ruleSpec_missingSalesPeriod = {
      rule_spec_id: "RULE-003",
      seasonal_pattern: "夏野菜",
      discount_rate_threshold: 20,
      sales_period_start: "",
      sales_period_end: "",
      approval_status: "draft",
    };

    expect(() =>
      validateRuleSpecificationForApproval(ruleSpec_missingSalesPeriod)
    ).toThrow(/販売期間/);

    // ケース 4: すべての必須フィールドが入力されている場合は承認フローが開始される（成功ケース）
    const ruleSpec_valid = {
      rule_spec_id: "RULE-004",
      seasonal_pattern: "秋野菜",
      discount_rate_threshold: 25,
      sales_period_start: "2024-09-01",
      sales_period_end: "2024-11-30",
      approval_status: "draft",
    };

    const result = validateRuleSpecificationForApproval(ruleSpec_valid);

    // 結果: 承認フロー状態が「承認待ち」に進行し、エラーが発生しない
    expect(result).toEqual({
      rule_spec_id: "RULE-004",
      seasonal_pattern: "秋野菜",
      discount_rate_threshold: 25,
      sales_period_start: "2024-09-01",
      sales_period_end: "2024-11-30",
      approval_status: "pending_approval",
      approval_initiated_at: expect.any(String),
    });

    // 期待結果: 承認フロー状態が「draft」から「pending_approval」に遷移し、承認ステップが進行している
    expect(result.approval_status).toBe("pending_approval");
    expect(result.approval_initiated_at).toBeDefined();
  });
});