import { detectConflictingMenus } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-325
  test('献立履歴が空の状態で新規制限条件が入力された時に空リストが正常に返される', () => {
    const emptyMenuHistory = [];
    
    const restrictionCondition = {
      excludedIngredients: ['えび'],
      calorieLimit: 2000,
      minProtein: 50,
    };

    const result = detectConflictingMenus(
      emptyMenuHistory,
      restrictionCondition
    );

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
    expect(result).toEqual([]);
  });
});