import { validateDietaryRestriction } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-459: [normal] 食事制限条件の入力妥当性判定機能 - 妥当な形式の食事制限条件が正常に受け入れられる
  test('妥当な形式の食事制限条件が受け入れられ、エラーメッセージが表示されずに正常に保存される', () => {
    const validRestriction1 = {
      userId: 'user_001',
      familyMemberId: 'member_001',
      restrictionType: 'allergy',
      restrictionValue: 'egg',
      restrictionLabel: '卵アレルギー',
      timestamp: new Date('2024-01-15T11:00:00Z'),
    };

    const result1 = validateDietaryRestriction(validRestriction1);

    expect(result1).toEqual({
      isValid: true,
      errors: [],
      restriction: {
        userId: 'user_001',
        familyMemberId: 'member_001',
        restrictionType: 'allergy',
        restrictionValue: 'egg',
        restrictionLabel: '卵アレルギー',
        timestamp: new Date('2024-01-15T11:00:00Z'),
      },
    });

    const validRestriction2 = {
      userId: 'user_002',
      familyMemberId: 'member_002',
      restrictionType: 'calorie_limit',
      restrictionValue: '2000',
      restrictionLabel: 'カロリー上限 2000kcal',
      timestamp: new Date('2024-01-15T12:30:00Z'),
    };

    const result2 = validateDietaryRestriction(validRestriction2);

    expect(result2).toEqual({
      isValid: true,
      errors: [],
      restriction: {
        userId: 'user_002',
        familyMemberId: 'member_002',
        restrictionType: 'calorie_limit',
        restrictionValue: '2000',
        restrictionLabel: 'カロリー上限 2000kcal',
        timestamp: new Date('2024-01-15T12:30:00Z'),
      },
    });

    const validRestriction3 = {
      userId: 'user_003',
      familyMemberId: 'member_003',
      restrictionType: 'religious',
      restrictionValue: 'halal',
      restrictionLabel: 'ハラール',
      timestamp: new Date('2024-01-15T14:00:00Z'),
    };

    const result3 = validateDietaryRestriction(validRestriction3);

    expect(result3).toEqual({
      isValid: true,
      errors: [],
      restriction: {
        userId: 'user_003',
        familyMemberId: 'member_003',
        restrictionType: 'religious',
        restrictionValue: 'halal',
        restrictionLabel: 'ハラール',
        timestamp: new Date('2024-01-15T14:00:00Z'),
      },
    });

    // Edge case: 複数のアレルギーを持つ場合
    const validRestriction4 = {
      userId: 'user_004',
      familyMemberId: 'member_004',
      restrictionType: 'multiple_allergies',
      restrictionValue: 'egg,milk,peanut',
      restrictionLabel: '卵、牛乳、ピーナッツアレルギー',
      timestamp: new Date('2024-01-15T15:45:00Z'),
    };

    const result4 = validateDietaryRestriction(validRestriction4);

    expect(result4).toEqual({
      isValid: true,
      errors: [],
      restriction: {
        userId: 'user_004',
        familyMemberId: 'member_004',
        restrictionType: 'multiple_allergies',
        restrictionValue: 'egg,milk,peanut',
        restrictionLabel: '卵、牛乳、ピーナッツアレルギー',
        timestamp: new Date('2024-01-15T15:45:00Z'),
      },
    });

    // Edge case: 範囲指定のカロリー制限
    const validRestriction5 = {
      userId: 'user_005',
      familyMemberId: 'member_005',
      restrictionType: 'calorie_range',
      restrictionValue: '1500-2000',
      restrictionLabel: 'カロリー範囲 1500-2000kcal',
      timestamp: new Date('2024-01-15T16:20:00Z'),
    };

    const result5 = validateDietaryRestriction(validRestriction5);

    expect(result5).toEqual({
      isValid: true,
      errors: [],
      restriction: {
        userId: 'user_005',
        familyMemberId: 'member_005',
        restrictionType: 'calorie_range',
        restrictionValue: '1500-2000',
        restrictionLabel: 'カロリー範囲 1500-2000kcal',
        timestamp: new Date('2024-01-15T16:20:00Z'),
      },
    });

    // 無効な形式のテスト: userId が空文字列
    const invalidRestriction1 = {
      userId: '',
      familyMemberId: 'member_001',
      restrictionType: 'allergy',
      restrictionValue: 'egg',
      restrictionLabel: '卵アレルギー',
      timestamp: new Date('2024-01-15T11:00:00Z'),
    };

    const resultInvalid1 = validateDietaryRestriction(invalidRestriction1);

    expect(resultInvalid1.isValid).toBe(false);
    expect(resultInvalid1.errors).toContain('ユーザーID');

    // 無効な形式のテスト: restrictionValue が空文字列
    const invalidRestriction2 = {
      userId: 'user_001',
      familyMemberId: 'member_001',
      restrictionType: 'allergy',
      restrictionValue: '',
      restrictionLabel: '卵アレルギー',
      timestamp: new Date('2024-01-15T11:00:00Z'),
    };

    const resultInvalid2 = validateDietaryRestriction(invalidRestriction2);

    expect(resultInvalid2.isValid).toBe(false);
    expect(resultInvalid2.errors).toContain('制限値');

    // 無効な形式のテスト: 不正な restrictionType
    const invalidRestriction3 = {
      userId: 'user_001',
      familyMemberId: 'member_001',
      restrictionType: 'invalid_type',
      restrictionValue: 'egg',
      restrictionLabel: '卵アレルギー',
      timestamp: new Date('2024-01-15T11:00:00Z'),
    };

    const resultInvalid3 = validateDietaryRestriction(invalidRestriction3);

    expect(resultInvalid3.isValid).toBe(false);
    expect(resultInvalid3.errors).toContain('制限タイプ');

    // 無効な形式のテスト: timestamp が無効な日時
    const invalidRestriction4 = {
      userId: 'user_001',
      familyMemberId: 'member_001',
      restrictionType: 'allergy',
      restrictionValue: 'egg',
      restrictionLabel: '卵アレルギー',
      timestamp: new Date('invalid-date'),
    };

    const resultInvalid4 = validateDietaryRestriction(invalidRestriction4);

    expect(resultInvalid4.isValid).toBe(false);
    expect(resultInvalid4.errors).toContain('日時');
  });
});