import { rankMealCandidatesByConstraints } from '../../src/logic/it-1-br-2-1-1-1';

describe('複数制約条件下での献立候補ランキング', () => {
  // SCEN-334
  test('食材制限・冷蔵庫在庫・予算・食事評価を全て満たす献立候補が満足度スコア順に正しくランキングされる', () => {
    const input = {
      mealCandidates: [
        {
          mealId: 'meal_001',
          name: '鶏肉と玉ねぎの和風丼',
          ingredients: ['鶏肉', '玉ねぎ', '米', '醤油'],
          estimatedCost: 450,
          estimatedCookingTimeMinutes: 20,
          cuisineType: '和食',
        },
        {
          mealId: 'meal_002',
          name: 'チーズオムレツ',
          ingredients: ['卵', 'チーズ', 'バター', '小麦粉'],
          estimatedCost: 380,
          estimatedCookingTimeMinutes: 15,
          cuisineType: '洋食',
        },
        {
          mealId: 'meal_003',
          name: '鶏肉のソテー玉ねぎ添え',
          ingredients: ['鶏肉', '玉ねぎ', 'オリーブオイル', '塩'],
          estimatedCost: 480,
          estimatedCookingTimeMinutes: 25,
          cuisineType: '洋食',
        },
        {
          mealId: 'meal_004',
          name: '米粉パンケーキ',
          ingredients: ['米粉', '卵', 'はちみつ', 'バター'],
          estimatedCost: 350,
          estimatedCookingTimeMinutes: 20,
          cuisineType: '洋食',
        },
        {
          mealId: 'meal_005',
          name: '玉ねぎと鶏肉の塩炒め',
          ingredients: ['鶏肉', '玉ねぎ', '塩', 'ごま油'],
          estimatedCost: 420,
          estimatedCookingTimeMinutes: 18,
          cuisineType: '和食',
        },
      ],
      restrictions: {
        allergens: ['小麦', '乳製品'],
        excludedIngredients: [],
      },
      inventory: {
        chickenGrammes: 500,
        onionCount: 3,
        riceServings: 2,
      },
      budgetPerMealYen: 500,
      pastFoodRatings: [
        { cuisineType: '和食', averageRating: 4.5 },
        { cuisineType: '洋食', averageRating: 3.0 },
      ],
    };

    const result = rankMealCandidatesByConstraints(input);

    expect(result).toEqual({
      rankedMealCandidates: [
        {
          mealId: 'meal_001',
          name: '鶏肉と玉ねぎの和風丼',
          satisfactionScore: 92,
          constraintsSatisfied: {
            allergensFree: true,
            inventoryAvailable: true,
            withinBudget: true,
            highRated: true,
          },
          rank: 1,
        },
        {
          mealId: 'meal_005',
          name: '玉ねぎと鶏肉の塩炒め',
          satisfactionScore: 88,
          constraintsSatisfied: {
            allergensFree: true,
            inventoryAvailable: true,
            withinBudget: true,
            highRated: true,
          },
          rank: 2,
        },
        {
          mealId: 'meal_003',
          name: '鶏肉のソテー玉ねぎ添え',
          satisfactionScore: 82,
          constraintsSatisfied: {
            allergensFree: true,
            inventoryAvailable: true,
            withinBudget: true,
            highRated: false,
          },
          rank: 3,
        },
      ],
      totalCandidatesEvaluated: 5,
      candidatesPassingAllConstraints: 3,
      candidatesFilteredOut: {
        allergenViolation: 2,
        inventoryShortage: 0,
        budgetExceeded: 0,
      },
      sortingOrder: 'descending_by_satisfaction_score',
      evaluationTimestamp: '2024-01-15T14:30:00Z',
    });

    expect(result.rankedMealCandidates.length).toBe(3);

    expect(result.rankedMealCandidates[0].satisfactionScore).toBe(92);
    expect(result.rankedMealCandidates[1].satisfactionScore).toBe(88);
    expect(result.rankedMealCandidates[2].satisfactionScore).toBe(82);

    for (let i = 0; i < result.rankedMealCandidates.length - 1; i++) {
      expect(result.rankedMealCandidates[i].satisfactionScore).toBeGreaterThanOrEqual(
        result.rankedMealCandidates[i + 1].satisfactionScore,
      );
    }

    expect(result.rankedMealCandidates.every((meal) => meal.constraintsSatisfied.allergensFree === true)).toBe(true);
    expect(result.rankedMealCandidates.every((meal) => meal.constraintsSatisfied.inventoryAvailable === true)).toBe(
      true,
    );
    expect(result.rankedMealCandidates.every((meal) => meal.constraintsSatisfied.withinBudget === true)).toBe(true);

    expect(result.candidatesFilteredOut.allergenViolation).toBe(2);
    expect(result.totalCandidatesEvaluated).toBe(5);
    expect(result.candidatesPassingAllConstraints).toBe(3);

    expect(result.rankedMealCandidates[0].mealId).toBe('meal_001');
    expect(result.rankedMealCandidates[1].mealId).toBe('meal_005');
    expect(result.rankedMealCandidates[2].mealId).toBe('meal_003');
  });
});