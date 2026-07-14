import { detectDietaryRestrictionConflicts } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-651
  test('新規食事制限条件入力時に過去献立との抵触パターンが正常に検出される', () => {
    // Arrange: 過去献立データ（3件以上）を準備
    const pastMenus = [
      {
        menuId: 'menu001',
        menuName: '鶏肉とエビの炒め物',
        ingredients: [
          { ingredientId: 'ing001', name: 'エビ', allergenCode: 'shrimp' },
          { ingredientId: 'ing002', name: '鶏肉', allergenCode: 'chicken' },
          { ingredientId: 'ing003', name: '大豆油', allergenCode: 'soy' }
        ],
        createdAt: '2024-01-10T10:00:00Z'
      },
      {
        menuId: 'menu002',
        menuName: 'ピーナッツバター入りサンドイッチ',
        ingredients: [
          { ingredientId: 'ing004', name: 'ピーナッツバター', allergenCode: 'peanut' },
          { ingredientId: 'ing005', name: '小麦粉', allergenCode: 'wheat' },
          { ingredientId: 'ing006', name: 'バター', allergenCode: 'dairy' }
        ],
        createdAt: '2024-01-11T10:00:00Z'
      },
      {
        menuId: 'menu003',
        menuName: '海老とナッツのサラダ',
        ingredients: [
          { ingredientId: 'ing007', name: 'クルミ', allergenCode: 'treenut' },
          { ingredientId: 'ing008', name: 'エビ', allergenCode: 'shrimp' },
          { ingredientId: 'ing009', name: 'ゴマ', allergenCode: 'sesame' }
        ],
        createdAt: '2024-01-12T10:00:00Z'
      }
    ];

    // 新規食事制限条件を入力（複数の抵触を引き起こす条件）
    const newDietaryRestriction = {
      restrictionId: 'restriction001',
      type: 'allergen',
      allergenCode: 'shrimp',
      restriction: 'エビを完全に禁止',
      addedAt: '2024-01-15T11:00:00Z'
    };

    // Act: 過去献立との抵触検出を実行
    const conflictResults = detectDietaryRestrictionConflicts(
      pastMenus,
      newDietaryRestriction
    );

    // Assert: 期待される抵触パターン検出結果を検証
    // 期待値計算：
    // - エビ(shrimp)を禁止する条件が追加される
    // - menu001にエビ(ing001)が含まれ、抵触
    // - menu003にエビ(ing008)が含まれ、抵触
    // - menu002にはエビが含まれていないため、抵触なし
    // つまり、検出される抵触パターンは2件となるべき

    expect(conflictResults).toBeDefined();
    expect(conflictResults).not.toBeNull();
    expect(Array.isArray(conflictResults)).toBe(true);

    // 検出された抵触パターン数が2件であることを検証
    expect(conflictResults.length).toBe(2);

    // 最初の抵触パターン（menu001）を検証
    expect(conflictResults[0]).toEqual({
      menuId: 'menu001',
      menuName: '鶏肉とエビの炒め物',
      conflictType: 'allergen_conflict',
      conflictContent: 'エビを完全に禁止',
      conflictAllergen: 'shrimp',
      conflictIngredientsFound: [
        { ingredientId: 'ing001', name: 'エビ', allergenCode: 'shrimp' }
      ],
      detectionTimestamp: expect.any(String),
      severity: 'high'
    });

    // 二番目の抵触パターン（menu003）を検証
    expect(conflictResults[1]).toEqual({
      menuId: 'menu003',
      menuName: '海老とナッツのサラダ',
      conflictType: 'allergen_conflict',
      conflictContent: 'エビを完全に禁止',
      conflictAllergen: 'shrimp',
      conflictIngredientsFound: [
        { ingredientId: 'ing008', name: 'エビ', allergenCode: 'shrimp' }
      ],
      detectionTimestamp: expect.any(String),
      severity: 'high'
    });

    // すべての抵触パターンが献立IDと抵触内容を含むことを検証
    conflictResults.forEach((conflict) => {
      expect(conflict.menuId).toBeDefined();
      expect(conflict.menuName).toBeDefined();
      expect(conflict.conflictContent).toBeDefined();
      expect(conflict.conflictAllergen).toBe('shrimp');
      expect(conflict.conflictIngredientsFound.length).toBeGreaterThan(0);
    });

    // 誤検出がないことを検証（menu002は検出対象外）
    const menu002ConflictCount = conflictResults.filter(
      (c) => c.menuId === 'menu002'
    ).length;
    expect(menu002ConflictCount).toBe(0);

    // 検出済みの献立IDが唯一である（重複がない）ことを検証
    const detectedMenuIds = conflictResults.map((c) => c.menuId);
    const uniqueMenuIds = new Set(detectedMenuIds);
    expect(uniqueMenuIds.size).toBe(detectedMenuIds.length);
  });
});