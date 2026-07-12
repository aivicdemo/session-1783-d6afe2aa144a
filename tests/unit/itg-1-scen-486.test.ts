import { detectDietaryConflictAndReflect } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-486: 制限条件入力から献立反映の統合フロー - フロー中の任意のステップで判定が不妥当になった場合、以降のステップがスキップされてエラー状態で終了する
  test('妥当性チェック失敗時に献立生成・反映処理がスキップされる', () => {
    const dietaryRestrictions = {
      allergens: ['卵', '乳製品'],
      dietStyle: 'ベジタリアン',
      budgetLimit: 1000,
      cookingTimeLimit: 30,
    };

    const conflictingRequirement = {
      requiredIngredient: '鶏肉',
    };

    const pasteMealHistory = [
      {
        id: 1,
        ingredients: ['鶏肉', 'たまねぎ'],
        name: '鶏肉の炒め物',
      },
    ];

    const input = {
      userRestrictionsSet: dietaryRestrictions,
      conflictingCondition: conflictingRequirement,
      pastMealRecords: pasteMealHistory,
    };

    expect(() => detectDietaryConflictAndReflect(input)).toThrow(/矛盾/);
  });
});