import { detectConflictWithPastMenus } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-339: [error] 過去献立との抵触検出 - 過去献立データが破損していた場合、エラーが返される
  test('過去献立データが破損している場合、適切なエラーメッセージとともにエラーが返される', () => {
    const corruptedMenuData = '{ invalid json }';
    const restrictionCondition = {
      familyMemberId: 'member_001',
      allergyList: ['egg', 'milk'],
      dietaryRestrictionList: ['vegetarian'],
      timestamp: '2024-01-15T11:00:00Z',
    };

    expect(() =>
      detectConflictWithPastMenus(corruptedMenuData, restrictionCondition)
    ).toThrow(/過去献立データが破損/);
  });
});