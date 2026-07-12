import { calculateNutritionAchievementScore } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-496: [edge] 栄養摂取状況の可視化と次月優先条件調整 - 栄養摂取データが存在しない場合、達成度スコアが 0 として表示される
  test("栄養摂取データが存在しない場合、達成度スコアが0として表示される", () => {
    // 前提: 献立自動生成アプリにログイン済み、栄養摂取データが存在しない状態
    const user_id = "user_001";
    const family_member_id = "member_001";
    const target_date_start = "2024-01-01";
    const target_date_end = "2024-01-31";
    const nutrition_records = [];

    // 発生条件: 栄養摂取状況の可視化画面にアクセス
    // 結果: 栄養摂取データが存在しない場合、達成度スコアが0として表示される
    const result = calculateNutritionAchievementScore({
      user_id,
      family_member_id,
      target_date_start,
      target_date_end,
      nutrition_records,
    });

    // 期待値: 栄養摂取データが存在しない場合、達成度スコアは0
    expect(result.achievement_score).toBe(0);

    // スコア表示形式が正しい形式（0-100の数値）であることを確認
    expect(typeof result.achievement_score).toBe("number");
    expect(result.achievement_score).toBeGreaterThanOrEqual(0);
    expect(result.achievement_score).toBeLessThanOrEqual(100);

    // UIがエラーやundefinedを表示せずに適切にレンダリングされることを確認
    expect(result.score_display_format).toBe("percentage");
    expect(result.score_display_value).toBe("0%");

    // スコア0の状態でも次月優先条件調整機能が正常に動作する状態
    expect(result.is_adjustable).toBe(true);
    expect(result.adjustment_status).toBe("ready");

    // 栄養不足項目が空配列で返されることを確認
    expect(Array.isArray(result.insufficient_items)).toBe(true);
    expect(result.insufficient_items.length).toBe(0);
  });
});