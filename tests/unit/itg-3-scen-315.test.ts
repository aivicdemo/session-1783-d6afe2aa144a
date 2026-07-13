import { generateMealPlan } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-315: [normal] 献立生成トリガー処理 - 専業主夫が手動で献立生成ボタンを押した時に家族の制約条件を正常に読み込んで生成処理が開始される
  test('SCEN-315: 献立生成ボタン押下時に家族の制約条件を正常に読み込んで献立生成処理が開始される', () => {
    const userId = 'user_001_househusband';
    const familyMembers = [
      {
        memberId: 'member_001_father',
        name: '父',
        age: 45,
        gender: 'M' as const,
        allergies: ['卵', 'エビ'],
        dislikedIngredients: ['ナス'],
        dietaryRestrictions: ['塩分控えめ'],
      },
      {
        memberId: 'member_002_mother',
        name: '母',
        age: 43,
        gender: 'F' as const,
        allergies: ['ピーナッツ'],
        dislikedIngredients: ['レバー'],
        dietaryRestrictions: [],
      },
      {
        memberId: 'member_003_son',
        name: '長男',
        age: 12,
        gender: 'M' as const,
        allergies: [],
        dislikedIngredients: ['グリーンピース', 'ブロッコリー'],
        dietaryRestrictions: [],
      },
      {
        memberId: 'member_004_daughter',
        name: '長女',
        age: 8,
        gender: 'F' as const,
        allergies: ['乳製品'],
        dislikedIngredients: ['玉ねぎ'],
        dietaryRestrictions: [],
      },
    ];

    const input = {
      userId,
      familyMembers,
      mealPlanDate: '2024-02-11',
      mealPlanDaysCount: 7,
      nutritionTargets: {
        caloriesPerDay: 2000,
        proteinGramsPerDay: 60,
        fiberGramsPerDay: 25,
        saltGramsPerDay: 6,
      },
      budgetLimitPerMonth: 50000,
      cookingTimeMinutesPerDay: 60,
      includeSeasonalIngredients: true,
    };

    const result = generateMealPlan(input);

    // 献立生成処理が開始され、結果が返される
    expect(result).toBeDefined();
    expect(result).toHaveProperty('mealPlanId');
    expect(result).toHaveProperty('meals');
    expect(result).toHaveProperty('constraintsSatisfaction');
    expect(result).toHaveProperty('processStatus');

    // 献立生成ID が正しく生成されている
    expect(typeof result.mealPlanId).toBe('string');
    expect(result.mealPlanId.length).toBeGreaterThan(0);

    // 献立データが配列として返される
    expect(Array.isArray(result.meals)).toBe(true);
    expect(result.meals.length).toBe(7);

    // 各献立が制約条件を満たしているか検証
    result.meals.forEach((meal: any) => {
      expect(meal).toHaveProperty('date');
      expect(meal).toHaveProperty('dishes');
      expect(meal).toHaveProperty('totalCalories');
      expect(meal).toHaveProperty('totalProteinGrams');
      expect(meal).toHaveProperty('totalFiberGrams');
      expect(meal).toHaveProperty('totalSaltGrams');

      // 全家族メンバーのアレルギー制約を確認
      meal.dishes.forEach((dish: any) => {
        familyMembers.forEach((member: any) => {
          const dishIngredientsLowerCase = dish.ingredients.map((ing: string) =>
            ing.toLowerCase()
          );
          member.allergies.forEach((allergen: string) => {
            expect(dishIngredientsLowerCase).not.toContain(allergen.toLowerCase());
          });
        });
      });

      // 全家族メンバーの嫌いな食材制約を確認
      meal.dishes.forEach((dish: any) => {
        familyMembers.forEach((member: any) => {
          const dishIngredientsLowerCase = dish.ingredients.map((ing: string) =>
            ing.toLowerCase()
          );
          member.dislikedIngredients.forEach((disliked: string) => {
            expect(dishIngredientsLowerCase).not.toContain(disliked.toLowerCase());
          });
        });
      });

      // 栄養基準を確認（許容範囲 ±10%）
      expect(meal.totalCalories).toBeLessThanOrEqual(2200);
      expect(meal.totalCalories).toBeGreaterThanOrEqual(1800);

      expect(meal.totalProteinGrams).toBeLessThanOrEqual(66);
      expect(meal.totalProteinGrams).toBeGreaterThanOrEqual(54);

      expect(meal.totalFiberGrams).toBeLessThanOrEqual(27.5);
      expect(meal.totalFiberGrams).toBeGreaterThanOrEqual(22.5);

      // 塩分控えめ制約（父向け）
      expect(meal.totalSaltGrams).toBeLessThanOrEqual(6);
    });

    // 制約条件の満足度スコアを検証
    expect(result.constraintsSatisfaction).toHaveProperty('allergyConstraint');
    expect(result.constraintsSatisfaction).toHaveProperty('dislikedIngredientsConstraint');
    expect(result.constraintsSatisfaction).toHaveProperty('nutritionConstraint');
    expect(result.constraintsSatisfaction).toHaveProperty('dietaryRestrictionConstraint');
    expect(result.constraintsSatisfaction).toHaveProperty('overallScore');

    expect(result.constraintsSatisfaction.allergyConstraint).toBe(100);
    expect(result.constraintsSatisfaction.dislikedIngredientsConstraint).toBe(100);
    expect(result.constraintsSatisfaction.nutritionConstraint).toBeGreaterThanOrEqual(90);
    expect(result.constraintsSatisfaction.dietaryRestrictionConstraint).toBe(100);
    expect(result.constraintsSatisfaction.overallScore).toBeGreaterThanOrEqual(95);

    // 処理ステータスが「成功」を示す
    expect(result.processStatus).toBe('completed');

    // ログに家族メンバーの制約条件が記録されていることを確認（メタデータ）
    expect(result).toHaveProperty('appliedConstraints');
    expect(result.appliedConstraints).toHaveProperty('familyMembersCount');
    expect(result.appliedConstraints.familyMembersCount).toBe(4);

    expect(result.appliedConstraints).toHaveProperty('totalAllergiesApplied');
    expect(result.appliedConstraints.totalAllergiesApplied).toBe(4);

    expect(result.appliedConstraints).toHaveProperty('totalDislikedIngredientsApplied');
    expect(result.appliedConstraints.totalDislikedIngredientsApplied).toBe(5);

    expect(result.appliedConstraints).toHaveProperty('dietaryRestrictionsApplied');
    expect(result.appliedConstraints.dietaryRestrictionsApplied).toContain('塩分控えめ');
  });
});