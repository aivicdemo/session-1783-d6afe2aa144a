import { detectConflictingMenusAndPrioritizeRestrictions } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-464
  test('複数食事制限条件の優先度自動判定機能 - 2件以上の制限条件の優先度が過去献立との抵触リスク順に自動判定される', () => {
    const user_id = 'user_001';
    const family_member_ids = ['fm_001', 'fm_002'];
    
    // 過去30日間の献立履歴データ
    const past_menus = [
      {
        menu_id: 'menu_001',
        date: '2024-12-01',
        dishes: [
          { dish_id: 'dish_001', name: '卵焼き', ingredients: ['egg', 'salt'] },
          { dish_id: 'dish_002', name: 'サラダ', ingredients: ['lettuce', 'olive_oil'] }
        ]
      },
      {
        menu_id: 'menu_002',
        date: '2024-12-05',
        dishes: [
          { dish_id: 'dish_003', name: 'オムライス', ingredients: ['egg', 'rice', 'salt'] },
          { dish_id: 'dish_004', name: 'チキンソテー', ingredients: ['chicken', 'salt'] }
        ]
      },
      {
        menu_id: 'menu_003',
        date: '2024-12-10',
        dishes: [
          { dish_id: 'dish_005', name: 'サーモン塩焼き', ingredients: ['salmon', 'salt'] },
          { dish_id: 'dish_006', name: 'ステーキ', ingredients: ['beef', 'salt'] }
        ]
      },
      {
        menu_id: 'menu_004',
        date: '2024-12-15',
        dishes: [
          { dish_id: 'dish_007', name: '野菜スープ', ingredients: ['carrot', 'onion', 'water'] },
          { dish_id: 'dish_008', name: 'ポテトサラダ', ingredients: ['potato', 'mayonnaise'] }
        ]
      },
      {
        menu_id: 'menu_005',
        date: '2024-12-20',
        dishes: [
          { dish_id: 'dish_009', name: '味噌汁', ingredients: ['miso', 'salt', 'tofu'] },
          { dish_id: 'dish_010', name: 'フライドチキン', ingredients: ['chicken', 'salt'] }
        ]
      }
    ];

    // 新規登録する複数の食事制限条件
    const new_restrictions = [
      {
        restriction_id: 'rest_001',
        restriction_type: 'allergy',
        restriction_name: 'egg_allergy',
        restricted_ingredients: ['egg'],
        severity: 'high',
        description: '卵アレルギー'
      },
      {
        restriction_id: 'rest_002',
        restriction_type: 'dietary_preference',
        restriction_name: 'vegetarian',
        restricted_ingredients: ['chicken', 'beef', 'salmon', 'fish', 'meat'],
        severity: 'medium',
        description: 'ベジタリアン'
      },
      {
        restriction_id: 'rest_003',
        restriction_type: 'medical_restriction',
        restriction_name: 'salt_limit',
        restricted_ingredients: ['salt'],
        severity: 'medium',
        description: '塩分制限'
      }
    ];

    // 関数を呼び出し
    const result = detectConflictingMenusAndPrioritizeRestrictions({
      user_id: user_id,
      family_member_ids: family_member_ids,
      past_menus: past_menus,
      new_restrictions: new_restrictions,
      analysis_period_days: 30
    });

    // 検証: 過去献立との抵触リスク度の計算
    // 卵アレルギー: menu_001, menu_002に抵触 (2/5 = 40%)
    // ベジタリアン: menu_002, menu_003, menu_005に抵触 (3/5 = 60%)
    // 塩分制限: menu_001, menu_002, menu_003, menu_005に抵触 (4/5 = 80%)
    
    expect(result.prioritized_restrictions).toHaveLength(3);
    
    // 最優先: 塩分制限（リスク度 80%）
    expect(result.prioritized_restrictions[0]).toEqual({
      restriction_id: 'rest_003',
      restriction_name: 'salt_limit',
      priority_rank: 1,
      conflict_risk_percentage: 80,
      conflicting_menu_count: 4,
      total_past_menu_count: 5
    });

    // 第2優先: ベジタリアン（リスク度 60%）
    expect(result.prioritized_restrictions[1]).toEqual({
      restriction_id: 'rest_002',
      restriction_name: 'vegetarian',
      priority_rank: 2,
      conflict_risk_percentage: 60,
      conflicting_menu_count: 3,
      total_past_menu_count: 5
    });

    // 第3優先: 卵アレルギー（リスク度 40%）
    expect(result.prioritized_restrictions[2]).toEqual({
      restriction_id: 'rest_001',
      restriction_name: 'egg_allergy',
      priority_rank: 3,
      conflict_risk_percentage: 40,
      conflicting_menu_count: 2,
      total_past_menu_count: 5
    });

    // 検証: 抵触した献立一覧
    expect(result.conflicting_menus).toEqual({
      rest_001: ['menu_001', 'menu_002'],
      rest_002: ['menu_002', 'menu_003', 'menu_005'],
      rest_003: ['menu_001', 'menu_002', 'menu_003', 'menu_005']
    });

    // 検証: 生成される献立が優先度順に制限条件を適用
    // 優先度1（塩分制限）→ 優先度2（ベジタリアン）→ 優先度3（卵アレルギー）の順で適用
    expect(result.generated_menu).toEqual({
      menu_id: expect.any(String),
      dishes: expect.arrayContaining([
        expect.objectContaining({
          name: expect.any(String),
          ingredients: expect.not.arrayContaining(['salt', 'egg', 'chicken', 'beef', 'salmon'])
        })
      ]),
      applied_restrictions_order: ['rest_003', 'rest_002', 'rest_001'],
      satisfies_all_restrictions: true,
      duplicate_menu_count: 0
    });

    // 検証: 全制限条件の充足確認
    expect(result.generated_menu.satisfies_all_restrictions).toBe(true);
    
    // 検証: 過去献立との重複最小化
    expect(result.generated_menu.duplicate_menu_count).toBe(0);
    
    // 検証: 優先度判定ロジックの妥当性
    expect(result.priority_calculation_method).toBe('conflict_risk_percentage_desc');
    expect(result.analysis_timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });
});