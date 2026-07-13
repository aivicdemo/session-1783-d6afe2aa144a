import { prioritizeNutrientDeficiencies } from "../../src/logic/it-1-br-2-1-1-1";

describe("栄養不足項目の優先度付け機能", () => {
  // SCEN-437: [normal] 栄養不足項目の優先度付け機能 - 複数の栄養不足項目に対して改善効果と家族嗜好リスクで正しく優先度付けされる
  test("複数の栄養不足項目が改善効果と家族嗜好リスクを総合的に考慮して正しく優先度付けされ、上位から改善効果が高く受け入れやすい項目が表示される", () => {
    const nutrientDeficiencies = [
      {
        nutrient_id: 1,
        nutrient_name: "鉄分",
        target_value: 11.0,
        actual_value: 5.2,
        unit: "mg",
        deficiency_gap: 5.8,
        family_preference_score: 0.85,
      },
      {
        nutrient_id: 2,
        nutrient_name: "カルシウム",
        target_value: 800.0,
        actual_value: 400.0,
        unit: "mg",
        deficiency_gap: 400.0,
        family_preference_score: 0.62,
      },
      {
        nutrient_id: 3,
        nutrient_name: "ビタミンD",
        target_value: 10.0,
        actual_value: 3.0,
        unit: "μg",
        deficiency_gap: 7.0,
        family_preference_score: 0.45,
      },
    ];

    const result = prioritizeNutrientDeficiencies(nutrientDeficiencies);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      nutrient_id: 1,
      nutrient_name: "鉄分",
      target_value: 11.0,
      actual_value: 5.2,
      unit: "mg",
      deficiency_gap: 5.8,
      family_preference_score: 0.85,
      improvement_effect_score: 52.73,
      priority_score: 44.82,
      priority_rank: 1,
    });

    expect(result[1]).toEqual({
      nutrient_id: 2,
      nutrient_name: "カルシウム",
      target_value: 800.0,
      actual_value: 400.0,
      unit: "mg",
      deficiency_gap: 400.0,
      family_preference_score: 0.62,
      improvement_effect_score: 50.0,
      priority_score: 31.0,
      priority_rank: 2,
    });

    expect(result[2]).toEqual({
      nutrient_id: 3,
      nutrient_name: "ビタミンD",
      target_value: 10.0,
      actual_value: 3.0,
      unit: "μg",
      deficiency_gap: 7.0,
      family_preference_score: 0.45,
      improvement_effect_score: 70.0,
      priority_score: 31.5,
      priority_rank: 3,
    });

    expect(result[0].priority_score).toBeGreaterThan(result[1].priority_score);
    expect(result[1].priority_score).toBeGreaterThan(result[2].priority_score);

    expect(result[0].priority_rank).toBe(1);
    expect(result[1].priority_rank).toBe(2);
    expect(result[2].priority_rank).toBe(3);

    expect(result[0].family_preference_score).toBeGreaterThan(
      result[1].family_preference_score
    );
    expect(result[1].family_preference_score).toBeGreaterThan(
      result[2].family_preference_score
    );
  });
});