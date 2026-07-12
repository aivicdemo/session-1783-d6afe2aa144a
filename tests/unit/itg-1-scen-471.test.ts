import { detectConflictingMenusWithNewRestrictions } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出', () => {
  // SCEN-471
  test('過去献立データが存在しない状態で新規制限条件を入力した場合、抵触検出せず処理継続できる', () => {
    const userId = 'user-001';
    const pastMenus: Array<{
      menuId: string;
      date: string;
      dishes: Array<{ dishId: string; ingredients: string[] }>;
    }> = [];
    const newRestrictions = [
      { allergen: 'egg', reason: 'allergy' },
      { ingredient: 'nuts', reason: 'restriction' },
    ];

    const result = detectConflictingMenusWithNewRestrictions({
      userId,
      pastMenus,
      newRestrictions,
    });

    expect(result.conflictingMenuCount).toBe(0);
    expect(result.hasConflict).toBe(false);
    expect(result.conflictingMenuIds).toEqual([]);
    expect(result.processingStatus).toBe('completed');
    expect(result.restrictionsApplied).toEqual(newRestrictions);
  });
});