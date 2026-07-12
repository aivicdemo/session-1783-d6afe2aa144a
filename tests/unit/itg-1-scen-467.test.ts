import { detectConflictingMenusByRestriction } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-467
  test('複数食事制限条件の優先度自動判定機能 - 1件のみの制限条件が送信された場合でも正常に処理される', () => {
    const singleRestrictionInput = {
      userId: 'user_001',
      familyMemberId: 'member_001',
      restrictions: [
        {
          restrictionId: 'rest_egg_001',
          type: 'allergy',
          allergenName: 'egg',
          severity: 'high',
          addedAt: '2024-01-15T10:00:00Z',
        },
      ],
      pastMenuIds: [
        'menu_001',
        'menu_002',
        'menu_003',
        'menu_004',
        'menu_005',
      ],
    };

    const pastMenuData = [
      {
        menuId: 'menu_001',
        dishes: [
          {
            dishName: 'スクランブルエッグ',
            ingredients: ['egg', 'butter', 'salt'],
          },
        ],
      },
      {
        menuId: 'menu_002',
        dishes: [
          {
            dishName: '鶏肉のグリル',
            ingredients: ['chicken', 'olive_oil', 'garlic'],
          },
        ],
      },
      {
        menuId: 'menu_003',
        dishes: [
          {
            dishName: 'オムレツ',
            ingredients: ['egg', 'milk', 'ham'],
          },
        ],
      },
      {
        menuId: 'menu_004',
        dishes: [
          {
            dishName: 'サラダ',
            ingredients: ['lettuce', 'tomato', 'cucumber'],
          },
        ],
      },
      {
        menuId: 'menu_005',
        dishes: [
          {
            dishName: 'ケーキ',
            ingredients: ['egg', 'flour', 'sugar'],
          },
        ],
      },
    ];

    const result = detectConflictingMenusByRestriction(
      singleRestrictionInput,
      pastMenuData
    );

    expect(result).toBeDefined();
    expect(result.userId).toBe('user_001');
    expect(result.restrictionCount).toBe(1);
    expect(result.priorityAssignmentSuccessful).toBe(true);
    expect(Array.isArray(result.conflictingMenus)).toBe(true);
    expect(result.conflictingMenus.length).toBe(3);

    const conflictingMenuIds = result.conflictingMenus.map(
      (item: any) => item.menuId
    );
    expect(conflictingMenuIds).toEqual(
      expect.arrayContaining(['menu_001', 'menu_003', 'menu_005'])
    );

    const eggConflict = result.conflictingMenus.find(
      (item: any) => item.menuId === 'menu_001'
    );
    expect(eggConflict).toBeDefined();
    expect(eggConflict.conflictingIngredients).toContain('egg');
    expect(eggConflict.conflictReason).toBe('allergy');

    expect(result.processedAt).toBeDefined();
    expect(typeof result.processedAt).toBe('string');

    const safeMenuIds = result.safeMenus.map((item: any) => item.menuId);
    expect(safeMenuIds).toEqual(
      expect.arrayContaining(['menu_002', 'menu_004'])
    );

    expect(result.errors).toEqual([]);
  });
});