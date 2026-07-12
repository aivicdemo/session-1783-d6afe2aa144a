import { detectConflictingMeals } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-338: [edge] 過去献立との抵触検出 - 抵触する過去献立が存在しない場合、空の一覧が返される
  test('should return empty list when no conflicting meals exist in past history', () => {
    // Arrange: 新規献立（鶏肉・玉ねぎ・人参を含む）
    const newMealIngredients = ['鶏肉', '玉ねぎ', '人参'];

    // 過去献立データ（魚・キャベツ・ジャガイモのみの献立3件）
    const pastMeals = [
      {
        mealId: 'past_meal_001',
        ingredients: ['魚', 'キャベツ', 'ジャガイモ'],
        mealName: '魚のポアレ',
        createdAt: '2024-01-10T18:00:00Z',
      },
      {
        mealId: 'past_meal_002',
        ingredients: ['魚', 'キャベツ', 'ジャガイモ'],
        mealName: '白身魚の塩焼き',
        createdAt: '2024-01-11T18:00:00Z',
      },
      {
        mealId: 'past_meal_003',
        ingredients: ['魚', 'キャベツ', 'ジャガイモ'],
        mealName: '魚のムニエル',
        createdAt: '2024-01-12T18:00:00Z',
      },
    ];

    // 新規食事制限条件（例：鶏肉・玉ねぎ・人参のいずれかを含む献立は避ける）
    const restrictedIngredients = ['鶏肉', '玉ねぎ', '人参'];

    // Act
    const conflictingMeals = detectConflictingMeals(
      pastMeals,
      restrictedIngredients
    );

    // Assert: 過去献立に制限食材が含まれていないため、空の一覧が返される
    expect(conflictingMeals).toEqual([]);
    expect(conflictingMeals.length).toBe(0);
  });
});