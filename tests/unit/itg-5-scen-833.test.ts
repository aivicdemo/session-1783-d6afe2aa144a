import { calculateIngredientsSeasonalDiscountPriorityScore } from "../../src/logic/it-7-2-1";

describe("献立生成アルゴリズムの成功・失敗パターン分析と改善提案 - 旬食材・割引商品優先度スコア計算", () => {
  // SCEN-833: [normal] 旬食材・割引商品優先度スコア計算 - 季節パターンと割引率が適用された食材に対して、優先度スコアが正しく計算され献立に組み込まれる
  test("should calculate seasonal and discount-adjusted priority scores and rank ingredients correctly", () => {
    // 入力: 季節パターンと割引率を含む食材データ
    const current_season = "spring"; // 春
    const current_date = new Date("2024-04-15T09:00:00Z");
    
    const ingredients = [
      {
        id: "ing_001",
        name: "たけのこ",
        base_priority: 50,
        seasonal_relevance: "spring",
        seasonal_coefficient: 1.5,
        discount_rate: 0.15,
        is_in_season: true,
        nutritional_value: 8,
      },
      {
        id: "ing_002",
        name: "新玉ねぎ",
        base_priority: 45,
        seasonal_relevance: "spring",
        seasonal_coefficient: 1.4,
        discount_rate: 0.25,
        is_in_season: true,
        nutritional_value: 7,
      },
      {
        id: "ing_003",
        name: "ほうれん草",
        base_priority: 40,
        seasonal_relevance: "winter",
        seasonal_coefficient: 1.0,
        discount_rate: 0.10,
        is_in_season: false,
        nutritional_value: 9,
      },
      {
        id: "ing_004",
        name: "アスパラガス",
        base_priority: 55,
        seasonal_relevance: "spring",
        seasonal_coefficient: 1.6,
        discount_rate: 0.20,
        is_in_season: true,
        nutritional_value: 6,
      },
    ];

    // 期待値: 優先度スコア計算式
    // priority_score = base_priority × seasonal_coefficient × (1 + discount_rate)
    // ing_001: 50 × 1.5 × (1 + 0.15) = 50 × 1.5 × 1.15 = 86.25
    // ing_002: 45 × 1.4 × (1 + 0.25) = 45 × 1.4 × 1.25 = 78.75
    // ing_003: 40 × 1.0 × (1 + 0.10) = 40 × 1.0 × 1.10 = 44.0
    // ing_004: 55 × 1.6 × (1 + 0.20) = 55 × 1.6 × 1.20 = 105.6
    
    const result = calculateIngredientsSeasonalDiscountPriorityScore(
      ingredients,
      current_season,
      current_date
    );

    // 期待結果検証

    // 1. 各食材の優先度スコア値が正しく計算されているか
    expect(result.scored_ingredients).toHaveLength(4);
    
    const scored_map = new Map(
      result.scored_ingredients.map((item) => [item.ingredient_id, item.priority_score])
    );

    // 具体値での検証 (浮動小数点の許容誤差: 0.01)
    expect(scored_map.get("ing_001")).toBeCloseTo(86.25, 2);
    expect(scored_map.get("ing_002")).toBeCloseTo(78.75, 2);
    expect(scored_map.get("ing_003")).toBeCloseTo(44.0, 2);
    expect(scored_map.get("ing_004")).toBeCloseTo(105.6, 2);

    // 2. 優先度スコアの降順ランキングが正しいか
    // 期待順位: ing_004 (105.6) > ing_001 (86.25) > ing_002 (78.75) > ing_003 (44.0)
    expect(result.scored_ingredients[0].ingredient_id).toBe("ing_004");
    expect(result.scored_ingredients[0].priority_score).toBeCloseTo(105.6, 2);
    
    expect(result.scored_ingredients[1].ingredient_id).toBe("ing_001");
    expect(result.scored_ingredients[1].priority_score).toBeCloseTo(86.25, 2);
    
    expect(result.scored_ingredients[2].ingredient_id).toBe("ing_002");
    expect(result.scored_ingredients[2].priority_score).toBeCloseTo(78.75, 2);
    
    expect(result.scored_ingredients[3].ingredient_id).toBe("ing_003");
    expect(result.scored_ingredients[3].priority_score).toBeCloseTo(44.0, 2);

    // 3. 季節パターンが正しく反映されているか
    // spring 関連食材が上位にあるか確認
    const seasonal_ingredients = result.scored_ingredients.filter(
      (item) => item.seasonal_relevance === "spring"
    );
    expect(seasonal_ingredients.length).toBe(3);
    expect(seasonal_ingredients[0].ingredient_id).toBe("ing_004");

    // 4. 割引率が正しく反映されているか
    // 割引率が高い食材ほどスコアが高くなっているか
    const ing_with_high_discount = result.scored_ingredients.find(
      (item) => item.ingredient_id === "ing_002"
    );
    const ing_with_low_discount = result.scored_ingredients.find(
      (item) => item.ingredient_id === "ing_003"
    );
    expect(ing_with_high_discount!.priority_score).toBeGreaterThan(
      ing_with_low_discount!.priority_score
    );

    // 5. 献立提案リストにおける食材の配置が正しいか
    expect(result.recommended_meal_ingredients).toHaveLength(3);
    // 上位 3 つのスコアが高い食材が推奨献立に含まれる
    expect(result.recommended_meal_ingredients[0]).toBe("ing_004");
    expect(result.recommended_meal_ingredients[1]).toBe("ing_001");
    expect(result.recommended_meal_ingredients[2]).toBe("ing_002");

    // 6. 栄養バランスと季節性が両立しているか
    // 推奨食材の栄養価の合計と季節係数の検証
    const recommended_nutrition_sum = ingredients
      .filter((ing) => result.recommended_meal_ingredients.includes(ing.id))
      .reduce((sum, ing) => sum + ing.nutritional_value, 0);
    expect(recommended_nutrition_sum).toBeGreaterThanOrEqual(20); // 最低栄養価閾値

    const recommended_seasonal_count = ingredients
      .filter((ing) => result.recommended_meal_ingredients.includes(ing.id))
      .filter((ing) => ing.is_in_season).length;
    expect(recommended_seasonal_count).toBe(3); // 全推奨食材が旬のもの

    // 7. 総合スコアが計算されているか
    expect(result.total_priority_score).toBeCloseTo(105.6 + 86.25 + 78.75, 2);

    // 8. 処理結果のメタデータが正しく記録されているか
    expect(result.calculation_timestamp).toEqual("2024-04-15T09:00:00Z");
    expect(result.applied_season).toBe("spring");
    expect(result.ingredient_count).toBe(4);
    expect(result.seasonal_ingredient_count).toBe(3);
    expect(result.average_discount_rate).toBeCloseTo(0.175, 2); // (0.15 + 0.25 + 0.10 + 0.20) / 4
  });
});