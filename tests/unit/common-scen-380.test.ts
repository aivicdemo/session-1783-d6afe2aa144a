import { calculateMealPlanOptimizationScore } from '../../src/logic/common';

describe('共通', () => {
  // SCEN-380
  test('献立案の最適化スコアリング機能 - 旬の食材・割引商品・在庫充足度を反映した優先度スコアが献立案に正確に付与される', () => {
    // テストデータ準備
    const mealPlans = [
      {
        id: 'plan_001',
        dishes: [
          {
            ingredientId: 'ing_001',
            ingredientName: '春キャベツ',
            isSeasonalIngredient: true,
            discountRate: 0,
            inventoryFulfillmentRate: 95,
          },
          {
            ingredientId: 'ing_002',
            ingredientName: '鶏肉',
            isSeasonalIngredient: false,
            discountRate: 30,
            inventoryFulfillmentRate: 80,
          },
        ],
      },
      {
        id: 'plan_002',
        dishes: [
          {
            ingredientId: 'ing_003',
            ingredientName: 'トマト',
            isSeasonalIngredient: false,
            discountRate: 0,
            inventoryFulfillmentRate: 50,
          },
          {
            ingredientId: 'ing_004',
            ingredientName: 'ほうれん草',
            isSeasonalIngredient: true,
            discountRate: 15,
            inventoryFulfillmentRate: 70,
          },
        ],
      },
      {
        id: 'plan_003',
        dishes: [
          {
            ingredientId: 'ing_005',
            ingredientName: '玉ねぎ',
            isSeasonalIngredient: false,
            discountRate: 0,
            inventoryFulfillmentRate: 30,
          },
        ],
      },
      {
        id: 'plan_004',
        dishes: [
          {
            ingredientId: 'ing_006',
            ingredientName: 'アスパラガス',
            isSeasonalIngredient: true,
            discountRate: 25,
            inventoryFulfillmentRate: 100,
          },
          {
            ingredientId: 'ing_007',
            ingredientName: 'イチゴ',
            isSeasonalIngredient: true,
            discountRate: 20,
            inventoryFulfillmentRate: 85,
          },
          {
            ingredientId: 'ing_008',
            ingredientName: 'キノコ',
            isSeasonalIngredient: false,
            discountRate: 10,
            inventoryFulfillmentRate: 60,
          },
        ],
      },
    ];

    // 献立案の最適化スコアリング機能を実行
    const scoredPlans = calculateMealPlanOptimizationScore(mealPlans);

    // Plan 001 の検証
    // 旬の食材: 1 (春キャベツ) → 加算: 1 * 10 = 10点
    // 割引商品の割引率合計: 30% → 加算: 30点
    // 在庫充足度の平均: (95 + 80) / 2 = 87.5% → 加算: 87.5点
    // 総合スコア: 10 + 30 + 87.5 = 127.5
    expect(scoredPlans[0].id).toBe('plan_001');
    expect(scoredPlans[0].seasonalIngredientCount).toBe(1);
    expect(scoredPlans[0].totalDiscountRate).toBe(30);
    expect(scoredPlans[0].averageInventoryFulfillmentRate).toBe(87.5);
    expect(scoredPlans[0].optimizationScore).toBe(127.5);

    // Plan 002 の検証
    // 旬の食材: 1 (ほうれん草) → 加算: 1 * 10 = 10点
    // 割引商品の割引率合計: 15% → 加算: 15点
    // 在庫充足度の平均: (50 + 70) / 2 = 60% → 加算: 60点
    // 総合スコア: 10 + 15 + 60 = 85
    expect(scoredPlans[1].id).toBe('plan_002');
    expect(scoredPlans[1].seasonalIngredientCount).toBe(1);
    expect(scoredPlans[1].totalDiscountRate).toBe(15);
    expect(scoredPlans[1].averageInventoryFulfillmentRate).toBe(60);
    expect(scoredPlans[1].optimizationScore).toBe(85);

    // Plan 003 の検証（エッジケース：旬の食材なし、割引なし、在庫不足）
    // 旬の食材: 0 → 加算: 0点
    // 割引商品の割引率合計: 0% → 加算: 0点
    // 在庫充足度の平均: 30% → 加算: 30点
    // 総合スコア: 0 + 0 + 30 = 30
    expect(scoredPlans[2].id).toBe('plan_003');
    expect(scoredPlans[2].seasonalIngredientCount).toBe(0);
    expect(scoredPlans[2].totalDiscountRate).toBe(0);
    expect(scoredPlans[2].averageInventoryFulfillmentRate).toBe(30);
    expect(scoredPlans[2].optimizationScore).toBe(30);

    // Plan 004 の検証（複数の旬の食材と割引商品）
    // 旬の食材: 2 (アスパラガス, イチゴ) → 加算: 2 * 10 = 20点
    // 割引商品の割引率合計: 25 + 20 + 10 = 55% → 加算: 55点
    // 在庫充足度の平均: (100 + 85 + 60) / 3 = 81.666... → 加算: 81.666...点
    // 総合スコア: 20 + 55 + 81.666... = 156.666...
    expect(scoredPlans[3].id).toBe('plan_004');
    expect(scoredPlans[3].seasonalIngredientCount).toBe(2);
    expect(scoredPlans[3].totalDiscountRate).toBe(55);
    expect(scoredPlans[3].averageInventoryFulfillmentRate).toBeCloseTo(81.666666, 5);
    expect(scoredPlans[3].optimizationScore).toBeCloseTo(156.666666, 5);

    // 複数の献立案を比較し、スコアの高い順に正しくランク付けされていることを確認
    // 期待される順序: Plan 004 (156.67) > Plan 001 (127.5) > Plan 002 (85) > Plan 003 (30)
    expect(scoredPlans[0].optimizationScore).toBeGreaterThan(
      scoredPlans[1].optimizationScore
    );
    expect(scoredPlans[1].optimizationScore).toBeGreaterThan(
      scoredPlans[2].optimizationScore
    );
    expect(scoredPlans[2].optimizationScore).toBeGreaterThan(
      scoredPlans[3].optimizationScore
    );

    // スコアが高い順に降順でソートされていることを確認
    for (let i = 0; i < scoredPlans.length - 1; i++) {
      expect(scoredPlans[i].optimizationScore).toBeGreaterThanOrEqual(
        scoredPlans[i + 1].optimizationScore
      );
    }
  });
});