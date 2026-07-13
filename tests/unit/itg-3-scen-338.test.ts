import { rankMenuCandidatesByUserSatisfaction } from "../../src/logic/it-1-br-3-2-1";

describe("複数制約条件下での献立候補ランキング機能", () => {
  // SCEN-338
  test("複数制約条件下での献立候補ランキング機能 - 食材制限、冷蔵庫在庫、予算上限、食事評価データの4つの制約条件を全て満たす献立候補がユーザー満足度スコア順に正しくランキングされる", () => {
    // テストデータ準備: 制約条件の定義
    const allergyRestrictions = {
      allergenNames: ["卵", "ナッツ"],
    };

    const inventoryConstraints = {
      availableIngredients: [
        { ingredientName: "鶏肉", quantityGrams: 500 },
        { ingredientName: "トマト", quantityGrams: 300 },
        { ingredientName: "ほうれん草", quantityGrams: 200 },
        { ingredientName: "人参", quantityGrams: 150 },
        { ingredientName: "醤油", quantityGrams: 200 },
        { ingredientName: "味噌", quantityGrams: 200 },
        { ingredientName: "塩", quantityGrams: 100 },
      ],
    };

    const budgetConstraint = {
      maxPricePerMealYen: 800,
    };

    const userEvaluationData = {
      mealTypeScores: {
        和食: 4.5,
        洋食: 3.0,
        中華: 4.0,
      },
    };

    // 献立候補データの定義
    // 候補1: 和食（鶏肉の味噌焼き）- 満足度スコア: (4.5 * 0.5 + 3.0 * 0.25 + 4.0 * 0.25) = 3.875
    const candidate1 = {
      menuId: "menu_001",
      menuName: "鶏肉の味噌焼き",
      mealType: "和食",
      priceYen: 650,
      cookingTimeMinutes: 20,
      ingredientList: [
        { ingredientName: "鶏肉", quantityGrams: 200 },
        { ingredientName: "味噌", quantityGrams: 30 },
        { ingredientName: "塩", quantityGrams: 5 },
      ],
      containsAllergens: [],
    };

    // 候補2: 洋食（トマトチキン）- 満足度スコア: (4.5 * 0.25 + 3.0 * 0.5 + 4.0 * 0.25) = 3.625
    const candidate2 = {
      menuId: "menu_002",
      menuName: "トマトチキン",
      mealType: "洋食",
      priceYen: 750,
      cookingTimeMinutes: 25,
      ingredientList: [
        { ingredientName: "鶏肉", quantityGrams: 250 },
        { ingredientName: "トマト", quantityGrams: 200 },
        { ingredientName: "塩", quantityGrams: 5 },
      ],
      containsAllergens: [],
    };

    // 候補3: 和食（ほうれん草と人参の味噌汁）- 満足度スコア: (4.5 * 0.5 + 3.0 * 0.25 + 4.0 * 0.25) = 3.875（同一スコア、調理時間15分で候補1より短い）
    const candidate3 = {
      menuId: "menu_003",
      menuName: "ほうれん草と人参の味噌汁",
      mealType: "和食",
      priceYen: 400,
      cookingTimeMinutes: 15,
      ingredientList: [
        { ingredientName: "ほうれん草", quantityGrams: 100 },
        { ingredientName: "人参", quantityGrams: 100 },
        { ingredientName: "味噌", quantityGrams: 20 },
        { ingredientName: "塩", quantityGrams: 3 },
      ],
      containsAllergens: [],
    };

    // 候補4: 中華（鶏肉炒め）- 満足度スコア: (4.5 * 0.25 + 3.0 * 0.25 + 4.0 * 0.5) = 3.875（同一スコア、調理時間25分）
    const candidate4 = {
      menuId: "menu_004",
      menuName: "鶏肉炒め",
      mealType: "中華",
      priceYen: 700,
      cookingTimeMinutes: 25,
      ingredientList: [
        { ingredientName: "鶏肉", quantityGrams: 200 },
        { ingredientName: "トマト", quantityGrams: 100 },
        { ingredientName: "塩", quantityGrams: 5 },
      ],
      containsAllergens: [],
    };

    const menuCandidates = [candidate2, candidate1, candidate3, candidate4];

    // 関数呼び出し
    const result = rankMenuCandidatesByUserSatisfaction({
      menuCandidates,
      allergyRestrictions,
      inventoryConstraints,
      budgetConstraint,
      userEvaluationData,
    });

    // 検証1: 返されたリストが配列であること
    expect(Array.isArray(result.rankedMenus)).toBe(true);

    // 検証2: 返されたリストの長さが4（制約を満たす候補数）であること
    expect(result.rankedMenus).toHaveLength(4);

    // 検証3: 全候補がアレルギー食材を含まないことを検証
    result.rankedMenus.forEach((menu) => {
      const hasAllergen = allergyRestrictions.allergenNames.some((allergen) =>
        menu.ingredientList.some((ing) => ing.ingredientName === allergen)
      );
      expect(hasAllergen).toBe(false);
    });

    // 検証4: 全候補が冷蔵庫在庫内の食材で構成されていることを検証
    result.rankedMenus.forEach((menu) => {
      const inventoryMap = new Map(
        inventoryConstraints.availableIngredients.map((ing) => [
          ing.ingredientName,
          ing.quantityGrams,
        ])
      );
      menu.ingredientList.forEach((ing) => {
        expect(inventoryMap.has(ing.ingredientName)).toBe(true);
        const availableQty = inventoryMap.get(ing.ingredientName) || 0;
        expect(ing.quantityGrams).toBeLessThanOrEqual(availableQty);
      });
    });

    // 検証5: 全候補の金額が予算上限800円以下であること
    result.rankedMenus.forEach((menu) => {
      expect(menu.priceYen).toBeLessThanOrEqual(
        budgetConstraint.maxPricePerMealYen
      );
    });

    // 検証6: ユーザー満足度スコアが正しく計算されていることを検証
    // 期待スコア順: 候補3(3.875, 15分) > 候補1(3.875, 20分) > 候補4(3.875, 25分) > 候補2(3.625)
    expect(result.rankedMenus[0].userSatisfactionScore).toBe(3.875);
    expect(result.rankedMenus[0].menuId).toBe("menu_003");

    expect(result.rankedMenus[1].userSatisfactionScore).toBe(3.875);
    expect(result.rankedMenus[1].menuId).toBe("menu_001");

    expect(result.rankedMenus[2].userSatisfactionScore).toBe(3.875);
    expect(result.rankedMenus[2].menuId).toBe("menu_004");

    expect(result.rankedMenus[3].userSatisfactionScore).toBe(3.625);
    expect(result.rankedMenus[3].menuId).toBe("menu_002");

    // 検証7: ランキングが満足度スコアの高い順（降順）にソートされていることを検証
    for (let i = 0; i < result.rankedMenus.length - 1; i++) {
      if (
        result.rankedMenus[i].userSatisfactionScore ===
        result.rankedMenus[i + 1].userSatisfactionScore
      ) {
        // 同一スコアの場合、調理時間が短い順に並んでいることを検証
        expect(result.rankedMenus[i].cookingTimeMinutes).toBeLessThanOrEqual(
          result.rankedMenus[i + 1].cookingTimeMinutes
        );
      } else {
        // 異なるスコアの場合、スコアが高い順に並んでいることを検証
        expect(result.rankedMenus[i].userSatisfactionScore).toBeGreaterThan(
          result.rankedMenus[i + 1].userSatisfactionScore
        );
      }
    }

    // 検証8: ランキング順位が正確に表示されていることを検証
    result.rankedMenus.forEach((menu, index) => {
      expect(menu.rankingPosition).toBe(index + 1);
    });

    // 検証9: 返された結果オブジェクトが必要なプロパティを持つこと
    expect(result).toHaveProperty("rankedMenus");
    expect(result).toHaveProperty("totalCandidatesEvaluated");
    expect(result.totalCandidatesEvaluated).toBe(4);
  });
});