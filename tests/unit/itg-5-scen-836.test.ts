import { calculatePriorityScore } from "../../src/logic/it-7-2-1";

describe("旬食材・割引商品優先度スコア計算 - 販売期間外フィルタリング", () => {
  // SCEN-836
  test("販売期間外の食材に対して優先度スコアがフィルタリングされ、献立から除外される", () => {
    // テストデータ: 販売期間内外の食材を含む複数食材データ
    const today = new Date("2024-06-15");
    const ingredients = [
      {
        ingredientId: "ing_001",
        name: "トマト（旬）",
        inSeason: true,
        discountRate: 0.15,
        saleStartDate: new Date("2024-06-01"),
        saleEndDate: new Date("2024-06-30"),
      },
      {
        ingredientId: "ing_002",
        name: "イチゴ（季節外）",
        inSeason: false,
        discountRate: 0.0,
        saleStartDate: new Date("2024-01-01"),
        saleEndDate: new Date("2024-02-28"),
      },
      {
        ingredientId: "ing_003",
        name: "玉ねぎ（割引中）",
        inSeason: true,
        discountRate: 0.25,
        saleStartDate: new Date("2024-06-10"),
        saleEndDate: new Date("2024-06-20"),
      },
      {
        ingredientId: "ing_004",
        name: "キャベツ（販売期間外）",
        inSeason: false,
        discountRate: 0.0,
        saleStartDate: new Date("2024-07-01"),
        saleEndDate: new Date("2024-07-31"),
      },
    ];

    const priorityRules = {
      seasonWeightage: 0.4,
      discountWeightage: 0.3,
      maxDiscountRate: 0.5,
      minSeasonScore: 30,
    };

    // 優先度スコア計算を実行
    const results = ingredients.map((ing) =>
      calculatePriorityScore({
        ingredient: ing,
        referenceDate: today,
        priorityRules,
      })
    );

    // ing_001: 旬・割引なし → スコア: 40(旬) + 0 = 40
    expect(results[0]).toEqual({
      ingredientId: "ing_001",
      priorityScore: 40,
      isFiltered: false,
      filterReason: null,
    });

    // ing_002: 季節外・販売期間外 → スコア: null または 0、フィルタリング対象
    expect(results[1]).toEqual({
      ingredientId: "ing_002",
      priorityScore: 0,
      isFiltered: true,
      filterReason: "販売期間外",
    });

    // ing_003: 旬・割引中(25%) → スコア: 40(旬) + 25*0.3 = 47.5 ≒ 48
    expect(results[2]).toEqual({
      ingredientId: "ing_003",
      priorityScore: 48,
      isFiltered: false,
      filterReason: null,
    });

    // ing_004: 季節外・販売期間外 → スコア: 0、フィルタリング対象
    expect(results[3]).toEqual({
      ingredientId: "ing_004",
      priorityScore: 0,
      isFiltered: true,
      filterReason: "販売期間外",
    });

    // フィルタリング処理: 献立生成時にスコア0または isFiltered:true の食材は除外
    const mealIngredientsAfterFiltering = results.filter(
      (r) => !r.isFiltered && r.priorityScore > 0
    );

    expect(mealIngredientsAfterFiltering).toHaveLength(2);
    expect(mealIngredientsAfterFiltering[0].ingredientId).toBe("ing_001");
    expect(mealIngredientsAfterFiltering[1].ingredientId).toBe("ing_003");

    // 献立に含まれる食材が全て販売期間内であることを確認
    mealIngredientsAfterFiltering.forEach((result) => {
      const ingredient = ingredients.find(
        (i) => i.ingredientId === result.ingredientId
      );
      expect(ingredient).toBeDefined();
      expect(ingredient!.saleStartDate <= today).toBe(true);
      expect(ingredient!.saleEndDate >= today).toBe(true);
    });

    // 販売期間外の食材が献立から除外されていることを確認
    const excludedIds = results
      .filter((r) => r.isFiltered)
      .map((r) => r.ingredientId);
    expect(excludedIds).toEqual(["ing_002", "ing_004"]);
    expect(
      mealIngredientsAfterFiltering.some((r) => excludedIds.includes(r.ingredientId))
    ).toBe(false);
  });
});