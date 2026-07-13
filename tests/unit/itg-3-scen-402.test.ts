import { prioritizeNutritionDeficiencies } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase Record and Monthly Food Cost Reduction Analysis', () => {
  // SCEN-402
  test('should prioritize nutrition deficiency items by improvement effect and family preference risk', () => {
    const nutritionDeficiencies = [
      {
        id: 'protein_001',
        nutrientName: 'タンパク質',
        improvementEffectScore: 85,
        familyPreferenceRiskScore: 20,
      },
      {
        id: 'vitaminc_001',
        nutrientName: 'ビタミンC',
        improvementEffectScore: 75,
        familyPreferenceRiskScore: 35,
      },
      {
        id: 'calcium_001',
        nutrientName: 'カルシウム',
        improvementEffectScore: 85,
        familyPreferenceRiskScore: 50,
      },
      {
        id: 'iron_001',
        nutrientName: '鉄',
        improvementEffectScore: 60,
        familyPreferenceRiskScore: 25,
      },
      {
        id: 'vitaminb_001',
        nutrientName: 'ビタミンB',
        improvementEffectScore: 75,
        familyPreferenceRiskScore: 15,
      },
    ];

    const result = prioritizeNutritionDeficiencies(nutritionDeficiencies);

    // Verify result is sorted by priority score in descending order
    expect(result).toHaveLength(5);

    // Calculate expected priority scores: improvement_effect * (1 - (family_preference_risk / 100))
    const expectedScores = [
      { id: 'protein_001', score: 85 * (1 - 0.2) }, // 68
      { id: 'calcium_001', score: 85 * (1 - 0.5) }, // 42.5
      { id: 'vitaminb_001', score: 75 * (1 - 0.15) }, // 63.75
      { id: 'vitaminc_001', score: 75 * (1 - 0.35) }, // 48.75
      { id: 'iron_001', score: 60 * (1 - 0.25) }, // 45
    ];

    // Verify the first item has highest improvement effect (85) and lowest risk among tied items
    expect(result[0].id).toBe('protein_001');
    expect(result[0].priorityScore).toBe(68);

    // Verify second item: same improvement effect (85) but higher risk (50)
    expect(result[1].id).toBe('calcium_001');
    expect(result[1].priorityScore).toBe(42.5);

    // Verify third item: improvement effect 75 with low risk (15)
    expect(result[2].id).toBe('vitaminb_001');
    expect(result[2].priorityScore).toBe(63.75);

    // Verify fourth item: improvement effect 75 with higher risk (35)
    expect(result[3].id).toBe('vitaminc_001');
    expect(result[3].priorityScore).toBe(48.75);

    // Verify last item: lowest improvement effect (60)
    expect(result[4].id).toBe('iron_001');
    expect(result[4].priorityScore).toBe(45);

    // Verify priority scores are in descending order
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].priorityScore).toBeGreaterThanOrEqual(result[i + 1].priorityScore);
    }

    // Verify all required fields are present
    result.forEach((item) => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('nutrientName');
      expect(item).toHaveProperty('improvementEffectScore');
      expect(item).toHaveProperty('familyPreferenceRiskScore');
      expect(item).toHaveProperty('priorityScore');
    });

    // Test edge case: items with identical priority scores
    const identicalScoreItems = [
      {
        id: 'nutrient_a',
        nutrientName: 'Nutrient A',
        improvementEffectScore: 80,
        familyPreferenceRiskScore: 25,
      },
      {
        id: 'nutrient_b',
        nutrientName: 'Nutrient B',
        improvementEffectScore: 80,
        familyPreferenceRiskScore: 25,
      },
    ];

    const identicalResult = prioritizeNutritionDeficiencies(identicalScoreItems);
    expect(identicalResult).toHaveLength(2);
    expect(identicalResult[0].priorityScore).toBe(60); // 80 * (1 - 0.25)
    expect(identicalResult[1].priorityScore).toBe(60);

    // Test with single item
    const singleItem = [
      {
        id: 'single_nutrient',
        nutrientName: 'Single Nutrient',
        improvementEffectScore: 90,
        familyPreferenceRiskScore: 10,
      },
    ];

    const singleResult = prioritizeNutritionDeficiencies(singleItem);
    expect(singleResult).toHaveLength(1);
    expect(singleResult[0].priorityScore).toBe(81); // 90 * (1 - 0.1)

    // Test with extreme risk values
    const extremeItems = [
      {
        id: 'zero_risk',
        nutrientName: 'Zero Risk Item',
        improvementEffectScore: 50,
        familyPreferenceRiskScore: 0,
      },
      {
        id: 'max_risk',
        nutrientName: 'Max Risk Item',
        improvementEffectScore: 50,
        familyPreferenceRiskScore: 100,
      },
    ];

    const extremeResult = prioritizeNutritionDeficiencies(extremeItems);
    expect(extremeResult[0].id).toBe('zero_risk');
    expect(extremeResult[0].priorityScore).toBe(50);
    expect(extremeResult[1].id).toBe('max_risk');
    expect(extremeResult[1].priorityScore).toBe(0);
  });
});