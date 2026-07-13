import { classifyMealFailurePattern } from "../../src/logic/it-1-br-2-1-1-1";

describe("献立失敗パターン分類・優先度判定", () => {
  test("SCEN-577: 失敗パターンが4カテゴリに正しく分類され、複数要因時は優先度で判定される", () => {
    // 栄養バランス不足パターン
    const nutritionDeficitResult = classifyMealFailurePattern({
      mealtitle: "鶏肉ソテー",
      nutritionBalance: {
        targetProtein: 60,
        actualProtein: 25,
        targetCalcium: 800,
        actualCalcium: 200,
        targetVitaminC: 100,
        actualVitaminC: 10,
      },
      familyPreference: null,
      cookingTimeMinutes: 20,
      targetCookingTimeMinutes: 30,
      dietaryRestrictions: ["gluten_free"],
      includedIngredients: ["chicken", "salt", "oil"],
      timestamp: new Date("2024-01-15T11:00:00Z"),
    });

    expect(nutritionDeficitResult.primaryCategory).toBe("nutritionBalance");
    expect(nutritionDeficitResult.priorityScore).toBe(9);
    expect(nutritionDeficitResult.gapAnalysis).toEqual({
      proteinGap: 35,
      calciumGap: 600,
      vitaminCGap: 90,
    });

    // 家族好み未反映パターン
    const familyPreferenceResult = classifyMealFailurePattern({
      mealtitle: "納豆巻き",
      nutritionBalance: {
        targetProtein: 60,
        actualProtein: 55,
        targetCalcium: 800,
        actualCalcium: 750,
        targetVitaminC: 100,
        actualVitaminC: 95,
      },
      familyPreference: {
        dislikedIngredients: ["natto"],
        dislikeReason: "strong_smell",
        familyMembersAffected: 3,
      },
      cookingTimeMinutes: 25,
      targetCookingTimeMinutes: 30,
      dietaryRestrictions: [],
      includedIngredients: ["nori", "rice", "natto"],
      timestamp: new Date("2024-01-15T12:00:00Z"),
    });

    expect(familyPreferenceResult.primaryCategory).toBe("familyPreference");
    expect(familyPreferenceResult.priorityScore).toBe(8);
    expect(familyPreferenceResult.affectedFamilyCount).toBe(3);

    // 調理時間超過パターン
    const cookingTimeResult = classifyMealFailurePattern({
      mealtitle: "手作りギョーザ",
      nutritionBalance: {
        targetProtein: 60,
        actualProtein: 58,
        targetCalcium: 800,
        actualCalcium: 780,
        targetVitaminC: 100,
        actualVitaminC: 98,
      },
      familyPreference: null,
      cookingTimeMinutes: 120,
      targetCookingTimeMinutes: 45,
      dietaryRestrictions: [],
      includedIngredients: ["flour", "pork", "cabbage"],
      timestamp: new Date("2024-01-15T13:00:00Z"),
    });

    expect(cookingTimeResult.primaryCategory).toBe("cookingTime");
    expect(cookingTimeResult.priorityScore).toBe(6);
    expect(cookingTimeResult.timeOverageMinutes).toBe(75);

    // 食材制限違反パターン
    const dietaryRestrictionResult = classifyMealFailurePattern({
      mealtitle: "小麦パスタカルボナーラ",
      nutritionBalance: {
        targetProtein: 60,
        actualProtein: 62,
        targetCalcium: 800,
        actualCalcium: 810,
        targetVitaminC: 100,
        actualVitaminC: 102,
      },
      familyPreference: null,
      cookingTimeMinutes: 25,
      targetCookingTimeMinutes: 30,
      dietaryRestrictions: ["gluten_free", "dairy_free"],
      includedIngredients: ["wheat_pasta", "eggs", "cheese", "bacon"],
      timestamp: new Date("2024-01-15T14:00:00Z"),
    });

    expect(dietaryRestrictionResult.primaryCategory).toBe("dietaryRestriction");
    expect(dietaryRestrictionResult.priorityScore).toBe(10);
    expect(dietaryRestrictionResult.violatedRestrictions).toEqual([
      "gluten_free",
      "dairy_free",
    ]);
    expect(dietaryRestrictionResult.violatedIngredients).toEqual([
      "wheat_pasta",
      "cheese",
    ]);

    // 複数要因パターン（優先度判定）
    const multipleFactorsResult = classifyMealFailurePattern({
      mealtitle: "小麦ラーメン with チーズトッピング",
      nutritionBalance: {
        targetProtein: 60,
        actualProtein: 30,
        targetCalcium: 800,
        actualCalcium: 100,
        targetVitaminC: 100,
        actualVitaminC: 5,
      },
      familyPreference: {
        dislikedIngredients: ["cheese"],
        dislikeReason: "lactose_intolerance",
        familyMembersAffected: 2,
      },
      cookingTimeMinutes: 90,
      targetCookingTimeMinutes: 20,
      dietaryRestrictions: ["gluten_free", "dairy_free"],
      includedIngredients: [
        "wheat_noodles",
        "cheese",
        "butter",
        "salt",
        "oil",
      ],
      timestamp: new Date("2024-01-15T15:00:00Z"),
    });

    // 複数要因の場合、優先度は: dietaryRestriction > nutritionBalance > familyPreference > cookingTime
    expect(multipleFactorsResult.primaryCategory).toBe("dietaryRestriction");
    expect(multipleFactorsResult.priorityScore).toBe(10);
    expect(multipleFactorsResult.secondaryCategories).toContain(
      "nutritionBalance"
    );
    expect(multipleFactorsResult.secondaryCategories).toContain(
      "familyPreference"
    );
    expect(multipleFactorsResult.secondaryCategories).toContain("cookingTime");

    // 複数要因分析の詳細検証
    expect(multipleFactorsResult.allDetectedFactors).toEqual({
      dietaryRestriction: {
        violated: ["gluten_free", "dairy_free"],
        violatedIngredients: ["wheat_noodles", "cheese", "butter"],
      },
      nutritionBalance: {
        proteinGap: 30,
        calciumGap: 700,
        vitaminCGap: 95,
      },
      familyPreference: {
        affectedMembers: 2,
        dislikedItems: ["cheese"],
      },
      cookingTime: {
        overageMinutes: 70,
      },
    });

    // 優先度スコア計算検証（複数要因時の加算）
    expect(multipleFactorsResult.compositePriorityScore).toBe(28);

    // リスク度判定
    expect(multipleFactorsResult.riskLevel).toBe("high");

    // 推奨対応順序
    expect(multipleFactorsResult.recommendedActionOrder).toEqual([
      "dietaryRestriction",
      "nutritionBalance",
      "familyPreference",
      "cookingTime",
    ]);
  });
});