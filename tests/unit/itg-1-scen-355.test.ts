import { generateMealCandidatesWithConstraints } from '../../src/logic/it-1-1-1';

describe('複数制約条件付き献立生成機能 - 制約条件を満たす献立候補が存在しない場合', () => {
  // SCEN-355
  test('制約条件を満たす献立候補が存在しない場合、空の候補リストを返却する', () => {
    const constraints = {
      max_calories: 300,
      max_cooking_time_minutes: 10,
      allergens_to_exclude: [
        'egg',
        'milk',
        'peanuts',
        'tree_nuts',
        'fish',
        'shellfish',
        'soy',
        'wheat',
      ],
    };

    const family_members = [
      {
        id: 'member-1',
        age: 8,
        gender: 'M',
        allergies: [],
        dietary_restrictions: [],
      },
      {
        id: 'member-2',
        age: 35,
        gender: 'F',
        allergies: [],
        dietary_restrictions: [],
      },
    ];

    const available_ingredients = [
      {
        name: 'rice',
        quantity: 2000,
        unit: 'g',
        expiration_date: '2025-12-31',
      },
    ];

    const result = generateMealCandidatesWithConstraints({
      constraints,
      family_members,
      available_ingredients,
      target_date: '2025-01-15',
    });

    expect(Array.isArray(result.candidates)).toBe(true);
    expect(result.candidates.length).toBe(0);
    expect(result.error_message).toBe('条件に合う献立が見つかりません');
    expect(result.is_empty).toBe(true);
  });
});