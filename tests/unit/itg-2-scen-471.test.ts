import { describe, test, expect, beforeEach } from "@jest/globals";
import { evaluateNutritionStandard } from "../../src/logic/it-1-br-2-1-1-1";

describe("栄養摂取量の達成度評価機能", () => {
  // SCEN-471: [edge] 栄養基準ロジック評価機能 - 達成度スコア100%以上の項目に対して合格判定が正しく下される
  test("達成度スコア100%以上のすべての栄養項目で合格判定が下される", () => {
    // 前提: ユーザーの栄養摂取データが100%以上の達成度スコアに設定されている
    const user_id = "test_user_001";
    const evaluation_period_start = "2024-01-01T00:00:00Z";
    const evaluation_period_end = "2024-01-31T23:59:59Z";

    // 栄養項目ごとの達成度データを構成
    // ケース1: スコアがちょうど100%の項目
    const nutrition_item_1 = {
      nutrition_id: "nutr_001",
      nutrition_name: "タンパク質",
      target_value: 60,
      actual_value: 60,
      unit: "g",
      achievement_percentage: 100,
    };

    // ケース2: スコアが100%を超える項目（例：150%）
    const nutrition_item_2 = {
      nutrition_id: "nutr_002",
      nutrition_name: "ビタミンC",
      target_value: 100,
      actual_value: 150,
      unit: "mg",
      achievement_percentage: 150,
    };

    // ケース3: スコアが100%を超える項目（例：120%）
    const nutrition_item_3 = {
      nutrition_id: "nutr_003",
      nutrition_name: "食物繊維",
      target_value: 20,
      actual_value: 24,
      unit: "g",
      achievement_percentage: 120,
    };

    // 複数の栄養項目で100%以上のスコアを持つケース
    const nutrition_items = [nutrition_item_1, nutrition_item_2, nutrition_item_3];

    const evaluation_input = {
      user_id,
      evaluation_period_start,
      evaluation_period_end,
      nutrition_items,
    };

    // 栄養基準ロジック評価機能を実行
    const evaluation_result = evaluateNutritionStandard(evaluation_input);

    // 期待結果: すべての栄養項目で合格判定が下される
    expect(evaluation_result).toBeDefined();
    expect(evaluation_result.user_id).toBe(user_id);
    expect(evaluation_result.evaluation_status).toBe("合格");

    // 各栄養項目の評価結果を検証
    expect(evaluation_result.nutrition_evaluations).toHaveLength(3);

    // ケース1: スコア100%の項目
    const evaluation_1 = evaluation_result.nutrition_evaluations[0];
    expect(evaluation_1.nutrition_id).toBe("nutr_001");
    expect(evaluation_1.nutrition_name).toBe("タンパク質");
    expect(evaluation_1.achievement_percentage).toBe(100);
    expect(evaluation_1.judgment_status).toBe("合格");
    expect(evaluation_1.judgment_badge).toBe("PASS");

    // ケース2: スコア150%の項目
    const evaluation_2 = evaluation_result.nutrition_evaluations[1];
    expect(evaluation_2.nutrition_id).toBe("nutr_002");
    expect(evaluation_2.nutrition_name).toBe("ビタミンC");
    expect(evaluation_2.achievement_percentage).toBe(150);
    expect(evaluation_2.judgment_status).toBe("合格");
    expect(evaluation_2.judgment_badge).toBe("PASS");

    // ケース3: スコア120%の項目
    const evaluation_3 = evaluation_result.nutrition_evaluations[2];
    expect(evaluation_3.nutrition_id).toBe("nutr_003");
    expect(evaluation_3.nutrition_name).toBe("食物繊維");
    expect(evaluation_3.achievement_percentage).toBe(120);
    expect(evaluation_3.judgment_status).toBe("合格");
    expect(evaluation_3.judgment_badge).toBe("PASS");

    // 総合評価スコア（複数項目すべてが100%以上なので100点）
    expect(evaluation_result.overall_achievement_percentage).toBe(100);

    // 合格バッジ・メッセージの確認
    expect(evaluation_result.display_message).toBe("すべての栄養項目が基準を達成しています");
    expect(evaluation_result.pass_badge_displayed).toBe(true);
  });
});