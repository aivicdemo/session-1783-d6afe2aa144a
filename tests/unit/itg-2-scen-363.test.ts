import { calculateMealPlanScores, selectBestMealPlan } from "../../src/logic/it-1-br-2-1-1-1";

describe("流通業者在庫・価格データ連携による献立案スコアリング", () => {
  // SCEN-363
  test("複数の献立案の中から最高スコアの献立案が正しく選出される", () => {
    // Precondition: 複数の献立案と流通業者の在庫・価格データが存在する状態
    const mealPlan1 = {
      id: "meal_001",
      name: "献立案A",
      dishes: ["唐揚げ", "サラダ", "味噌汁"],
      ingredients: [
        { name: "鶏肉", quantity: 500, unit: "g" },
        { name: "野菜", quantity: 300, unit: "g" },
        { name: "味噌", quantity: 30, unit: "g" },
      ],
      nutritionBalance: 85, // 栄養バランススコア (0-100)
    };

    const mealPlan2 = {
      id: "meal_002",
      name: "献立案B",
      dishes: ["魚フライ", "煮込み野菜", "ご飯"],
      ingredients: [
        { name: "白身魚", quantity: 400, unit: "g" },
        { name: "野菜", quantity: 250, unit: "g" },
        { name: "米", quantity: 200, unit: "g" },
      ],
      nutritionBalance: 78,
    };

    const mealPlan3 = {
      id: "meal_003",
      name: "献立案C",
      dishes: ["豚の生姜焼き", "副菜", "汁物"],
      ingredients: [
        { name: "豚肉", quantity: 450, unit: "g" },
        { name: "生姜", quantity: 15, unit: "g" },
        { name: "野菜", quantity: 200, unit: "g" },
      ],
      nutritionBalance: 80,
    };

    // 流通業者の在庫・価格データ
    const distributorData = {
      "鶏肉": {
        inStock: true,
        stockLevel: 95, // 在庫充足度 (0-100)
        price: 1200, // 円/kg
        seasonalDiscount: 10, // %
      },
      "白身魚": {
        inStock: true,
        stockLevel: 60,
        price: 1800,
        seasonalDiscount: 5,
      },
      "豚肉": {
        inStock: true,
        stockLevel: 85,
        price: 1400,
        seasonalDiscount: 15, // 割引キャンペーン中
      },
      "野菜": {
        inStock: true,
        stockLevel: 92,
        price: 150,
        seasonalDiscount: 8,
      },
      "米": {
        inStock: true,
        stockLevel: 98,
        price: 300,
        seasonalDiscount: 0,
      },
      "味噌": {
        inStock: true,
        stockLevel: 88,
        price: 400,
        seasonalDiscount: 3,
      },
      "生姜": {
        inStock: true,
        stockLevel: 70,
        price: 600,
        seasonalDiscount: 12,
      },
    };

    // Action: 各献立案のスコアリング計算を実行
    // スコアリングアルゴリズム:
    // - 在庫充足度スコア (0-100): 各食材の在庫レベルの平均値
    // - 価格スコア (0-100): 割引を考慮した価格効率度 (割引率が高く価格が安いほど高スコア)
    // - 栄養バランススコア (0-100): 入力値をそのまま使用
    // - 総合スコア = (在庫充足度スコア × 0.3) + (価格スコア × 0.3) + (栄養バランススコア × 0.4)

    const mealPlans = [mealPlan1, mealPlan2, mealPlan3];
    const scoredPlans = calculateMealPlanScores(mealPlans, distributorData);

    // 献立案Aの期待スコア計算:
    // 在庫充足度: (95 + 92 + 88) / 3 = 91.67
    // 価格スコア: 鶏肉(1200*0.9=1080), 野菜(150*0.92=138), 味噌(400*0.97=388)
    //   価格合計: 1606円、割引平均: 9.33%、効率度: 100 - (9.33 * 0.5) = 95.33
    // 総合スコア: (91.67 × 0.3) + (95.33 × 0.3) + (85 × 0.4) = 27.5 + 28.6 + 34 = 90.1

    const expectedScore1 = 90.1;

    // 献立案Bの期待スコア計算:
    // 在庫充足度: (60 + 92 + 98) / 3 = 83.33
    // 価格スコア: 白身魚(1800*0.95=1710), 野菜(150*0.92=138), 米(300*1.0=300)
    //   価格合計: 2148円、割引平均: 1.67%、効率度: 100 - (1.67 * 0.5) = 99.17
    // 総合スコア: (83.33 × 0.3) + (99.17 × 0.3) + (78 × 0.4) = 25.0 + 29.75 + 31.2 = 85.95

    const expectedScore2 = 85.95;

    // 献立案Cの期待スコア計算:
    // 在庫充足度: (85 + 70 + 92 + 88) / 4 = 83.75
    // 価格スコア: 豚肉(1400*0.85=1190), 生姜(600*0.88=528), 野菜(150*0.92=138)
    //   価格合計: 1856円、割引平均: 13.33%、効率度: 100 - (13.33 * 0.5) = 93.33
    // 総合スコア: (83.75 × 0.3) + (93.33 × 0.3) + (80 × 0.4) = 25.13 + 28.0 + 32.0 = 85.13

    const expectedScore3 = 85.13;

    // 各献立案のスコアが正しく計算されている
    expect(scoredPlans[0].totalScore).toBeCloseTo(expectedScore1, 1);
    expect(scoredPlans[1].totalScore).toBeCloseTo(expectedScore2, 1);
    expect(scoredPlans[2].totalScore).toBeCloseTo(expectedScore3, 1);

    // Action: 最高スコアの献立案を特定
    const bestMealPlan = selectBestMealPlan(scoredPlans);

    // Outcome: 最高スコアの献立案が正しく選出されている
    expect(bestMealPlan.id).toBe("meal_001"); // 献立案Aが最高スコア
    expect(bestMealPlan.totalScore).toBeCloseTo(expectedScore1, 1);

    // 選出された献立案のスコアが他の献立案より高いことを確認
    expect(bestMealPlan.totalScore).toBeGreaterThan(scoredPlans[1].totalScore);
    expect(bestMealPlan.totalScore).toBeGreaterThan(scoredPlans[2].totalScore);

    // スコアリングアルゴリズムが在庫状況・価格・栄養バランスを考慮していることを確認
    expect(bestMealPlan).toHaveProperty("stockFulfillmentScore");
    expect(bestMealPlan).toHaveProperty("priceScore");
    expect(bestMealPlan).toHaveProperty("nutritionBalanceScore");
    expect(bestMealPlan).toHaveProperty("totalScore");

    // スコアの内訳が正確に計算されている
    expect(bestMealPlan.stockFulfillmentScore).toBeCloseTo(91.67, 1);
    expect(bestMealPlan.priceScore).toBeCloseTo(95.33, 1);
    expect(bestMealPlan.nutritionBalanceScore).toBe(85);
  });
});