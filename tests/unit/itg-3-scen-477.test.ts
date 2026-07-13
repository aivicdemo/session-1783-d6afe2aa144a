import { detectConflictingDiscountRules } from "../../src/logic/it-1-br-6-2-1-1";

describe("食材流通業者・スーパーの在庫・価格データ連携インターフェース", () => {
  // SCEN-477
  test("既存ルールと矛盾する割引率閾値が提示された場合競合エラーを返す", () => {
    const existing_rules = [
      {
        rule_id: "RULE_001",
        seasonal_pattern: "春",
        discount_rate_min: 20,
        discount_rate_max: 30,
        sales_period_start: "2024-03-01",
        sales_period_end: "2024-05-31",
      },
      {
        rule_id: "RULE_002",
        seasonal_pattern: "夏",
        discount_rate_min: 15,
        discount_rate_max: 35,
        sales_period_start: "2024-06-01",
        sales_period_end: "2024-08-31",
      },
    ];

    const new_rule = {
      seasonal_pattern: "春",
      discount_rate_min: 15,
      discount_rate_max: 25,
      sales_period_start: "2024-03-01",
      sales_period_end: "2024-05-31",
    };

    expect(() => {
      detectConflictingDiscountRules(existing_rules, new_rule);
    }).toThrow(/割引率/);
  });

  test("既存ルールと矛盾しない割引率閾値が提示された場合成功を返す", () => {
    const existing_rules = [
      {
        rule_id: "RULE_001",
        seasonal_pattern: "春",
        discount_rate_min: 20,
        discount_rate_max: 30,
        sales_period_start: "2024-03-01",
        sales_period_end: "2024-05-31",
      },
    ];

    const new_rule = {
      seasonal_pattern: "夏",
      discount_rate_min: 25,
      discount_rate_max: 40,
      sales_period_start: "2024-06-01",
      sales_period_end: "2024-08-31",
    };

    const result = detectConflictingDiscountRules(existing_rules, new_rule);

    expect(result).toEqual({
      has_conflict: false,
      conflicting_rules: [],
    });
  });

  test("同じ季節パターンで販売期間が異なる場合競合エラーを返す", () => {
    const existing_rules = [
      {
        rule_id: "RULE_001",
        seasonal_pattern: "春",
        discount_rate_min: 20,
        discount_rate_max: 30,
        sales_period_start: "2024-03-01",
        sales_period_end: "2024-05-31",
      },
    ];

    const new_rule = {
      seasonal_pattern: "春",
      discount_rate_min: 20,
      discount_rate_max: 30,
      sales_period_start: "2024-04-01",
      sales_period_end: "2024-06-30",
    };

    expect(() => {
      detectConflictingDiscountRules(existing_rules, new_rule);
    }).toThrow(/販売期間/);
  });

  test("複数の既存ルールと矛盾する場合すべての競合情報を含むエラーを返す", () => {
    const existing_rules = [
      {
        rule_id: "RULE_001",
        seasonal_pattern: "春",
        discount_rate_min: 20,
        discount_rate_max: 30,
        sales_period_start: "2024-03-01",
        sales_period_end: "2024-05-31",
      },
      {
        rule_id: "RULE_002",
        seasonal_pattern: "春",
        discount_rate_min: 18,
        discount_rate_max: 28,
        sales_period_start: "2024-03-15",
        sales_period_end: "2024-05-15",
      },
    ];

    const new_rule = {
      seasonal_pattern: "春",
      discount_rate_min: 15,
      discount_rate_max: 25,
      sales_period_start: "2024-03-01",
      sales_period_end: "2024-05-31",
    };

    expect(() => {
      detectConflictingDiscountRules(existing_rules, new_rule);
    }).toThrow(/競合/);
  });

  test("割引率範囲が既存ルールと完全に重複する場合エラーを返す", () => {
    const existing_rules = [
      {
        rule_id: "RULE_001",
        seasonal_pattern: "秋",
        discount_rate_min: 25,
        discount_rate_max: 35,
        sales_period_start: "2024-09-01",
        sales_period_end: "2024-11-30",
      },
    ];

    const new_rule = {
      seasonal_pattern: "秋",
      discount_rate_min: 25,
      discount_rate_max: 35,
      sales_period_start: "2024-09-01",
      sales_period_end: "2024-11-30",
    };

    expect(() => {
      detectConflictingDiscountRules(existing_rules, new_rule);
    }).toThrow(/割引率/);
  });
});