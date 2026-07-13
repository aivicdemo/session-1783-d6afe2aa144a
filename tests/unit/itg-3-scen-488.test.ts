import { calculateSeasonalFoodPriorityScore } from '../../src/logic/it-1-br-6-2-1-1';

describe('旬食材・割引商品優先度スコア計算機能', () => {
  // SCEN-488: [edge] 販売期間の開始日と終了日が同一日時の場合、優先度スコアが正常に計算される
  test('販売期間の開始日と終了日が同一日時のとき、優先度スコアが0～100の有効な数値で返される', () => {
    // パターン1: 2024-01-15 10:00:00 で開始日と終了日が同一
    const result1 = calculateSeasonalFoodPriorityScore({
      foodName: 'トマト',
      discountRate: 20,
      seasonalityScore: 85,
      saleStartDate: new Date('2024-01-15T10:00:00Z'),
      saleEndDate: new Date('2024-01-15T10:00:00Z'),
      inventoryFulfillmentRate: 0.95,
    });

    expect(result1).toBeDefined();
    expect(typeof result1).toBe('number');
    expect(Number.isNaN(result1)).toBe(false);
    expect(result1).toBeGreaterThanOrEqual(0);
    expect(result1).toBeLessThanOrEqual(100);

    // パターン2: 2024-03-22 14:30:00 で開始日と終了日が同一（異なる時刻）
    const result2 = calculateSeasonalFoodPriorityScore({
      foodName: 'ナス',
      discountRate: 15,
      seasonalityScore: 78,
      saleStartDate: new Date('2024-03-22T14:30:00Z'),
      saleEndDate: new Date('2024-03-22T14:30:00Z'),
      inventoryFulfillmentRate: 0.88,
    });

    expect(result2).toBeDefined();
    expect(typeof result2).toBe('number');
    expect(Number.isNaN(result2)).toBe(false);
    expect(result2).toBeGreaterThanOrEqual(0);
    expect(result2).toBeLessThanOrEqual(100);

    // パターン3: 2024-07-01 00:00:00 で開始日と終了日が同一（異なる日付）
    const result3 = calculateSeasonalFoodPriorityScore({
      foodName: 'キュウリ',
      discountRate: 25,
      seasonalityScore: 92,
      saleStartDate: new Date('2024-07-01T00:00:00Z'),
      saleEndDate: new Date('2024-07-01T00:00:00Z'),
      inventoryFulfillmentRate: 0.75,
    });

    expect(result3).toBeDefined();
    expect(typeof result3).toBe('number');
    expect(Number.isNaN(result3)).toBe(false);
    expect(result3).toBeGreaterThanOrEqual(0);
    expect(result3).toBeLessThanOrEqual(100);

    // パターン4: 2024-12-25 23:59:59 で開始日と終了日が同一（年末時刻）
    const result4 = calculateSeasonalFoodPriorityScore({
      foodName: 'リンゴ',
      discountRate: 30,
      seasonalityScore: 88,
      saleStartDate: new Date('2024-12-25T23:59:59Z'),
      saleEndDate: new Date('2024-12-25T23:59:59Z'),
      inventoryFulfillmentRate: 0.82,
    });

    expect(result4).toBeDefined();
    expect(typeof result4).toBe('number');
    expect(Number.isNaN(result4)).toBe(false);
    expect(result4).toBeGreaterThanOrEqual(0);
    expect(result4).toBeLessThanOrEqual(100);

    // 複数パターンの計算結果の一貫性検証
    // 同じパラメータで複数回実行した場合、結果が一致することを確認
    const testParams = {
      foodName: 'ブロッコリー',
      discountRate: 18,
      seasonalityScore: 72,
      saleStartDate: new Date('2024-05-10T12:00:00Z'),
      saleEndDate: new Date('2024-05-10T12:00:00Z'),
      inventoryFulfillmentRate: 0.9,
    };

    const result5a = calculateSeasonalFoodPriorityScore(testParams);
    const result5b = calculateSeasonalFoodPriorityScore(testParams);
    const result5c = calculateSeasonalFoodPriorityScore(testParams);

    expect(result5a).toBe(result5b);
    expect(result5b).toBe(result5c);
    expect(result5a).toBeGreaterThanOrEqual(0);
    expect(result5a).toBeLessThanOrEqual(100);
  });
});