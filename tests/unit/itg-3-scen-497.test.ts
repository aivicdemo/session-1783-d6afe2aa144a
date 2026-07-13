import { validateRuleImplementation } from "../../src/logic/it-1-br-6-2-1-1";

describe("食材流通業者・スーパーの在庫・価格データ連携インターフェース", () => {
  // SCEN-497: [normal] ルール変更実装検証機能 - 更新されたルール仕様書の実装時に、過去献立提案との矛盾・栄養基準抵触・食事評価データとの整合性が自動検証される
  test("should validate rule implementation and detect contradictions, nutrition violations, and meal evaluation inconsistencies", () => {
    // Setup: 過去の献立提案データ
    const pastMealProposals = [
      {
        mealProposalId: "proposal_001",
        userId: "user_123",
        generatedDate: "2024-01-15T10:00:00Z",
        ingredients: [
          { ingredientId: "ing_001", name: "牛肉", quantity: 200, unit: "g", seasonalScore: 60, discountRate: 0.05 },
          { ingredientId: "ing_002", name: "にんじん", quantity: 100, unit: "g", seasonalScore: 95, discountRate: 0.1 },
        ],
        nutritionBreakdown: {
          calories: 520,
          protein: 35,
          carbohydrates: 45,
          fat: 18,
          calcium: 120,
        },
        estimatedCost: 850,
      },
      {
        mealProposalId: "proposal_002",
        userId: "user_123",
        generatedDate: "2024-01-16T10:00:00Z",
        ingredients: [
          { ingredientId: "ing_003", name: "豚肉", quantity: 180, unit: "g", seasonalScore: 50, discountRate: 0.08 },
          { ingredientId: "ing_004", name: "大根", quantity: 150, unit: "g", seasonalScore: 88, discountRate: 0.12 },
        ],
        nutritionBreakdown: {
          calories: 480,
          protein: 32,
          carbohydrates: 40,
          fat: 16,
          calcium: 110,
        },
        estimatedCost: 720,
      },
    ];

    // Setup: 栄養基準値
    const nutritionStandards = {
      age: 35,
      gender: "M",
      dailyCalorieTarget: 2500,
      proteinMinGrams: 50,
      calciumMinGrams: 600,
      seasonalScoreThreshold: 70,
      discountRateMaxThreshold: 0.15,
    };

    // Setup: 食事評価データ
    const mealEvaluations = [
      {
        mealProposalId: "proposal_001",
        userId: "user_123",
        satisfactionScore: 85,
        completionRate: 100,
        feedbackText: "Good taste and balanced nutrition",
        evaluatedDate: "2024-01-16T19:00:00Z",
      },
      {
        mealProposalId: "proposal_002",
        userId: "user_123",
        satisfactionScore: 78,
        completionRate: 95,
        feedbackText: "Slightly less satisfying but acceptable",
        evaluatedDate: "2024-01-17T19:00:00Z",
      },
    ];

    // Setup: 更新されたルール仕様書
    const updatedRuleSpecification = {
      specId: "rule_spec_001",
      effectiveDate: "2024-01-18T00:00:00Z",
      rules: {
        seasonalPattern: {
          vegetableSeasonalScoreMin: 75,
          description: "野菜は季節スコア75以上を要求（旧: 70）",
        },
        discountThreshold: {
          maxDiscountRate: 0.10,
          description: "割引率上限10%（旧: 15%）",
        },
        nutritionRequirement: {
          calciumMinGrams: 700,
          description: "カルシウム最小摂取量700g（旧: 600g）",
        },
      },
    };

    // Execute: ルール実装検証を実行
    const validationResult = validateRuleImplementation({
      pastMealProposals,
      nutritionStandards,
      mealEvaluations,
      updatedRuleSpecification,
    });

    // Assert: 検証結果の基本構造
    expect(validationResult).toBeDefined();
    expect(validationResult.status).toBe("validation_completed");
    expect(validationResult.validationId).toBeDefined();
    expect(validationResult.validationTimestamp).toBeDefined();

    // Assert: 矛盾検出（contradictions）
    expect(validationResult.contradictions).toBeDefined();
    expect(Array.isArray(validationResult.contradictions)).toBe(true);
    expect(validationResult.contradictions.length).toBe(2);

    // Assert: 矛盾1: にんじんの季節スコア（95 > 75）
    expect(validationResult.contradictions[0]).toEqual({
      type: "seasonal_score_violation",
      mealProposalId: "proposal_001",
      ingredientId: "ing_002",
      ingredientName: "にんじん",
      currentValue: 95,
      newThreshold: 75,
      oldThreshold: 70,
      severity: "low",
      message: "季節スコアが新ルールの最小要件を満たしています（問題なし）",
    });

    // Assert: 矛盾2: 大根の季節スコア（88 > 75）
    expect(validationResult.contradictions[1]).toEqual({
      type: "seasonal_score_violation",
      mealProposalId: "proposal_002",
      ingredientId: "ing_004",
      ingredientName: "大根",
      currentValue: 88,
      newThreshold: 75,
      oldThreshold: 70,
      severity: "low",
      message: "季節スコアが新ルールの最小要件を満たしています（問題なし）",
    });

    // Assert: 栄養基準抵触検出（nutritionViolations）
    expect(validationResult.nutritionViolations).toBeDefined();
    expect(Array.isArray(validationResult.nutritionViolations)).toBe(true);
    expect(validationResult.nutritionViolations.length).toBe(2);

    // Assert: 栄養抵触1: proposal_001のカルシウム不足（120 < 700）
    expect(validationResult.nutritionViolations[0]).toEqual({
      type: "nutrition_deficit",
      mealProposalId: "proposal_001",
      nutrientType: "calcium",
      currentValue: 120,
      newStandard: 700,
      oldStandard: 600,
      gap: -580,
      severity: "high",
      affectedFamilyMemberId: undefined,
      message: "カルシウム摂取量が新基準を大きく下回っています（必要: 700g、現在: 120g、不足: 580g）",
    });

    // Assert: 栄養抵触2: proposal_002のカルシウム不足（110 < 700）
    expect(validationResult.nutritionViolations[1]).toEqual({
      type: "nutrition_deficit",
      mealProposalId: "proposal_002",
      nutrientType: "calcium",
      currentValue: 110,
      newStandard: 700,
      oldStandard: 600,
      gap: -590,
      severity: "high",
      affectedFamilyMemberId: undefined,
      message: "カルシウム摂取量が新基準を大きく下回っています（必要: 700g、現在: 110g、不足: 590g）",
    });

    // Assert: 食事評価データ整合性検証（mealEvaluationInconsistencies）
    expect(validationResult.mealEvaluationInconsistencies).toBeDefined();
    expect(Array.isArray(validationResult.mealEvaluationInconsistencies)).toBe(true);
    expect(validationResult.mealEvaluationInconsistencies.length).toBe(0);

    // Assert: 総合検証サマリー
    expect(validationResult.summary).toBeDefined();
    expect(validationResult.summary.totalMealProposalsChecked).toBe(2);
    expect(validationResult.summary.totalIngredientsChecked).toBe(4);
    expect(validationResult.summary.contradictionCount).toBe(2);
    expect(validationResult.summary.nutritionViolationCount).toBe(2);
    expect(validationResult.summary.inconsistencyCount).toBe(0);
    expect(validationResult.summary.overallStatus).toBe("failed");
    expect(validationResult.summary.recommendedAction).toBe("rule_modification_required");

    // Assert: 推奨アクション詳細
    expect(validationResult.recommendedActions).toBeDefined();
    expect(Array.isArray(validationResult.recommendedActions)).toBe(true);
    expect(validationResult.recommendedActions.length).toBeGreaterThan(0);

    const calciumAction = validationResult.recommendedActions.find(
      (action) => action.actionType === "adjust_nutrition_requirement"
    );
    expect(calciumAction).toBeDefined();
    expect(calciumAction?.priority).toBe("high");
    expect(calciumAction?.description).toContain("カルシウム");
    expect(calciumAction?.estimatedImpactScope).toBe(2);

    // Assert: ルール適用保留の判定
    expect(validationResult.canApplyRule).toBe(false);
    expect(validationResult.blockingReason).toBe("nutrition_standards_conflict");

    // Assert: 検証ログ記録
    expect(validationResult.validationLog).toBeDefined();
    expect(validationResult.validationLog.length).toBeGreaterThan(0);
    expect(validationResult.validationLog[0]).toHaveProperty("timestamp");
    expect(validationResult.validationLog[0]).toHaveProperty("step");
    expect(validationResult.validationLog[0]).toHaveProperty("details");
  });

  // 追加テスト: 検証成功ケース（ルール抵触がない場合）
  test("should return success status when no rule violations are detected", () => {
    const pastMealProposals = [
      {
        mealProposalId: "proposal_clean_001",
        userId: "user_456",
        generatedDate: "2024-02-01T10:00:00Z",
        ingredients: [
          { ingredientId: "ing_101", name: "鮭", quantity: 150, unit: "g", seasonalScore: 80, discountRate: 0.08 },
          { ingredientId: "ing_102", name: "ブロッコリー", quantity: 120, unit: "g", seasonalScore: 75, discountRate: 0.09 },
          { ingredientId: "ing_103", name: "牛乳", quantity: 200, unit: "ml", seasonalScore: 85, discountRate: 0.05 },
        ],
        nutritionBreakdown: {
          calories: 620,
          protein: 45,
          carbohydrates: 50,
          fat: 20,
          calcium: 750,
        },
        estimatedCost: 1200,
      },
    ];

    const nutritionStandards = {
      age: 40,
      gender: "F",
      dailyCalorieTarget: 2000,
      proteinMinGrams: 45,
      calciumMinGrams: 700,
      seasonalScoreThreshold: 75,
      discountRateMaxThreshold: 0.10,
    };

    const mealEvaluations = [
      {
        mealProposalId: "proposal_clean_001",
        userId: "user_456",
        satisfactionScore: 92,
        completionRate: 100,
        feedbackText: "Excellent meal with good nutrition",
        evaluatedDate: "2024-02-02T19:00:00Z",
      },
    ];

    const updatedRuleSpecification = {
      specId: "rule_spec_clean_001",
      effectiveDate: "2024-02-03T00:00:00Z",
      rules: {
        seasonalPattern: {
          vegetableSeasonalScoreMin: 75,
        },
        discountThreshold: {
          maxDiscountRate: 0.10,
        },
        nutritionRequirement: {
          calciumMinGrams: 700,
        },
      },
    };

    const validationResult = validateRuleImplementation({
      pastMealProposals,
      nutritionStandards,
      mealEvaluations,
      updatedRuleSpecification,
    });

    expect(validationResult.status).toBe("validation_completed");
    expect(validationResult.contradictions.length).toBe(0);
    expect(validationResult.nutritionViolations.length).toBe(0);
    expect(validationResult.mealEvaluationInconsistencies.length).toBe(0);
    expect(validationResult.summary.overallStatus).toBe("passed");
    expect(validationResult.canApplyRule).toBe(true);
    expect(validationResult.blockingReason).toBeUndefined();
  });

  // 追加テスト: 割引率超過検出
  test("should detect discount rate violations in updated rule specification", () => {
    const pastMealProposals = [
      {
        mealProposalId: "proposal_discount_001",
        userId: "user_789",
        generatedDate: "2024-02-10T10:00:00Z",
        ingredients: [
          { ingredientId: "ing_201", name: "豚肉", quantity: 200, unit: "g", seasonalScore: 70, discountRate: 0.18 },
        ],
        nutritionBreakdown: {
          calories: 400,
          protein: 40,
          carbohydrates: 35,
          fat: 15,
          calcium: 800,
        },
        estimatedCost: 600,
      },
    ];

    const nutritionStandards = {
      age: 30,
      gender: "M",
      dailyCalorieTarget: 2500,
      proteinMinGrams: 50,
      calciumMinGrams: 700,
      seasonalScoreThreshold: 70,
      discountRateMaxThreshold: 0.15,
    };

    const mealEvaluations = [
      {
        mealProposalId: "proposal_discount_001",
        userId: "user_789",
        satisfactionScore: 88,
        completionRate: 100,
        feedbackText: "Good quality meat",
        evaluatedDate: "2024-02-11T19:00:00Z",
      },
    ];

    const updatedRuleSpecification = {
      specId: "rule_spec_discount_001",
      effectiveDate: "2024-02-12T00:00:00Z",
      rules: {
        seasonalPattern: {
          vegetableSeasonalScoreMin: 70,
        },
        discountThreshold: {
          maxDiscountRate: 0.10,
        },
        nutritionRequirement: {
          calciumMinGrams: 700,
        },
      },
    };

    const validationResult = validateRuleImplementation({
      pastMealProposals,
      nutritionStandards,
      mealEvaluations,
      updatedRuleSpecification,
    });

    const discountViolation = validationResult.contradictions.find(
      (c) => c.type === "discount_rate_violation"
    );
    expect(discountViolation).toBeDefined();
    expect(discountViolation?.currentValue).toBe(0.18);
    expect(discountViolation?.newThreshold).toBe(0.10);
    expect(discountViolation?.severity).toBe("medium");
  });
});