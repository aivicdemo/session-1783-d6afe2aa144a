import { aggregateFamilyMealEvaluations } from "../../src/logic/it-7-2-1";

describe("食事評価データ蓄積・嗜好学習機能", () => {
  // SCEN-555: 家族成員ごとの食事評価データが時系列で蓄積され、料理ごとの嗜好パターンが学習可能な状態で保持される
  test("should aggregate family meal evaluations by member and dish over time with preference pattern learning", () => {
    // テストデータ: 複数の家族成員による料理ごとの評価データ
    const familyGroupId = "family_001";
    const parent1Id = "member_p1";
    const parent2Id = "member_p2";
    const child1Id = "member_c1";
    const child2Id = "member_c2";

    // 同一料理に対する複数成員からの多時期評価
    const mealEvaluationInputs = [
      {
        familyGroupId,
        familyMemberId: parent1Id,
        dishName: "カレーライス",
        evaluationScore: 5,
        evaluationDate: "2024-01-08T19:30:00Z",
        completionRatio: 100,
        feedback: "家族全員が完食した",
      },
      {
        familyGroupId,
        familyMemberId: parent1Id,
        dishName: "カレーライス",
        evaluationScore: 4,
        evaluationDate: "2024-01-15T19:30:00Z",
        completionRatio: 95,
        feedback: "味は良かったが少し辛かった",
      },
      {
        familyGroupId,
        familyMemberId: parent1Id,
        dishName: "野菜炒め",
        evaluationScore: 3,
        evaluationDate: "2024-01-22T19:30:00Z",
        completionRatio: 80,
        feedback: "野菜の量が多かった",
      },
      {
        familyGroupId,
        familyMemberId: parent2Id,
        dishName: "カレーライス",
        evaluationScore: 5,
        evaluationDate: "2024-01-08T19:30:00Z",
        completionRatio: 100,
        feedback: "おいしい",
      },
      {
        familyGroupId,
        familyMemberId: parent2Id,
        dishName: "カレーライス",
        evaluationScore: 5,
        evaluationDate: "2024-01-15T19:30:00Z",
        completionRatio: 100,
        feedback: "毎回おいしい",
      },
      {
        familyGroupId,
        familyMemberId: parent2Id,
        dishName: "野菜炒め",
        evaluationScore: 4,
        evaluationDate: "2024-01-22T19:30:00Z",
        completionRatio: 90,
        feedback: "塩辛くない",
      },
      {
        familyGroupId,
        familyMemberId: child1Id,
        dishName: "カレーライス",
        evaluationScore: 5,
        evaluationDate: "2024-01-08T19:30:00Z",
        completionRatio: 100,
        feedback: "大好き",
      },
      {
        familyGroupId,
        familyMemberId: child1Id,
        dishName: "野菜炒め",
        evaluationScore: 2,
        evaluationDate: "2024-01-22T19:30:00Z",
        completionRatio: 50,
        feedback: "野菜が嫌い",
      },
      {
        familyGroupId,
        familyMemberId: child2Id,
        dishName: "カレーライス",
        evaluationScore: 4,
        evaluationDate: "2024-01-08T19:30:00Z",
        completionRatio: 100,
        feedback: "おいしい",
      },
      {
        familyGroupId,
        familyMemberId: child2Id,
        dishName: "野菜炒め",
        evaluationScore: 3,
        evaluationDate: "2024-01-22T19:30:00Z",
        completionRatio: 75,
        feedback: "まあまあ",
      },
    ];

    // 関数実行: 家族成員ごとの評価履歴を集計、嗜好パターンを学習
    const aggregationResult = aggregateFamilyMealEvaluations(mealEvaluationInputs);

    // アサーション1: 家族成員ごとに評価データが時系列で格納されている
    expect(aggregationResult.memberEvaluationHistory).toBeDefined();
    expect(Object.keys(aggregationResult.memberEvaluationHistory)).toContain(
      parent1Id
    );
    expect(Object.keys(aggregationResult.memberEvaluationHistory)).toContain(
      parent2Id
    );
    expect(Object.keys(aggregationResult.memberEvaluationHistory)).toContain(
      child1Id
    );
    expect(Object.keys(aggregationResult.memberEvaluationHistory)).toContain(
      child2Id
    );

    // アサーション2: 親1の評価履歴が時系列順に格納されている
    const parent1History = aggregationResult.memberEvaluationHistory[parent1Id];
    expect(parent1History.length).toBe(3);
    expect(parent1History[0].dishName).toBe("カレーライス");
    expect(parent1History[0].evaluationScore).toBe(5);
    expect(parent1History[0].evaluationDate).toBe("2024-01-08T19:30:00Z");
    expect(parent1History[1].evaluationDate).toBe("2024-01-15T19:30:00Z");
    expect(parent1History[2].evaluationDate).toBe("2024-01-22T19:30:00Z");

    // アサーション3: 料理ごとの嗜好パターンが計算されている
    expect(aggregationResult.dishPreferencePatterns).toBeDefined();
    expect(aggregationResult.dishPreferencePatterns["カレーライス"]).toBeDefined();
    expect(aggregationResult.dishPreferencePatterns["野菜炒め"]).toBeDefined();

    // アサーション4: カレーライスの嗜好パターン検証
    // parent1: 5→4 (平均4.5)、parent2: 5→5 (平均5)、child1: 5 (平均5)、child2: 4 (平均4)
    // 全体平均: (4.5 + 5 + 5 + 4) / 4 = 4.625
    const curryPattern = aggregationResult.dishPreferencePatterns["カレーライス"];
    expect(curryPattern.averageScore).toBeCloseTo(4.625, 2);
    expect(curryPattern.evaluationCount).toBe(6);
    expect(curryPattern.memberPreferences[parent1Id].averageScore).toBeCloseTo(
      4.5,
      2
    );
    expect(curryPattern.memberPreferences[parent2Id].averageScore).toBe(5);
    expect(curryPattern.memberPreferences[child1Id].averageScore).toBe(5);
    expect(curryPattern.memberPreferences[child2Id].averageScore).toBe(4);

    // アサーション5: 野菜炒めの嗜好パターン検証
    // parent1: 3 (平均3)、parent2: 4 (平均4)、child1: 2 (平均2)、child2: 3 (平均3)
    // 全体平均: (3 + 4 + 2 + 3) / 4 = 3.0
    const stirFryPattern =
      aggregationResult.dishPreferencePatterns["野菜炒め"];
    expect(stirFryPattern.averageScore).toBe(3.0);
    expect(stirFryPattern.evaluationCount).toBe(4);
    expect(stirFryPattern.memberPreferences[parent1Id].averageScore).toBe(3);
    expect(stirFryPattern.memberPreferences[parent2Id].averageScore).toBe(4);
    expect(stirFryPattern.memberPreferences[child1Id].averageScore).toBe(2);
    expect(stirFryPattern.memberPreferences[child2Id].averageScore).toBe(3);

    // アサーション6: 嗜好パターンの安定性指標（標準偏差）が計算されている
    expect(curryPattern.stabilityScore).toBeDefined();
    expect(typeof curryPattern.stabilityScore).toBe("number");
    expect(stirFryPattern.stabilityScore).toBeDefined();
    expect(typeof stirFryPattern.stabilityScore).toBe("number");

    // アサーション7: 完食度の平均が計算されている
    expect(curryPattern.averageCompletionRatio).toBeCloseTo(99.17, 1);
    expect(stirFryPattern.averageCompletionRatio).toBeCloseTo(73.75, 1);

    // アサーション8: 新規データ追加後の嗜好パターン更新を検証
    const newEvaluationInput = [
      ...mealEvaluationInputs,
      {
        familyGroupId,
        familyMemberId: parent1Id,
        dishName: "カレーライス",
        evaluationScore: 5,
        evaluationDate: "2024-01-29T19:30:00Z",
        completionRatio: 100,
        feedback: "今回も美味しかった",
      },
    ];

    const updatedAggregation = aggregateFamilyMealEvaluations(
      newEvaluationInput
    );

    // 親1のカレーライス評価が更新されている
    expect(updatedAggregation.memberEvaluationHistory[parent1Id].length).toBe(4);
    expect(
      updatedAggregation.memberEvaluationHistory[parent1Id][3].evaluationScore
    ).toBe(5);
    expect(
      updatedAggregation.memberEvaluationHistory[parent1Id][3].evaluationDate
    ).toBe("2024-01-29T19:30:00Z");

    // 嗜好パターンが動的に更新されている
    // 新しい平均: (5 + 4 + 5) / 3 = 4.67 (親1のカレーライス)
    const updatedCurryPattern =
      updatedAggregation.dishPreferencePatterns["カレーライス"];
    expect(updatedCurryPattern.evaluationCount).toBe(7);
    expect(
      updatedCurryPattern.memberPreferences[parent1Id].averageScore
    ).toBeCloseTo(4.67, 2);
    // 全体平均も再計算: (4.67 + 5 + 5 + 4) / 4 = 4.67
    expect(updatedCurryPattern.averageScore).toBeCloseTo(4.67, 2);

    // アサーション9: ダッシュボード表示用の集計情報が存在する
    expect(aggregationResult.dashboardSummary).toBeDefined();
    expect(aggregationResult.dashboardSummary.totalEvaluationsCount).toBe(10);
    expect(aggregationResult.dashboardSummary.familyMembersCount).toBe(4);
    expect(aggregationResult.dashboardSummary.dishesCount).toBe(2);
    expect(
      aggregationResult.dashboardSummary.highPreferenceDishes.length
    ).toBeGreaterThan(0);

    // アサーション10: 高評価料理（平均4.0以上）と低評価料理（平均3.0未満）が分類されている
    const highPrefDishes = aggregationResult.dashboardSummary
      .highPreferenceDishes as string[];
    const lowPrefDishes = aggregationResult.dashboardSummary
      .lowPreferenceDishes as string[];
    expect(highPrefDishes).toContain("カレーライス");
    expect(lowPrefDishes).not.toContain("カレーライス");
    expect(lowPrefDishes.length).toBeGreaterThanOrEqual(0);
  });
});