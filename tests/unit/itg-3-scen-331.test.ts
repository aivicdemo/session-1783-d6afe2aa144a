import { evaluateConstraintFulfillment } from "../../src/logic/it-1-br-3-2-1";

describe("購入実績の記録と月次食費削減効果の自動集計・分析機能", () => {
  // SCEN-331
  test("複数制約条件の充足度評価機能 - 制約条件の定義が不完全な場合にエラーが発生する", () => {
    // 不完全な制約条件: 制約名が空
    const incomplete_constraint_no_name = {
      constraint_id: "c001",
      constraint_name: "",
      constraint_type: "budget",
      threshold_value: 5000,
      unit: "JPY",
      priority: 1,
    };

    expect(() =>
      evaluateConstraintFulfillment(incomplete_constraint_no_name)
    ).toThrow(/制約条件の定義/);

    // 不完全な制約条件: 制約タイプが空
    const incomplete_constraint_no_type = {
      constraint_id: "c002",
      constraint_name: "月次食費予算",
      constraint_type: "",
      threshold_value: 5000,
      unit: "JPY",
      priority: 1,
    };

    expect(() =>
      evaluateConstraintFulfillment(incomplete_constraint_no_type)
    ).toThrow(/制約条件の定義/);

    // 不完全な制約条件: 閾値が未定義
    const incomplete_constraint_no_threshold = {
      constraint_id: "c003",
      constraint_name: "月次食費予算",
      constraint_type: "budget",
      threshold_value: undefined,
      unit: "JPY",
      priority: 1,
    };

    expect(() =>
      evaluateConstraintFulfillment(incomplete_constraint_no_threshold)
    ).toThrow(/制約条件の定義/);

    // 不完全な制約条件: 単位が空
    const incomplete_constraint_no_unit = {
      constraint_id: "c004",
      constraint_name: "月次食費予算",
      constraint_type: "budget",
      threshold_value: 5000,
      unit: "",
      priority: 1,
    };

    expect(() =>
      evaluateConstraintFulfillment(incomplete_constraint_no_unit)
    ).toThrow(/制約条件の定義/);

    // 不完全な制約条件: 優先度が負の値
    const incomplete_constraint_invalid_priority = {
      constraint_id: "c005",
      constraint_name: "月次食費予算",
      constraint_type: "budget",
      threshold_value: 5000,
      unit: "JPY",
      priority: -1,
    };

    expect(() =>
      evaluateConstraintFulfillment(incomplete_constraint_invalid_priority)
    ).toThrow(/制約条件の定義/);

    // 完全な制約条件: エラーが発生しない
    const complete_constraint = {
      constraint_id: "c006",
      constraint_name: "月次食費予算",
      constraint_type: "budget",
      threshold_value: 5000,
      unit: "JPY",
      priority: 1,
      actual_value: 4500,
    };

    const result = evaluateConstraintFulfillment(complete_constraint);

    expect(result).toBeDefined();
    expect(result.constraint_id).toBe("c006");
    expect(result.fulfillment_score).toBe(90);
    expect(result.is_satisfied).toBe(true);
  });
});