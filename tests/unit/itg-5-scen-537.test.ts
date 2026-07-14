import { detectConflictingMeals } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-537: [normal] 過去献立制限抵触検出機能 - 新規アレルギー登録時に該当食材を含む過去献立を抽出する
  test('新規アレルギー登録時に該当食材を含む過去献立をすべて検出・表示する', () => {
    const past_menus = [
      {
        menu_id: 'menu_001',
        menu_name: '親子丼',
        menu_date: '2024-01-10T18:00:00Z',
        ingredients: [
          { ingredient_id: 'ing_001', ingredient_name: '卵', quantity: 2, unit: '個' },
          { ingredient_id: 'ing_002', ingredient_name: '鶏肉', quantity: 150, unit: 'g' },
          { ingredient_id: 'ing_003', ingredient_name: '玉ねぎ', quantity: 100, unit: 'g' },
        ],
      },
      {
        menu_id: 'menu_002',
        menu_name: '魚のムニエル',
        menu_date: '2024-01-11T18:30:00Z',
        ingredients: [
          { ingredient_id: 'ing_004', ingredient_name: '白身魚', quantity: 180, unit: 'g' },
          { ingredient_id: 'ing_005', ingredient_name: 'バター', quantity: 20, unit: 'g' },
          { ingredient_id: 'ing_003', ingredient_name: '玉ねぎ', quantity: 50, unit: 'g' },
        ],
      },
      {
        menu_id: 'menu_003',
        menu_name: 'ケーキ',
        menu_date: '2024-01-12T15:00:00Z',
        ingredients: [
          { ingredient_id: 'ing_001', ingredient_name: '卵', quantity: 3, quantity_unit: '個' },
          { ingredient_id: 'ing_006', ingredient_name: '小麦粉', quantity: 200, unit: 'g' },
          { ingredient_id: 'ing_007', ingredient_name: '砂糖', quantity: 150, unit: 'g' },
        ],
      },
      {
        menu_id: 'menu_004',
        menu_name: 'サラダ',
        menu_date: '2024-01-13T12:00:00Z',
        ingredients: [
          { ingredient_id: 'ing_008', ingredient_name: 'レタス', quantity: 100, unit: 'g' },
          { ingredient_id: 'ing_009', ingredient_name: 'トマト', quantity: 150, unit: 'g' },
          { ingredient_id: 'ing_010', ingredient_name: 'きゅうり', quantity: 100, unit: 'g' },
        ],
      },
      {
        menu_id: 'menu_005',
        menu_name: 'タマゴサンドイッチ',
        menu_date: '2024-01-14T11:30:00Z',
        ingredients: [
          { ingredient_id: 'ing_001', ingredient_name: '卵', quantity: 2, unit: '個' },
          { ingredient_id: 'ing_011', ingredient_name: 'パン', quantity: 2, unit: '枚' },
          { ingredient_id: 'ing_012', ingredient_name: 'マヨネーズ', quantity: 30, unit: 'g' },
        ],
      },
    ];

    const new_allergy = {
      allergen_id: 'allergen_egg',
      allergen_name: '卵',
      ingredient_id: 'ing_001',
      ingredient_name: '卵',
      registration_date: '2024-01-15T09:00:00Z',
    };

    const result = detectConflictingMeals(past_menus, new_allergy);

    // 期待値: 卵を含む献立は3件 (menu_001, menu_003, menu_005)
    expect(result.conflicting_menus).toHaveLength(3);

    // 検出結果に献立日時、献立名、含有食材が正確に記載されているか確認
    expect(result.conflicting_menus[0]).toEqual({
      menu_id: 'menu_001',
      menu_name: '親子丼',
      menu_date: '2024-01-10T18:00:00Z',
      conflicting_ingredients: [
        {
          ingredient_id: 'ing_001',
          ingredient_name: '卵',
          quantity: 2,
          unit: '個',
        },
      ],
    });

    expect(result.conflicting_menus[1]).toEqual({
      menu_id: 'menu_003',
      menu_name: 'ケーキ',
      menu_date: '2024-01-12T15:00:00Z',
      conflicting_ingredients: [
        {
          ingredient_id: 'ing_001',
          ingredient_name: '卵',
          quantity: 3,
          unit: '個',
        },
      ],
    });

    expect(result.conflicting_menus[2]).toEqual({
      menu_id: 'menu_005',
      menu_name: 'タマゴサンドイッチ',
      menu_date: '2024-01-14T11:30:00Z',
      conflicting_ingredients: [
        {
          ingredient_id: 'ing_001',
          ingredient_name: '卵',
          quantity: 2,
          unit: '個',
        },
      ],
    });

    // 検出結果メタデータの確認
    expect(result.allergen_registered).toBe(true);
    expect(result.allergen_name).toBe('卵');
    expect(result.detection_timestamp).toBe('2024-01-15T09:00:00Z');
    expect(result.total_conflicting_count).toBe(3);
    expect(result.status).toBe('completed');
  });
});