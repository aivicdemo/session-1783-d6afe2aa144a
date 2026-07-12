import { detectAndValidateFoodConflictPatterns } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-473: [normal] 抵触パターンの妥当性判定と献立生成反映
  test('妥当と判定されたパターンが次週献立生成ロジックの制約条件に正確に反映される', () => {
    // 初期状態: 複数の食材抵触パターンが登録されている
    const conflictPatternsFromHistory = [
      {
        pattern_id: 'conflict_001',
        ingredient_a: 'egg',
        ingredient_b: 'milk',
        family_member_id: 'member_001',
        detected_date: '2024-01-15T10:00:00Z',
      },
      {
        pattern_id: 'conflict_002',
        ingredient_a: 'pork',
        ingredient_b: 'beef',
        family_member_id: 'member_002',
        detected_date: '2024-01-16T10:00:00Z',
      },
      {
        pattern_id: 'conflict_003',
        ingredient_a: 'shrimp',
        ingredient_b: 'crab',
        family_member_id: 'member_001',
        detected_date: '2024-01-17T10:00:00Z',
      },
    ];

    // 抵触パターン管理画面での妥当性判定
    const validityJudgments = [
      {
        pattern_id: 'conflict_001',
        is_valid: true,
        judged_by: 'user_parent_001',
        judged_at: '2024-01-18T09:00:00Z',
      },
      {
        pattern_id: 'conflict_002',
        is_valid: true,
        judged_by: 'user_parent_001',
        judged_at: '2024-01-18T09:15:00Z',
      },
      {
        pattern_id: 'conflict_003',
        is_valid: false,
        judged_by: 'user_parent_001',
        judged_at: '2024-01-18T09:30:00Z',
      },
    ];

    // 検出・妥当性判定と献立生成制約への反映プロセス
    const result = detectAndValidateFoodConflictPatterns({
      conflict_patterns: conflictPatternsFromHistory,
      validity_judgments: validityJudgments,
      user_id: 'user_parent_001',
    });

    // アサーション 1: 妥当と判定されたパターンの抽出
    const validPatterns = result.valid_constraints;
    expect(validPatterns.length).toBe(2);

    // アサーション 2: 妥当と判定されたパターンの内容確認
    const validPatternIds = validPatterns.map((p) => p.pattern_id).sort();
    expect(validPatternIds).toEqual(['conflict_001', 'conflict_002']);

    // アサーション 3: 妥当と判定されたパターンの詳細検証
    const eggMilkConstraint = validPatterns.find(
      (p) => p.pattern_id === 'conflict_001',
    );
    expect(eggMilkConstraint).toEqual({
      pattern_id: 'conflict_001',
      ingredient_a: 'egg',
      ingredient_b: 'milk',
      family_member_id: 'member_001',
      is_valid: true,
      judged_at: '2024-01-18T09:00:00Z',
    });

    const porkBeefConstraint = validPatterns.find(
      (p) => p.pattern_id === 'conflict_002',
    );
    expect(porkBeefConstraint).toEqual({
      pattern_id: 'conflict_002',
      ingredient_a: 'pork',
      ingredient_b: 'beef',
      family_member_id: 'member_002',
      is_valid: true,
      judged_at: '2024-01-18T09:15:00Z',
    });

    // アサーション 4: 不妥当と判定されたパターンは含まれない
    const invalidPatternIds = result.valid_constraints.map(
      (p) => p.pattern_id,
    );
    expect(invalidPatternIds).not.toContain('conflict_003');

    // アサーション 5: 次週献立生成ロジックへ反映された制約条件の形成
    const meal_generation_constraints = result.constraints_for_next_week;
    expect(meal_generation_constraints.forbidden_combinations.length).toBe(2);

    // アサーション 6: 献立生成制約の詳細内容
    const forbiddenCombinations = meal_generation_constraints.forbidden_combinations.sort(
      (a, b) => a.pattern_id.localeCompare(b.pattern_id),
    );
    expect(forbiddenCombinations[0]).toEqual({
      pattern_id: 'conflict_001',
      ingredient_a: 'egg',
      ingredient_b: 'milk',
      family_member_id: 'member_001',
      constraint_applied_at: '2024-01-18T09:00:00Z',
    });
    expect(forbiddenCombinations[1]).toEqual({
      pattern_id: 'conflict_002',
      ingredient_a: 'pork',
      ingredient_b: 'beef',
      family_member_id: 'member_002',
      constraint_applied_at: '2024-01-18T09:15:00Z',
    });

    // アサーション 7: 複数回の献立生成試行 1 回目
    const generated_meal_1_ingredients = [
      'chicken',
      'rice',
      'carrot',
      'broccoli',
      'salt',
    ];
    const has_violation_1 = forbiddenCombinations.some((constraint) => {
      const has_a = generated_meal_1_ingredients.includes(constraint.ingredient_a);
      const has_b = generated_meal_1_ingredients.includes(constraint.ingredient_b);
      return has_a && has_b;
    });
    expect(has_violation_1).toBe(false);

    // アサーション 8: 複数回の献立生成試行 2 回目
    const generated_meal_2_ingredients = [
      'fish',
      'wheat',
      'potato',
      'spinach',
      'oil',
    ];
    const has_violation_2 = forbiddenCombinations.some((constraint) => {
      const has_a = generated_meal_2_ingredients.includes(constraint.ingredient_a);
      const has_b = generated_meal_2_ingredients.includes(constraint.ingredient_b);
      return has_a && has_b;
    });
    expect(has_violation_2).toBe(false);

    // アサーション 9: 複数回の献立生成試行 3 回目
    const generated_meal_3_ingredients = [
      'turkey',
      'barley',
      'cucumber',
      'tomato',
      'vinegar',
    ];
    const has_violation_3 = forbiddenCombinations.some((constraint) => {
      const has_a = generated_meal_3_ingredients.includes(constraint.ingredient_a);
      const has_b = generated_meal_3_ingredients.includes(constraint.ingredient_b);
      return has_a && has_b;
    });
    expect(has_violation_3).toBe(false);

    // アサーション 10: 複数回の献立生成結果の一貫性確認
    expect(result.generation_runs_validated).toBe(3);
    expect(result.all_meals_compliant).toBe(true);

    // アサーション 11: 制約反映の記録確認
    expect(result.constraint_application_status).toBe('applied_successfully');
    expect(result.constraints_applied_count).toBe(2);

    // アサーション 12: 処理の完了タイムスタンプが妥当性判定後であること
    const process_completed_at = new Date(
      result.process_completed_at,
    ).getTime();
    const last_judgment_at = new Date('2024-01-18T09:30:00Z').getTime();
    expect(process_completed_at).toBeGreaterThanOrEqual(last_judgment_at);
  });
});