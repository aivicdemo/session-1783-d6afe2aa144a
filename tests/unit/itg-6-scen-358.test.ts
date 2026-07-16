import { classifyUserSegmentByFamilyComposition } from '../../src/logic/it-1-br-8-2-1-1';

describe('ユーザーセグメント別の利用パターン分析ダッシュボード', () => {
  // SCEN-358: [edge] 専業主夫層セグメント分類基準定義機能 - 家族構成が1人世帯から複数世帯の境界線において、正確に分類される
  test('家族構成の境界値において、1人世帯と複数世帯が正確に分類される', () => {
    // 1人世帯のテストケース
    const singleHouseholdProfile = {
      user_id: 'user_001',
      family_member_count: 1,
      household_type: 'single',
      age_group: '30-39',
      dietary_restrictions_count: 0,
    };

    const singleHouseholdResult = classifyUserSegmentByFamilyComposition(singleHouseholdProfile);
    expect(singleHouseholdResult.segment).toBe('1人世帯');
    expect(singleHouseholdResult.classification_accuracy).toBe(1.0);
    expect(singleHouseholdResult.boundary_classification).toBe(false);

    // 2人世帯（配偶者+本人）のテストケース：境界値
    const twoPersonHouseholdProfile = {
      user_id: 'user_002',
      family_member_count: 2,
      household_type: 'couple',
      age_group: '30-39',
      dietary_restrictions_count: 1,
    };

    const twoPersonHouseholdResult = classifyUserSegmentByFamilyComposition(twoPersonHouseholdProfile);
    expect(twoPersonHouseholdResult.segment).toBe('複数世帯');
    expect(twoPersonHouseholdResult.classification_accuracy).toBe(1.0);
    expect(twoPersonHouseholdResult.boundary_classification).toBe(true);

    // 3人世帯以上のテストケース
    const threePersonHouseholdProfile = {
      user_id: 'user_003',
      family_member_count: 3,
      household_type: 'family',
      age_group: '30-39',
      dietary_restrictions_count: 2,
    };

    const threePersonHouseholdResult = classifyUserSegmentByFamilyComposition(threePersonHouseholdProfile);
    expect(threePersonHouseholdResult.segment).toBe('複数世帯');
    expect(threePersonHouseholdResult.classification_accuracy).toBe(1.0);
    expect(threePersonHouseholdResult.boundary_classification).toBe(false);

    // 4人世帯のテストケース
    const fourPersonHouseholdProfile = {
      user_id: 'user_004',
      family_member_count: 4,
      household_type: 'family',
      age_group: '35-44',
      dietary_restrictions_count: 3,
    };

    const fourPersonHouseholdResult = classifyUserSegmentByFamilyComposition(fourPersonHouseholdProfile);
    expect(fourPersonHouseholdResult.segment).toBe('複数世帯');
    expect(fourPersonHouseholdResult.classification_accuracy).toBe(1.0);
    expect(fourPersonHouseholdResult.boundary_classification).toBe(false);

    // 境界値検証：分類ロジックの整合性確認
    const boundaryValidation = {
      single_household_boundary: singleHouseholdResult.segment === '1人世帯',
      two_person_boundary: twoPersonHouseholdResult.segment === '複数世帯',
      multiple_household_consistency:
        threePersonHouseholdResult.segment === '複数世帯' &&
        fourPersonHouseholdResult.segment === '複数世帯',
    };

    expect(boundaryValidation.single_household_boundary).toBe(true);
    expect(boundaryValidation.two_person_boundary).toBe(true);
    expect(boundaryValidation.multiple_household_consistency).toBe(true);

    // 誤分類検証
    expect(singleHouseholdResult.segment).not.toBe('複数世帯');
    expect(twoPersonHouseholdResult.segment).not.toBe('1人世帯');
    expect(threePersonHouseholdResult.segment).not.toBe('1人世帯');
    expect(fourPersonHouseholdResult.segment).not.toBe('1人世帯');

    // 分類基準の境界線（1人と2人の分岐点）が正確に機能していることを確認
    expect(singleHouseholdResult.family_member_count_threshold).toBe(1);
    expect(twoPersonHouseholdResult.family_member_count_threshold).toBe(2);
  });
});