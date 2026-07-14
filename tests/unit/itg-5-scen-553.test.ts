import { aggregateWeeklyBehaviorMetrics } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの週次行動指標自動集計と改善効果定量比較', () => {
  // SCEN-553: [error] 複数制約条件付き献立候補ランキング機能 - 制約条件を満たす献立候補が存在しない場合、空のリストが返される
  test('矛盾する複数制約条件を設定した場合、空のリストが返され、エラー処理が正常に機能すること', () => {
    const input_constraints = {
      calorieMax: 100,
      proteinMin: 50,
      fatMin: 30,
      carbMax: 20,
      cookingTimeMax: 15,
      budgetMax: 300,
      allergies: ['egg', 'milk', 'peanut'],
      avoidanceIngredients: ['chicken', 'beef', 'pork']
    };

    const input_menu_candidates = [
      {
        id: 'menu_001',
        name: 'High Protein Chicken Bowl',
        calories: 650,
        protein: 45,
        fat: 18,
        carbs: 60,
        cookingTime: 25,
        estimatedCost: 850,
        ingredients: ['chicken', 'rice', 'broccoli']
      },
      {
        id: 'menu_002',
        name: 'Egg Pasta',
        calories: 580,
        protein: 22,
        fat: 16,
        carbs: 75,
        cookingTime: 20,
        estimatedCost: 600,
        ingredients: ['egg', 'pasta', 'butter']
      },
      {
        id: 'menu_003',
        name: 'Milk Cream Soup',
        calories: 420,
        protein: 18,
        fat: 28,
        carbs: 35,
        cookingTime: 30,
        estimatedCost: 750,
        ingredients: ['milk', 'cream', 'onion']
      }
    ];

    const input_weekly_execution_data = {
      week_start_date: new Date('2024-01-15T00:00:00Z'),
      week_end_date: new Date('2024-01-21T23:59:59Z'),
      generation_attempts: 3,
      generation_successes: 0,
      generation_failures: 3,
      menu_rejection_count: 3,
      menu_modification_count: 0,
      average_cooking_time_minutes: 0,
      average_user_satisfaction_score: 0,
      rejection_reasons: [
        'constraints_conflict_calorie_protein',
        'constraints_conflict_calorie_protein',
        'constraints_conflict_calorie_protein'
      ]
    };

    const result = aggregateWeeklyBehaviorMetrics(
      input_constraints,
      input_menu_candidates,
      input_weekly_execution_data
    );

    expect(result).toEqual({
      week_start_date: new Date('2024-01-15T00:00:00Z'),
      week_end_date: new Date('2024-01-21T23:59:59Z'),
      generation_success_rate: 0,
      average_cooking_time_shortening_rate: 0,
      average_user_satisfaction_score: 0,
      menu_candidates_matching_constraints: [],
      ranking_result: [],
      error_code: 'NO_MATCHING_CANDIDATES',
      error_message: '制約条件を満たす献立候補が存在しません',
      has_error: true,
      exception_thrown: false
    });

    expect(result.menu_candidates_matching_constraints).toEqual([]);
    expect(result.ranking_result).toEqual([]);
    expect(result.error_code).toBe('NO_MATCHING_CANDIDATES');
    expect(result.has_error).toBe(true);
    expect(result.exception_thrown).toBe(false);
    expect(result.generation_success_rate).toBe(0);
  });
});