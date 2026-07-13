import { calculateAlgorithmImprovementEffect } from '../../src/logic/it-1-br-2-1-1-1';

describe('Algorithm Improvement Effect Comparison - Edge Case: Zero Difference', () => {
  test('SCEN-595: when improvement difference equals zero, system correctly judges no improvement', () => {
    // Setup: Pre-improvement algorithm analysis result
    const pre_improvement_result = {
      nutrition_item_id: 'NUT_001',
      nutrition_item_name: 'protein',
      target_value: 50,
      actual_value: 50,
      achievement_rate: 100.0,
      gap_value: 0.0,
      priority_rank: 1,
    };

    // Setup: Post-improvement algorithm analysis result (identical to pre-improvement)
    const post_improvement_result = {
      nutrition_item_id: 'NUT_001',
      nutrition_item_name: 'protein',
      target_value: 50,
      actual_value: 50,
      achievement_rate: 100.0,
      gap_value: 0.0,
      priority_rank: 1,
    };

    // Execute: Calculate improvement effect difference
    const improvement_effect_comparison = calculateAlgorithmImprovementEffect({
      pre_improvement_achievement_rate: pre_improvement_result.achievement_rate,
      post_improvement_achievement_rate: post_improvement_result.achievement_rate,
      pre_improvement_gap_value: pre_improvement_result.gap_value,
      post_improvement_gap_value: post_improvement_result.gap_value,
    });

    // Verify: Difference equals exactly 0.0
    expect(improvement_effect_comparison.achievement_rate_difference).toBe(0.0);
    expect(improvement_effect_comparison.gap_value_difference).toBe(0.0);

    // Verify: System correctly judges no improvement
    expect(improvement_effect_comparison.has_improvement).toBe(false);

    // Verify: Result display shows "no improvement" or "0% difference"
    expect(improvement_effect_comparison.improvement_status).toBe('no_improvement');
    expect(improvement_effect_comparison.improvement_percentage).toBe(0.0);

    // Verify: Edge case (difference = 0) is processed normally without error
    expect(improvement_effect_comparison.status).toBe('success');
    expect(improvement_effect_comparison.error_message).toBeNull();
  });
});