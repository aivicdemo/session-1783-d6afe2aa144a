import { determinePurchaseReflectionPolicy } from "../../src/logic/it-1-br-2-1-1-1";

describe("季節変動・曜日別購買傾向承認判定機能", () => {
  // SCEN-560: [edge] 季節変動率が 0% の境界値で反映方針が正しく決定される
  test("季節変動率が0%の場合、反映方針が正しく決定される", () => {
    const purchase_trend_data = {
      seasonal_variation_rate: 0,
      weekday_pattern_rate: 12.5,
      base_purchase_volume: 100,
      approval_timestamp: "2024-01-15T11:00:00Z",
      analyst_id: "analyst_001",
      analysis_period_start: "2024-01-01",
      analysis_period_end: "2024-01-31",
    };

    const result = determinePurchaseReflectionPolicy(purchase_trend_data);

    expect(result.is_approved).toBe(true);
    expect(result.reflection_policy).toBe("通常反映");
    expect(result.seasonal_variation_assessment).toBe("変動なし");
    expect(result.policy_reasoning).toContain("季節変動");
    expect(result.next_menu_priority_conditions).toEqual({
      seasonal_adjustment: false,
      weekday_adjustment: true,
      urgency_level: "normal",
    });
    expect(result.approval_decision_timestamp).toBe("2024-01-15T11:00:00Z");
  });

  // 季節変動率が低値（1%）の場合、通常反映ポリシーが適用される
  test("季節変動率が1%の場合、通常反映ポリシーが適用される", () => {
    const purchase_trend_data = {
      seasonal_variation_rate: 1,
      weekday_pattern_rate: 8.3,
      base_purchase_volume: 150,
      approval_timestamp: "2024-02-10T14:30:00Z",
      analyst_id: "analyst_002",
      analysis_period_start: "2024-02-01",
      analysis_period_end: "2024-02-29",
    };

    const result = determinePurchaseReflectionPolicy(purchase_trend_data);

    expect(result.is_approved).toBe(true);
    expect(result.reflection_policy).toBe("通常反映");
    expect(result.seasonal_variation_assessment).toBe("微小変動");
  });

  // 季節変動率が中程度（25%）の場合、条件付き調整ポリシーが適用される
  test("季節変動率が25%の場合、条件付き調整ポリシーが適用される", () => {
    const purchase_trend_data = {
      seasonal_variation_rate: 25,
      weekday_pattern_rate: 15.6,
      base_purchase_volume: 200,
      approval_timestamp: "2024-03-20T09:15:00Z",
      analyst_id: "analyst_003",
      analysis_period_start: "2024-03-01",
      analysis_period_end: "2024-03-31",
    };

    const result = determinePurchaseReflectionPolicy(purchase_trend_data);

    expect(result.is_approved).toBe(true);
    expect(result.reflection_policy).toBe("条件付き調整反映");
    expect(result.seasonal_variation_assessment).toBe("中程度変動");
    expect(result.next_menu_priority_conditions.seasonal_adjustment).toBe(true);
    expect(result.next_menu_priority_conditions.urgency_level).toBe("medium");
  });

  // 季節変動率が高値（50%）の場合、優先度付き調整ポリシーが適用される
  test("季節変動率が50%の場合、優先度付き調整ポリシーが適用される", () => {
    const purchase_trend_data = {
      seasonal_variation_rate: 50,
      weekday_pattern_rate: 22.4,
      base_purchase_volume: 180,
      approval_timestamp: "2024-04-01T16:45:00Z",
      analyst_id: "analyst_004",
      analysis_period_start: "2024-04-01",
      analysis_period_end: "2024-04-30",
    };

    const result = determinePurchaseReflectionPolicy(purchase_trend_data);

    expect(result.is_approved).toBe(true);
    expect(result.reflection_policy).toBe("優先度付き調整反映");
    expect(result.seasonal_variation_assessment).toBe("高度変動");
    expect(result.next_menu_priority_conditions.seasonal_adjustment).toBe(true);
    expect(result.next_menu_priority_conditions.urgency_level).toBe("high");
  });

  // 曜日別パターン率が0%の場合、曜日調整が無効化される
  test("曜日別パターン率が0%の場合、曜日調整が無効化される", () => {
    const purchase_trend_data = {
      seasonal_variation_rate: 5,
      weekday_pattern_rate: 0,
      base_purchase_volume: 120,
      approval_timestamp: "2024-05-15T10:00:00Z",
      analyst_id: "analyst_005",
      analysis_period_start: "2024-05-01",
      analysis_period_end: "2024-05-31",
    };

    const result = determinePurchaseReflectionPolicy(purchase_trend_data);

    expect(result.is_approved).toBe(true);
    expect(result.next_menu_priority_conditions.weekday_adjustment).toBe(false);
    expect(result.weekday_pattern_assessment).toBe("変動なし");
  });

  // 曜日別パターン率が高値（35%）の場合、曜日調整が有効化される
  test("曜日別パターン率が35%の場合、曜日調整が有効化される", () => {
    const purchase_trend_data = {
      seasonal_variation_rate: 8,
      weekday_pattern_rate: 35,
      base_purchase_volume: 160,
      approval_timestamp: "2024-06-01T12:30:00Z",
      analyst_id: "analyst_006",
      analysis_period_start: "2024-06-01",
      analysis_period_end: "2024-06-30",
    };

    const result = determinePurchaseReflectionPolicy(purchase_trend_data);

    expect(result.is_approved).toBe(true);
    expect(result.next_menu_priority_conditions.weekday_adjustment).toBe(true);
    expect(result.weekday_pattern_assessment).toBe("高度パターン");
  });

  // 季節変動率と曜日別パターン率が両方0%の境界値の場合、変動なしと判定される
  test("季節変動率と曜日別パターン率が両方0%の場合、変動なしと判定される", () => {
    const purchase_trend_data = {
      seasonal_variation_rate: 0,
      weekday_pattern_rate: 0,
      base_purchase_volume: 110,
      approval_timestamp: "2024-07-10T08:00:00Z",
      analyst_id: "analyst_007",
      analysis_period_start: "2024-07-01",
      analysis_period_end: "2024-07-31",
    };

    const result = determinePurchaseReflectionPolicy(purchase_trend_data);

    expect(result.is_approved).toBe(true);
    expect(result.reflection_policy).toBe("標準反映");
    expect(result.seasonal_variation_assessment).toBe("変動なし");
    expect(result.weekday_pattern_assessment).toBe("変動なし");
    expect(result.next_menu_priority_conditions.seasonal_adjustment).toBe(false);
    expect(result.next_menu_priority_conditions.weekday_adjustment).toBe(false);
    expect(result.next_menu_priority_conditions.urgency_level).toBe("low");
  });

  // base_purchase_volume が 0 の場合、エラーが発生する
  test("base_purchase_volume が0の場合、エラーが発生する", () => {
    const purchase_trend_data = {
      seasonal_variation_rate: 10,
      weekday_pattern_rate: 5,
      base_purchase_volume: 0,
      approval_timestamp: "2024-08-01T13:00:00Z",
      analyst_id: "analyst_008",
      analysis_period_start: "2024-08-01",
      analysis_period_end: "2024-08-31",
    };

    expect(() => determinePurchaseReflectionPolicy(purchase_trend_data)).toThrow(
      /基準購買量/
    );
  });

  // seasonal_variation_rate が負値の場合、エラーが発生する
  test("季節変動率が負値の場合、エラーが発生する", () => {
    const purchase_trend_data = {
      seasonal_variation_rate: -5,
      weekday_pattern_rate: 10,
      base_purchase_volume: 100,
      approval_timestamp: "2024-09-01T15:00:00Z",
      analyst_id: "analyst_009",
      analysis_period_start: "2024-09-01",
      analysis_period_end: "2024-09-30",
    };

    expect(() => determinePurchaseReflectionPolicy(purchase_trend_data)).toThrow(
      /季節変動率/
    );
  });

  // weekday_pattern_rate が100を超える場合、エラーが発生する
  test("曜日別パターン率が100を超える場合、エラーが発生する", () => {
    const purchase_trend_data = {
      seasonal_variation_rate: 15,
      weekday_pattern_rate: 105,
      base_purchase_volume: 130,
      approval_timestamp: "2024-10-01T11:00:00Z",
      analyst_id: "analyst_010",
      analysis_period_start: "2024-10-01",
      analysis_period_end: "2024-10-31",
    };

    expect(() => determinePurchaseReflectionPolicy(purchase_trend_data)).toThrow(
      /パターン率/
    );
  });

  // approval_timestamp が無効な ISO フォーマットの場合、エラーが発生する
  test("approval_timestamp が無効なISO形式の場合、エラーが発生する", () => {
    const purchase_trend_data = {
      seasonal_variation_rate: 10,
      weekday_pattern_rate: 8,
      base_purchase_volume: 100,
      approval_timestamp: "2024/01/15 11:00:00",
      analyst_id: "analyst_011",
      analysis_period_start: "2024-01-01",
      analysis_period_end: "2024-01-31",
    };

    expect(() => determinePurchaseReflectionPolicy(purchase_trend_data)).toThrow(
      /タイムスタンプ/
    );
  });

  // 複合条件：季節変動率30%、曜日別パターン率20%の場合、条件付き調整ポリシーが適用される
  test("複合条件：季節変動率30%、曜日別パターン率20%の場合、条件付き調整ポリシーが適用される", () => {
    const purchase_trend_data = {
      seasonal_variation_rate: 30,
      weekday_pattern_rate: 20,
      base_purchase_volume: 175,
      approval_timestamp: "2024-11-15T14:15:00Z",
      analyst_id: "analyst_012",
      analysis_period_start: "2024-11-01",
      analysis_period_end: "2024-11-30",
    };

    const result = determinePurchaseReflectionPolicy(purchase_trend_data);

    expect(result.is_approved).toBe(true);
    expect(result.reflection_policy).toBe("条件付き調整反映");
    expect(result.seasonal_variation_assessment).toBe("中程度変動");
    expect(result.weekday_pattern_assessment).toBe("中程度パターン");
    expect(result.next_menu_priority_conditions.seasonal_adjustment).toBe(true);
    expect(result.next_menu_priority_conditions.weekday_adjustment).toBe(true);
    expect(result.next_menu_priority_conditions.urgency_level).toBe("medium");
  });
});