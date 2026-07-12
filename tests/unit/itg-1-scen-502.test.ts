import { prioritizeNutritionGapsAndAdjustMealPlan } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-502
  test('栄養不足項目の優先度付けと献立生成条件調整 - 不足項目が複数存在する場合、スコアリングアルゴリズムにより全項目が優先順位付けされる', () => {
    // 複数の栄養不足項目を持つユーザープロファイル設定
    const userProfile = {
      userId: 'user-001',
      familyMemberId: 'member-001',
      age: 35,
      gender: 'male',
    };

    const nutritionGaps = [
      {
        nutrientName: 'タンパク質',
        targetAmount: 60,
        actualAmount: 42,
        gapAmount: 18,
        unitOfMeasure: 'g',
        gapPercentage: 30,
      },
      {
        nutrientName: 'カルシウム',
        targetAmount: 800,
        actualAmount: 560,
        gapAmount: 240,
        unitOfMeasure: 'mg',
        gapPercentage: 30,
      },
      {
        nutrientName: 'ビタミンC',
        targetAmount: 100,
        actualAmount: 65,
        gapAmount: 35,
        unitOfMeasure: 'mg',
        gapPercentage: 35,
      },
    ];

    const familyPreferences = {
      dislikedIngredients: ['しいたけ', 'ナス'],
      allergies: [],
      dietaryRestrictions: [],
    };

    const mealPlanConstraints = {
      maxCookingTimeMinutes: 40,
      maxBudgetPerMeal: 800,
      preferredCuisineTypes: ['日本食', '洋食'],
    };

    // スコアリングアルゴリズムにより各不足項目に対して優先度スコアを計算
    const result = prioritizeNutritionGapsAndAdjustMealPlan({
      userProfile,
      nutritionGaps,
      familyPreferences,
      mealPlanConstraints,
    });

    // 優先度スコアが計算されていることを確認
    expect(result.prioritizedNutritionGaps).toBeDefined();
    expect(result.prioritizedNutritionGaps.length).toBe(3);

    // 優先度スコアがすべて計算されていることを確認（スコアは0～100）
    result.prioritizedNutritionGaps.forEach((gap) => {
      expect(gap.priorityScore).toBeGreaterThanOrEqual(0);
      expect(gap.priorityScore).toBeLessThanOrEqual(100);
    });

    // ビタミンCが最も優先度が高い（ギャップ率が最大35%）
    // タンパク質とカルシウムは同じギャップ率30%だが、タンパク質の方がコントロール指数が高い
    expect(result.prioritizedNutritionGaps[0].nutrientName).toBe('ビタミンC');
    expect(result.prioritizedNutritionGaps[0].priorityScore).toBe(100);

    expect(result.prioritizedNutritionGaps[1].nutrientName).toBe('タンパク質');
    expect(result.prioritizedNutritionGaps[1].priorityScore).toBe(90);

    expect(result.prioritizedNutritionGaps[2].nutrientName).toBe('カルシウム');
    expect(result.prioritizedNutritionGaps[2].priorityScore).toBe(75);

    // 献立生成の優先条件が調整されていることを確認
    expect(result.adjustedMealPlanConditions).toBeDefined();
    expect(result.adjustedMealPlanConditions.primaryNutrientFocus).toBe('ビタミンC');
    expect(result.adjustedMealPlanConditions.secondaryNutrientFocus).toBe('タンパク質');
    expect(result.adjustedMealPlanConditions.tertiaryNutrientFocus).toBe('カルシウム');

    // 生成された献立に含まれる料理の栄養素分析結果を取得
    expect(result.recommendedDishes).toBeDefined();
    expect(result.recommendedDishes.length).toBeGreaterThan(0);

    // 優先度の高い順に栄養不足項目が献立に反映されていることを検証
    // 優先度1位のビタミンCを含む料理が献立に含まれる
    const vitaminCDishes = result.recommendedDishes.filter((dish) =>
      dish.targetNutrients.includes('ビタミンC')
    );
    expect(vitaminCDishes.length).toBeGreaterThan(0);

    // 優先度2位のタンパク質を含む料理が献立に含まれる
    const proteinDishes = result.recommendedDishes.filter((dish) =>
      dish.targetNutrients.includes('タンパク質')
    );
    expect(proteinDishes.length).toBeGreaterThan(0);

    // 優先度3位のカルシウムを含む料理が献立に含まれる
    const calciumDishes = result.recommendedDishes.filter((dish) =>
      dish.targetNutrients.includes('カルシウム')
    );
    expect(calciumDishes.length).toBeGreaterThan(0);

    // 献立内の各料理が不足栄養素の優先順位に基づいて選定されたことをログから確認
    expect(result.selectionLogs).toBeDefined();
    expect(result.selectionLogs.length).toBeGreaterThan(0);

    // 第1優先度の料理選定ログが含まれていることを確認
    const primaryLogs = result.selectionLogs.filter(
      (log) => log.nutrientPriority === 1
    );
    expect(primaryLogs.length).toBeGreaterThan(0);

    // 第2優先度の料理選定ログが含まれていることを確認
    const secondaryLogs = result.selectionLogs.filter(
      (log) => log.nutrientPriority === 2
    );
    expect(secondaryLogs.length).toBeGreaterThan(0);

    // 第3優先度の料理選定ログが含まれていることを確認
    const tertiaryLogs = result.selectionLogs.filter(
      (log) => log.nutrientPriority === 3
    );
    expect(tertiaryLogs.length).toBeGreaterThan(0);

    // 生成された献立の栄養バランスレポートを表示
    expect(result.nutritionBalanceReport).toBeDefined();
    expect(result.nutritionBalanceReport.projectedProteinAmount).toBeGreaterThan(
      42
    );
    expect(result.nutritionBalanceReport.projectedCalciumAmount).toBeGreaterThan(
      560
    );
    expect(result.nutritionBalanceReport.projectedVitaminCAmount).toBeGreaterThan(
      65
    );

    // 優先度付けが適切に反映されていることを確認
    // 最小改善額の計算: 各栄養素の不足分を優先度スコアの重み付けで配分
    // 優先度スコア合計: 100 + 90 + 75 = 265
    // ビタミンC改善予定: 35 * (100/265) ≈ 13.2mg 加算予定
    // タンパク質改善予定: 18 * (90/265) ≈ 6.1g 加算予定
    // カルシウム改善予定: 240 * (75/265) ≈ 67.9mg 加算予定
    const expectedProteinIncrease = 6;
    const expectedCalciumIncrease = 68;
    const expectedVitaminCIncrease = 13;

    expect(
      result.nutritionBalanceReport.projectedProteinAmount - 42
    ).toBeGreaterThanOrEqual(expectedProteinIncrease - 2);
    expect(
      result.nutritionBalanceReport.projectedProteinAmount - 42
    ).toBeLessThanOrEqual(expectedProteinIncrease + 2);

    expect(
      result.nutritionBalanceReport.projectedCalciumAmount - 560
    ).toBeGreaterThanOrEqual(expectedCalciumIncrease - 5);
    expect(
      result.nutritionBalanceReport.projectedCalciumAmount - 560
    ).toBeLessThanOrEqual(expectedCalciumIncrease + 5);

    expect(
      result.nutritionBalanceReport.projectedVitaminCAmount - 65
    ).toBeGreaterThanOrEqual(expectedVitaminCIncrease - 2);
    expect(
      result.nutritionBalanceReport.projectedVitaminCAmount - 65
    ).toBeLessThanOrEqual(expectedVitaminCIncrease + 2);

    // すべての不足項目が何らかの形で献立に考慮されていることを確認
    expect(result.coverageStatus).toBeDefined();
    expect(result.coverageStatus.vitaminCCovered).toBe(true);
    expect(result.coverageStatus.proteinCovered).toBe(true);
    expect(result.coverageStatus.calciumCovered).toBe(true);

    // 全体的な改善指標の確認
    expect(result.improvementMetrics).toBeDefined();
    expect(result.improvementMetrics.totalGapsCovered).toBe(3);
    expect(result.improvementMetrics.averagePriorityScore).toBeGreaterThan(80);
  });
});