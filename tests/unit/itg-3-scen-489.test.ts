import { calculatePriorityScore } from "../../src/logic/it-1-br-6-2-1-1";

describe("旬食材・割引商品優先度スコア計算機能", () => {
  // SCEN-489
  test("割引率が0%の場合、優先度スコア計算で割引ボーナスが適用されない", () => {
    // 基本設定
    const SEASONAL_BONUS = 15;
    const DISCOUNT_BONUS_PER_PERCENT = 0.5;
    const BASE_SCORES = [50, 100, 150];
    const DISCOUNT_RATE_ZERO = 0;
    const DISCOUNT_RATE_ONE = 1;

    // 割引率 0% のテスト - 複数の基本スコアで検証
    const results_zero_discount = BASE_SCORES.map((base_score) => {
      const input_zero_discount = {
        base_score: base_score,
        is_seasonal: true,
        discount_rate: DISCOUNT_RATE_ZERO,
      };
      return calculatePriorityScore(input_zero_discount);
    });

    // 割引率 0% の場合、期待スコア = 基本スコア + 旬食材ボーナス
    const expected_scores_zero_discount = BASE_SCORES.map(
      (base_score) => base_score + SEASONAL_BONUS
    );

    // 割引率 0% の結果を検証
    results_zero_discount.forEach((result, idx) => {
      expect(result).toBe(expected_scores_zero_discount[idx]);
    });

    // 割引率 1% 以上のテスト - 基本スコア 100 での検証
    const base_score_100 = 100;
    const input_one_percent = {
      base_score: base_score_100,
      is_seasonal: true,
      discount_rate: DISCOUNT_RATE_ONE,
    };
    const result_one_percent = calculatePriorityScore(input_one_percent);

    // 割引率 1% の場合、期待スコア = 基本スコア + 旬食材ボーナス + (割引率 * ボーナス係数)
    const expected_score_one_percent =
      base_score_100 + SEASONAL_BONUS + DISCOUNT_RATE_ONE * DISCOUNT_BONUS_PER_PERCENT;

    expect(result_one_percent).toBe(expected_score_one_percent);

    // 割引率 0% vs 1% のスコア差分を検証
    const result_zero_discount_base_100 = results_zero_discount[1]; // BASE_SCORES[1] = 100
    const score_difference = result_one_percent - result_zero_discount_base_100;

    // 期待される差分 = 割引率 1% × ボーナス係数
    const expected_difference =
      DISCOUNT_RATE_ONE * DISCOUNT_BONUS_PER_PERCENT;

    expect(score_difference).toBe(expected_difference);

    // 割引率 0% の場合は割引ボーナスが含まれていないことを確認
    expect(result_zero_discount_base_100).toBe(base_score_100 + SEASONAL_BONUS);
    expect(result_one_percent).toBeGreaterThan(result_zero_discount_base_100);
  });
});