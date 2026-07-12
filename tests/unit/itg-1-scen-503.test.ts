import { prioritizeNutritionDeficiencies } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  test('SCEN-503: 栄養不足項目が存在しない場合、優先度付けは実行されず空の結果が返される', () => {
    // Arrange: 栄養不足項目が空の状態を設定
    const nutritionDeficiencies: string[] = [];
    const mealGenerationConditions = {
      budget: 5000,
      cookingTimeMinutes: 60,
      familyMembers: 4,
    };

    // Act: 栄養不足項目の優先度付けロジックを呼び出し
    const result = prioritizeNutritionDeficiencies(
      nutritionDeficiencies,
      mealGenerationConditions
    );

    // Assert: 空の配列が返されることを確認
    expect(result).toEqual([]);

    // Assert: 献立生成条件が変更されていないことを確認
    expect(mealGenerationConditions).toEqual({
      budget: 5000,
      cookingTimeMinutes: 60,
      familyMembers: 4,
    });
  });
});