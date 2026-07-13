import {
  calculateNutrientAchievementScore,
} from "../../src/logic/it-1-br-3-2-1";

describe("購入実績の記録と月次食費削減効果の自動集計・分析機能", () => {
  // SCEN-397
  test("食事評価データが存在しない状態で栄養達成度スコア算出時にエラーハンドリングが行われる", () => {
    const user_id = "user_001";
    const analysis_month = "2024-01";
    const meal_evaluation_records = [];

    expect(() =>
      calculateNutrientAchievementScore({
        user_id,
        analysis_month,
        meal_evaluation_records,
      })
    ).toThrow(/食事評価データ/);
  });
});