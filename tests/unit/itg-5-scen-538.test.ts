import { detectPastMealPlanRestrictionViolations } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-538: [edge] 過去献立制限抵触検出機能 - 過去献立が0件の場合に空配列を返す
  test('過去献立が0件の場合、空配列を返す', () => {
    const user_id = 'user_001';
    const family_member_id = 'member_001';
    const past_meal_plans: Array<{
      meal_plan_id: string;
      user_id: string;
      family_member_id: string;
      dishes: Array<{
        dish_id: string;
        ingredients: Array<{
          ingredient_id: string;
          ingredient_name: string;
          allergen_category: string;
        }>;
      }>;
    }> = [];
    const new_food_restriction = {
      restriction_id: 'rest_001',
      family_member_id: family_member_id,
      restriction_type: 'allergen',
      allergen_category: 'peanuts',
      restricted_ingredients: [
        {
          ingredient_id: 'ing_001',
          ingredient_name: 'peanut_butter'
        }
      ]
    };

    const result = detectPastMealPlanRestrictionViolations(
      user_id,
      family_member_id,
      past_meal_plans,
      new_food_restriction
    );

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
    expect(result).toEqual([]);
  });
});