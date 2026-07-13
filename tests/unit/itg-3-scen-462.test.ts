import { determineExternalFactorVariablePriority } from '../../src/logic/it-1-br-3-2-1';

describe('External Factor Variable Priority Auto-Determination', () => {
  // SCEN-462
  test('should correctly determine priority of external factor variables using 2-axis matrix (impact vs implementation difficulty)', () => {
    // Test data: External factor variables identified from correlation analysis
    const externalFactorVariables = [
      {
        variable_id: 'var_001',
        variable_name: 'seasonal_variation',
        impact_score: 9,
        implementation_difficulty_score: 2,
      },
      {
        variable_id: 'var_002',
        variable_name: 'event_occurrence',
        impact_score: 8,
        implementation_difficulty_score: 5,
      },
      {
        variable_id: 'var_003',
        variable_name: 'weather_pattern',
        impact_score: 7,
        implementation_difficulty_score: 3,
      },
      {
        variable_id: 'var_004',
        variable_name: 'competitor_campaign',
        impact_score: 6,
        implementation_difficulty_score: 8,
      },
      {
        variable_id: 'var_005',
        variable_name: 'holiday_schedule',
        impact_score: 4,
        implementation_difficulty_score: 2,
      },
    ];

    // Execute priority determination function
    const priorityResult = determineExternalFactorVariablePriority(externalFactorVariables);

    // Validate that result structure contains priority ranking
    expect(priorityResult).toBeDefined();
    expect(priorityResult.ranked_variables).toBeDefined();
    expect(Array.isArray(priorityResult.ranked_variables)).toBe(true);
    expect(priorityResult.ranked_variables.length).toBe(5);

    // Validate highest priority: high impact (9) + low difficulty (2)
    // Priority calculation: impact_score * 10 - implementation_difficulty_score * 5
    // var_001: 9*10 - 2*5 = 90 - 10 = 80
    // var_002: 8*10 - 5*5 = 80 - 25 = 55
    // var_003: 7*10 - 3*5 = 70 - 15 = 55
    // var_004: 6*10 - 8*5 = 60 - 40 = 20
    // var_005: 4*10 - 2*5 = 40 - 10 = 30
    // Expected order: var_001, var_002/var_003, var_005, var_004

    const firstRankedVariable = priorityResult.ranked_variables[0];
    expect(firstRankedVariable.variable_id).toBe('var_001');
    expect(firstRankedVariable.variable_name).toBe('seasonal_variation');
    expect(firstRankedVariable.priority_rank).toBe(1);
    expect(firstRankedVariable.priority_score).toBe(80);

    // Validate second priority tier
    const secondRankedVariable = priorityResult.ranked_variables[1];
    expect(secondRankedVariable.variable_id).toBe('var_002');
    expect(secondRankedVariable.variable_name).toBe('event_occurrence');
    expect(secondRankedVariable.priority_rank).toBe(2);
    expect(secondRankedVariable.priority_score).toBe(55);

    // Validate third priority tier
    const thirdRankedVariable = priorityResult.ranked_variables[2];
    expect(thirdRankedVariable.variable_id).toBe('var_003');
    expect(thirdRankedVariable.variable_name).toBe('weather_pattern');
    expect(thirdRankedVariable.priority_rank).toBe(2);
    expect(thirdRankedVariable.priority_score).toBe(55);

    // Validate medium-low priority
    const fourthRankedVariable = priorityResult.ranked_variables[3];
    expect(fourthRankedVariable.variable_id).toBe('var_005');
    expect(fourthRankedVariable.variable_name).toBe('holiday_schedule');
    expect(fourthRankedVariable.priority_rank).toBe(3);
    expect(fourthRankedVariable.priority_score).toBe(30);

    // Validate lowest priority: low impact (6) + high difficulty (8)
    const fifthRankedVariable = priorityResult.ranked_variables[4];
    expect(fifthRankedVariable.variable_id).toBe('var_004');
    expect(fifthRankedVariable.variable_name).toBe('competitor_campaign');
    expect(fifthRankedVariable.priority_rank).toBe(4);
    expect(fifthRankedVariable.priority_score).toBe(20);

    // Validate that priority tiers follow 2-axis matrix logic
    // (high impact + low difficulty = highest priority)
    expect(priorityResult.priority_matrix).toBeDefined();
    expect(priorityResult.priority_matrix.high_impact_low_difficulty).toEqual([
      { variable_id: 'var_001', variable_name: 'seasonal_variation' },
    ]);
    expect(priorityResult.priority_matrix.high_impact_high_difficulty).toEqual([
      { variable_id: 'var_002', variable_name: 'event_occurrence' },
      { variable_id: 'var_003', variable_name: 'weather_pattern' },
    ]);
    expect(priorityResult.priority_matrix.low_impact_low_difficulty).toEqual([
      { variable_id: 'var_005', variable_name: 'holiday_schedule' },
    ]);
    expect(priorityResult.priority_matrix.low_impact_high_difficulty).toEqual([
      { variable_id: 'var_004', variable_name: 'competitor_campaign' },
    ]);

    // Validate priority calculation consistency
    for (let i = 0; i < priorityResult.ranked_variables.length - 1; i++) {
      const currentVar = priorityResult.ranked_variables[i];
      const nextVar = priorityResult.ranked_variables[i + 1];
      // Priority score should be in descending order or equal (ties allowed)
      expect(currentVar.priority_score).toBeGreaterThanOrEqual(nextVar.priority_score);
    }

    // Validate that all variables maintain their original properties
    for (const rankedVar of priorityResult.ranked_variables) {
      const originalVar = externalFactorVariables.find(
        (v) => v.variable_id === rankedVar.variable_id
      );
      expect(rankedVar.impact_score).toBe(originalVar?.impact_score);
      expect(rankedVar.implementation_difficulty_score).toBe(
        originalVar?.implementation_difficulty_score
      );
    }

    // Validate response includes implementation guidance
    expect(priorityResult.implementation_recommendation).toBeDefined();
    expect(priorityResult.implementation_recommendation.immediate_action_variables).toEqual([
      'var_001',
    ]);
    expect(
      priorityResult.implementation_recommendation.secondary_action_variables
    ).toContain('var_002');
    expect(
      priorityResult.implementation_recommendation.secondary_action_variables
    ).toContain('var_003');
    expect(priorityResult.implementation_recommendation.defer_action_variables).toContain(
      'var_004'
    );
  });
});