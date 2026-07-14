import { computeSeasonalMealPlan } from "../../src/logic/it-7-2-1";

describe("献立生成アルゴリズムの季節ルール実装と動作検証", () => {
  // SCEN-825
  test("配布されたルール仕様書の季節パターン・割引率閾値・販売期間ルールが献立生成アルゴリズムに正しく実装され、すべてのテストが成功する", () => {
    // 【入力】ルール仕様書から定義された季節パターン、割引率閾値、販売期間ルール
    const ruleSpecification = {
      seasonalPatterns: {
        spring: ["タケノコ", "新キャベツ", "アスパラガス", "イチゴ"],
        summer: ["トマト", "キュウリ", "ナス", "トウモロコシ", "スイカ"],
        autumn: ["ニンジン", "サツマイモ", "栗", "梨", "キノコ"],
        winter: ["ダイコン", "ハクサイ", "ホウレンソウ", "ミカン", "大根"],
      },
      discountRateThresholds: {
        spring: { minRate: 10, maxRate: 30 },
        summer: { minRate: 15, maxRate: 35 },
        autumn: { minRate: 12, maxRate: 28 },
        winter: { minRate: 8, maxRate: 25 },
      },
      salePeriods: {
        タケノコ: { start: "2024-03-01", end: "2024-05-31" },
        新キャベツ: { start: "2024-03-15", end: "2024-06-30" },
        アスパラガス: { start: "2024-04-01", end: "2024-06-30" },
        イチゴ: { start: "2024-01-01", end: "2024-05-31" },
        トマト: { start: "2024-06-01", end: "2024-09-30" },
        キュウリ: { start: "2024-05-15", end: "2024-08-31" },
        ナス: { start: "2024-07-01", end: "2024-09-30" },
        トウモロコシ: { start: "2024-07-15", end: "2024-09-15" },
        スイカ: { start: "2024-06-15", end: "2024-08-31" },
        ニンジン: { start: "2024-09-01", end: "2024-12-31" },
        サツマイモ: { start: "2024-09-15", end: "2024-12-31" },
        栗: { start: "2024-09-01", end: "2024-11-30" },
        梨: { start: "2024-08-15", end: "2024-11-30" },
        キノコ: { start: "2024-09-01", end: "2024-11-30" },
        ダイコン: { start: "2024-11-01", end: "2025-03-31" },
        ハクサイ: { start: "2024-10-01", end: "2025-02-28" },
        ホウレンソウ: { start: "2024-11-01", end: "2025-03-31" },
        ミカン: { start: "2024-10-15", end: "2025-02-28" },
        大根: { start: "2024-11-01", end: "2025-03-31" },
      },
    };

    const springMealRequest = {
      date: "2024-04-15",
      season: "spring",
      familySize: 4,
      constraints: {
        allergyExclusions: [],
        dietaryRestrictions: [],
        budgetLimit: 3000,
        cookingTimeLimit: 60,
      },
    };

    const springMealResult = computeSeasonalMealPlan(
      springMealRequest,
      ruleSpecification
    );

    // 【検証1】春季の献立が春の食材を含むことを確認
    expect(springMealResult.mealPlan).toBeDefined();
    expect(springMealResult.mealPlan.meals).toHaveLength(3);
    expect(
      springMealResult.mealPlan.meals.every((meal: { ingredients: string[] }) =>
        meal.ingredients.some((ingredient: string) =>
          ruleSpecification.seasonalPatterns.spring.includes(ingredient)
        )
      )
    ).toBe(true);

    // 【検証2】春季の献立が春以外の季節食材を含まないことを確認
    const otherSeasonIngredients = [
      ...ruleSpecification.seasonalPatterns.summer,
      ...ruleSpecification.seasonalPatterns.autumn,
      ...ruleSpecification.seasonalPatterns.winter,
    ];
    expect(
      springMealResult.mealPlan.meals.every((meal: { ingredients: string[] }) =>
        meal.ingredients.every(
          (ingredient: string) => !otherSeasonIngredients.includes(ingredient)
        )
      )
    ).toBe(true);

    // 【検証3】春季の割引率が割引率閾値内であることを確認
    expect(springMealResult.discountApplied).toBeDefined();
    expect(springMealResult.discountApplied.rate).toBeGreaterThanOrEqual(
      ruleSpecification.discountRateThresholds.spring.minRate
    );
    expect(springMealResult.discountApplied.rate).toBeLessThanOrEqual(
      ruleSpecification.discountRateThresholds.spring.maxRate
    );

    // 【検証4】春季の献立に含まれる食材が販売期間内であることを確認
    springMealResult.mealPlan.meals.forEach(
      (meal: { ingredients: string[] }) => {
        meal.ingredients.forEach((ingredient: string) => {
          const period = ruleSpecification.salePeriods[ingredient as keyof typeof ruleSpecification.salePeriods];
          if (period) {
            const requestDate = new Date("2024-04-15");
            const periodStart = new Date(period.start);
            const periodEnd = new Date(period.end);
            expect(requestDate.getTime()).toBeGreaterThanOrEqual(
              periodStart.getTime()
            );
            expect(requestDate.getTime()).toBeLessThanOrEqual(
              periodEnd.getTime()
            );
          }
        });
      }
    );

    // 【検証5】夏季パターンのテスト（季節切り替え検証）
    const summerMealRequest = {
      date: "2024-07-20",
      season: "summer",
      familySize: 4,
      constraints: {
        allergyExclusions: [],
        dietaryRestrictions: [],
        budgetLimit: 3000,
        cookingTimeLimit: 60,
      },
    };

    const summerMealResult = computeSeasonalMealPlan(
      summerMealRequest,
      ruleSpecification
    );

    expect(summerMealResult.mealPlan).toBeDefined();
    expect(
      summerMealResult.mealPlan.meals.every((meal: { ingredients: string[] }) =>
        meal.ingredients.some((ingredient: string) =>
          ruleSpecification.seasonalPatterns.summer.includes(ingredient)
        )
      )
    ).toBe(true);

    expect(summerMealResult.discountApplied.rate).toBeGreaterThanOrEqual(
      ruleSpecification.discountRateThresholds.summer.minRate
    );
    expect(summerMealResult.discountApplied.rate).toBeLessThanOrEqual(
      ruleSpecification.discountRateThresholds.summer.maxRate
    );

    // 【検証6】秋季パターンのテスト
    const autumnMealRequest = {
      date: "2024-10-10",
      season: "autumn",
      familySize: 4,
      constraints: {
        allergyExclusions: [],
        dietaryRestrictions: [],
        budgetLimit: 3000,
        cookingTimeLimit: 60,
      },
    };

    const autumnMealResult = computeSeasonalMealPlan(
      autumnMealRequest,
      ruleSpecification
    );

    expect(autumnMealResult.mealPlan).toBeDefined();
    expect(
      autumnMealResult.mealPlan.meals.every((meal: { ingredients: string[] }) =>
        meal.ingredients.some((ingredient: string) =>
          ruleSpecification.seasonalPatterns.autumn.includes(ingredient)
        )
      )
    ).toBe(true);

    expect(autumnMealResult.discountApplied.rate).toBeGreaterThanOrEqual(
      ruleSpecification.discountRateThresholds.autumn.minRate
    );
    expect(autumnMealResult.discountApplied.rate).toBeLessThanOrEqual(
      ruleSpecification.discountRateThresholds.autumn.maxRate
    );

    // 【検証7】冬季パターンのテスト
    const winterMealRequest = {
      date: "2024-12-15",
      season: "winter",
      familySize: 4,
      constraints: {
        allergyExclusions: [],
        dietaryRestrictions: [],
        budgetLimit: 3000,
        cookingTimeLimit: 60,
      },
    };

    const winterMealResult = computeSeasonalMealPlan(
      winterMealRequest,
      ruleSpecification
    );

    expect(winterMealResult.mealPlan).toBeDefined();
    expect(
      winterMealResult.mealPlan.meals.every((meal: { ingredients: string[] }) =>
        meal.ingredients.some((ingredient: string) =>
          ruleSpecification.seasonalPatterns.winter.includes(ingredient)
        )
      )
    ).toBe(true);

    expect(winterMealResult.discountApplied.rate).toBeGreaterThanOrEqual(
      ruleSpecification.discountRateThresholds.winter.minRate
    );
    expect(winterMealResult.discountApplied.rate).toBeLessThanOrEqual(
      ruleSpecification.discountRateThresholds.winter.maxRate
    );

    // 【検証8】複数季節パターンを組み合わせたシナリオ：春から夏への季節切り替え検証
    const transitionMealRequest = {
      date: "2024-06-01",
      season: "early-summer",
      familySize: 4,
      constraints: {
        allergyExclusions: [],
        dietaryRestrictions: [],
        budgetLimit: 3000,
        cookingTimeLimit: 60,
      },
    };

    const transitionMealResult = computeSeasonalMealPlan(
      transitionMealRequest,
      ruleSpecification
    );

    expect(transitionMealResult.mealPlan).toBeDefined();
    expect(transitionMealResult.discountApplied).toBeDefined();

    // 【検証9】販売期間外の食材が献立に含まれていないことを確認（秋食材を冬に要求）
    const winterSeasonWithAutumnCheckRequest = {
      date: "2025-01-15",
      season: "winter",
      familySize: 4,
      constraints: {
        allergyExclusions: [],
        dietaryRestrictions: [],
        budgetLimit: 3000,
        cookingTimeLimit: 60,
      },
    };

    const winterCheckResult = computeSeasonalMealPlan(
      winterSeasonWithAutumnCheckRequest,
      ruleSpecification
    );

    const autumnExclusiveIngredients = ["栗", "梨"];
    expect(
      winterCheckResult.mealPlan.meals.every((meal: { ingredients: string[] }) =>
        meal.ingredients.every(
          (ingredient: string) =>
            !autumnExclusiveIngredients.includes(ingredient)
        )
      )
    ).toBe(true);

    // 【検証10】全テストが成功し、結果オブジェクトの構造が完全であることを確認
    expect(springMealResult).toHaveProperty("mealPlan");
    expect(springMealResult).toHaveProperty("discountApplied");
    expect(springMealResult).toHaveProperty("validationStatus");
    expect(springMealResult.validationStatus).toEqual({
      seasonalPatternValid: true,
      discountRateValid: true,
      salePeriodValid: true,
      constraintsMetCondition: true,
    });

    // 【検証11】予算と調理時間の制約が満たされていることを確認
    expect(springMealResult.mealPlan.totalCost).toBeLessThanOrEqual(
      springMealRequest.constraints.budgetLimit
    );
    expect(springMealResult.mealPlan.totalCookingTime).toBeLessThanOrEqual(
      springMealRequest.constraints.cookingTimeLimit
    );

    // 【検証12】複数の季節ルール組み合わせシナリオでのカバレッジ確認
    const multipleSeasonScenarios = [
      { date: "2024-03-21", season: "spring" },
      { date: "2024-06-21", season: "summer" },
      { date: "2024-09-21", season: "autumn" },
      { date: "2024-12-21", season: "winter" },
    ];

    multipleSeasonScenarios.forEach((scenario) => {
      const multiRequest = {
        date: scenario.date,
        season: scenario.season,
        familySize: 4,
        constraints: {
          allergyExclusions: [],
          dietaryRestrictions: [],
          budgetLimit: 3000,
          cookingTimeLimit: 60,
        },
      };

      const multiResult = computeSeasonalMealPlan(
        multiRequest,
        ruleSpecification
      );

      expect(multiResult.mealPlan).toBeDefined();
      expect(multiResult.mealPlan.meals.length).toBeGreaterThan(0);
      expect(multiResult.validationStatus.seasonalPatternValid).toBe(true);
      expect(multiResult.validationStatus.salePeriodValid).toBe(true);
    });
  });
});