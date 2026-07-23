import { calculateMenuComplianceScore } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase Record and Monthly Food Cost Reduction Analysis', () => {
  // SCEN-329: [edge] 複数制約条件の充足度評価機能 - 全制約条件が完全に満たされた献立案の総合評価スコアが100になる
  test('should return compliance score of 100 when all constraint conditions are fully satisfied', () => {
    const menu_proposal = {
      menu_id: 'MENU-2024-001',
      family_id: 'FAM-001',
      proposed_date: '2024-01-15',
      dishes: [
        {
          dish_id: 'DISH-001',
          dish_name: 'Grilled Chicken with Vegetables',
          calories: 450,
          protein_g: 35,
          carbs_g: 45,
          fat_g: 12,
          fiber_g: 8,
          cost_per_serving: 3.5,
          cooking_time_minutes: 25,
          allergens: []
        },
        {
          dish_id: 'DISH-002',
          dish_name: 'Brown Rice',
          calories: 200,
          protein_g: 5,
          carbs_g: 44,
          fat_g: 1,
          fiber_g: 3,
          cost_per_serving: 0.8,
          cooking_time_minutes: 20,
          allergens: []
        },
        {
          dish_id: 'DISH-003',
          dish_name: 'Mixed Salad',
          calories: 100,
          protein_g: 3,
          carbs_g: 12,
          fat_g: 5,
          fiber_g: 5,
          cost_per_serving: 1.2,
          cooking_time_minutes: 10,
          allergens: []
        }
      ]
    };

    const family_constraints = {
      family_id: 'FAM-001',
      family_members: [
        {
          member_id: 'MEM-001',
          age: 12,
          gender: 'M',
          daily_calorie_target: 2000,
          daily_calorie_min: 1800,
          daily_calorie_max: 2200,
          allergen_ids: [],
          dietary_restrictions: []
        },
        {
          member_id: 'MEM-002',
          age: 10,
          gender: 'F',
          daily_calorie_target: 1800,
          daily_calorie_min: 1600,
          daily_calorie_max: 2000,
          allergen_ids: [],
          dietary_restrictions: []
        }
      ]
    };

    const constraint_weights = {
      nutrition_balance_weight: 0.30,
      cost_efficiency_weight: 0.25,
      cooking_time_weight: 0.20,
      allergen_avoidance_weight: 0.15,
      calorie_restriction_weight: 0.10
    };

    const meal_count = 2;
    const total_dish_calories = 450 + 200 + 100;
    const avg_calories_per_person = total_dish_calories / meal_count;

    // Constraint 1: Nutrition Balance (30%)
    // Target: Protein 15-20%, Carbs 45-55%, Fat 20-30%, Fiber 5+ g
    const total_protein_g = 35 + 5 + 3;
    const total_carbs_g = 45 + 44 + 12;
    const total_fat_g = 12 + 1 + 5;
    const total_fiber_g = 8 + 3 + 5;
    const total_calories = total_dish_calories;

    const protein_ratio = (total_protein_g / total_calories) * 4 * 100;
    const carbs_ratio = (total_carbs_g / total_calories) * 4 * 100;
    const fat_ratio = (total_fat_g / total_calories) * 9 * 100;

    const nutrition_score =
      (protein_ratio >= 15 && protein_ratio <= 20 ? 100 : 0) +
      (carbs_ratio >= 45 && carbs_ratio <= 55 ? 100 : 0) +
      (fat_ratio >= 20 && fat_ratio <= 30 ? 100 : 0) +
      (total_fiber_g >= 5 ? 100 : 0);
    const nutrition_compliance = nutrition_score === 400 ? 100 : 0;

    // Constraint 2: Cost Efficiency (25%)
    // Target: Average cost per serving <= 5.0
    const total_cost_per_serving = 3.5 + 0.8 + 1.2;
    const avg_cost_per_serving = total_cost_per_serving / meal_count;
    const cost_compliance = avg_cost_per_serving <= 5.0 ? 100 : 0;

    // Constraint 3: Cooking Time (20%)
    // Target: Total cooking time <= 60 minutes
    const total_cooking_time = 25 + 20 + 10;
    const time_compliance = total_cooking_time <= 60 ? 100 : 0;

    // Constraint 4: Allergen Avoidance (15%)
    // Target: No allergens in dishes
    const has_allergens = menu_proposal.dishes.some(d => d.allergens.length > 0);
    const allergen_compliance = !has_allergens ? 100 : 0;

    // Constraint 5: Calorie Restriction (10%)
    // Target: Average calories per person within target range for all members
    const member_calorie_compliance = family_constraints.family_members.every(
      member => avg_calories_per_person >= member.daily_calorie_min &&
                 avg_calories_per_person <= member.daily_calorie_max
    ) ? 100 : 0;

    const expected_total_score =
      (nutrition_compliance * constraint_weights.nutrition_balance_weight +
       cost_compliance * constraint_weights.cost_efficiency_weight +
       time_compliance * constraint_weights.cooking_time_weight +
       allergen_compliance * constraint_weights.allergen_avoidance_weight +
       member_calorie_compliance * constraint_weights.calorie_restriction_weight);

    const actual_score = calculateMenuComplianceScore(
      menu_proposal,
      family_constraints,
      constraint_weights
    );

    expect(actual_score).toBe(100);
    expect(expected_total_score).toBe(100);
  });
});