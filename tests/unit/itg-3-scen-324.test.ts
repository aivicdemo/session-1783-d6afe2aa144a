import { detectConflictingMeals } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase Record and Monthly Food Cost Savings Analysis', () => {
  // SCEN-324: [normal] 制限条件の抵触献立検出機能 - 変更された食事制限条件により過去1年間の献立履歴がスキャンされて抵触パターンが検出される
  test('should detect conflicting meals from past 1 year when dietary restriction is changed', () => {
    const userId = 'user_001';
    const familyMemberId = 'family_member_001';

    // Input: Previous dietary restrictions (before change)
    const previousRestrictions = [
      {
        restrictionId: 'restrict_001',
        familyMemberId: familyMemberId,
        restrictionType: 'allergen',
        restrictionValue: 'peanuts',
        startDate: new Date('2023-01-01'),
        endDate: null,
      },
    ];

    // Input: New dietary restrictions (after change)
    const newRestrictions = [
      {
        restrictionId: 'restrict_001',
        familyMemberId: familyMemberId,
        restrictionType: 'allergen',
        restrictionValue: 'peanuts',
        startDate: new Date('2023-01-01'),
        endDate: null,
      },
      {
        restrictionId: 'restrict_002',
        familyMemberId: familyMemberId,
        restrictionType: 'allergen',
        restrictionValue: 'shellfish',
        startDate: new Date('2024-01-15'),
        endDate: null,
      },
    ];

    // Input: Meal history for past 1 year (365 days from 2024-01-15)
    const mealHistory = [
      {
        mealId: 'meal_001',
        userId: userId,
        familyMemberId: familyMemberId,
        mealDate: new Date('2023-02-10'),
        mealName: 'Peanut Butter Sandwich',
        ingredients: ['bread', 'peanut_butter'],
        allergens: ['peanuts'],
      },
      {
        mealId: 'meal_002',
        userId: userId,
        familyMemberId: familyMemberId,
        mealDate: new Date('2023-06-20'),
        mealName: 'Shrimp Pasta',
        ingredients: ['pasta', 'shrimp', 'garlic'],
        allergens: ['shellfish'],
      },
      {
        mealId: 'meal_003',
        userId: userId,
        familyMemberId: familyMemberId,
        mealDate: new Date('2023-09-15'),
        mealName: 'Grilled Chicken',
        ingredients: ['chicken', 'lemon'],
        allergens: [],
      },
      {
        mealId: 'meal_004',
        userId: userId,
        familyMemberId: familyMemberId,
        mealDate: new Date('2023-11-22'),
        mealName: 'Crab Salad',
        ingredients: ['lettuce', 'crab', 'mayo'],
        allergens: ['shellfish'],
      },
      {
        mealId: 'meal_005',
        userId: userId,
        familyMemberId: familyMemberId,
        mealDate: new Date('2024-01-10'),
        mealName: 'Squid Risotto',
        ingredients: ['risotto', 'squid'],
        allergens: ['shellfish'],
      },
    ];

    // Execute: Detect conflicting meals
    const result = detectConflictingMeals({
      userId: userId,
      familyMemberId: familyMemberId,
      previousRestrictions: previousRestrictions,
      newRestrictions: newRestrictions,
      mealHistory: mealHistory,
      referenceDate: new Date('2024-01-15'),
    });

    // Verify: Basic result structure
    expect(result).toHaveProperty('conflictingMeals');
    expect(result).toHaveProperty('scanStatus');
    expect(result).toHaveProperty('statistics');

    // Verify: Scan status
    expect(result.scanStatus).toBe('completed');

    // Verify: Conflicting meals detected (meals with new shellfish restriction)
    expect(result.conflictingMeals).toHaveLength(3);

    // Verify: First conflicting meal (shellfish from history before restriction change)
    expect(result.conflictingMeals[0]).toEqual({
      mealId: 'meal_002',
      mealDate: new Date('2023-06-20'),
      mealName: 'Shrimp Pasta',
      conflictReason: 'allergen_shellfish',
      ingredients: ['pasta', 'shrimp', 'garlic'],
      allergens: ['shellfish'],
      detectionTimestamp: expect.any(Date),
    });

    // Verify: Second conflicting meal
    expect(result.conflictingMeals[1]).toEqual({
      mealId: 'meal_004',
      mealDate: new Date('2023-11-22'),
      mealName: 'Crab Salad',
      conflictReason: 'allergen_shellfish',
      ingredients: ['lettuce', 'crab', 'mayo'],
      allergens: ['shellfish'],
      detectionTimestamp: expect.any(Date),
    });

    // Verify: Third conflicting meal
    expect(result.conflictingMeals[2]).toEqual({
      mealId: 'meal_005',
      mealDate: new Date('2024-01-10'),
      mealName: 'Squid Risotto',
      conflictReason: 'allergen_shellfish',
      ingredients: ['risotto', 'squid'],
      allergens: ['shellfish'],
      detectionTimestamp: expect.any(Date),
    });

    // Verify: Statistics - conflict count
    expect(result.statistics.totalConflictingMealCount).toBe(3);

    // Verify: Statistics - conflict rate (3 conflicting out of 5 total meals)
    expect(result.statistics.conflictRate).toBe(60);

    // Verify: Statistics - breakdown by restriction
    expect(result.statistics.conflictsByRestrictionType).toEqual({
      allergen_shellfish: 3,
    });

    // Verify: Statistics - date range of scan
    expect(result.statistics.scanStartDate).toEqual(new Date('2023-01-15'));
    expect(result.statistics.scanEndDate).toEqual(new Date('2024-01-15'));

    // Verify: Progress tracking
    expect(result.progress).toEqual({
      totalMealsScanned: 5,
      mealsProcessed: 5,
      scanProgress: 100,
    });
  });
});