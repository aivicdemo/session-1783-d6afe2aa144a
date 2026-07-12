import { detectConflictingMenusAndReflectRestriction } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-483: [edge] 複数制限条件の優先度処理と自動決定 - 単一の制限条件が入力された場合、優先度処理をスキップして即座に反映できる
  test('単一の制限条件（アレルギー「卵」）のみが入力された場合、優先度判定処理をスキップして即座に条件が反映され、卵を含まない献立が1秒以内に生成される', () => {
    const startTime = Date.now();

    const singleRestrictionInput = {
      userId: 'user-001',
      familyMemberId: 'member-001',
      restrictionType: 'allergy',
      allergyName: 'egg',
      allergyLevel: 1,
      restrictionChangeTimestamp: new Date('2024-01-15T10:00:00Z').toISOString(),
      additionalRestrictions: [],
    };

    const pastMenusData = [
      {
        menuId: 'menu-001',
        menuName: 'Scrambled Eggs',
        ingredients: ['egg', 'butter', 'salt'],
        nutritionInfo: { protein: 12, carbs: 2, fat: 8 },
        preparationTime: 10,
        estimatedCost: 250,
      },
      {
        menuId: 'menu-002',
        menuName: 'Grilled Chicken Salad',
        ingredients: ['chicken', 'lettuce', 'tomato', 'olive oil'],
        nutritionInfo: { protein: 28, carbs: 8, fat: 10 },
        preparationTime: 15,
        estimatedCost: 450,
      },
      {
        menuId: 'menu-003',
        menuName: 'Egg Fried Rice',
        ingredients: ['egg', 'rice', 'soy sauce', 'vegetables'],
        nutritionInfo: { protein: 10, carbs: 45, fat: 5 },
        preparationTime: 12,
        estimatedCost: 300,
      },
      {
        menuId: 'menu-004',
        menuName: 'Fish Pasta',
        ingredients: ['salmon', 'pasta', 'cream', 'lemon'],
        nutritionInfo: { protein: 22, carbs: 40, fat: 12 },
        preparationTime: 18,
        estimatedCost: 600,
      },
    ];

    const result = detectConflictingMenusAndReflectRestriction(
      singleRestrictionInput,
      pastMenusData
    );

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // Priority processing should be skipped for single restriction
    expect(result.priorityProcessingExecuted).toBe(false);

    // Conflicting menus must be detected: Scrambled Eggs (menu-001) and Egg Fried Rice (menu-003)
    expect(result.conflictingMenuIds).toContainEqual('menu-001');
    expect(result.conflictingMenuIds).toContainEqual('menu-003');
    expect(result.conflictingMenuIds).not.toContainEqual('menu-002');
    expect(result.conflictingMenuIds).not.toContainEqual('menu-004');
    expect(result.conflictingMenuCount).toBe(2);

    // Reflection should be applied immediately
    expect(result.isRestrictionApplied).toBe(true);
    expect(result.appliedRestrictionType).toBe('allergy');
    expect(result.appliedRestrictionValue).toBe('egg');

    // Processing time must be less than 1 second (1000 ms)
    expect(processingTime).toBeLessThan(1000);

    // Reflected restriction timestamp should match input
    expect(result.restrictionAppliedTimestamp).toBe(
      '2024-01-15T10:00:00Z'
    );

    // Next menu generation should exclude conflicting ingredients
    const generatedMenuIds = result.suggestedMenuIdsForNextGeneration;
    expect(generatedMenuIds).toContain('menu-002');
    expect(generatedMenuIds).toContain('menu-004');
    expect(generatedMenuIds).not.toContain('menu-001');
    expect(generatedMenuIds).not.toContain('menu-003');

    // No additional restrictions should be processed
    expect(result.processedAdditionalRestrictionsCount).toBe(0);

    // Conflict detection confidence should be high for single restriction
    expect(result.conflictDetectionConfidence).toBeGreaterThanOrEqual(0.95);
  });
});