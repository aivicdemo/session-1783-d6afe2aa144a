import { detectConflictingMenus } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-583: [edge] ルール変更の自動検証 - 過去献立データが存在しない場合、検証が完了する
  test('過去献立データが存在しない場合、検証が正常に完了しエラーが発生しない', () => {
    const restrictionChangeData = {
      userId: 'user_001',
      restrictionType: 'allergen',
      newRestriction: 'shellfish',
      changeTimestamp: new Date('2024-01-15T10:00:00Z'),
      changedBy: 'spouse_001'
    };

    const pastMenuHistory = [];

    const result = detectConflictingMenus({
      restrictionChangeData,
      pastMenuHistory
    });

    expect(result.validationCompleted).toBe(true);
    expect(result.conflictingMenuIds).toEqual([]);
    expect(result.validationStatus).toBe('completed');
    expect(result.errorOccurred).toBe(false);
    expect(result.processedMenuCount).toBe(0);
  });
});