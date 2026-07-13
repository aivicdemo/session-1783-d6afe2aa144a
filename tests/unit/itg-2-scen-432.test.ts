import { calculateNutrientAchievementScore } from "../../src/logic/it-1-br-2-1-1-1";

describe("栄養摂取達成度可視化機能", () => {
  // SCEN-432
  test("栄養摂取量が基準値の0%から100%の全範囲において達成度スコアが正確に算出される", () => {
    const standard_value = 2000;

    // 基準値の0%: 摂取量0kcal -> 達成度スコア0%
    const result_0pct = calculateNutrientAchievementScore({
      actual_intake: 0,
      standard_value: standard_value,
    });
    expect(result_0pct).toBe(0);

    // 基準値の25%: 摂取量500kcal -> 達成度スコア25%
    const result_25pct = calculateNutrientAchievementScore({
      actual_intake: 500,
      standard_value: standard_value,
    });
    expect(result_25pct).toBe(25);

    // 基準値の50%: 摂取量1000kcal -> 達成度スコア50%
    const result_50pct = calculateNutrientAchievementScore({
      actual_intake: 1000,
      standard_value: standard_value,
    });
    expect(result_50pct).toBe(50);

    // 基準値の75%: 摂取量1500kcal -> 達成度スコア75%
    const result_75pct = calculateNutrientAchievementScore({
      actual_intake: 1500,
      standard_value: standard_value,
    });
    expect(result_75pct).toBe(75);

    // 基準値の100%: 摂取量2000kcal -> 達成度スコア100%
    const result_100pct = calculateNutrientAchievementScore({
      actual_intake: 2000,
      standard_value: standard_value,
    });
    expect(result_100pct).toBe(100);

    // 基準値を超える場合: 摂取量2500kcal -> 達成度スコア125%（上限100%で丸める場合もある）
    const result_over = calculateNutrientAchievementScore({
      actual_intake: 2500,
      standard_value: standard_value,
    });
    expect(result_over).toBe(125);

    // 小数点以下を含む計算: 摂取量333kcal -> 達成度スコア16.65% (小数点以下2桁)
    const result_decimal = calculateNutrientAchievementScore({
      actual_intake: 333,
      standard_value: standard_value,
    });
    expect(result_decimal).toBeCloseTo(16.65, 2);
  });
});