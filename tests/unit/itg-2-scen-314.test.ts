import { validateFamilyMemberAllergies } from '../../src/logic/it-1-br-2-1-1-1';

describe('栄養摂取量推移分析ダッシュボード - 家族成員アレルギー情報検証', () => {
  // SCEN-314
  test('家族成員のアレルギー情報が未登録の場合、エラーメッセージが返される', () => {
    const familyMemberId = 'fam_member_001';
    const userId = 'user_12345';
    const allergyData = {
      familyMemberId,
      userId,
      allergyRegistered: false,
      allergyItems: [],
      lastUpdatedAt: null,
    };

    expect(() => {
      validateFamilyMemberAllergies(allergyData);
    }).toThrow(/アレルギー情報/);
  });

  test('家族成員のアレルギー情報が登録済みの場合、処理が続行される', () => {
    const familyMemberId = 'fam_member_002';
    const userId = 'user_12345';
    const allergyData = {
      familyMemberId,
      userId,
      allergyRegistered: true,
      allergyItems: [
        { allergyId: 'allergy_001', allergyName: '卵', severity: 'high' },
      ],
      lastUpdatedAt: '2024-01-15T10:00:00Z',
    };

    const result = validateFamilyMemberAllergies(allergyData);

    expect(result).toEqual({
      isValid: true,
      familyMemberId,
      allergyCount: 1,
      validationTimestamp: expect.any(String),
    });
  });

  test('複数家族成員のうち1名のアレルギー情報が未登録の場合、その成員のエラーを検出する', () => {
    const familyMembersData = [
      {
        familyMemberId: 'fam_member_003',
        userId: 'user_12345',
        allergyRegistered: true,
        allergyItems: [
          { allergyId: 'allergy_002', allergyName: '小麦', severity: 'medium' },
        ],
        lastUpdatedAt: '2024-01-14T09:30:00Z',
      },
      {
        familyMemberId: 'fam_member_004',
        userId: 'user_12345',
        allergyRegistered: false,
        allergyItems: [],
        lastUpdatedAt: null,
      },
    ];

    expect(() => {
      validateFamilyMemberAllergies(familyMembersData[1]);
    }).toThrow(/アレルギー情報/);
  });

  test('アレルギー情報が空配列で登録済みの場合、処理が続行される', () => {
    const familyMemberId = 'fam_member_005';
    const userId = 'user_12345';
    const allergyData = {
      familyMemberId,
      userId,
      allergyRegistered: true,
      allergyItems: [],
      lastUpdatedAt: '2024-01-15T08:00:00Z',
    };

    const result = validateFamilyMemberAllergies(allergyData);

    expect(result).toEqual({
      isValid: true,
      familyMemberId,
      allergyCount: 0,
      validationTimestamp: expect.any(String),
    });
  });

  test('未登録状態でエラーが発生した場合、エラーコードと詳細情報が含まれる', () => {
    const familyMemberId = 'fam_member_006';
    const userId = 'user_12345';
    const allergyData = {
      familyMemberId,
      userId,
      allergyRegistered: false,
      allergyItems: [],
      lastUpdatedAt: null,
    };

    try {
      validateFamilyMemberAllergies(allergyData);
      fail('エラーがスローされるはずです');
    } catch (error: any) {
      expect(error.message).toMatch(/アレルギー情報/);
      expect(error.code).toBe('ALLERGY_NOT_REGISTERED');
      expect(error.familyMemberId).toBe(familyMemberId);
      expect(error.details).toContain('献立生成前に設定してください');
    }
  });

  test('複数のアレルギー情報が登録されている場合、すべてが検証対象に含まれる', () => {
    const familyMemberId = 'fam_member_007';
    const userId = 'user_12345';
    const allergyData = {
      familyMemberId,
      userId,
      allergyRegistered: true,
      allergyItems: [
        { allergyId: 'allergy_003', allergyName: '卵', severity: 'high' },
        { allergyId: 'allergy_004', allergyName: '乳製品', severity: 'medium' },
        { allergyId: 'allergy_005', allergyName: 'ナッツ類', severity: 'high' },
      ],
      lastUpdatedAt: '2024-01-15T11:00:00Z',
    };

    const result = validateFamilyMemberAllergies(allergyData);

    expect(result).toEqual({
      isValid: true,
      familyMemberId,
      allergyCount: 3,
      validationTimestamp: expect.any(String),
    });
  });
});