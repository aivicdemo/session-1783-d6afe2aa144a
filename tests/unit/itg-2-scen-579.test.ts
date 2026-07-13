import { classifyMenuFailurePatterns, rankImprovementPriority } from "../../src/logic/it-1-br-2-1-1-1";

describe("献立失敗パターン分類・優先度判定 - 発生頻度0件カテゴリ除外と優先度ランキング", () => {
  test("SCEN-579: 発生頻度0件の失敗カテゴリが除外され、改善優先度が正しくランク付けされる", () => {
    // ============================================================================
    // Setup: 過去1ヶ月間の献立失敗データを集計
    // ============================================================================
    const failureRawData = [
      {
        failure_id: 1,
        user_id: "user_001",
        menu_id: "menu_001",
        rejection_reason: "栄養バランスが悪い",
        rejection_category: "nutrition_balance",
        failure_date: "2024-01-05T10:00:00Z",
        impact_score: 8,
        correction_effectiveness: 0.85,
      },
      {
        failure_id: 2,
        user_id: "user_001",
        menu_id: "menu_002",
        rejection_reason: "家族の好みに合致していない",
        rejection_category: "family_preference",
        failure_date: "2024-01-08T14:30:00Z",
        impact_score: 7,
        correction_effectiveness: 0.75,
      },
      {
        failure_id: 3,
        user_id: "user_001",
        menu_id: "menu_003",
        rejection_reason: "栄養バランスが悪い",
        rejection_category: "nutrition_balance",
        failure_date: "2024-01-12T09:15:00Z",
        impact_score: 8,
        correction_effectiveness: 0.85,
      },
      {
        failure_id: 4,
        user_id: "user_001",
        menu_id: "menu_004",
        rejection_reason: "栄養バランスが悪い",
        rejection_category: "nutrition_balance",
        failure_date: "2024-01-18T16:45:00Z",
        impact_score: 8,
        correction_effectiveness: 0.85,
      },
      {
        failure_id: 5,
        user_id: "user_001",
        menu_id: "menu_005",
        rejection_reason: "調理時間が超過している",
        rejection_category: "cooking_time_exceeded",
        failure_date: "2024-01-22T11:20:00Z",
        impact_score: 5,
        correction_effectiveness: 0.60,
      },
    ];

    // ============================================================================
    // Step 1: 献立失敗パターン分類を実行
    // ============================================================================
    const classificationResult = classifyMenuFailurePatterns({
      failures: failureRawData,
      analysis_period_start: "2024-01-01T00:00:00Z",
      analysis_period_end: "2024-02-01T00:00:00Z",
    });

    // ============================================================================
    // Step 2: 発生頻度0件のカテゴリが除外されていることを検証
    // ============================================================================
    // 期待: nutrition_balance (3件), family_preference (1件), cooking_time_exceeded (1件)
    // 期待: 他の未発生カテゴリ (food_restriction_mismatch, budget_exceeded など) は除外
    expect(classificationResult.classified_patterns).toBeDefined();
    expect(Array.isArray(classificationResult.classified_patterns)).toBe(true);

    const categoriesWithOccurrences = classificationResult.classified_patterns.map(
      (pattern: any) => pattern.category
    );
    expect(categoriesWithOccurrences).toContain("nutrition_balance");
    expect(categoriesWithOccurrences).toContain("family_preference");
    expect(categoriesWithOccurrences).toContain("cooking_time_exceeded");

    // 発生頻度0件のカテゴリが含まれていないことを確認
    expect(categoriesWithOccurrences).not.toContain("food_restriction_mismatch");
    expect(categoriesWithOccurrences).not.toContain("budget_exceeded");

    // ============================================================================
    // Step 3: 各カテゴリの発生頻度を検証
    // ============================================================================
    const nutritionPatternData = classificationResult.classified_patterns.find(
      (p: any) => p.category === "nutrition_balance"
    );
    expect(nutritionPatternData).toBeDefined();
    expect(nutritionPatternData.occurrence_count).toBe(3);

    const familyPrefPatternData = classificationResult.classified_patterns.find(
      (p: any) => p.category === "family_preference"
    );
    expect(familyPrefPatternData).toBeDefined();
    expect(familyPrefPatternData.occurrence_count).toBe(1);

    const cookingTimePatternData = classificationResult.classified_patterns.find(
      (p: any) => p.category === "cooking_time_exceeded"
    );
    expect(cookingTimePatternData).toBeDefined();
    expect(cookingTimePatternData.occurrence_count).toBe(1);

    // ============================================================================
    // Step 4: 改善優先度ランキング機能を実行
    // ============================================================================
    const priorityRankingResult = rankImprovementPriority({
      classified_patterns: classificationResult.classified_patterns,
      weighting_config: {
        occurrence_weight: 0.4,
        impact_weight: 0.35,
        effectiveness_weight: 0.25,
      },
    });

    // ============================================================================
    // Step 5: 優先度ランキングが正しく計算されていることを検証
    // ============================================================================
    expect(priorityRankingResult.ranked_priorities).toBeDefined();
    expect(Array.isArray(priorityRankingResult.ranked_priorities)).toBe(true);

    // 発生頻度0件のカテゴリが優先度ランキングに含まれていないことを確認
    const rankedCategories = priorityRankingResult.ranked_priorities.map(
      (item: any) => item.category
    );
    expect(rankedCategories).not.toContain("food_restriction_mismatch");
    expect(rankedCategories).not.toContain("budget_exceeded");

    // ============================================================================
    // Step 6: 優先度スコアの計算検証
    // ============================================================================
    // nutrition_balance: 発生3件, 平均impact 8, 平均effectiveness 0.85
    // → priority_score = (3/5)*0.4 + (8/10)*0.35 + (0.85/1.0)*0.25
    //                 = 0.24 + 0.28 + 0.2125 = 0.7325
    const nutritionRanked = priorityRankingResult.ranked_priorities.find(
      (item: any) => item.category === "nutrition_balance"
    );
    expect(nutritionRanked).toBeDefined();
    expect(nutritionRanked.priority_score).toBeCloseTo(0.7325, 4);
    expect(nutritionRanked.priority_rank).toBe("HIGH");

    // family_preference: 発生1件, impact 7, effectiveness 0.75
    // → priority_score = (1/5)*0.4 + (7/10)*0.35 + (0.75/1.0)*0.25
    //                 = 0.08 + 0.245 + 0.1875 = 0.5125
    const familyPrefRanked = priorityRankingResult.ranked_priorities.find(
      (item: any) => item.category === "family_preference"
    );
    expect(familyPrefRanked).toBeDefined();
    expect(familyPrefRanked.priority_score).toBeCloseTo(0.5125, 4);
    expect(familyPrefRanked.priority_rank).toBe("MEDIUM");

    // cooking_time_exceeded: 発生1件, impact 5, effectiveness 0.60
    // → priority_score = (1/5)*0.4 + (5/10)*0.35 + (0.60/1.0)*0.25
    //                 = 0.08 + 0.175 + 0.15 = 0.405
    const cookingTimeRanked = priorityRankingResult.ranked_priorities.find(
      (item: any) => item.category === "cooking_time_exceeded"
    );
    expect(cookingTimeRanked).toBeDefined();
    expect(cookingTimeRanked.priority_score).toBeCloseTo(0.405, 4);
    expect(cookingTimeRanked.priority_rank).toBe("MEDIUM");

    // ============================================================================
    // Step 7: 優先度ランキング順序を検証
    // ============================================================================
    // 期待順序: nutrition_balance (0.7325) > family_preference (0.5125) > cooking_time_exceeded (0.405)
    const priorityOrder = priorityRankingResult.ranked_priorities.map(
      (item: any) => item.category
    );
    expect(priorityOrder[0]).toBe("nutrition_balance");
    expect(priorityOrder[1]).toBe("family_preference");
    expect(priorityOrder[2]).toBe("cooking_time_exceeded");

    // ============================================================================
    // Step 8: 複数の優先度レベル分類を検証
    // ============================================================================
    const highPriorityItems = priorityRankingResult.ranked_priorities.filter(
      (item: any) => item.priority_rank === "HIGH"
    );
    const mediumPriorityItems = priorityRankingResult.ranked_priorities.filter(
      (item: any) => item.priority_rank === "MEDIUM"
    );

    expect(highPriorityItems.length).toBe(1);
    expect(highPriorityItems[0].category).toBe("nutrition_balance");

    expect(mediumPriorityItems.length).toBe(2);
    expect(mediumPriorityItems.map((item: any) => item.category)).toContain(
      "family_preference"
    );
    expect(mediumPriorityItems.map((item: any) => item.category)).toContain(
      "cooking_time_exceeded"
    );

    // ============================================================================
    // Step 9: エクスポート対象データの検証 - 除外カテゴリが含まれていないことを確認
    // ============================================================================
    const exportReport = {
      export_timestamp: "2024-01-31T23:59:59Z",
      analysis_period_start: "2024-01-01T00:00:00Z",
      analysis_period_end: "2024-02-01T00:00:00Z",
      total_failure_count: 5,
      analyzed_categories_count: 3,
      ranked_patterns: priorityRankingResult.ranked_priorities,
    };

    const reportCategories = exportReport.ranked_patterns.map(
      (item: any) => item.category
    );
    expect(reportCategories.length).toBe(3);
    expect(reportCategories).not.toContain("food_restriction_mismatch");
    expect(reportCategories).not.toContain("budget_exceeded");
    expect(reportCategories).not.toContain("allergen_mismatch");
    expect(reportCategories).not.toContain("inventory_shortage");

    // ============================================================================
    // Step 10: 総合検証 - 全要件を満たすことを確認
    // ============================================================================
    expect(classificationResult.classified_patterns.length).toBe(3);
    expect(priorityRankingResult.ranked_priorities.length).toBe(3);
    expect(exportReport.analyzed_categories_count).toBe(3);
    expect(exportReport.total_failure_count).toBe(5);
  });
});