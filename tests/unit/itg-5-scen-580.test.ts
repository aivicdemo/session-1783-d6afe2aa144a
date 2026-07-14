import { calculateMealPriorityScore } from '../../src/logic/it-7-2-1';

describe('献立案の優先度スコアリング - 在庫充足度0%時の大幅低下検証', () => {
  // SCEN-580
  test('在庫充足度0%の食材を含む献立案は、同等の献立案と比較して30%以上のスコア低下を示す', () => {
    // 基準となる献立案（全食材で充足度70%以上）
    const baselineMealPlan = {
      mealPlanId: 'meal-001',
      dishes: [
        {
          dishId: 'dish-001',
          dishName: '牛丼',
          ingredients: [
            {
              ingredientId: 'ing-001',
              name: '牛肉',
              stockFulfillmentRate: 80,
              discountRate: 0,
              isSeasonalItem: true,
            },
            {
              ingredientId: 'ing-002',
              name: '玉ねぎ',
              stockFulfillmentRate: 70,
              discountRate: 0,
              isSeasonalItem: false,
            },
          ],
        },
      ],
      createdAt: '2024-01-15T10:00:00Z',
    };

    // 在庫充足度0%の食材を含む献立案
    const zeroStockMealPlan = {
      mealPlanId: 'meal-002',
      dishes: [
        {
          dishId: 'dish-002',
          dishName: '牛丼',
          ingredients: [
            {
              ingredientId: 'ing-001',
              name: '牛肉',
              stockFulfillmentRate: 0,
              discountRate: 0,
              isSeasonalItem: true,
            },
            {
              ingredientId: 'ing-002',
              name: '玉ねぎ',
              stockFulfillmentRate: 70,
              discountRate: 0,
              isSeasonalItem: false,
            },
          ],
        },
      ],
      createdAt: '2024-01-15T10:00:00Z',
    };

    // 基準献立案のスコア算出
    const baselineScore = calculateMealPriorityScore(baselineMealPlan);

    // 在庫充足度0%を含む献立案のスコア算出
    const zeroStockScore = calculateMealPriorityScore(zeroStockMealPlan);

    // スコア低下率を計算（基準値との差分に対する相対率）
    const scoreDecrementRate = ((baselineScore - zeroStockScore) / baselineScore) * 100;

    // スコアは0以上の値であることを確認
    expect(baselineScore).toBeGreaterThanOrEqual(0);
    expect(zeroStockScore).toBeGreaterThanOrEqual(0);

    // 在庫充足度0%を含む献立案のスコアが基準献立案より低いことを確認
    expect(zeroStockScore).toBeLessThan(baselineScore);

    // スコア低下率が30%以上であることを確認
    expect(scoreDecrementRate).toBeGreaterThanOrEqual(30);

    // 具体的なスコア値の検証
    // 基準献立案: 牛肉(80%) + 玉ねぎ(70%) の平均 = 75%
    // 旬食材ボーナス・割引ボーナスを加味したスコアが算出される
    // 例: ベーススコア 75 + 旬食材ボーナス(牛肉の旬で+10) = 85
    expect(baselineScore).toBe(85);

    // 在庫充足度0%の献立案: 牛肉(0%) + 玉ねぎ(70%) の平均 = 35%
    // スコア = 35 + 旬食材ボーナス(0で加算されない) = 35
    expect(zeroStockScore).toBe(35);

    // スコア低下率 = (85 - 35) / 85 * 100 = 58.8%（30%以上を満たす）
    expect(scoreDecrementRate).toBeCloseTo(58.823, 2);
  });
});