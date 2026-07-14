import { generateMenuWithConstraints } from '../../src/logic/it-7-2-1';

describe('献立生成のアルゴリズム改善効果検証ダッシュボード', () => {
  // SCEN-528
  test('手動ボタン押下時に家族の食事制限・アレルギー情報を正常に読み込んで献立生成を開始する', () => {
    const family_member_id = 'FM001';
    const user_id = 'USR001';
    const generation_request_type = 'manual';
    const timestamp = new Date('2024-01-15T14:30:00Z');

    const family_constraints = {
      food_restrictions: [
        { restriction_id: 'FR001', restriction_name: 'ピーナッツ不可', restriction_type: 'allergen' },
        { restriction_id: 'FR002', restriction_name: 'グルテン不可', restriction_type: 'allergen' },
      ],
      allergy_info: [
        { allergy_id: 'AL001', allergen_name: 'エビ', severity: 'high' },
        { allergy_id: 'AL002', allergen_name: 'そば', severity: 'medium' },
      ],
      age_group: '30-40',
      household_size: 4,
    };

    const menu_generation_request = {
      user_id,
      family_member_id,
      request_type: generation_request_type,
      timestamp,
      constraints: family_constraints,
    };

    const generated_menu_candidates = [
      {
        menu_id: 'MN001',
        menu_name: '和風ハンバーグ定食',
        dishes: ['ハンバーグ', 'ご飯', 'みそ汁', 'サラダ'],
        preparation_time_minutes: 35,
        nutrition_score: 85,
        is_constraint_compliant: true,
        excluded_allergens: ['ピーナッツ', 'グルテン', 'エビ', 'そば'],
      },
      {
        menu_id: 'MN002',
        menu_name: 'チキンカレー',
        dishes: ['カレーライス', 'ラッキョウ', 'サラダ'],
        preparation_time_minutes: 40,
        nutrition_score: 78,
        is_constraint_compliant: true,
        excluded_allergens: ['ピーナッツ', 'グルテン', 'エビ', 'そば'],
      },
    ];

    const result = generateMenuWithConstraints(menu_generation_request);

    expect(result).toEqual({
      generation_request_id: expect.any(String),
      user_id,
      family_member_id,
      request_type: generation_request_type,
      request_timestamp: timestamp,
      constraints_loaded: {
        food_restrictions_count: 2,
        allergy_info_count: 2,
        age_group: '30-40',
        household_size: 4,
      },
      generation_status: 'completed',
      menu_candidates_count: 2,
      menu_candidates: generated_menu_candidates,
      filtering_applied: true,
      excluded_dishes: [],
      generation_completed_at: expect.any(Date),
      compliance_verification: {
        all_candidates_compliant: true,
        restricted_allergens_excluded: ['ピーナッツ', 'グルテン', 'エビ', 'そば'],
        non_compliant_menus: [],
      },
    });

    expect(result.generation_status).toBe('completed');
    expect(result.menu_candidates_count).toBe(2);
    expect(result.filtering_applied).toBe(true);
    expect(result.compliance_verification.all_candidates_compliant).toBe(true);

    result.menu_candidates.forEach((menu) => {
      expect(menu.is_constraint_compliant).toBe(true);
      expect(menu.excluded_allergens).toEqual(
        expect.arrayContaining(['ピーナッツ', 'グルテン', 'エビ', 'そば'])
      );
    });

    expect(result.menu_candidates[0].menu_name).toBe('和風ハンバーグ定食');
    expect(result.menu_candidates[0].preparation_time_minutes).toBe(35);
    expect(result.menu_candidates[0].nutrition_score).toBe(85);

    expect(result.menu_candidates[1].menu_name).toBe('チキンカレー');
    expect(result.menu_candidates[1].preparation_time_minutes).toBe(40);
    expect(result.menu_candidates[1].nutrition_score).toBe(78);
  });
});