import { calculateFamilySatisfactionScore } from '../../src/logic/it-1-1-1';

describe('家族成員の食事評価履歴とアレルギー・食事制限情報の変更監視と献立生成反映', () => {
  // SCEN-448
  test('アルゴリズム改善効果の定量比較機能 - 家族満足度スコアが複数家族成員の平均値として算出される', () => {
    // テストケース1: 3名の家族成員、異なる満足度スコア
    const familyGroup1 = {
      familyId: 'family_001',
      mealProposalId: 'meal_proposal_001',
      familyMembers: [
        {
          memberId: 'member_001',
          name: 'Father',
          satisfactionScore: 5,
          timestamp: new Date('2024-01-15T18:30:00Z'),
        },
        {
          memberId: 'member_002',
          name: 'Mother',
          satisfactionScore: 4,
          timestamp: new Date('2024-01-15T18:35:00Z'),
        },
        {
          memberId: 'member_003',
          name: 'Child',
          satisfactionScore: 1,
          timestamp: new Date('2024-01-15T18:40:00Z'),
        },
      ],
    };

    const result1 = calculateFamilySatisfactionScore(familyGroup1);
    // 期待値: (5 + 4 + 1) / 3 = 10 / 3 = 3.33 (小数点第2位まで)
    expect(result1.averageScore).toBe(3.33);
    expect(result1.familyId).toBe('family_001');
    expect(result1.mealProposalId).toBe('meal_proposal_001');
    expect(result1.memberCount).toBe(3);

    // テストケース2: 4名の家族成員、小数点計算精度検証
    const familyGroup2 = {
      familyId: 'family_002',
      mealProposalId: 'meal_proposal_002',
      familyMembers: [
        {
          memberId: 'member_004',
          name: 'GrandFather',
          satisfactionScore: 3,
          timestamp: new Date('2024-01-16T19:00:00Z'),
        },
        {
          memberId: 'member_005',
          name: 'GrandMother',
          satisfactionScore: 4,
          timestamp: new Date('2024-01-16T19:05:00Z'),
        },
        {
          memberId: 'member_006',
          name: 'Parent1',
          satisfactionScore: 5,
          timestamp: new Date('2024-01-16T19:10:00Z'),
        },
        {
          memberId: 'member_007',
          name: 'Parent2',
          satisfactionScore: 2,
          timestamp: new Date('2024-01-16T19:15:00Z'),
        },
      ],
    };

    const result2 = calculateFamilySatisfactionScore(familyGroup2);
    // 期待値: (3 + 4 + 5 + 2) / 4 = 14 / 4 = 3.50
    expect(result2.averageScore).toBe(3.50);
    expect(result2.memberCount).toBe(4);

    // テストケース3: 全員が同じスコアの場合
    const familyGroup3 = {
      familyId: 'family_003',
      mealProposalId: 'meal_proposal_003',
      familyMembers: [
        {
          memberId: 'member_008',
          name: 'Person1',
          satisfactionScore: 4,
          timestamp: new Date('2024-01-17T20:00:00Z'),
        },
        {
          memberId: 'member_009',
          name: 'Person2',
          satisfactionScore: 4,
          timestamp: new Date('2024-01-17T20:05:00Z'),
        },
        {
          memberId: 'member_010',
          name: 'Person3',
          satisfactionScore: 4,
          timestamp: new Date('2024-01-17T20:10:00Z'),
        },
      ],
    };

    const result3 = calculateFamilySatisfactionScore(familyGroup3);
    // 期待値: (4 + 4 + 4) / 3 = 12 / 3 = 4.00
    expect(result3.averageScore).toBe(4.00);
    expect(result3.memberCount).toBe(3);

    // テストケース4: 小数点第2位で四捨五入が必要な場合
    const familyGroup4 = {
      familyId: 'family_004',
      mealProposalId: 'meal_proposal_004',
      familyMembers: [
        {
          memberId: 'member_011',
          name: 'User1',
          satisfactionScore: 5,
          timestamp: new Date('2024-01-18T21:00:00Z'),
        },
        {
          memberId: 'member_012',
          name: 'User2',
          satisfactionScore: 4,
          timestamp: new Date('2024-01-18T21:05:00Z'),
        },
        {
          memberId: 'member_013',
          name: 'User3',
          satisfactionScore: 3,
          timestamp: new Date('2024-01-18T21:10:00Z'),
        },
      ],
    };

    const result4 = calculateFamilySatisfactionScore(familyGroup4);
    // 期待値: (5 + 4 + 3) / 3 = 12 / 3 = 4.00
    expect(result4.averageScore).toBe(4.00);

    // テストケース5: 異なる家族グループでも同じ計算ロジックが適用されることを確認
    const familyGroup5 = {
      familyId: 'family_005',
      mealProposalId: 'meal_proposal_005',
      familyMembers: [
        {
          memberId: 'member_014',
          name: 'TestUser1',
          satisfactionScore: 2,
          timestamp: new Date('2024-01-19T18:00:00Z'),
        },
        {
          memberId: 'member_015',
          name: 'TestUser2',
          satisfactionScore: 3,
          timestamp: new Date('2024-01-19T18:05:00Z'),
        },
        {
          memberId: 'member_016',
          name: 'TestUser3',
          satisfactionScore: 4,
          timestamp: new Date('2024-01-19T18:10:00Z'),
        },
        {
          memberId: 'member_017',
          name: 'TestUser4',
          satisfactionScore: 5,
          timestamp: new Date('2024-01-19T18:15:00Z'),
        },
        {
          memberId: 'member_018',
          name: 'TestUser5',
          satisfactionScore: 1,
          timestamp: new Date('2024-01-19T18:20:00Z'),
        },
      ],
    };

    const result5 = calculateFamilySatisfactionScore(familyGroup5);
    // 期待値: (2 + 3 + 4 + 5 + 1) / 5 = 15 / 5 = 3.00
    expect(result5.averageScore).toBe(3.00);
    expect(result5.memberCount).toBe(5);

    // エラーケース: 空の家族成員リスト
    const emptyFamilyGroup = {
      familyId: 'family_empty',
      mealProposalId: 'meal_proposal_empty',
      familyMembers: [],
    };

    expect(() => calculateFamilySatisfactionScore(emptyFamilyGroup)).toThrow(/家族成員/);

    // エラーケース: 不正なスコア値 (範囲外)
    const invalidScoreFamilyGroup = {
      familyId: 'family_invalid',
      mealProposalId: 'meal_proposal_invalid',
      familyMembers: [
        {
          memberId: 'member_invalid',
          name: 'InvalidUser',
          satisfactionScore: 6,
          timestamp: new Date('2024-01-20T18:00:00Z'),
        },
      ],
    };

    expect(() => calculateFamilySatisfactionScore(invalidScoreFamilyGroup)).toThrow(/満足度/);
  });
});