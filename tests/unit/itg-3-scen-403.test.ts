import { prioritizeNutritionDeficiencies } from "../../src/logic/it-1-br-3-2-1";

describe("購入実績の記録と月次食費削減効果の自動集計・分析機能", () => {
  // SCEN-403
  test("栄養不足項目の優先度付け機能 - 家族の食事評価データが不足している場合、嗜好リスク評価がデフォルト値で処理される", () => {
    const familyMemberId = "family_member_001";
    const nutritionDeficiencies = [
      {
        nutrient_id: "nutrient_001",
        nutrient_name: "タンパク質",
        deficiency_amount: 15.5,
        target_amount: 50.0,
        achievement_rate: 69.0,
        impact_score: 8.5,
      },
      {
        nutrient_id: "nutrient_002",
        nutrient_name: "カルシウム",
        deficiency_amount: 200.0,
        target_amount: 800.0,
        achievement_rate: 75.0,
        impact_score: 7.2,
      },
    ];
    const familyFoodEvaluationData = [];
    const defaultPreferenceRiskValue = 0;
    const defaultPreferenceRiskLabel = "neutral";

    const result = prioritizeNutritionDeficiencies({
      family_member_id: familyMemberId,
      nutrition_deficiencies: nutritionDeficiencies,
      family_food_evaluation_data: familyFoodEvaluationData,
    });

    expect(result).toHaveProperty("prioritized_deficiencies");
    expect(result).toHaveProperty("preference_risk_evaluation");
    expect(result).toHaveProperty("warning_log");

    expect(Array.isArray(result.prioritized_deficiencies)).toBe(true);
    expect(result.prioritized_deficiencies.length).toBe(2);

    expect(result.prioritized_deficiencies[0]).toEqual({
      nutrient_id: "nutrient_001",
      nutrient_name: "タンパク質",
      priority_rank: 1,
      deficiency_amount: 15.5,
      impact_score: 8.5,
    });

    expect(result.prioritized_deficiencies[1]).toEqual({
      nutrient_id: "nutrient_002",
      nutrient_name: "カルシウム",
      priority_rank: 2,
      deficiency_amount: 200.0,
      impact_score: 7.2,
    });

    expect(result.preference_risk_evaluation).toEqual({
      risk_score: defaultPreferenceRiskValue,
      risk_level: defaultPreferenceRiskLabel,
      is_default_value: true,
    });

    expect(result.warning_log).toContain(
      "食事評価データが不足しています。嗜好リスク評価をデフォルト値で処理します。"
    );

    expect(result.warning_log.length).toBeGreaterThan(0);
  });
});