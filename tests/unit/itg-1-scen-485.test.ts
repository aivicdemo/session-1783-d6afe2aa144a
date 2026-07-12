import { detectDietaryConflicts } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-485: [normal] 制限条件入力から献立反映の統合フロー
  test('制限条件入力から過去献立抵触検出、妥当性判定を経て次週献立に反映される', () => {
    // 前提: 過去献立履歴とユーザーの制限条件が存在する状態
    const past_meal_records = [
      {
        meal_id: 'meal_001',
        meal_date: '2024-01-08',
        dishes: [
          {
            dish_id: 'dish_001',
            dish_name: 'オムレツ',
            ingredients: ['卵', 'バター', '塩']
          },
          {
            dish_id: 'dish_002',
            dish_name: 'チーズサラダ',
            ingredients: ['チーズ', 'レタス', 'トマト']
          }
        ]
      },
      {
        meal_id: 'meal_002',
        meal_date: '2024-01-09',
        dishes: [
          {
            dish_id: 'dish_003',
            dish_name: 'ステーキ丼',
            ingredients: ['牛肉', 'ご飯', '玉ねぎ']
          },
          {
            dish_id: 'dish_004',
            dish_name: 'ミルク粥',
            ingredients: ['牛乳', 'お米', '砂糖']
          }
        ]
      },
      {
        meal_id: 'meal_003',
        meal_date: '2024-01-10',
        dishes: [
          {
            dish_id: 'dish_005',
            dish_name: 'ベジタリアン',
            ingredients: ['豆腐', 'ほうれん草', 'きのこ']
          }
        ]
      }
    ];

    // 新規入力された制限条件
    const new_restriction_input = {
      allergen_restrictions: ['卵', '乳製品'],
      nutrition_restrictions: ['高タンパク質'],
      dietary_style_restrictions: ['ベジタリアン'],
      input_timestamp: '2024-01-12T10:30:00Z',
      input_user_id: 'user_001'
    };

    // 関数実行: 制限条件と過去献立の抵触検出
    const conflict_detection_result = detectDietaryConflicts(
      past_meal_records,
      new_restriction_input
    );

    // 期待結果の検証
    // 1. 抵触検出されるべき献立の件数
    expect(conflict_detection_result.conflicting_meals_count).toBe(3);

    // 2. 抵触理由の分類（卵制限に抵触）
    expect(conflict_detection_result.conflict_details).toContainEqual(
      expect.objectContaining({
        meal_id: 'meal_001',
        conflict_reason: '卵',
        conflicting_dishes: ['dish_001'],
        severity_level: 'high'
      })
    );

    // 3. 抵触理由の分類（乳製品制限に抵触）
    expect(conflict_detection_result.conflict_details).toContainEqual(
      expect.objectContaining({
        meal_id: 'meal_001',
        conflict_reason: '乳製品',
        conflicting_dishes: ['dish_002'],
        severity_level: 'high'
      })
    );

    // 4. 抵触理由の分類（乳製品制限に抵触）
    expect(conflict_detection_result.conflict_details).toContainEqual(
      expect.objectContaining({
        meal_id: 'meal_002',
        conflict_reason: '乳製品',
        conflicting_dishes: ['dish_004'],
        severity_level: 'high'
      })
    );

    // 5. ベジタリアン制限とステーキの矛盾を検出
    expect(conflict_detection_result.conflict_details).toContainEqual(
      expect.objectContaining({
        meal_id: 'meal_002',
        conflict_reason: 'ベジタリアン',
        conflicting_dishes: ['dish_003'],
        severity_level: 'high'
      })
    );

    // 6. 妥当性判定フラグ: ベジタリアンながら肉を含む献立の矛盾
    expect(conflict_detection_result.conflict_details).toContainEqual(
      expect.objectContaining({
        meal_id: 'meal_002',
        conflict_reason: 'ベジタリアン',
        conflicting_dishes: ['dish_003'],
        severity_level: 'high'
      })
    );

    // 7. 過去献立meal_003は制限条件を満たしている（ベジタリアン）
    const meal_003_conflicts = conflict_detection_result.conflict_details.filter(
      (detail: any) => detail.meal_id === 'meal_003'
    );
    expect(meal_003_conflicts.length).toBe(0);

    // 8. 妥当性判定結果: 制限条件の矛盾チェック
    expect(conflict_detection_result.validity_check).toEqual({
      has_internal_contradiction: false,
      is_applicable_to_new_menu: true,
      compatibility_score: 85
    });

    // 9. 妥当性判定結果: 推奨アクション
    expect(conflict_detection_result.recommended_action).toBe('APPLY_WITH_REVIEW');

    // 10. 変更履歴ログの記録
    expect(conflict_detection_result.audit_log).toEqual({
      change_timestamp: '2024-01-12T10:30:00Z',
      changed_by_user_id: 'user_001',
      change_type: 'DIETARY_RESTRICTION_UPDATE',
      change_summary: 'allergen_restrictions, nutrition_restrictions, dietary_style_restrictions',
      conflicting_meals_detected: 3,
      status: 'LOGGED'
    });

    // 11. 次週献立への反映判定
    expect(conflict_detection_result.next_week_menu_generation).toEqual({
      should_regenerate: true,
      priority_constraints: [
        'allergen_exclusion:卵',
        'allergen_exclusion:乳製品',
        'nutrition_focus:高タンパク質',
        'dietary_style:ベジタリアン'
      ],
      regeneration_scheduled_for: '2024-01-15T00:00:00Z'
    });

    // 12. 制限条件が新規献立生成ロジックに反映されたか確認
    expect(conflict_detection_result.applied_to_algorithm).toBe(true);

    // 13. 献立登録ステータス
    expect(conflict_detection_result.menu_registration_status).toBe('REGISTERED_WITH_NEW_CONSTRAINTS');
  });
});