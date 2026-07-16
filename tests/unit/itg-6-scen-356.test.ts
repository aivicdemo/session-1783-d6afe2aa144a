import {
  defineAgeSegmentationCriteria,
  validateAgeSegmentationSchema,
  exportSegmentationToJson,
  loadSegmentationCriteria,
  analyzePatternsByAgeSegment,
} from "../../src/logic/it-1-br-8-2-1-1";

describe("ユーザーセグメント別の利用パターン分析ダッシュボード", () => {
  // SCEN-356
  test("[normal] 専業主夫層セグメント分類基準定義機能 - 年代軸のカテゴリ分けが正確に定義され、後続の利用パターン分析で使用可能な状態になる", () => {
    // Step 1: セグメント分類基準定義機能を開き、年代軸カテゴリ分けを定義
    const ageSegmentationInput = {
      targetSegment: "stay_at_home_father",
      ageAxisCategories: [
        { id: "age_20s", label: "20代", minAge: 20, maxAge: 29 },
        { id: "age_30s", label: "30代", minAge: 30, maxAge: 39 },
        { id: "age_40s", label: "40代", minAge: 40, maxAge: 49 },
        { id: "age_50plus", label: "50代以上", minAge: 50, maxAge: 100 },
      ],
      familyCompositionAxis: [
        { id: "family_2child", label: "2人以下の子ども" },
        { id: "family_3plus", label: "3人以上の子ども" },
      ],
      dietaryRestrictionAxis: [
        { id: "restriction_none", label: "制限なし" },
        { id: "restriction_allergy", label: "アレルギー対応" },
        { id: "restriction_balance", label: "栄養バランス重視" },
      ],
    };

    // Step 2: 年代軸カテゴリ分けが正確に定義されていることを検証
    const definedCriteria = defineAgeSegmentationCriteria(
      ageSegmentationInput
    );

    expect(definedCriteria.targetSegment).toBe("stay_at_home_father");
    expect(definedCriteria.ageAxisCategories).toHaveLength(4);
    expect(definedCriteria.ageAxisCategories[0]).toEqual({
      id: "age_20s",
      label: "20代",
      minAge: 20,
      maxAge: 29,
    });
    expect(definedCriteria.ageAxisCategories[1]).toEqual({
      id: "age_30s",
      label: "30代",
      minAge: 30,
      maxAge: 39,
    });
    expect(definedCriteria.ageAxisCategories[2]).toEqual({
      id: "age_40s",
      label: "40代",
      minAge: 40,
      maxAge: 49,
    });
    expect(definedCriteria.ageAxisCategories[3]).toEqual({
      id: "age_50plus",
      label: "50代以上",
      minAge: 50,
      maxAge: 100,
    });

    // Step 3: 各年代カテゴリに対応する年齢範囲の境界値が正確に設定されていることを検証
    const validateResult = validateAgeSegmentationSchema(definedCriteria);
    expect(validateResult.isValid).toBe(true);
    expect(validateResult.errors).toHaveLength(0);

    // Step 4: 定義されたカテゴリ情報をJSONスキーマに従ってエクスポート
    const exportedJson = exportSegmentationToJson(definedCriteria);
    expect(typeof exportedJson).toBe("string");

    const parsedJson = JSON.parse(exportedJson);
    expect(parsedJson.targetSegment).toBe("stay_at_home_father");
    expect(parsedJson.ageAxisCategories).toHaveLength(4);
    expect(parsedJson.ageAxisCategories[0].id).toBe("age_20s");
    expect(parsedJson.ageAxisCategories[1].id).toBe("age_30s");
    expect(parsedJson.ageAxisCategories[2].id).toBe("age_40s");
    expect(parsedJson.ageAxisCategories[3].id).toBe("age_50plus");

    // Step 5: エクスポートされたデータの構造と値が仕様に合致していることを確認
    expect(parsedJson.ageAxisCategories[0]).toHaveProperty("label", "20代");
    expect(parsedJson.ageAxisCategories[0]).toHaveProperty("minAge", 20);
    expect(parsedJson.ageAxisCategories[0]).toHaveProperty("maxAge", 29);
    expect(parsedJson.ageAxisCategories[1]).toHaveProperty("label", "30代");
    expect(parsedJson.ageAxisCategories[1]).toHaveProperty("minAge", 30);
    expect(parsedJson.ageAxisCategories[1]).toHaveProperty("maxAge", 39);
    expect(parsedJson.ageAxisCategories[2]).toHaveProperty("label", "40代");
    expect(parsedJson.ageAxisCategories[2]).toHaveProperty("minAge", 40);
    expect(parsedJson.ageAxisCategories[2]).toHaveProperty("maxAge", 49);
    expect(parsedJson.ageAxisCategories[3]).toHaveProperty("label", "50代以上");
    expect(parsedJson.ageAxisCategories[3]).toHaveProperty("minAge", 50);
    expect(parsedJson.ageAxisCategories[3]).toHaveProperty("maxAge", 100);

    // Step 6: 後続の利用パターン分析機能に年代軸カテゴリデータを読み込ませる
    const loadedCriteria = loadSegmentationCriteria(exportedJson);
    expect(loadedCriteria.targetSegment).toBe("stay_at_home_father");
    expect(loadedCriteria.ageAxisCategories).toHaveLength(4);

    // Step 7: 利用パターン分析機能が年代軸カテゴリを正常に認識・使用できることを検証
    const sampleUsagePatternData = [
      {
        userId: "user_001",
        age: 25,
        mealsGeneratedCount: 12,
        cookingTimeAverage: 28,
        userSatisfactionScore: 4.2,
      },
      {
        userId: "user_002",
        age: 35,
        mealsGeneratedCount: 20,
        cookingTimeAverage: 22,
        userSatisfactionScore: 4.5,
      },
      {
        userId: "user_003",
        age: 45,
        mealsGeneratedCount: 15,
        cookingTimeAverage: 25,
        userSatisfactionScore: 4.1,
      },
      {
        userId: "user_004",
        age: 55,
        mealsGeneratedCount: 18,
        cookingTimeAverage: 30,
        userSatisfactionScore: 3.9,
      },
    ];

    const analysisResult = analyzePatternsByAgeSegment(
      loadedCriteria,
      sampleUsagePatternData
    );

    // Step 8: 分析結果出力時に年代軸カテゴリが正確に反映されていることを確認
    expect(analysisResult).toHaveProperty("segmentAnalysisResults");
    expect(analysisResult.segmentAnalysisResults).toHaveLength(4);

    // 20代セグメント検証
    const ageSegment20s = analysisResult.segmentAnalysisResults.find(
      (seg: { ageCategory: string }) => seg.ageCategory === "age_20s"
    );
    expect(ageSegment20s).toBeDefined();
    expect(ageSegment20s.label).toBe("20代");
    expect(ageSegment20s.userCount).toBe(1);
    expect(ageSegment20s.avgMealsGenerated).toBe(12);
    expect(ageSegment20s.avgCookingTime).toBe(28);
    expect(ageSegment20s.avgUserSatisfaction).toBe(4.2);

    // 30代セグメント検証
    const ageSegment30s = analysisResult.segmentAnalysisResults.find(
      (seg: { ageCategory: string }) => seg.ageCategory === "age_30s"
    );
    expect(ageSegment30s).toBeDefined();
    expect(ageSegment30s.label).toBe("30代");
    expect(ageSegment30s.userCount).toBe(1);
    expect(ageSegment30s.avgMealsGenerated).toBe(20);
    expect(ageSegment30s.avgCookingTime).toBe(22);
    expect(ageSegment30s.avgUserSatisfaction).toBe(4.5);

    // 40代セグメント検証
    const ageSegment40s = analysisResult.segmentAnalysisResults.find(
      (seg: { ageCategory: string }) => seg.ageCategory === "age_40s"
    );
    expect(ageSegment40s).toBeDefined();
    expect(ageSegment40s.label).toBe("40代");
    expect(ageSegment40s.userCount).toBe(1);
    expect(ageSegment40s.avgMealsGenerated).toBe(15);
    expect(ageSegment40s.avgCookingTime).toBe(25);
    expect(ageSegment40s.avgUserSatisfaction).toBe(4.1);

    // 50代以上セグメント検証
    const ageSegment50plus = analysisResult.segmentAnalysisResults.find(
      (seg: { ageCategory: string }) => seg.ageCategory === "age_50plus"
    );
    expect(ageSegment50plus).toBeDefined();
    expect(ageSegment50plus.label).toBe("50代以上");
    expect(ageSegment50plus.userCount).toBe(1);
    expect(ageSegment50plus.avgMealsGenerated).toBe(18);
    expect(ageSegment50plus.avgCookingTime).toBe(30);
    expect(ageSegment50plus.avgUserSatisfaction).toBe(3.9);

    // Step 9: 全体統計情報の検証
    expect(analysisResult).toHaveProperty("totalUsersAnalyzed", 4);
    expect(analysisResult).toHaveProperty("overallAvgMealsGenerated");
    expect(analysisResult.overallAvgMealsGenerated).toBe(16.25);
    expect(analysisResult).toHaveProperty("overallAvgCookingTime");
    expect(analysisResult.overallAvgCookingTime).toBe(26.25);
    expect(analysisResult).toHaveProperty("overallAvgUserSatisfaction");
    expect(analysisResult.overallAvgUserSatisfaction).toBe(4.175);
  });
});