import { prioritizeNutritionDeficiencies } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase Records and Monthly Food Cost Reduction Analysis', () => {
  // SCEN-404: [edge] Nutrition Deficiency Prioritization with Identical Improvement Effect Scores
  test('should prioritize nutrition deficiencies with identical improvement effect scores using secondary sort criteria', () => {
    // Precondition: User logged in, nutrition analysis feature accessible
    // Multiple nutrition deficiency items registered with identical improvement effect scores (80)
    const nutrition_deficiencies_input = [
      {
        nutrition_item_id: 'nut_001',
        nutrition_name: 'タンパク質',
        improvement_effect_score: 80,
        family_preference_risk: 0.2,
        registration_order: 3,
      },
      {
        nutrition_item_id: 'nut_002',
        nutrition_name: 'カルシウム',
        improvement_effect_score: 80,
        family_preference_risk: 0.15,
        registration_order: 1,
      },
      {
        nutrition_item_id: 'nut_003',
        nutrition_name: '鉄分',
        improvement_effect_score: 80,
        family_preference_risk: 0.25,
        registration_order: 2,
      },
    ];

    // Execute: Call prioritization function
    const result = prioritizeNutritionDeficiencies(nutrition_deficiencies_input);

    // Verify: Primary sort by improvement_effect_score (all 80), then secondary sort by nutrition_name (alphabetical)
    // Expected order: カルシウム (Ca), 鉄分 (Fe), タンパク質 (Pr) - alphabetically by Japanese name
    // Per secondary sort: alphabetical order should be consistent
    expect(result).toHaveLength(3);
    expect(result[0].nutrition_item_id).toBe('nut_002'); // カルシウム - first alphabetically
    expect(result[1].nutrition_item_id).toBe('nut_003'); // 鉄分 - second alphabetically
    expect(result[2].nutrition_item_id).toBe('nut_001'); // タンパク質 - third alphabetically

    // Verify: All items maintain identical improvement_effect_score at top level
    expect(result.every(item => item.improvement_effect_score === 80)).toBe(true);

    // Verify: Priority sequence is clearly assigned
    expect(result[0].priority_rank).toBe(1);
    expect(result[1].priority_rank).toBe(2);
    expect(result[2].priority_rank).toBe(3);

    // Execute again: Verify deterministic behavior on second execution
    const result_second_execution = prioritizeNutritionDeficiencies(nutrition_deficiencies_input);

    // Verify: Order remains consistent across multiple executions
    expect(result_second_execution[0].nutrition_item_id).toBe(result[0].nutrition_item_id);
    expect(result_second_execution[1].nutrition_item_id).toBe(result[1].nutrition_item_id);
    expect(result_second_execution[2].nutrition_item_id).toBe(result[2].nutrition_item_id);

    // Verify: Secondary sort criteria metadata is included in result
    expect(result[0]).toHaveProperty('secondary_sort_criteria');
    expect(result[0].secondary_sort_criteria).toBe('nutrition_name_alphabetical');

    // Edge case: Mixed scores with subset at 80 - verify only items with highest score are sorted by secondary criteria
    const mixed_scores_input = [
      {
        nutrition_item_id: 'nut_004',
        nutrition_name: 'ビタミンC',
        improvement_effect_score: 85,
        family_preference_risk: 0.1,
        registration_order: 4,
      },
      {
        nutrition_item_id: 'nut_005',
        nutrition_name: 'マグネシウム',
        improvement_effect_score: 80,
        family_preference_risk: 0.22,
        registration_order: 5,
      },
      {
        nutrition_item_id: 'nut_006',
        nutrition_name: 'ナトリウム',
        improvement_effect_score: 80,
        family_preference_risk: 0.18,
        registration_order: 6,
      },
    ];

    const result_mixed = prioritizeNutritionDeficiencies(mixed_scores_input);

    expect(result_mixed).toHaveLength(3);
    // Highest score item ranked first
    expect(result_mixed[0].improvement_effect_score).toBe(85);
    expect(result_mixed[0].priority_rank).toBe(1);
    // Secondary sort applied to tied items at score 80
    expect(result_mixed[1].nutrition_item_id).toBe('nut_006'); // マグネシウム - alphabetically first
    expect(result_mixed[1].priority_rank).toBe(2);
    expect(result_mixed[2].nutrition_item_id).toBe('nut_005'); // ナトリウム - alphabetically second
    expect(result_mixed[2].priority_rank).toBe(3);

    // Verify: Result clarity - each item has clear, distinct priority assignment
    const priority_ranks = result_mixed.map(item => item.priority_rank);
    const unique_ranks = new Set(priority_ranks);
    expect(unique_ranks.size).toBe(result_mixed.length); // All ranks are unique

    // Verify: Log or metadata reflects secondary sort decision
    expect(result_mixed[1]).toHaveProperty('sort_decision_log');
    expect(result_mixed[1].sort_decision_log).toContain('secondary_sort_applied');
  });
});