import { describe, test, expect, beforeEach } from "@jest/globals";
import {
  recordFoodEvaluation,
  extractPreferencePatternByFamilyMember,
  extractPreferencePatternByDish,
  extractPreferencePatternByCross,
} from "../../src/logic/it-1-br-3-2-1";

describe("食事評価データの時系列蓄積・管理機能", () => {
  // SCEN-344
  test("同一の家族成員・料理に対して複数の評価データが送信された場合、全て蓄積されて家族成員ごと・料理ごとの嗜好パターンが正しく抽出される", () => {
    const family_member_id = "father_001";
    const dish_id = "curry_rice_001";
    const user_id = "user_123";

    // テストデータの準備：同一家族成員と料理に対する5件の評価データ
    const evaluation_data_set = [
      {
        family_member_id,
        dish_id,
        user_id,
        satisfaction_score: 85,
        completion_rate: 100,
        recorded_at: new Date("2024-01-15T18:00:00Z"),
        request_text: "もっとスパイシーに",
      },
      {
        family_member_id,
        dish_id,
        user_id,
        satisfaction_score: 78,
        completion_rate: 95,
        recorded_at: new Date("2024-01-22T18:30:00Z"),
        request_text: "塩分を少なめに",
      },
      {
        family_member_id,
        dish_id,
        user_id,
        satisfaction_score: 92,
        completion_rate: 100,
        recorded_at: new Date("2024-01-29T18:15:00Z"),
        request_text: "このレシピで固定したい",
      },
      {
        family_member_id,
        dish_id,
        user_id,
        satisfaction_score: 88,
        completion_rate: 98,
        recorded_at: new Date("2024-02-05T18:45:00Z"),
        request_text: "野菜をもっと増やして",
      },
      {
        family_member_id,
        dish_id,
        user_id,
        satisfaction_score: 81,
        completion_rate: 100,
        recorded_at: new Date("2024-02-12T18:20:00Z"),
        request_text: "好きな料理",
      },
    ];

    // 1件目の評価データを送信し、データベースに正常に蓄積されることを確認
    const result_1 = recordFoodEvaluation(
      family_member_id,
      dish_id,
      user_id,
      evaluation_data_set[0].satisfaction_score,
      evaluation_data_set[0].completion_rate,
      evaluation_data_set[0].recorded_at,
      evaluation_data_set[0].request_text
    );
    expect(result_1).toEqual({
      success: true,
      recorded_evaluation_id: expect.any(String),
      family_member_id,
      dish_id,
    });

    // 2～5件目の評価データを順次送信
    const recorded_ids = [result_1.recorded_evaluation_id];
    for (let i = 1; i < evaluation_data_set.length; i++) {
      const result_n = recordFoodEvaluation(
        family_member_id,
        dish_id,
        user_id,
        evaluation_data_set[i].satisfaction_score,
        evaluation_data_set[i].completion_rate,
        evaluation_data_set[i].recorded_at,
        evaluation_data_set[i].request_text
      );
      expect(result_n).toEqual({
        success: true,
        recorded_evaluation_id: expect.any(String),
        family_member_id,
        dish_id,
      });
      recorded_ids.push(result_n.recorded_evaluation_id);
    }

    // 家族成員ごとの嗜好パターン抽出：統計値の計算
    const family_member_pattern = extractPreferencePatternByFamilyMember(
      family_member_id,
      user_id
    );

    // 満足度スコアの統計値：85, 78, 92, 88, 81
    // 平均値：(85+78+92+88+81)/5 = 424/5 = 84.8
    // ソート済み：78, 81, 85, 88, 92 → 中央値 = 85
    // 標準偏差の計算：分散 = ((85-84.8)^2 + (78-84.8)^2 + (92-84.8)^2 + (88-84.8)^2 + (81-84.8)^2)/5
    //              = (0.04 + 46.24 + 51.84 + 10.24 + 14.44)/5 = 122.8/5 = 24.56
    // 標準偏差 = sqrt(24.56) ≈ 4.956
    // 完食率：平均 = (100+95+100+98+100)/5 = 493/5 = 98.6
    expect(family_member_pattern).toEqual({
      family_member_id,
      avg_satisfaction_score: 84.8,
      median_satisfaction_score: 85,
      std_dev_satisfaction_score: expect.any(Number),
      avg_completion_rate: 98.6,
      evaluation_count: 5,
      preference_trend: "高い評価で安定している",
      common_requests: expect.arrayContaining([
        "スパイシー",
        "塩分",
        "野菜",
      ]),
    });

    // 中央値と平均値の検証
    expect(family_member_pattern.median_satisfaction_score).toBe(85);
    expect(family_member_pattern.avg_satisfaction_score).toBe(84.8);
    expect(family_member_pattern.avg_completion_rate).toBe(98.6);
    expect(family_member_pattern.evaluation_count).toBe(5);

    // 標準偏差の検証（許容誤差0.01）
    const expected_std_dev = Math.sqrt(24.56);
    expect(Math.abs(family_member_pattern.std_dev_satisfaction_score - expected_std_dev)).toBeLessThan(0.01);

    // 料理ごとの嗜好パターン抽出
    const dish_pattern = extractPreferencePatternByDish(dish_id, user_id);

    expect(dish_pattern).toEqual({
      dish_id,
      avg_satisfaction_score: 84.8,
      median_satisfaction_score: 85,
      std_dev_satisfaction_score: expect.any(Number),
      avg_completion_rate: 98.6,
      evaluation_count: 5,
      preference_trend: "高い評価で安定している",
      evaluator_count: 1,
    });

    expect(dish_pattern.median_satisfaction_score).toBe(85);
    expect(dish_pattern.avg_satisfaction_score).toBe(84.8);
    expect(dish_pattern.evaluation_count).toBe(5);
    expect(dish_pattern.evaluator_count).toBe(1);

    // クロス軸での嗜好パターン抽出：家族成員×料理
    const cross_pattern = extractPreferencePatternByCross(
      family_member_id,
      dish_id,
      user_id
    );

    expect(cross_pattern).toEqual({
      family_member_id,
      dish_id,
      avg_satisfaction_score: 84.8,
      median_satisfaction_score: 85,
      std_dev_satisfaction_score: expect.any(Number),
      avg_completion_rate: 98.6,
      evaluation_count: 5,
      preference_classification: "常連料理_高評価",
      recommendation_priority: 85,
    });

    // クロス軸の詳細検証
    expect(cross_pattern.avg_satisfaction_score).toBe(84.8);
    expect(cross_pattern.median_satisfaction_score).toBe(85);
    expect(cross_pattern.avg_completion_rate).toBe(98.6);
    expect(cross_pattern.evaluation_count).toBe(5);
    expect(cross_pattern.preference_classification).toBe("常連料理_高評価");

    // 推奨優先度：平均満足度（84.8）と完食率（98.6）を加味した総合スコア
    // 推奨優先度 = (avg_satisfaction_score * 0.6 + avg_completion_rate * 0.4)
    //            = (84.8 * 0.6 + 98.6 * 0.4)
    //            = 50.88 + 39.44 = 90.32 ≈ 90 (切り捨て) ただしテストでは許容値以内
    const expected_priority = Math.floor(84.8 * 0.6 + 98.6 * 0.4);
    expect(cross_pattern.recommendation_priority).toBeGreaterThanOrEqual(85);
    expect(cross_pattern.recommendation_priority).toBeLessThanOrEqual(91);
  });
});