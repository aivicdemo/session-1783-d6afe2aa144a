import { prioritizeNutritionDeficiencies } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-501: [normal] 栄養不足項目の優先度付けと献立生成条件調整
  test("栄養不足項目が改善効果の大きさと家族の嗜好リスクで正しく優先度付けされる", () => {
    // 入力: 家族構成と栄養分析データ
    const familyComposition = {
      adults: 2,
      children: 1,
    };

    const nutritionDeficiencies = [
      {
        nutrient: "カルシウム",
        current_intake: 400,
        target_intake: 800,
        deficit: 400,
        improvement_effect_score: 85,
        family_preference_risk: 20,
      },
      {
        nutrient: "鉄分",
        current_intake: 6,
        target_intake: 12,
        deficit: 6,
        improvement_effect_score: 90,
        family_preference_risk: 35,
      },
      {
        nutrient: "タンパク質",
        current_intake: 45,
        target_intake: 60,
        deficit: 15,
        improvement_effect_score: 75,
        family_preference_risk: 10,
      },
    ];

    // 実行
    const result = prioritizeNutritionDeficiencies({
      family_composition: familyComposition,
      nutrition_deficiencies: nutritionDeficiencies,
    });

    // 期待値の検証
    // 優先度スコア = (改善効果スコア * 0.7) - (嗜好リスク度 * 0.3)
    // 鉄分: (90 * 0.7) - (35 * 0.3) = 63 - 10.5 = 52.5
    // カルシウム: (85 * 0.7) - (20 * 0.3) = 59.5 - 6 = 53.5
    // タンパク質: (75 * 0.7) - (10 * 0.3) = 52.5 - 3 = 49.5

    expect(result).toEqual({
      prioritized_deficiencies: [
        {
          rank: 1,
          nutrient: "カルシウム",
          deficit: 400,
          improvement_effect_score: 85,
          family_preference_risk: 20,
          priority_score: 53.5,
          recommended_food_categories: [
            "乳製品",
            "小魚",
            "葉物野菜",
          ],
        },
        {
          rank: 2,
          nutrient: "鉄分",
          deficit: 6,
          improvement_effect_score: 90,
          family_preference_risk: 35,
          priority_score: 52.5,
          recommended_food_categories: [
            "赤肉",
            "レバー",
            "ほうれん草",
          ],
        },
        {
          rank: 3,
          nutrient: "タンパク質",
          deficit: 15,
          improvement_effect_score: 75,
          family_preference_risk: 10,
          priority_score: 49.5,
          recommended_food_categories: [
            "鶏肉",
            "卵",
            "豆類",
          ],
        },
      ],
      menu_generation_conditions: {
        priority_order: [
          "カルシウム",
          "鉄分",
          "タンパク質",
        ],
        primary_focus_nutrient: "カルシウム",
        secondary_focus_nutrient: "鉄分",
        tertiary_focus_nutrient: "タンパク質",
        constraint_adjustments: [
          {
            nutrient: "カルシウム",
            adjustment_type: "増加",
            target_increase_ratio: 0.5,
          },
          {
            nutrient: "鉄分",
            adjustment_type: "増加",
            target_increase_ratio: 1.0,
          },
          {
            nutrient: "タンパク質",
            adjustment_type: "増加",
            target_increase_ratio: 0.25,
          },
        ],
      },
      generated_menu_validation: {
        menu_includes_priority_nutrients: true,
        primary_nutrient_coverage: "カルシウム補給食材が含まれる",
        secondary_nutrient_coverage: "鉄分補給食材が含まれる",
        tertiary_nutrient_coverage: "タンパク質補給食材が含まれる",
        all_deficiencies_addressed: true,
      },
    });

    // 優先度スコアが高い順にソートされているか検証
    const priorityScores = result.prioritized_deficiencies.map(
      (d: any) => d.priority_score,
    );
    expect(priorityScores).toEqual([53.5, 52.5, 49.5]);
    expect(priorityScores[0]).toBeGreaterThan(priorityScores[1]);
    expect(priorityScores[1]).toBeGreaterThan(priorityScores[2]);

    // 優先度リストが順序付けられているか検証
    expect(result.menu_generation_conditions.priority_order[0]).toBe(
      "カルシウム",
    );
    expect(result.menu_generation_conditions.priority_order[1]).toBe(
      "鉄分",
    );
    expect(result.menu_generation_conditions.priority_order[2]).toBe(
      "タンパク質",
    );

    // 主要栄養項目が正しく設定されているか検証
    expect(result.menu_generation_conditions.primary_focus_nutrient).toBe(
      "カルシウム",
    );
    expect(result.menu_generation_conditions.secondary_focus_nutrient).toBe(
      "鉄分",
    );
    expect(result.menu_generation_conditions.tertiary_focus_nutrient).toBe(
      "タンパク質",
    );

    // 調整されたメニュー生成条件が存在するか検証
    expect(result.menu_generation_conditions.constraint_adjustments.length).toBe(
      3,
    );
    expect(
      result.menu_generation_conditions.constraint_adjustments[0].nutrient,
    ).toBe("カルシウム");
    expect(
      result.menu_generation_conditions.constraint_adjustments[0]
        .target_increase_ratio,
    ).toBe(0.5);

    // メニュー生成の妥当性検証
    expect(result.generated_menu_validation.all_deficiencies_addressed).toBe(
      true,
    );
    expect(result.generated_menu_validation.menu_includes_priority_nutrients).toBe(
      true,
    );
  });
});