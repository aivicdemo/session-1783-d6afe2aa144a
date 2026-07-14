import { classifyUserSegment } from '../../src/logic/it-7-2-1';

describe('セグメント別効果分析 - ユーザーセグメント分類', () => {
  // SCEN-597: [edge] セグメント分類基準（年代・家族構成・食材制限有無）の複合条件境界値で正しくユーザーを分類できる
  test('SCEN-597: 年代・家族構成・食材制限有無の複合条件境界値でユーザーを正しく分類', () => {
    // テストデータ: 年代境界値ユーザー
    const age_boundaries = [
      { userId: 'u_age_18', age: 18, familyStructure: 'single', dietaryRestrictions: 'none' },
      { userId: 'u_age_19', age: 19, familyStructure: 'single', dietaryRestrictions: 'none' },
      { userId: 'u_age_29', age: 29, familyStructure: 'single', dietaryRestrictions: 'none' },
      { userId: 'u_age_30', age: 30, familyStructure: 'single', dietaryRestrictions: 'none' },
      { userId: 'u_age_59', age: 59, familyStructure: 'single', dietaryRestrictions: 'none' },
      { userId: 'u_age_60', age: 60, familyStructure: 'single', dietaryRestrictions: 'none' },
      { userId: 'u_age_65', age: 65, familyStructure: 'single', dietaryRestrictions: 'none' },
    ];

    // テストデータ: 家族構成ユーザー
    const family_structures = [
      { userId: 'u_fam_single', age: 35, familyStructure: 'single', dietaryRestrictions: 'none' },
      { userId: 'u_fam_couple', age: 35, familyStructure: 'couple', dietaryRestrictions: 'none' },
      { userId: 'u_fam_parent_child', age: 35, familyStructure: 'parent_child', dietaryRestrictions: 'none' },
      { userId: 'u_fam_multi_gen', age: 35, familyStructure: 'multi_generation', dietaryRestrictions: 'none' },
    ];

    // テストデータ: 食材制限有無ユーザー
    const dietary_restrictions = [
      { userId: 'u_diet_none', age: 35, familyStructure: 'couple', dietaryRestrictions: 'none' },
      { userId: 'u_diet_allergy', age: 35, familyStructure: 'couple', dietaryRestrictions: 'allergy' },
      { userId: 'u_diet_religious', age: 35, familyStructure: 'couple', dietaryRestrictions: 'religious' },
      { userId: 'u_diet_other', age: 35, familyStructure: 'couple', dietaryRestrictions: 'other' },
    ];

    // テストデータ: 複合条件パターン（サンプル）
    const combined_patterns = [
      { userId: 'u_combo_18_single_none', age: 18, familyStructure: 'single', dietaryRestrictions: 'none' },
      { userId: 'u_combo_30_couple_allergy', age: 30, familyStructure: 'couple', dietaryRestrictions: 'allergy' },
      { userId: 'u_combo_60_parent_child_religious', age: 60, familyStructure: 'parent_child', dietaryRestrictions: 'religious' },
      { userId: 'u_combo_29_multi_gen_other', age: 29, familyStructure: 'multi_generation', dietaryRestrictions: 'other' },
      { userId: 'u_combo_65_single_allergy', age: 65, familyStructure: 'single', dietaryRestrictions: 'allergy' },
    ];

    const all_test_users = [
      ...age_boundaries,
      ...family_structures,
      ...dietary_restrictions,
      ...combined_patterns,
    ];

    // 実行: セグメント分類ロジックを実行
    const results = all_test_users.map(user =>
      classifyUserSegment({
        userId: user.userId,
        age: user.age,
        familyStructure: user.familyStructure,
        dietaryRestrictions: user.dietaryRestrictions,
      })
    );

    // 検証1: すべてのユーザーが分類されていることを確認
    expect(results).toHaveLength(all_test_users.length);
    results.forEach((result, idx) => {
      expect(result).toBeDefined();
      expect(result.userId).toBe(all_test_users[idx].userId);
      expect(result.segment).toBeDefined();
      expect(typeof result.segment).toBe('string');
    });

    // 検証2: 年代境界値での分類一貫性
    // 期待: 18-28歳 → youth, 29-59歳 → middle, 60+歳 → senior
    const age_18_result = results.find(r => r.userId === 'u_age_18');
    const age_19_result = results.find(r => r.userId === 'u_age_19');
    const age_29_result = results.find(r => r.userId === 'u_age_29');
    const age_30_result = results.find(r => r.userId === 'u_age_30');
    const age_59_result = results.find(r => r.userId === 'u_age_59');
    const age_60_result = results.find(r => r.userId === 'u_age_60');
    const age_65_result = results.find(r => r.userId === 'u_age_65');

    // 18-28歳はyouthセグメント
    expect(age_18_result!.segment).toContain('youth');
    expect(age_19_result!.segment).toContain('youth');
    
    // 29-59歳はmiddleセグメント
    expect(age_29_result!.segment).toContain('middle');
    expect(age_30_result!.segment).toContain('middle');
    expect(age_59_result!.segment).toContain('middle');
    
    // 60+歳はseniorセグメント
    expect(age_60_result!.segment).toContain('senior');
    expect(age_65_result!.segment).toContain('senior');

    // 検証3: 家族構成による分類
    // 期待: single → single_household, couple → couple, parent_child → family_with_children, multi_generation → extended_family
    const fam_single = results.find(r => r.userId === 'u_fam_single');
    const fam_couple = results.find(r => r.userId === 'u_fam_couple');
    const fam_parent_child = results.find(r => r.userId === 'u_fam_parent_child');
    const fam_multi_gen = results.find(r => r.userId === 'u_fam_multi_gen');

    expect(fam_single!.segment).toContain('single_household');
    expect(fam_couple!.segment).toContain('couple');
    expect(fam_parent_child!.segment).toContain('family_with_children');
    expect(fam_multi_gen!.segment).toContain('extended_family');

    // 検証4: 食材制限有無による分類
    // 期待: none → unrestricted, allergy → allergy_aware, religious → religious_restriction, other → other_restriction
    const diet_none = results.find(r => r.userId === 'u_diet_none');
    const diet_allergy = results.find(r => r.userId === 'u_diet_allergy');
    const diet_religious = results.find(r => r.userId === 'u_diet_religious');
    const diet_other = results.find(r => r.userId === 'u_diet_other');

    expect(diet_none!.segment).toContain('unrestricted');
    expect(diet_allergy!.segment).toContain('allergy_aware');
    expect(diet_religious!.segment).toContain('religious_restriction');
    expect(diet_other!.segment).toContain('other_restriction');

    // 検証5: 複合条件での分類（例：30歳・夫婦・アレルギー）
    const combo_30_couple_allergy = results.find(r => r.userId === 'u_combo_30_couple_allergy');
    expect(combo_30_couple_allergy!.segment).toEqual('middle_couple_allergy_aware');

    // 検証6: 複合条件での分類（例：60歳・親子・宗教的制限）
    const combo_60_parent_child_religious = results.find(r => r.userId === 'u_combo_60_parent_child_religious');
    expect(combo_60_parent_child_religious!.segment).toEqual('senior_family_with_children_religious_restriction');

    // 検証7: 複合条件での分類（例：65歳・単身・アレルギー）
    const combo_65_single_allergy = results.find(r => r.userId === 'u_combo_65_single_allergy');
    expect(combo_65_single_allergy!.segment).toEqual('senior_single_household_allergy_aware');

    // 検証8: ユーザーの重複分類がないことを確認（各ユーザーは1つのセグメントにのみ分類）
    results.forEach(result => {
      const segment_parts = result.segment.split('_');
      // 同じセグメント部分が重複していないか確認
      const unique_parts = new Set(segment_parts);
      expect(unique_parts.size).toBe(segment_parts.length);
    });

    // 検証9: すべてのユーザーが1つ以上のセグメント特性を持つことを確認
    results.forEach(result => {
      const has_age_segment = result.segment.includes('youth') || 
                             result.segment.includes('middle') || 
                             result.segment.includes('senior');
      expect(has_age_segment).toBe(true);
    });

    // 検証10: 境界値を跨ぐケースでの分類一貫性
    // 29歳と30歳でセグメントが異なることを確認（異なる年代グループ）
    const boundary_29 = results.find(r => r.userId === 'u_age_29');
    const boundary_30 = results.find(r => r.userId === 'u_age_30');
    expect(boundary_29!.segment).not.toEqual(boundary_30!.segment);
    expect(boundary_29!.segment).toContain('middle');
    expect(boundary_30!.segment).toContain('middle');

    // 59歳と60歳でセグメントが異なることを確認（異なる年代グループ）
    const boundary_59 = results.find(r => r.userId === 'u_age_59');
    const boundary_60 = results.find(r => r.userId === 'u_age_60');
    expect(boundary_59!.segment).not.toEqual(boundary_60!.segment);
    expect(boundary_59!.segment).toContain('middle');
    expect(boundary_60!.segment).toContain('senior');

    // 検証11: すべての複合条件パターンが漏れなく分類されていることを確認
    const unclassified_users = all_test_users.filter(user => {
      const result = results.find(r => r.userId === user.userId);
      return !result || !result.segment;
    });
    expect(unclassified_users).toHaveLength(0);

    // 検証12: セグメント分類の形式が正しいことを確認（形式: age_family_restriction）
    results.forEach(result => {
      const valid_format = /^(youth|middle|senior)_(single_household|couple|family_with_children|extended_family)_(unrestricted|allergy_aware|religious_restriction|other_restriction)$/.test(result.segment);
      expect(valid_format).toBe(true);
    });
  });
});