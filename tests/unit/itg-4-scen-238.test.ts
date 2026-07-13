import { approveSeasonalTrendAndDecideReflectionPolicy } from "../../src/logic/it-2-br-6-3-2";

describe("季節変動・曜日別購買傾向承認判定機能", () => {
  // SCEN-238
  test("should approve seasonal trend and determine reflection policy for next menu generation logic", () => {
    // 入力: 季節変動・曜日別購買傾向データ
    const seasonal_trend_data = {
      analysis_period_start: "2024-01-01",
      analysis_period_end: "2024-12-31",
      seasonal_factors: [
        {
          season: "spring",
          avg_purchase_rate: 1.15,
          top_category: "fresh_vegetables",
          category_demand_lift: 1.25,
        },
        {
          season: "summer",
          avg_purchase_rate: 0.92,
          top_category: "cold_drinks",
          category_demand_lift: 1.8,
        },
        {
          season: "autumn",
          avg_purchase_rate: 1.22,
          top_category: "grains",
          category_demand_lift: 1.35,
        },
        {
          season: "winter",
          avg_purchase_rate: 1.18,
          top_category: "warming_soups",
          category_demand_lift: 1.42,
        },
      ],
      weekday_factors: [
        {
          weekday: "monday",
          avg_purchase_rate: 0.95,
          peak_time: "18:00-19:00",
          typical_basket_size: 4.2,
        },
        {
          weekday: "tuesday",
          avg_purchase_rate: 0.88,
          peak_time: "19:00-20:00",
          typical_basket_size: 3.8,
        },
        {
          weekday: "wednesday",
          avg_purchase_rate: 0.91,
          peak_time: "18:30-19:30",
          typical_basket_size: 3.9,
        },
        {
          weekday: "thursday",
          avg_purchase_rate: 0.93,
          peak_time: "18:00-19:00",
          typical_basket_size: 4.1,
        },
        {
          weekday: "friday",
          avg_purchase_rate: 1.18,
          peak_time: "17:00-19:00",
          typical_basket_size: 5.2,
        },
        {
          weekday: "saturday",
          avg_purchase_rate: 1.35,
          peak_time: "10:00-13:00",
          typical_basket_size: 6.8,
        },
        {
          weekday: "sunday",
          avg_purchase_rate: 1.12,
          peak_time: "11:00-14:00",
          typical_basket_size: 5.5,
        },
      ],
      data_quality_score: 0.94,
      correlation_confidence: 0.87,
    };

    // 承認者情報
    const approver_info = {
      user_id: "pm_001",
      user_role: "product_manager",
      approval_timestamp: "2024-12-28T14:30:00Z",
    };

    // 함수 호출
    const result = approveSeasonalTrendAndDecideReflectionPolicy(
      seasonal_trend_data,
      approver_info
    );

    // 承認判定結果の確認
    expect(result.approval_status).toBe(true);

    // 次期献立ロジックへの反映方針が決定されたか確認
    expect(result.reflection_policy).toBeDefined();
    expect(result.reflection_policy_decided_at).toBe("2024-12-28T14:30:00Z");

    // 反映方針に季節要因が含まれているか検証
    expect(result.reflection_policy.seasonal_factors_enabled).toBe(true);
    expect(result.reflection_policy.seasonal_adjustment_weights).toEqual({
      spring: 1.15,
      summer: 0.92,
      autumn: 1.22,
      winter: 1.18,
    });
    expect(result.reflection_policy.seasonal_category_priorities).toEqual({
      spring: "fresh_vegetables",
      summer: "cold_drinks",
      autumn: "grains",
      winter: "warming_soups",
    });

    // 反映方針に曜日別要因が含まれているか検証
    expect(result.reflection_policy.weekday_factors_enabled).toBe(true);
    expect(result.reflection_policy.weekday_adjustment_weights).toEqual({
      monday: 0.95,
      tuesday: 0.88,
      wednesday: 0.91,
      thursday: 0.93,
      friday: 1.18,
      saturday: 1.35,
      sunday: 1.12,
    });
    expect(result.reflection_policy.weekday_peak_purchase_times).toEqual({
      monday: "18:00-19:00",
      tuesday: "19:00-20:00",
      wednesday: "18:30-19:30",
      thursday: "18:00-19:00",
      friday: "17:00-19:00",
      saturday: "10:00-13:00",
      sunday: "11:00-14:00",
    });

    // 反映方針の有効化状態を確認
    expect(result.menu_generation_logic_activated).toBe(true);
    expect(result.menu_generation_logic_version).toBe("v2.0_seasonal_aware");

    // システム内部状態への保存確認
    expect(result.stored_in_system).toBe(true);
    expect(result.system_state_updated_at).toBe("2024-12-28T14:30:00Z");
    expect(result.reflection_policy_id).toBeDefined();
    expect(result.reflection_policy_id).toMatch(/^policy_/);

    // 次ステップへの通知状態確認
    expect(result.notification_to_development_team).toBe(true);
    expect(result.notification_sent_at).toBeDefined();

    // データ品質スコアと信頼度の確認
    expect(result.data_quality_validation).toBe(true);
    expect(result.confidence_score).toBe(0.87);

    // 承認者情報の記録確認
    expect(result.approver_user_id).toBe("pm_001");
    expect(result.approver_role).toBe("product_manager");
  });
});