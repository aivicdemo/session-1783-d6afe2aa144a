import { evaluateMealPlanConstraintSatisfaction } from '../../src/logic/it-1-br-1783670064270-1-1-1';

describe('献立提案後の家族成員による食事評価入力機能', () => {
  // SCEN-346: [edge] 複数制約条件の充足度判定 - 栄養・アレルギー・予算・調理時間すべての制約を満たす献立案は総合スコア100と評価される
  test('すべての制約条件を満たす献立案が生成された場合、総合スコアが100となる', () => {
    const mealPlan = {
      id: 'meal-001',
      name: '栄養バランス定食',
      ingredients: [
        { name: '鶏むね肉', allergens: [] },
        { name: '玄米', allergens: [] },
        { name: 'ブロッコリー', allergens: [] },
        { name: 'オリーブオイル', allergens: [] }
      ],
      nutrition: {
        protein: 25,
        carbohydrates: 52,
        fat: 14
      },
      estimatedCost: 480,
      estimatedCookingTimeMinutes: 28
    };

    const constraints = {
      nutrition: {
        protein: { min: 20 },
        carbohydrates: { min: 50 },
        fat: { max: 15 }
      },
      allergyExclusions: ['egg', 'dairy'],
      budgetLimit: 500,
      cookingTimeLimit: 30
    };

    const result = evaluateMealPlanConstraintSatisfaction(mealPlan, constraints);

    expect(result.overallScore).toBe(100);
    expect(result.nutritionScore).toBe(100);
    expect(result.allergyScore).toBe(100);
    expect(result.budgetScore).toBe(100);
    expect(result.cookingTimeScore).toBe(100);
    expect(result.satisfiesAllConstraints).toBe(true);
  });

  test('栄養基準を満たさない献立案の場合、総合スコアは100未満となる', () => {
    const mealPlan = {
      id: 'meal-002',
      name: '栄養不足定食',
      ingredients: [
        { name: 'キャベツ', allergens: [] },
        { name: '白米', allergens: [] }
      ],
      nutrition: {
        protein: 8,
        carbohydrates: 48,
        fat: 2
      },
      estimatedCost: 300,
      estimatedCookingTimeMinutes: 15
    };

    const constraints = {
      nutrition: {
        protein: { min: 20 },
        carbohydrates: { min: 50 },
        fat: { max: 15 }
      },
      allergyExclusions: ['egg', 'dairy'],
      budgetLimit: 500,
      cookingTimeLimit: 30
    };

    const result = evaluateMealPlanConstraintSatisfaction(mealPlan, constraints);

    expect(result.overallScore).toBeLessThan(100);
    expect(result.nutritionScore).toBeLessThan(100);
    expect(result.satisfiesAllConstraints).toBe(false);
  });

  test('アレルギー除外対象が含まれた献立案の場合、総合スコアは100未満となる', () => {
    const mealPlan = {
      id: 'meal-003',
      name: 'アレルギー含有定食',
      ingredients: [
        { name: '鶏むね肉', allergens: [] },
        { name: '卵焼き', allergens: ['egg'] },
        { name: '玄米', allergens: [] }
      ],
      nutrition: {
        protein: 25,
        carbohydrates: 52,
        fat: 14
      },
      estimatedCost: 450,
      estimatedCookingTimeMinutes: 25
    };

    const constraints = {
      nutrition: {
        protein: { min: 20 },
        carbohydrates: { min: 50 },
        fat: { max: 15 }
      },
      allergyExclusions: ['egg', 'dairy'],
      budgetLimit: 500,
      cookingTimeLimit: 30
    };

    const result = evaluateMealPlanConstraintSatisfaction(mealPlan, constraints);

    expect(result.allergyScore).toBeLessThan(100);
    expect(result.overallScore).toBeLessThan(100);
    expect(result.satisfiesAllConstraints).toBe(false);
  });

  test('予算超過の献立案の場合、総合スコアは100未満となる', () => {
    const mealPlan = {
      id: 'meal-004',
      name: '高級定食',
      ingredients: [
        { name: '和牛', allergens: [] },
        { name: '玄米', allergens: [] },
        { name: 'アスパラガス', allergens: [] }
      ],
      nutrition: {
        protein: 28,
        carbohydrates: 55,
        fat: 13
      },
      estimatedCost: 520,
      estimatedCookingTimeMinutes: 20
    };

    const constraints = {
      nutrition: {
        protein: { min: 20 },
        carbohydrates: { min: 50 },
        fat: { max: 15 }
      },
      allergyExclusions: ['egg', 'dairy'],
      budgetLimit: 500,
      cookingTimeLimit: 30
    };

    const result = evaluateMealPlanConstraintSatisfaction(mealPlan, constraints);

    expect(result.budgetScore).toBeLessThan(100);
    expect(result.overallScore).toBeLessThan(100);
    expect(result.satisfiesAllConstraints).toBe(false);
  });

  test('調理時間超過の献立案の場合、総合スコアは100未満となる', () => {
    const mealPlan = {
      id: 'meal-005',
      name: '複雑調理定食',
      ingredients: [
        { name: '鶏むね肉', allergens: [] },
        { name: '玄米', allergens: [] },
        { name: 'ブロッコリー', allergens: [] }
      ],
      nutrition: {
        protein: 26,
        carbohydrates: 53,
        fat: 12
      },
      estimatedCost: 480,
      estimatedCookingTimeMinutes: 35
    };

    const constraints = {
      nutrition: {
        protein: { min: 20 },
        carbohydrates: { min: 50 },
        fat: { max: 15 }
      },
      allergyExclusions: ['egg', 'dairy'],
      budgetLimit: 500,
      cookingTimeLimit: 30
    };

    const result = evaluateMealPlanConstraintSatisfaction(mealPlan, constraints);

    expect(result.cookingTimeScore).toBeLessThan(100);
    expect(result.overallScore).toBeLessThan(100);
    expect(result.satisfiesAllConstraints).toBe(false);
  });

  test('脂質上限を超える献立案の場合、栄養スコアが低下する', () => {
    const mealPlan = {
      id: 'meal-006',
      name: '脂質過多定食',
      ingredients: [
        { name: '豚バラ肉', allergens: [] },
        { name: '白米', allergens: [] }
      ],
      nutrition: {
        protein: 22,
        carbohydrates: 51,
        fat: 18
      },
      estimatedCost: 400,
      estimatedCookingTimeMinutes: 20
    };

    const constraints = {
      nutrition: {
        protein: { min: 20 },
        carbohydrates: { min: 50 },
        fat: { max: 15 }
      },
      allergyExclusions: ['egg', 'dairy'],
      budgetLimit: 500,
      cookingTimeLimit: 30
    };

    const result = evaluateMealPlanConstraintSatisfaction(mealPlan, constraints);

    expect(result.nutritionScore).toBeLessThan(100);
    expect(result.overallScore).toBeLessThan(100);
  });

  test('複数の制約違反がある献立案の場合、総合スコアは大幅に低下する', () => {
    const mealPlan = {
      id: 'meal-007',
      name: '制約違反多重定食',
      ingredients: [
        { name: 'チーズ', allergens: ['dairy'] },
        { name: '卵焼き', allergens: ['egg'] },
        { name: '白米', allergens: [] }
      ],
      nutrition: {
        protein: 12,
        carbohydrates: 40,
        fat: 22
      },
      estimatedCost: 550,
      estimatedCookingTimeMinutes: 45
    };

    const constraints = {
      nutrition: {
        protein: { min: 20 },
        carbohydrates: { min: 50 },
        fat: { max: 15 }
      },
      allergyExclusions: ['egg', 'dairy'],
      budgetLimit: 500,
      cookingTimeLimit: 30
    };

    const result = evaluateMealPlanConstraintSatisfaction(mealPlan, constraints);

    expect(result.overallScore).toBeLessThan(50);
    expect(result.satisfiesAllConstraints).toBe(false);
    expect(result.allergyScore).toBeLessThan(100);
    expect(result.nutritionScore).toBeLessThan(100);
    expect(result.budgetScore).toBeLessThan(100);
    expect(result.cookingTimeScore).toBeLessThan(100);
  });

  test('制約条件にnullやundefinedが含まれる場合、エラーが発生する', () => {
    const mealPlan = {
      id: 'meal-008',
      name: 'テスト定食',
      ingredients: [{ name: '鶏肉', allergens: [] }],
      nutrition: { protein: 25, carbohydrates: 52, fat: 14 },
      estimatedCost: 480,
      estimatedCookingTimeMinutes: 28
    };

    const invalidConstraints = {
      nutrition: null,
      allergyExclusions: ['egg'],
      budgetLimit: 500,
      cookingTimeLimit: 30
    };

    expect(() => {
      evaluateMealPlanConstraintSatisfaction(mealPlan, invalidConstraints as any);
    }).toThrow(/制約条件/);
  });

  test('献立案にnullが渡される場合、エラーが発生する', () => {
    const constraints = {
      nutrition: {
        protein: { min: 20 },
        carbohydrates: { min: 50 },
        fat: { max: 15 }
      },
      allergyExclusions: ['egg', 'dairy'],
      budgetLimit: 500,
      cookingTimeLimit: 30
    };

    expect(() => {
      evaluateMealPlanConstraintSatisfaction(null as any, constraints);
    }).toThrow(/献立案/);
  });
});