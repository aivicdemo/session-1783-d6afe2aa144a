import { aggregateWeeklyMetrics } from '../../src/logic/it-7-2-1';

describe('献立生成の成功率・調理時間短縮度・ユーザー満足度スコアなどの行動指標を週次で自動集計し、アルゴリズム改善前後の効果差を定量比較', () => {
  // SCEN-558: [normal] 蓄積評価データの献立生成ロジック反映機能
  test('蓄積された評価データから高評価料理とリクエストが優先度付けされ、次週献立生成に自動反映される', () => {
    // 過去3ヶ月の評価データを事前登録
    const accumulated_ratings = [
      { dish_name: 'カレー', rating_score: 4.5, request_count: 8, previous_week_included: false },
      { dish_name: 'グラタン', rating_score: 4.2, request_count: 6, previous_week_included: false },
      { dish_name: 'パスタ', rating_score: 3.8, request_count: 3, previous_week_included: false },
      { dish_name: 'サラダ', rating_score: 3.5, request_count: 2, previous_week_included: false },
      { dish_name: 'シチュー', rating_score: 4.1, request_count: 5, previous_week_included: false },
      { dish_name: '天丼', rating_score: 4.3, request_count: 7, previous_week_included: true },
    ];

    const min_rating_threshold = 4.0;
    const previous_week_dishes = ['天丼'];

    // 評価スコア4.0以上の高評価料理を抽出
    const high_rated_dishes = accumulated_ratings.filter(
      (item) => item.rating_score >= min_rating_threshold && !item.previous_week_included
    );

    // 期待値: 4.0以上でかつ前週未含有の料理は4件
    expect(high_rated_dishes.length).toBe(4);

    // リクエスト頻度でソート・優先度付け
    const prioritized_dishes = high_rated_dishes.sort(
      (a, b) => b.request_count - a.request_count || b.rating_score - a.rating_score
    );

    // 優先度順序を検証: カレー(8) > グラタン(6) > シチュー(5) > パスタ(3)
    expect(prioritized_dishes[0].dish_name).toBe('カレー');
    expect(prioritized_dishes[0].request_count).toBe(8);
    expect(prioritized_dishes[0].rating_score).toBe(4.5);

    expect(prioritized_dishes[1].dish_name).toBe('グラタン');
    expect(prioritized_dishes[1].request_count).toBe(6);
    expect(prioritized_dishes[1].rating_score).toBe(4.2);

    expect(prioritized_dishes[2].dish_name).toBe('シチュー');
    expect(prioritized_dishes[2].request_count).toBe(5);
    expect(prioritized_dishes[2].rating_score).toBe(4.1);

    expect(prioritized_dishes[3].dish_name).toBe('パスタ');
    expect(prioritized_dishes[3].request_count).toBe(3);
    expect(prioritized_dishes[3].rating_score).toBe(3.8);

    // 献立生成エンジンへの入力として使用
    const generation_input = {
      prioritized_dishes: prioritized_dishes.slice(0, 3),
      constraint_nutrition: { protein: 60, carbs: 300, fat: 80 },
      constraint_budget: 3000,
      constraint_cooking_time: 120,
      family_size: 4,
      exclude_ingredients: [],
      previous_week_menu: previous_week_dishes,
    };

    // 次週献立を自動生成
    const generated_menu = aggregateWeeklyMetrics({
      input_dishes: generation_input.prioritized_dishes,
      family_info: { size: generation_input.family_size },
      budget_limit: generation_input.constraint_budget,
      cooking_time_limit: generation_input.constraint_cooking_time,
      previous_menu: generation_input.previous_week_menu,
    });

    // 生成献立に高評価料理が含まれていることを確認
    expect(generated_menu.suggested_menu.length).toBeGreaterThan(0);

    // 生成献立が優先度順に組み込まれていることを検証
    const menu_dish_names = generated_menu.suggested_menu.map((m: any) => m.dish_name);
    expect(menu_dish_names).toContain('カレー');
    expect(menu_dish_names).toContain('グラタン');

    // 生成献立内でカレーがグラタンより前に配置されていることを確認（優先度順）
    const curry_index = menu_dish_names.indexOf('カレー');
    const gratin_index = menu_dish_names.indexOf('グラタン');
    expect(curry_index).toBeLessThan(gratin_index);

    // リクエスト頻度の高い料理が反映されていることを確認
    const request_count_in_menu = generated_menu.suggested_menu.reduce(
      (sum: number, m: any) => sum + (prioritized_dishes.find((d) => d.dish_name === m.dish_name)?.request_count || 0),
      0
    );
    expect(request_count_in_menu).toBeGreaterThanOrEqual(8);

    // 前週献立に含まれていた料理が重複していないことを検証
    expect(menu_dish_names).not.toContain('天丼');

    // 献立の栄養バランスと食費・調理時間が制約条件を満たしていることを確認
    expect(generated_menu.total_estimated_cost).toBeLessThanOrEqual(generation_input.constraint_budget);
    expect(generated_menu.total_estimated_cooking_time).toBeLessThanOrEqual(generation_input.constraint_cooking_time);

    // 生成献立の満足度スコア計算確認
    const expected_satisfaction_score = (4.5 + 4.2) / 2; // カレーとグラタンの平均スコア
    expect(generated_menu.estimated_satisfaction_score).toBeCloseTo(expected_satisfaction_score, 1);
  });
});