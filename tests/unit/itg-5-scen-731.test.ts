import {
  calculateNutritionImprovementEffect,
  linkMealGenerationLogsWithFoodRecords,
  verifyNutritionAdherenceBeforeAndAfter,
} from "../../src/logic/it-7-2-1";

describe("栄養基準改善効果検証機能", () => {
  // SCEN-731: [normal] 栄養基準改善前後の献立生成ログと食事記録を正しく紐付けて比較できる
  test("栄養基準改善前後の献立生成ログと食事記録が正しく紐付けられ、改善効果が検証できる", () => {
    // Arrange: 改善前の献立生成ログと食事記録
    const preImprovementMealLogs = [
      {
        id: "meal_log_001",
        userId: "user_123",
        generatedAt: "2024-01-08T19:00:00Z",
        menus: [
          { name: "鶏肉と野菜の炒め物", calories: 450 },
          { name: "白米", calories: 250 },
          { name: "味噌汁", calories: 80 },
        ],
        totalCalories: 780,
        proteinGrams: 28,
        carbGrams: 95,
        fatGrams: 22,
        fiberGrams: 4,
        sodiumMg: 950,
      },
      {
        id: "meal_log_002",
        userId: "user_123",
        generatedAt: "2024-01-09T19:00:00Z",
        menus: [
          { name: "豚肉生姜焼き", calories: 480 },
          { name: "白米", calories: 250 },
          { name: "漬物", calories: 40 },
        ],
        totalCalories: 770,
        proteinGrams: 26,
        carbGrams: 92,
        fatGrams: 24,
        fiberGrams: 3,
        sodiumMg: 1200,
      },
    ];

    const preFoodRecords = [
      {
        id: "food_record_001",
        userId: "user_123",
        mealLogId: "meal_log_001",
        recordedAt: "2024-01-08T20:15:00Z",
        actualCalories: 760,
        proteinGrams: 27,
        carbGrams: 93,
        fatGrams: 21,
        fiberGrams: 3.8,
        sodiumMg: 920,
        satisfactionScore: 3.5,
        completionRate: 0.9,
      },
      {
        id: "food_record_002",
        userId: "user_123",
        mealLogId: "meal_log_002",
        recordedAt: "2024-01-09T20:20:00Z",
        actualCalories: 745,
        proteinGrams: 25,
        carbGrams: 90,
        fatGrams: 23,
        fiberGrams: 2.9,
        sodiumMg: 1150,
        satisfactionScore: 3.2,
        completionRate: 0.85,
      },
    ];

    // 改善後の献立生成ログと食事記録
    const postImprovementMealLogs = [
      {
        id: "meal_log_003",
        userId: "user_123",
        generatedAt: "2024-01-15T19:00:00Z",
        menus: [
          { name: "サーモンと野菜の蒸し焼き", calories: 420 },
          { name: "玄米", calories: 220 },
          { name: "野菜スープ", calories: 90 },
        ],
        totalCalories: 730,
        proteinGrams: 32,
        carbGrams: 82,
        fatGrams: 18,
        fiberGrams: 6.5,
        sodiumMg: 680,
      },
      {
        id: "meal_log_004",
        userId: "user_123",
        generatedAt: "2024-01-16T19:00:00Z",
        menus: [
          { name: "鶏むね肉と野菜の和え物", calories: 410 },
          { name: "玄米", calories: 220 },
          { name: "豆腐の味噌汁", calories: 100 },
        ],
        totalCalories: 730,
        proteinGrams: 34,
        carbGrams: 80,
        fatGrams: 16,
        fiberGrams: 6.8,
        sodiumMg: 750,
      },
    ];

    const postFoodRecords = [
      {
        id: "food_record_003",
        userId: "user_123",
        mealLogId: "meal_log_003",
        recordedAt: "2024-01-15T20:10:00Z",
        actualCalories: 715,
        proteinGrams: 31,
        carbGrams: 80,
        fatGrams: 17.5,
        fiberGrams: 6.3,
        sodiumMg: 660,
        satisfactionScore: 4.1,
        completionRate: 0.95,
      },
      {
        id: "food_record_004",
        userId: "user_123",
        mealLogId: "meal_log_004",
        recordedAt: "2024-01-16T20:15:00Z",
        actualCalories: 720,
        proteinGrams: 33,
        carbGrams: 79,
        fatGrams: 15.8,
        fiberGrams: 6.7,
        sodiumMg: 730,
        satisfactionScore: 4.3,
        completionRate: 0.98,
      },
    ];

    // 栄養基準目標値
    const nutritionStandards = {
      caloriesMin: 700,
      caloriesMax: 800,
      proteinGramsMin: 30,
      proteinGramsMax: 50,
      carbGramsMin: 80,
      carbGramsMax: 120,
      fatGramsMin: 15,
      fatGramsMax: 30,
      fiberGramsMin: 6,
      fiberGramsMax: 15,
      sodiumMgMax: 800,
    };

    // Act: 改善前後の献立生成ログと食事記録を紐付ける
    const linkedDatasetPre = linkMealGenerationLogsWithFoodRecords(
      preImprovementMealLogs,
      preFoodRecords,
      "user_123"
    );

    const linkedDatasetPost = linkMealGenerationLogsWithFoodRecords(
      postImprovementMealLogs,
      postFoodRecords,
      "user_123"
    );

    // 改善前後の栄養基準への適合度を検証
    const preAdherenceResults = verifyNutritionAdherenceBeforeAndAfter(
      linkedDatasetPre,
      nutritionStandards,
      "pre"
    );

    const postAdherenceResults = verifyNutritionAdherenceBeforeAndAfter(
      linkedDatasetPost,
      nutritionStandards,
      "post"
    );

    // 改善前後の効果差を計算
    const improvementEffect = calculateNutritionImprovementEffect(
      preAdherenceResults,
      postAdherenceResults
    );

    // Assert: 改善前の紐付けが正しく行われたか検証
    expect(linkedDatasetPre).toEqual({
      userId: "user_123",
      period: "pre",
      linkedPairs: [
        {
          mealLogId: "meal_log_001",
          foodRecordId: "food_record_001",
          mealName: "鶏肉と野菜の炒め物, 白米, 味噌汁",
          generatedCalories: 780,
          actualCalories: 760,
          generatedProteinGrams: 28,
          actualProteinGrams: 27,
          generatedCarbGrams: 95,
          actualCarbGrams: 93,
          generatedFatGrams: 22,
          actualFatGrams: 21,
          generatedFiberGrams: 4,
          actualFiberGrams: 3.8,
          generatedSodiumMg: 950,
          actualSodiumMg: 920,
          satisfactionScore: 3.5,
          completionRate: 0.9,
        },
        {
          mealLogId: "meal_log_002",
          foodRecordId: "food_record_002",
          mealName: "豚肉生姜焼き, 白米, 漬物",
          generatedCalories: 770,
          actualCalories: 745,
          generatedProteinGrams: 26,
          actualProteinGrams: 25,
          generatedCarbGrams: 92,
          actualCarbGrams: 90,
          generatedFatGrams: 24,
          actualFatGrams: 23,
          generatedFiberGrams: 3,
          actualFiberGrams: 2.9,
          generatedSodiumMg: 1200,
          actualSodiumMg: 1150,
          satisfactionScore: 3.2,
          completionRate: 0.85,
        },
      ],
      totalRecordsLinked: 2,
      linkingErrorCount: 0,
    });

    // 改善後の紐付けが正しく行われたか検証
    expect(linkedDatasetPost).toEqual({
      userId: "user_123",
      period: "post",
      linkedPairs: [
        {
          mealLogId: "meal_log_003",
          foodRecordId: "food_record_003",
          mealName: "サーモンと野菜の蒸し焼き, 玄米, 野菜スープ",
          generatedCalories: 730,
          actualCalories: 715,
          generatedProteinGrams: 32,
          actualProteinGrams: 31,
          generatedCarbGrams: 82,
          actualCarbGrams: 80,
          generatedFatGrams: 18,
          actualFatGrams: 17.5,
          generatedFiberGrams: 6.5,
          actualFiberGrams: 6.3,
          generatedSodiumMg: 680,
          actualSodiumMg: 660,
          satisfactionScore: 4.1,
          completionRate: 0.95,
        },
        {
          mealLogId: "meal_log_004",
          foodRecordId: "food_record_004",
          mealName: "鶏むね肉と野菜の和え物, 玄米, 豆腐の味噌汁",
          generatedCalories: 730,
          actualCalories: 720,
          generatedProteinGrams: 34,
          actualProteinGrams: 33,
          generatedCarbGrams: 80,
          actualCarbGrams: 79,
          generatedFatGrams: 16,
          actualFatGrams: 15.8,
          generatedFiberGrams: 6.8,
          actualFiberGrams: 6.7,
          generatedSodiumMg: 750,
          actualSodiumMg: 730,
          satisfactionScore: 4.3,
          completionRate: 0.98,
        },
      ],
      totalRecordsLinked: 2,
      linkingErrorCount: 0,
    });

    // 改善前の栄養基準適合度を検証
    // 改善前: カロリー不足 (752.5/750), タンパク質不足 (26/30), 炭水化物OK (91.5/100), 脂肪OK (22/25), 食物繊維不足 (3.35/6), ナトリウム過剰 (1035/800)
    expect(preAdherenceResults).toEqual({
      userId: "user_123",
      period: "pre",
      averageAdherenceScore: 61.3, // 6指標中適合4項目の平均
      nutrientComplianceDetails: [
        {
          nutrient: "calories",
          standardMin: 700,
          standardMax: 800,
          averageActual: 752.5,
          adherencePercentage: 100,
          isCompliant: true,
        },
        {
          nutrient: "protein",
          standardMin: 30,
          standardMax: 50,
          averageActual: 26,
          adherencePercentage: 87,
          isCompliant: false,
        },
        {
          nutrient: "carbohydrates",
          standardMin: 80,
          standardMax: 120,
          averageActual: 91.5,
          adherencePercentage: 100,
          isCompliant: true,
        },
        {
          nutrient: "fat",
          standardMin: 15,
          standardMax: 30,
          averageActual: 22,
          adherencePercentage: 100,
          isCompliant: true,
        },
        {
          nutrient: "fiber",
          standardMin: 6,
          standardMax: 15,
          averageActual: 3.35,
          adherencePercentage: 56,
          isCompliant: false,
        },
        {
          nutrient: "sodium",
          standardMin: 0,
          standardMax: 800,
          averageActual: 1035,
          adherencePercentage: 77,
          isCompliant: false,
        },
      ],
      averageSatisfactionScore: 3.35,
      averageCompletionRate: 0.875,
    });

    // 改善後の栄養基準適合度を検証
    // 改善後: カロリーOK (717.5/750), タンパク質OK (32/40), 炭水化物OK (79.5/100), 脂肪OK (16.65/22), 食物繊維OK (6.5/12), ナトリウムOK (695/800)
    expect(postAdherenceResults).toEqual({
      userId: "user_123",
      period: "post",
      averageAdherenceScore: 97.8, // 6指標中適合5項目の平均
      nutrientComplianceDetails: [
        {
          nutrient: "calories",
          standardMin: 700,
          standardMax: 800,
          averageActual: 717.5,
          adherencePercentage: 100,
          isCompliant: true,
        },
        {
          nutrient: "protein",
          standardMin: 30,
          standardMax: 50,
          averageActual: 32,
          adherencePercentage: 100,
          isCompliant: true,
        },
        {
          nutrient: "carbohydrates",
          standardMin: 80,
          standardMax: 120,
          averageActual: 79.5,
          adherencePercentage: 100,
          isCompliant: true,
        },
        {
          nutrient: "fat",
          standardMin: 15,
          standardMax: 30,
          averageActual: 16.65,
          adherencePercentage: 100,
          isCompliant: true,
        },
        {
          nutrient: "fiber",
          standardMin: 6,
          standardMax: 15,
          averageActual: 6.5,
          adherencePercentage: 100,
          isCompliant: true,
        },
        {
          nutrient: "sodium",
          standardMin: 0,
          standardMax: 800,
          averageActual: 695,
          adherencePercentage: 100,
          isCompliant: true,
        },
      ],
      averageSatisfactionScore: 4.2,
      averageCompletionRate: 0.965,
    });

    // 改善効果を検証
    // 改善効果: 適合度 61.3 → 97.8 (+36.5ポイント), 満足度 3.35 → 4.2 (+0.85点), 完食度 0.875 → 0.965 (+0.09)
    expect(improvementEffect).toEqual({
      userId: "user_123",
      improvementPeriod: {
        preperiod: "pre",
        postperiod: "post",
      },
      adherenceScoreImprovement: 36.5,
      adherenceScorePercentageChange: 59.6,
      satisfactionScoreImprovement: 0.85,
      satisfactionScorePercentageChange: 25.4,
      completionRateImprovement: 0.09,
      completionRatePercentageChange: 10.3,
      nutrientImprovementDetails: [
        {
          nutrient: "protein",
          preCompliancePercentage: 87,
          postCompliancePercentage: 100,
          improvementPercentage: 15,
        },
        {
          nutrient: "fiber",
          preCompliancePercentage: 56,
          postCompliancePercentage: 100,
          improvementPercentage: 79,
        },
        {
          nutrient: "sodium",
          preCompliancePercentage: 77,
          postCompliancePercentage: 100,
          improvementPercentage: 30,
        },
      ],
      overallImprovementSignificant: true,
      improvementThresholdMet: true,
      minAdherenceThreshold: 95,
      achievedAdherenceThreshold: 97.8,
    });

    // ダッシュボード表示用の最終結果を検証
    expect(improvementEffect.overallImprovementSignificant).toBe(true);
    expect(improvementEffect.improvementThresholdMet).toBe(true);
    expect(improvementEffect.adherenceScoreImprovement).toBeGreaterThan(30);
    expect(improvementEffect.satisfactionScoreImprovement).toBeGreaterThan(0.5);
    expect(linkedDatasetPre.linkingErrorCount).toBe(0);
    expect(linkedDatasetPost.linkingErrorCount).toBe(0);
    expect(linkedDatasetPre.totalRecordsLinked).toBe(2);
    expect(linkedDatasetPost.totalRecordsLinked).toBe(2);
  });
});