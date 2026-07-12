import { detectConflictingMeals } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-404: [edge] ペイン分析・優先度マトリクス生成機能 - 複数のペイン要因が同一優先度の場合、優先度マトリクスが重複なく生成される
  test('複数のペイン要因が同一優先度で入力された場合、重複なく優先度マトリクスが生成される', () => {
    const painFactors = [
      {
        id: 'pain_1',
        name: '時間がない',
        priority: 3,
        occurrenceFrequency: 45,
        impactScore: 78,
      },
      {
        id: 'pain_2',
        name: '献立が思いつかない',
        priority: 3,
        occurrenceFrequency: 42,
        impactScore: 82,
      },
      {
        id: 'pain_3',
        name: '予算が限られている',
        priority: 3,
        occurrenceFrequency: 38,
        impactScore: 71,
      },
    ];

    const pastMeals = [
      {
        mealId: 'meal_001',
        mealName: 'トマトスパゲッティ',
        cuisineTime: 35,
        cost: 1200,
        ingredients: [
          { ingredientId: 'ing_1', name: 'トマト', allergen: false },
          { ingredientId: 'ing_2', name: 'パスタ', allergen: false },
        ],
        createdAt: '2024-01-10T19:00:00Z',
      },
      {
        mealId: 'meal_002',
        mealName: 'チキンカレー',
        cuisineTime: 45,
        cost: 1800,
        ingredients: [
          { ingredientId: 'ing_3', name: '鶏肉', allergen: false },
          { ingredientId: 'ing_4', name: 'カレー粉', allergen: false },
        ],
        createdAt: '2024-01-08T19:00:00Z',
      },
      {
        mealId: 'meal_003',
        mealName: '野菜炒め',
        cuisineTime: 20,
        cost: 900,
        ingredients: [
          { ingredientId: 'ing_5', name: 'キャベツ', allergen: false },
          { ingredientId: 'ing_6', name: 'ニンジン', allergen: false },
        ],
        createdAt: '2024-01-05T19:00:00Z',
      },
    ];

    const newDietaryRestriction = {
      restrictionId: 'restrict_001',
      restrictionName: '卵類除外',
      affectedIngredients: ['egg', 'mayonnaise'],
      priority: 'high',
    };

    const result = detectConflictingMeals(
      painFactors,
      pastMeals,
      newDietaryRestriction
    );

    // 優先度マトリクス構造の検証
    expect(result).toHaveProperty('priorityMatrix');
    expect(Array.isArray(result.priorityMatrix)).toBe(true);

    // 優先度レベル 3 に属するペイン要因がすべて含まれているか検証
    const priority3Items = result.priorityMatrix.filter(
      (item: any) => item.priority === 3
    );
    expect(priority3Items).toHaveLength(3);

    // 各ペイン要因が一意に存在することを検証（重複なし）
    const uniqueIds = new Set(priority3Items.map((item: any) => item.id));
    expect(uniqueIds.size).toBe(3);

    // ペイン要因 ID の正確性を検証
    const painIds = priority3Items.map((item: any) => item.id).sort();
    expect(painIds).toEqual(['pain_1', 'pain_2', 'pain_3']);

    // マトリクス内に同じペイン要因が複数回存在しないことを検証
    const allIds = result.priorityMatrix.map((item: any) => item.id);
    expect(allIds.length).toBe(new Set(allIds).size);

    // 同一優先度内でのペイン要因の配置が正しく行われていることを確認
    const matrixStructure = result.priorityMatrix.map((item: any) => ({
      id: item.id,
      priority: item.priority,
      occurrenceFrequency: item.occurrenceFrequency,
      impactScore: item.impactScore,
    }));

    expect(matrixStructure).toContainEqual({
      id: 'pain_1',
      priority: 3,
      occurrenceFrequency: 45,
      impactScore: 78,
    });

    expect(matrixStructure).toContainEqual({
      id: 'pain_2',
      priority: 3,
      occurrenceFrequency: 42,
      impactScore: 82,
    });

    expect(matrixStructure).toContainEqual({
      id: 'pain_3',
      priority: 3,
      occurrenceFrequency: 38,
      impactScore: 71,
    });

    // 抵触検出結果の検証
    expect(result).toHaveProperty('conflictingMeals');
    expect(Array.isArray(result.conflictingMeals)).toBe(true);

    // 抵触メール数は 0（卵類を含む献立がないため）
    expect(result.conflictingMeals).toHaveLength(0);

    // 優先度マトリクスのメタデータ検証
    expect(result).toHaveProperty('matrixMetadata');
    expect(result.matrixMetadata).toHaveProperty('totalPainFactors');
    expect(result.matrixMetadata.totalPainFactors).toBe(3);
    expect(result.matrixMetadata).toHaveProperty('uniqueFactorsCount');
    expect(result.matrixMetadata.uniqueFactorsCount).toBe(3);
  });
});