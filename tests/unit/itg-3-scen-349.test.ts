import { generateMealPlanWithRatings } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-349: [edge] 評価データに基づく献立生成ロジックの自動反映機能 - 複数の高評価料理がある場合、優先度スコアが最も高い料理が献立に最初に反映される
  test('複数の高評価料理が存在する場合、優先度スコアが最も高い料理が献立の最初に反映され、その後の料理も優先度スコアの降順で整列される', () => {
    // 準備: 複数の高評価料理（4.5以上）を5件以上登録、各料理に異なる優先度スコアを設定
    const meal_ratings_input = [
      {
        meal_id: 'meal_001',
        dish_name: 'カレーライス',
        rating_score: 4.7,
        priority_score: 95,
        user_id: 'user_123',
        family_member_id: 'fam_001',
        evaluation_date: '2024-01-15'
      },
      {
        meal_id: 'meal_002',
        dish_name: '唐揚げ',
        rating_score: 4.5,
        priority_score: 87,
        user_id: 'user_123',
        family_member_id: 'fam_001',
        evaluation_date: '2024-01-15'
      },
      {
        meal_id: 'meal_003',
        dish_name: 'パスタ',
        rating_score: 4.6,
        priority_score: 92,
        user_id: 'user_123',
        family_member_id: 'fam_001',
        evaluation_date: '2024-01-15'
      },
      {
        meal_id: 'meal_004',
        dish_name: 'グラタン',
        rating_score: 4.55,
        priority_score: 88,
        user_id: 'user_123',
        family_member_id: 'fam_001',
        evaluation_date: '2024-01-15'
      },
      {
        meal_id: 'meal_005',
        dish_name: 'ハンバーグ',
        rating_score: 4.65,
        priority_score: 90,
        user_id: 'user_123',
        family_member_id: 'fam_001',
        evaluation_date: '2024-01-15'
      }
    ];

    // 献立生成関数の実行
    const generated_meal_plan = generateMealPlanWithRatings({
      user_id: 'user_123',
      family_member_id: 'fam_001',
      meal_ratings: meal_ratings_input,
      plan_date: '2024-01-22'
    });

    // 生成された献立の最初の要素（index 0）を取得
    const first_dish = generated_meal_plan[0];

    // 検証1: 最初に反映される料理の優先度スコアが全登録料理の中で最高値（95）であることを確認
    expect(first_dish.priority_score).toBe(95);
    expect(first_dish.dish_name).toBe('カレーライス');

    // 検証2: 献立に含まれる料理の順序が優先度スコアの降順であることを検証
    expect(generated_meal_plan[0].priority_score).toBe(95);
    expect(generated_meal_plan[1].priority_score).toBe(92);
    expect(generated_meal_plan[2].priority_score).toBe(90);
    expect(generated_meal_plan[3].priority_score).toBe(88);
    expect(generated_meal_plan[4].priority_score).toBe(87);

    // 検証3: 献立の料理が優先度スコアの降順で整列されていることの確認
    for (let idx = 0; idx < generated_meal_plan.length - 1; idx++) {
      expect(generated_meal_plan[idx].priority_score).toBeGreaterThanOrEqual(
        generated_meal_plan[idx + 1].priority_score
      );
    }

    // 検証4: 複数回献立生成を実行して結果の一貫性を確認
    const second_plan = generateMealPlanWithRatings({
      user_id: 'user_123',
      family_member_id: 'fam_001',
      meal_ratings: meal_ratings_input,
      plan_date: '2024-01-29'
    });

    expect(second_plan[0].priority_score).toBe(95);
    expect(second_plan[0].dish_name).toBe('カレーライス');

    const third_plan = generateMealPlanWithRatings({
      user_id: 'user_123',
      family_member_id: 'fam_001',
      meal_ratings: meal_ratings_input,
      plan_date: '2024-02-05'
    });

    expect(third_plan[0].priority_score).toBe(95);
    expect(third_plan[0].dish_name).toBe('カレーライス');

    // 検証5: 全生成献立が同じ優先度順で整列されていることを確認
    expect(second_plan.map(d => d.priority_score)).toEqual([95, 92, 90, 88, 87]);
    expect(third_plan.map(d => d.priority_score)).toEqual([95, 92, 90, 88, 87]);
  });
});