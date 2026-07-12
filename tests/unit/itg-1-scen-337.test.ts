import { detectMenuConflicts } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-337
  test('複数の新規食事制限が同時に入力された場合、全ての抵触献立が正確に検出される', () => {
    // Arrange
    const pastMenus = [
      {
        menu_id: 'menu_001',
        menu_name: '献立A',
        ingredients: ['鶏肉', '卵'],
      },
      {
        menu_id: 'menu_002',
        menu_name: '献立B',
        ingredients: ['牛肉', '乳製品'],
      },
      {
        menu_id: 'menu_003',
        menu_name: '献立C',
        ingredients: ['小麦', 'ナッツ'],
      },
    ];

    const newRestrictions = [
      {
        restriction_id: 'rest_001',
        restriction_name: '鶏肉アレルギー',
        restricted_ingredient: '鶏肉',
      },
      {
        restriction_id: 'rest_002',
        restriction_name: '乳製品不可',
        restricted_ingredient: '乳製品',
      },
      {
        restriction_id: 'rest_003',
        restriction_name: 'ナッツ類不可',
        restricted_ingredient: 'ナッツ',
      },
    ];

    // Act
    const result = detectMenuConflicts(pastMenus, newRestrictions);

    // Assert
    expect(result.conflict_count).toBe(3);
    expect(result.conflicting_menus).toHaveLength(3);

    // 献立A（鶏肉制限に抵触）
    const conflictMenuA = result.conflicting_menus.find(
      (m) => m.menu_id === 'menu_001'
    );
    expect(conflictMenuA).toBeDefined();
    expect(conflictMenuA!.menu_name).toBe('献立A');
    expect(conflictMenuA!.conflict_reasons).toContain('鶏肉制限に抵触');
    expect(conflictMenuA!.conflicting_ingredients).toEqual(['鶏肉']);

    // 献立B（乳製品制限に抵触）
    const conflictMenuB = result.conflicting_menus.find(
      (m) => m.menu_id === 'menu_002'
    );
    expect(conflictMenuB).toBeDefined();
    expect(conflictMenuB!.menu_name).toBe('献立B');
    expect(conflictMenuB!.conflict_reasons).toContain('乳製品制限に抵触');
    expect(conflictMenuB!.conflicting_ingredients).toEqual(['乳製品']);

    // 献立C（ナッツ類制限に抵触）
    const conflictMenuC = result.conflicting_menus.find(
      (m) => m.menu_id === 'menu_003'
    );
    expect(conflictMenuC).toBeDefined();
    expect(conflictMenuC!.menu_name).toBe('献立C');
    expect(conflictMenuC!.conflict_reasons).toContain('ナッツ類制限に抵触');
    expect(conflictMenuC!.conflicting_ingredients).toEqual(['ナッツ']);

    // 全体的な検出結果の確認
    expect(result.detection_status).toBe('completed');
    expect(result.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );
  });
});