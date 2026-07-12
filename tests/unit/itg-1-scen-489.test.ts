import { detectDietaryRestrictionChanges } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-489: [error] 食事制限条件変更の抵触検出と監査ログ記録 - 食事制限条件の変更が無効な形式の場合、エラーとなり監査ログに記録されない
  test('無効な形式の食事制限条件入力時、エラーメッセージが表示され監査ログが記録されない', () => {
    const userId = 'user_123';
    const familyMemberId = 'family_001';
    const restrictionInput = '';
    const timestamp = new Date('2024-01-15T11:00:00Z');

    expect(() =>
      detectDietaryRestrictionChanges({
        userId,
        familyMemberId,
        restrictionInput,
        timestamp,
      })
    ).toThrow(/食事制限条件/);
  });

  test('null値の食事制限条件入力時、エラーメッセージが表示され監査ログが記録されない', () => {
    const userId = 'user_123';
    const familyMemberId = 'family_001';
    const restrictionInput = null;
    const timestamp = new Date('2024-01-15T11:00:00Z');

    expect(() =>
      detectDietaryRestrictionChanges({
        userId,
        familyMemberId,
        restrictionInput: restrictionInput as any,
        timestamp,
      })
    ).toThrow(/食事制限条件/);
  });

  test('特殊文字のみの食事制限条件入力時、エラーメッセージが表示され監査ログが記録されない', () => {
    const userId = 'user_123';
    const familyMemberId = 'family_001';
    const restrictionInput = '!@#$%^&*()';
    const timestamp = new Date('2024-01-15T11:00:00Z');

    expect(() =>
      detectDietaryRestrictionChanges({
        userId,
        familyMemberId,
        restrictionInput,
        timestamp,
      })
    ).toThrow(/食事制限条件/);
  });

  test('有効な食事制限条件入力時、変更が受け入れられ抵触パターンが検出される', () => {
    const userId = 'user_123';
    const familyMemberId = 'family_001';
    const restrictionInput = 'アレルギー:エビ,カニ';
    const timestamp = new Date('2024-01-15T11:00:00Z');
    const pastMenuHistory = [
      {
        menuId: 'menu_001',
        dishName: 'エビフライ',
        ingredients: ['エビ', '小麦粉'],
        createdAt: new Date('2024-01-10T12:00:00Z'),
      },
      {
        menuId: 'menu_002',
        dishName: 'ご飯',
        ingredients: ['米'],
        createdAt: new Date('2024-01-12T12:00:00Z'),
      },
    ];

    const result = detectDietaryRestrictionChanges({
      userId,
      familyMemberId,
      restrictionInput,
      timestamp,
      pastMenuHistory,
    });

    expect(result).toEqual({
      isValid: true,
      conflictingMenus: [
        {
          menuId: 'menu_001',
          dishName: 'エビフライ',
          conflictingIngredients: ['エビ'],
          riskLevel: 'high',
        },
      ],
      auditLogId: expect.any(String),
      changeDetected: true,
    });
  });

  test('有効な食事制限条件で過去献立に抵触がない場合、空のconflictingMenusが返される', () => {
    const userId = 'user_123';
    const familyMemberId = 'family_001';
    const restrictionInput = 'アレルギー:グルテン';
    const timestamp = new Date('2024-01-15T11:00:00Z');
    const pastMenuHistory = [
      {
        menuId: 'menu_001',
        dishName: 'サラダ',
        ingredients: ['レタス', 'トマト', 'きゅうり'],
        createdAt: new Date('2024-01-10T12:00:00Z'),
      },
    ];

    const result = detectDietaryRestrictionChanges({
      userId,
      familyMemberId,
      restrictionInput,
      timestamp,
      pastMenuHistory,
    });

    expect(result).toEqual({
      isValid: true,
      conflictingMenus: [],
      auditLogId: expect.any(String),
      changeDetected: true,
    });
  });

  test('複数の抵触パターンが検出される場合、すべてがconflictingMenusに含まれる', () => {
    const userId = 'user_123';
    const familyMemberId = 'family_001';
    const restrictionInput = 'アレルギー:小麦粉,卵';
    const timestamp = new Date('2024-01-15T11:00:00Z');
    const pastMenuHistory = [
      {
        menuId: 'menu_001',
        dishName: 'パン',
        ingredients: ['小麦粉', 'バター'],
        createdAt: new Date('2024-01-14T12:00:00Z'),
      },
      {
        menuId: 'menu_002',
        dishName: 'スクランブルエッグ',
        ingredients: ['卵', 'バター'],
        createdAt: new Date('2024-01-13T12:00:00Z'),
      },
      {
        menuId: 'menu_003',
        dishName: 'オムレツ',
        ingredients: ['卵', '小麦粉', 'チーズ'],
        createdAt: new Date('2024-01-12T12:00:00Z'),
      },
    ];

    const result = detectDietaryRestrictionChanges({
      userId,
      familyMemberId,
      restrictionInput,
      timestamp,
      pastMenuHistory,
    });

    expect(result.conflictingMenus).toHaveLength(3);
    expect(result.conflictingMenus).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          menuId: 'menu_001',
          dishName: 'パン',
          conflictingIngredients: ['小麦粉'],
        }),
        expect.objectContaining({
          menuId: 'menu_002',
          dishName: 'スクランブルエッグ',
          conflictingIngredients: ['卵'],
        }),
        expect.objectContaining({
          menuId: 'menu_003',
          dishName: 'オムレツ',
          conflictingIngredients: ['卵', '小麦粉'],
        }),
      ])
    );
    expect(result.isValid).toBe(true);
    expect(result.auditLogId).toBeDefined();
  });
});