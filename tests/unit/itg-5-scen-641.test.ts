import { generateMenuWithPreferenceTracking } from "../../src/logic/it-7-2-1";

describe("献立生成の成功率・調理時間短縮度・ユーザー満足度スコアなどの行動指標を週次で自動集計し、アルゴリズム改善前後の効果差を定量比較するダッシュボード機能", () => {
  // SCEN-641: [edge] 初期段階献立生成機能 - 評価データが30件に到達した時点で嗜好学習が翌生成から段階的に反映される
  test("評価データが30件未満では嗜好学習は非適用、30件到達後から段階的に反映される", () => {
    const initial_evaluation_data_count = 0;
    const target_learning_threshold = 30;
    const total_generations = 32;

    // 初期化: 評価データベースをリセット
    const evaluation_history: Array<{
      generation_id: number;
      meal_id: string;
      satisfaction_score: number;
      completion_rate: number;
      request_text: string;
    }> = [];

    // 1回目から29回目: 嗜好学習の影響を受けない状態での献立生成
    const gen_1_to_29_results: Array<{
      generation_num: number;
      meal: { meal_id: string; main_dish: string; side_dishes: string[] };
      preference_influence_ratio: number;
      diversity_score: number;
    }> = [];

    for (let i = 1; i <= 29; i++) {
      const base_context = {
        user_id: "user-001",
        family_members: [
          { member_id: "fam-001", age: 35, allergies: [], restrictions: [] },
          { member_id: "fam-002", age: 8, allergies: ["egg"], restrictions: [] },
        ],
        budget_limit: 2000,
        cooking_time_limit_minutes: 45,
        evaluation_data_count: i - 1,
      };

      const result_i = generateMenuWithPreferenceTracking(base_context);

      // 評価データが30件未満では嗜好学習は影響しない（influence_ratio = 0）
      expect(result_i.preference_influence_ratio).toBe(0);
      expect(result_i.diversity_score).toBeGreaterThanOrEqual(0.85);

      gen_1_to_29_results.push({
        generation_num: i,
        meal: result_i.meal,
        preference_influence_ratio: result_i.preference_influence_ratio,
        diversity_score: result_i.diversity_score,
      });

      // 評価を追加
      evaluation_history.push({
        generation_id: i,
        meal_id: result_i.meal.meal_id,
        satisfaction_score: 7 + Math.random() * 2, // 7-9点
        completion_rate: 0.8 + Math.random() * 0.2, // 80-100%
        request_text: "good taste",
      });
    }

    // 29回目時点で評価データが29件であることを確認
    expect(evaluation_history.length).toBe(29);
    expect(gen_1_to_29_results[28].preference_influence_ratio).toBe(0);

    // 30回目献立生成: 評価データが30件に到達する前に生成する
    const context_at_gen_30 = {
      user_id: "user-001",
      family_members: [
        { member_id: "fam-001", age: 35, allergies: [], restrictions: [] },
        { member_id: "fam-002", age: 8, allergies: ["egg"], restrictions: [] },
      ],
      budget_limit: 2000,
      cooking_time_limit_minutes: 45,
      evaluation_data_count: 29, // この時点では29件
    };

    const result_gen_30 = generateMenuWithPreferenceTracking(context_at_gen_30);

    // 30回目は評価データが30件に到達する直前なので嗜好学習はまだ非適用
    expect(result_gen_30.preference_influence_ratio).toBe(0);

    // 30回目評価を追加すると30件に到達
    evaluation_history.push({
      generation_id: 30,
      meal_id: result_gen_30.meal.meal_id,
      satisfaction_score: 8.2,
      completion_rate: 0.9,
      request_text: "preferred main",
    });
    expect(evaluation_history.length).toBe(30);

    // 31回目献立生成: 評価データが30件に到達した後の初回生成
    const context_at_gen_31 = {
      user_id: "user-001",
      family_members: [
        { member_id: "fam-001", age: 35, allergies: [], restrictions: [] },
        { member_id: "fam-002", age: 8, allergies: ["egg"], restrictions: [] },
      ],
      budget_limit: 2000,
      cooking_time_limit_minutes: 45,
      evaluation_data_count: 30, // 30件に到達した
    };

    const result_gen_31 = generateMenuWithPreferenceTracking(context_at_gen_31);

    // 31回目から嗜好学習が段階的に反映される（影響度 > 0）
    expect(result_gen_31.preference_influence_ratio).toBeGreaterThan(0);
    expect(result_gen_31.preference_influence_ratio).toBeLessThanOrEqual(0.35); // 初期段階では弱い
    expect(result_gen_31.diversity_score).toBeGreaterThanOrEqual(0.75); // 多様性は保持

    evaluation_history.push({
      generation_id: 31,
      meal_id: result_gen_31.meal.meal_id,
      satisfaction_score: 8.1,
      completion_rate: 0.88,
      request_text: "good",
    });

    // 32回目献立生成: さらに段階的に嗜好学習が強化される
    const context_at_gen_32 = {
      user_id: "user-001",
      family_members: [
        { member_id: "fam-001", age: 35, allergies: [], restrictions: [] },
        { member_id: "fam-002", age: 8, allergies: ["egg"], restrictions: [] },
      ],
      budget_limit: 2000,
      cooking_time_limit_minutes: 45,
      evaluation_data_count: 31,
    };

    const result_gen_32 = generateMenuWithPreferenceTracking(context_at_gen_32);

    // 32回目は31回目より嗜好学習の影響がより強い
    expect(result_gen_32.preference_influence_ratio).toBeGreaterThan(
      result_gen_31.preference_influence_ratio
    );
    expect(result_gen_32.preference_influence_ratio).toBeLessThanOrEqual(0.45); // 段階的に強化
    expect(result_gen_32.diversity_score).toBeGreaterThanOrEqual(0.7); // 多様性はさらに調整

    evaluation_history.push({
      generation_id: 32,
      meal_id: result_gen_32.meal.meal_id,
      satisfaction_score: 8.3,
      completion_rate: 0.92,
      request_text: "excellent",
    });

    // 最終検証: 段階的な変化を確認
    const influence_ratios = [
      result_gen_30.preference_influence_ratio, // 0
      result_gen_31.preference_influence_ratio, // > 0
      result_gen_32.preference_influence_ratio, // > 31
    ];

    // 嗜好学習の影響が段階的に増加していることを確認
    expect(influence_ratios[0]).toBe(0);
    expect(influence_ratios[1]).toBeGreaterThan(influence_ratios[0]);
    expect(influence_ratios[2]).toBeGreaterThan(influence_ratios[1]);

    // 多様性と嗜好反映のバランスが取れていることを確認
    const diversity_scores = [
      result_gen_30.diversity_score,
      result_gen_31.diversity_score,
      result_gen_32.diversity_score,
    ];

    // 多様性は徐々に低下するが最低ライン（0.6）以上を保持
    expect(diversity_scores[0]).toBeGreaterThanOrEqual(0.85);
    expect(diversity_scores[1]).toBeGreaterThanOrEqual(0.75);
    expect(diversity_scores[2]).toBeGreaterThanOrEqual(0.7);

    // 全体を通じた最終的な検証
    expect(evaluation_history.length).toBe(32);
    expect(gen_1_to_29_results.every((r) => r.preference_influence_ratio === 0)).toBe(true);
    expect(result_gen_31.preference_influence_ratio).toBeGreaterThan(0);
    expect(result_gen_32.preference_influence_ratio).toBeGreaterThan(
      result_gen_31.preference_influence_ratio
    );
  });
});