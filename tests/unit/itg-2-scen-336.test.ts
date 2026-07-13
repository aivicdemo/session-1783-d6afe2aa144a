import { rankMealCandidates } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移データダッシュボード機能', () => {
  // SCEN-336: [edge] 複数制約条件下での献立候補ランキング - 食材制限が0件の場合、他の制約条件のみで献立候補がランキングされる
  test('食材制限が0件の場合、他の制約条件のみで献立候補がランキングされる', () => {
    const input = {
      meal_candidates: [
        {
          meal_id: 'meal_001',
          meal_name: '豚肉炒め',
          calories: 450,
          cooking_time_minutes: 20,
          nutrition_balance_score: 85,
          food_category: 'meat',
          satisfaction_score: 88,
        },
        {
          meal_id: 'meal_002',
          meal_name: 'グリーンサラダ',
          calories: 180,
          cooking_time_minutes: 5,
          nutrition_balance_score: 72,
          food_category: 'vegetable',
          satisfaction_score: 75,
        },
        {
          meal_id: 'meal_003',
          meal_name: '鶏むね肉の照り焼き',
          calories: 380,
          cooking_time_minutes: 25,
          nutrition_balance_score: 90,
          food_category: 'meat',
          satisfaction_score: 92,
        },
        {
          meal_id: 'meal_004',
          meal_name: 'パスタ',
          calories: 520,
          cooking_time_minutes: 30,
          nutrition_balance_score: 68,
          food_category: 'grain',
          satisfaction_score: 80,
        },
      ],
      constraints: {
        food_restrictions: [],
        calorie_min: 300,
        calorie_max: 500,
        nutrition_balance_min_score: 70,
        max_cooking_time_minutes: 30,
        preferred_food_categories: ['meat', 'vegetable'],
      },
      user_id: 'user_test_001',
      evaluation_date: '2024-01-15',
    };

    const result = rankMealCandidates(input);

    // 期待結果の検証：
    // 1. 食材制限が0件のため、全候補が制限フィルタリングされない
    // 2. カロリー制限: 300-500 kcal
    //    - meal_001: 450 kcal ✓ (範囲内)
    //    - meal_002: 180 kcal ✗ (最小値未満)
    //    - meal_003: 380 kcal ✓ (範囲内)
    //    - meal_004: 520 kcal ✗ (最大値超過)
    //
    // 3. 栄養バランス制限: 70以上
    //    - meal_001: 85 ✓
    //    - meal_003: 90 ✓
    //
    // 4. 調理時間制限: 30分以内
    //    - meal_001: 20分 ✓
    //    - meal_003: 25分 ✓
    //
    // 5. 優先カテゴリ: meat, vegetable
    //    - meal_001: meat ✓
    //    - meal_003: meat ✓
    //
    // 6. ランキング計算（スコア重み付け）：
    //    满足度スコア * カテゴリマッチ(1.0) * 栄養バランス(0-100) / 100
    //    - meal_001: 88 * 1.0 * 0.85 = 74.8
    //    - meal_003: 92 * 1.0 * 0.90 = 82.8
    //
    // 期待される上位2件のランキング順序：
    // rank 1: meal_003 (鶏むね肉の照り焼き, score: 82.8)
    // rank 2: meal_001 (豚肉炒め, score: 74.8)

    expect(result).toEqual({
      user_id: 'user_test_001',
      evaluation_date: '2024-01-15',
      filtered_candidates_count: 2,
      total_candidates_count: 4,
      food_restriction_applied: false,
      ranked_meals: [
        {
          rank: 1,
          meal_id: 'meal_003',
          meal_name: '鶏むね肉の照り焼き',
          calories: 380,
          cooking_time_minutes: 25,
          nutrition_balance_score: 90,
          food_category: 'meat',
          satisfaction_score: 92,
          ranking_score: 82.8,
          constraint_compliance: {
            food_restriction_pass: true,
            calorie_range_pass: true,
            nutrition_balance_pass: true,
            cooking_time_pass: true,
            preferred_category_match: true,
          },
        },
        {
          rank: 2,
          meal_id: 'meal_001',
          meal_name: '豚肉炒め',
          calories: 450,
          cooking_time_minutes: 20,
          nutrition_balance_score: 85,
          food_category: 'meat',
          satisfaction_score: 88,
          ranking_score: 74.8,
          constraint_compliance: {
            food_restriction_pass: true,
            calorie_range_pass: true,
            nutrition_balance_pass: true,
            cooking_time_pass: true,
            preferred_category_match: true,
          },
        },
      ],
      constraints_applied: {
        food_restrictions_count: 0,
        calorie_min: 300,
        calorie_max: 500,
        nutrition_balance_min_score: 70,
        max_cooking_time_minutes: 30,
        preferred_food_categories: ['meat', 'vegetable'],
      },
    });

    // 追加の検証：ランキング結果が制約条件を満たしていることを確認
    expect(result.filtered_candidates_count).toBe(2);
    expect(result.food_restriction_applied).toBe(false);
    expect(result.ranked_meals.length).toBe(2);
    expect(result.ranked_meals[0].ranking_score).toBeGreaterThan(
      result.ranked_meals[1].ranking_score
    );
    expect(result.ranked_meals[0].rank).toBe(1);
    expect(result.ranked_meals[1].rank).toBe(2);
    expect(result.ranked_meals[0].constraint_compliance.food_restriction_pass).toBe(
      true
    );
    expect(result.ranked_meals[1].constraint_compliance.food_restriction_pass).toBe(
      true
    );
  });
});