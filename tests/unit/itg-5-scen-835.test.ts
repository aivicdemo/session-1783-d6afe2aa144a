import { calculatePriorityScore } from '../../src/logic/it-7-2-1';

describe('旬食材・割引商品優先度スコア計算', () => {
  // SCEN-835
  test('割引率閾値が0%の場合、食材の優先度スコアが最低値として正しく計算される', () => {
    // テスト環境初期化
    const seasonalityScore = 8;
    const minAllowedScore = 0;

    // 旬食材データ（割引率0%）
    const seasonalIngredientZeroDiscount = {
      name: 'トマト',
      seasonalityScore: seasonalityScore,
      discountRate: 0,
      basePrice: 100,
      discountedPrice: 100,
      stockLevel: 5,
    };

    // 旬食材データ（割引率1%）
    const seasonalIngredientOnePercentDiscount = {
      name: 'トマト',
      seasonalityScore: seasonalityScore,
      discountRate: 1,
      basePrice: 100,
      discountedPrice: 99,
      stockLevel: 5,
    };

    // 旬食材データ（割引率5%）
    const seasonalIngredientFivePercentDiscount = {
      name: 'トマト',
      seasonalityScore: seasonalityScore,
      discountRate: 5,
      basePrice: 100,
      discountedPrice: 95,
      stockLevel: 5,
    };

    // 割引率0%での優先度スコア計算
    const scoreZeroDiscount = calculatePriorityScore(
      seasonalIngredientZeroDiscount
    );

    // 割引率1%での優先度スコア計算
    const scoreOnePercentDiscount = calculatePriorityScore(
      seasonalIngredientOnePercentDiscount
    );

    // 割引率5%での優先度スコア計算
    const scoreFivePercentDiscount = calculatePriorityScore(
      seasonalIngredientFivePercentDiscount
    );

    // アサーション：割引率0%時が最低値であること
    expect(scoreZeroDiscount).toBe(minAllowedScore);

    // アサーション：割引率0%が最も低いスコアであること
    expect(scoreZeroDiscount).toBeLessThanOrEqual(scoreOnePercentDiscount);
    expect(scoreZeroDiscount).toBeLessThanOrEqual(scoreFivePercentDiscount);

    // アサーション：割引率が上がるとスコアが上がることを確認
    expect(scoreOnePercentDiscount).toBeLessThanOrEqual(
      scoreFivePercentDiscount
    );

    // アサーション：すべてのスコアが非負であること
    expect(scoreZeroDiscount).toBeGreaterThanOrEqual(minAllowedScore);
    expect(scoreOnePercentDiscount).toBeGreaterThanOrEqual(minAllowedScore);
    expect(scoreFivePercentDiscount).toBeGreaterThanOrEqual(minAllowedScore);

    // アサーション：割引率0%と1%でスコアが異なること（割引による優先度向上が反映されない状態をチェック）
    expect(scoreZeroDiscount).toBeLessThan(scoreOnePercentDiscount);
  });
});