import { calculateMenuConstraintFulfillmentScore } from "../../src/logic/it-1-br-2-1-1-1";

describe("献立案の制約条件充足度スコア計算機能", () => {
  // SCEN-324
  test("複数の制約条件（栄養・アレルギー・予算・調理時間）を満たす献立案について、各制約ごとの充足度スコア（0～100）と総合スコアが正確に計算される", () => {
    const menu_input = {
      menu_id: "menu_20240115_001",
      dishes: [
        {
          dish_id: "dish_chicken_001",
          dish_name: "鶏むね肉のソテー",
          nutrition: {
            calories: 350,
            protein_g: 45,
            carbs_g: 5,
            fat_g: 15,
          },
          allergens: [],
          cost_yen: 250,
          cooking_time_minutes: 20,
        },
        {
          dish_id: "dish_spinach_001",
          dish_name: "ほうれん草のおひたし",
          nutrition: {
            calories: 80,
            protein_g: 8,
            carbs_g: 10,
            fat_g: 2,
          },
          allergens: [],
          cost_yen: 80,
          cooking_time_minutes: 8,
        },
        {
          dish_id: "dish_miso_soup_001",
          dish_name: "大根の味噌汁",
          nutrition: {
            calories: 120,
            protein_g: 6,
            carbs_g: 18,
            fat_g: 2,
          },
          allergens: [],
          cost_yen: 60,
          cooking_time_minutes: 10,
        },
        {
          dish_id: "dish_rice_001",
          dish_name: "ご飯",
          nutrition: {
            calories: 1450,
            protein_g: 12,
            carbs_g: 320,
            fat_g: 3,
          },
          allergens: [],
          cost_yen: 110,
          cooking_time_minutes: 15,
        },
      ],
      constraints: {
        nutrition: {
          target_calories: 2000,
          tolerance_calories_percent: 10,
          target_protein_g: 60,
          tolerance_protein_percent: 5,
        },
        allergens_exclude: ["egg", "dairy"],
        budget_max_yen: 500,
        cooking_time_max_minutes: 30,
      },
    };

    const result = calculateMenuConstraintFulfillmentScore(menu_input);

    // 総カロリー: 350 + 80 + 120 + 1450 = 2000
    expect(result.nutrition_score).toBe(100);

    // 総タンパク質: 45 + 8 + 6 + 12 = 71g
    // 目標: 60g ±5% = 57-63g
    // 71g は 63g を超過しているため不充足
    // 充足度: (63 / 71) * 100 = 88.73... ≈ 89
    expect(result.nutrition_score).toBe(89);

    // アレルギー対応スコア: 卵・乳製品が含まれていない → 100
    expect(result.allergen_score).toBe(100);

    // 予算合計: 250 + 80 + 60 + 110 = 500円
    // 予算上限: 500円
    // 充足度: (500 / 500) * 100 = 100
    expect(result.budget_score).toBe(100);

    // 調理時間合計: 20 + 8 + 10 + 15 = 53分
    // 制限時間: 30分
    // 充足度: (30 / 53) * 100 = 56.60... ≈ 57
    expect(result.cooking_time_score).toBe(57);

    // 総合スコア: (89 + 100 + 100 + 57) / 4 = 346 / 4 = 86.5
    expect(result.overall_score).toBe(86.5);

    // 詳細内訳の検証
    expect(result.nutrition_detail).toEqual({
      actual_calories: 2000,
      target_calories: 2000,
      calories_achievement_percent: 100,
      actual_protein_g: 71,
      target_protein_g: 60,
      protein_achievement_percent: 118.33,
      protein_status: "exceeded",
    });

    expect(result.allergen_detail).toEqual({
      excluded_allergens: ["egg", "dairy"],
      detected_allergens: [],
      is_compliant: true,
    });

    expect(result.budget_detail).toEqual({
      actual_cost_yen: 500,
      budget_max_yen: 500,
      budget_achievement_percent: 100,
      is_within_budget: true,
    });

    expect(result.cooking_time_detail).toEqual({
      actual_cooking_time_minutes: 53,
      max_cooking_time_minutes: 30,
      time_achievement_percent: 56.6,
      is_within_limit: false,
      excess_minutes: 23,
    });

    // スコア範囲の検証
    expect(result.nutrition_score).toBeGreaterThanOrEqual(0);
    expect(result.nutrition_score).toBeLessThanOrEqual(100);
    expect(result.allergen_score).toBeGreaterThanOrEqual(0);
    expect(result.allergen_score).toBeLessThanOrEqual(100);
    expect(result.budget_score).toBeGreaterThanOrEqual(0);
    expect(result.budget_score).toBeLessThanOrEqual(100);
    expect(result.cooking_time_score).toBeGreaterThanOrEqual(0);
    expect(result.cooking_time_score).toBeLessThanOrEqual(100);
    expect(result.overall_score).toBeGreaterThanOrEqual(0);
    expect(result.overall_score).toBeLessThanOrEqual(100);
  });
});