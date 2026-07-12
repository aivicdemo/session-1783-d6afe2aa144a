import { detectConflictingMenuPatterns } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-481: [normal] 複数制限条件の優先度処理と自動決定
  test('複数の制限条件が同一タイムスタンプで入力された場合、優先度順に処理され過去献立との抵触検出が実行される', () => {
    const timestamp = new Date('2024-01-15T10:00:00Z');

    const restrictionA = {
      id: 'rest-a-001',
      userId: 'user-001',
      restrictionType: 'ingredient_exclude',
      restrictionValue: 'egg',
      priority: 1,
      inputTimestamp: timestamp,
    };

    const restrictionB = {
      id: 'rest-b-001',
      userId: 'user-001',
      restrictionType: 'nutrition_limit',
      restrictionValue: 'sodium_under_2000mg',
      priority: 2,
      inputTimestamp: timestamp,
    };

    const restrictionC = {
      id: 'rest-c-001',
      userId: 'user-001',
      restrictionType: 'cooking_time_limit',
      restrictionValue: 'under_30min',
      priority: 3,
      inputTimestamp: timestamp,
    };

    const multipleRestrictions = [restrictionA, restrictionB, restrictionC];

    const pastMenuHistory = [
      {
        menuId: 'menu-001',
        date: new Date('2024-01-08T00:00:00Z'),
        dishes: [
          { name: 'Omelette', ingredients: ['egg', 'milk'], cookingTime: 15 },
          { name: 'Salad', ingredients: ['lettuce', 'tomato'], cookingTime: 5 },
        ],
        totalSodium: 1800,
      },
      {
        menuId: 'menu-002',
        date: new Date('2024-01-09T00:00:00Z'),
        dishes: [
          { name: 'Grilled Fish', ingredients: ['salmon', 'lemon'], cookingTime: 25 },
          { name: 'Rice', ingredients: ['rice', 'water'], cookingTime: 20 },
        ],
        totalSodium: 1950,
      },
      {
        menuId: 'menu-003',
        date: new Date('2024-01-10T00:00:00Z'),
        dishes: [
          { name: 'Pasta with Egg Sauce', ingredients: ['pasta', 'egg', 'cream'], cookingTime: 45 },
          { name: 'Bread', ingredients: ['flour', 'water'], cookingTime: 60 },
        ],
        totalSodium: 2100,
      },
    ];

    const result = detectConflictingMenuPatterns({
      restrictions: multipleRestrictions,
      pastMenuHistory: pastMenuHistory,
      userId: 'user-001',
    });

    expect(result).toBeDefined();
    expect(result.processingOrder).toEqual([1, 2, 3]);
    expect(result.restrictionsPrioritySorted.length).toBe(3);
    expect(result.restrictionsPrioritySorted[0].priority).toBe(1);
    expect(result.restrictionsPrioritySorted[1].priority).toBe(2);
    expect(result.restrictionsPrioritySorted[2].priority).toBe(3);

    expect(result.allRestrictionsApplied).toBe(true);

    const eggConflict = result.conflictingPatterns.find((conflict) => conflict.conflictType === 'ingredient_mismatch' && conflict.conflictReason === 'egg');
    expect(eggConflict).toBeDefined();
    expect(eggConflict?.affectedMenuIds).toContain('menu-001');
    expect(eggConflict?.affectedMenuIds).toContain('menu-003');

    const sodiumConflict = result.conflictingPatterns.find((conflict) => conflict.conflictType === 'nutrition_mismatch');
    expect(sodiumConflict).toBeDefined();
    expect(sodiumConflict?.affectedMenuIds).toContain('menu-003');

    const cookingTimeConflict = result.conflictingPatterns.find((conflict) => conflict.conflictType === 'cooking_time_mismatch');
    expect(cookingTimeConflict).toBeDefined();
    expect(cookingTimeConflict?.affectedMenuIds).toContain('menu-003');

    expect(result.totalConflictingMenuCount).toBe(3);
    expect(result.conflictingPatterns.length).toBeGreaterThan(0);

    const nonConflictingMenuIds = pastMenuHistory
      .filter((menu) => !result.conflictingPatterns.some((conflict) => conflict.affectedMenuIds.includes(menu.menuId)))
      .map((menu) => menu.menuId);

    expect(nonConflictingMenuIds.length).toBe(1);
    expect(nonConflictingMenuIds[0]).toBe('menu-002');

    expect(result.notificationRequired).toBe(true);
    expect(result.notificationMessage).toMatch(/抵触/);

    expect(result.processedAtTimestamp).toEqual(timestamp);
    expect(result.userId).toBe('user-001');
  });
});